import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import Card from '#models/card'
import User from '#models/user'
import UserCard from '#models/user_card'
import BoosterOpening from '#models/booster_opening'
import gameConfig, { type Rarity } from '#config/game'
import logger from '@adonisjs/core/services/logger'
import CardFactory from '#services/card_factory'
import RarityRoller, { isAtLeast, rarityFallbacks } from '#services/rarity_roller'
import WikipediaClient, {
  type WikiArticle,
  WikipediaUnavailableError,
} from '#services/wikipedia_client'
import { rarityFor } from '#services/card_stats'

const { boosters } = gameConfig
const refillEvery = { minutes: boosters.refillEveryMinutes }

export type BoosterStock = {
  available: number
  max: number
  nextRefillAt: DateTime | null
}

export class NoBoosterAvailableError extends Exception {
  static status = 422
  static code = 'E_NO_BOOSTER_AVAILABLE'
  static message = 'Aucun booster disponible pour le moment.'
}

/**
 * Boosters refill lazily: the stored stock is only brought up to date when
 * it is read or spent, so no scheduler is needed.
 */
export function refilledStock(
  user: Pick<User, 'boosterStock' | 'boosterRefilledAt'>,
  now: DateTime
) {
  const intervalMs = boosters.refillEveryMinutes * 60_000
  const elapsed = Math.max(0, now.toMillis() - user.boosterRefilledAt.toMillis())
  const accrued = Math.floor(elapsed / intervalMs)

  if (user.boosterStock + accrued >= boosters.maxStock) {
    return { stock: Math.max(user.boosterStock, boosters.maxStock), refilledAt: now }
  }

  return {
    stock: user.boosterStock + accrued,
    refilledAt: user.boosterRefilledAt.plus({ milliseconds: accrued * intervalMs }),
  }
}

export function stockOf(user: User, now = DateTime.now()): BoosterStock {
  const { stock, refilledAt } = refilledStock(user, now)

  return {
    available: stock,
    max: boosters.maxStock,
    nextRefillAt: stock < boosters.maxStock ? refilledAt.plus(refillEvery) : null,
  }
}

type SlotPick = { rarity: Rarity; article: WikiArticle } | { rarity: Rarity; card: Card }

@inject()
export default class BoosterService {
  constructor(
    protected wikipedia: WikipediaClient,
    protected cards: CardFactory,
    protected roller: RarityRoller
  ) {}

  /**
   * Spends one booster and grants its cards. Each slot rolls a rarity, then
   * takes a card of that rarity from a live random draw or the catalogue,
   * falling back to lower rarities when none is available.
   *
   * Wikipedia is queried before the transaction so the user row is never
   * locked during network calls; the stock is checked again under the lock,
   * so concurrent openings cannot spend the same booster twice.
   */
  async open(user: User): Promise<BoosterOpening> {
    if (stockOf(user).available < 1) {
      throw new NoBoosterAvailableError()
    }

    const live = await this.liveDraw()
    const picks = await this.pickSlots(this.roller.rollBooster(), live)

    const chosen = new Set(
      picks.flatMap((pick) => ('article' in pick ? [pick.article.pageId] : []))
    )
    const extras = live.filter(
      (article) =>
        !chosen.has(article.pageId) &&
        isAtLeast(rarityFor(article.avgDailyViews), gameConfig.harvest.minRarity)
    )
    const attributes = await this.cards.prepare([
      ...picks.flatMap((pick) => ('article' in pick ? [pick.article] : [])),
      ...extras,
    ])

    return db.transaction(async (trx) => {
      const locked = await User.query({ client: trx })
        .where('id', user.id)
        .forUpdate()
        .firstOrFail()
      const now = DateTime.now()
      const { stock, refilledAt } = refilledStock(locked, now)
      if (stock < 1) {
        throw new NoBoosterAvailableError()
      }

      locked.merge({ boosterStock: stock - 1, boosterRefilledAt: refilledAt })
      await locked.save()

      const created = await this.cards.save(attributes, trx)
      const saved = new Map(created.map((card) => [card.wikiPageId, card]))
      const opening = await BoosterOpening.create(
        { userId: user.id, openedAt: now },
        { client: trx }
      )
      await UserCard.createMany(
        picks.map((pick) => ({
          userId: user.id,
          cardId: 'card' in pick ? pick.card.id : saved.get(pick.article.pageId)!.id,
          boosterOpeningId: opening.id,
          isFavorite: false,
          obtainedAt: now,
        })),
        { client: trx }
      )

      return opening
    })
  }

  /**
   * One batch of random articles. An outage is not fatal: the catalogue can
   * still fill the booster.
   */
  protected async liveDraw(): Promise<WikiArticle[]> {
    try {
      return await this.wikipedia.randomArticles()
    } catch (error) {
      if (!(error instanceof WikipediaUnavailableError)) {
        throw error
      }
      logger.warn({ err: error }, 'Live draw unavailable, serving the booster from the catalogue')
      return []
    }
  }

  protected async pickSlots(slots: Rarity[], live: WikiArticle[]): Promise<SlotPick[]> {
    const usedPages = new Set<number>()
    const picks: SlotPick[] = []

    for (const slot of slots) {
      const pick = await this.pickSlot(slot, live, usedPages)
      if (!pick) {
        throw new WikipediaUnavailableError(`No card available for a ${slot} slot`)
      }
      if (pick.rarity !== slot) {
        logger.warn({ slot, served: pick.rarity }, 'Booster slot fell back to a lower rarity')
      }

      usedPages.add('article' in pick ? pick.article.pageId : pick.card.wikiPageId)
      picks.push(pick)
    }

    return picks
  }

  /**
   * Live articles first, so the catalogue keeps growing; then a random
   * catalogue card of the same rarity; then one rarity lower.
   */
  protected async pickSlot(
    slot: Rarity,
    live: WikiArticle[],
    usedPages: Set<number>
  ): Promise<SlotPick | null> {
    for (const rarity of rarityFallbacks(slot)) {
      const article = live.find(
        (candidate) =>
          !usedPages.has(candidate.pageId) && rarityFor(candidate.avgDailyViews) === rarity
      )
      if (article) {
        return { rarity, article }
      }

      const card = await Card.query()
        .where('lang', gameConfig.wikipedia.lang)
        .where('rarity', rarity)
        .whereNotIn('wiki_page_id', [...usedPages, ...live.map((candidate) => candidate.pageId)])
        .orderByRaw('random()')
        .first()
      if (card) {
        return { rarity, card }
      }
    }

    return null
  }
}
