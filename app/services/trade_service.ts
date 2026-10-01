import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Trade from '#models/trade'
import TradeItem from '#models/trade_item'
import User from '#models/user'
import UserCard from '#models/user_card'
import Card from '#models/card'
import gameConfig, { RARITIES } from '#config/game'

const { trades } = gameConfig.economy

export class TradeError extends Exception {
  static status = 422
}

export class UnknownPlayerError extends TradeError {
  static code = 'E_UNKNOWN_PLAYER'
  static message = 'Aucun joueur ne porte cet identifiant.'
}

export class SelfTradeError extends TradeError {
  static code = 'E_SELF_TRADE'
  static message = 'Tu ne peux pas échanger avec toi-même.'
}

export class CardsUnavailableError extends TradeError {
  static code = 'E_CARDS_UNAVAILABLE'
  static message = 'Certaines cartes ne sont plus disponibles (vendues, échangées ou en vente).'
}

export class TradeClosedError extends TradeError {
  static code = 'E_TRADE_CLOSED'
  static message = 'Cette proposition n’est plus en attente.'
}

type Side = { ownerId: number; cardIds: number[] }

/**
 * Card-for-card trades. Copies are not reserved by a pending offer: they
 * are checked again on acceptance, and another free copy of the same card
 * stands in if the picked one is gone.
 */
export default class TradeService {
  async propose(proposer: User, recipientUsername: string, offered: number[], requested: number[]) {
    const recipient = await User.query()
      .whereRaw('lower(username) = lower(?)', [recipientUsername])
      .first()
    if (!recipient) {
      throw new UnknownPlayerError()
    }
    if (recipient.id === proposer.id) {
      throw new SelfTradeError()
    }

    return db.transaction(async (trx) => {
      const sides: Side[] = [
        { ownerId: proposer.id, cardIds: offered },
        { ownerId: recipient.id, cardIds: requested },
      ]
      const items = []
      for (const side of sides) {
        for (const copy of await this.pickCopies(trx, side, [])) {
          items.push({ ownerId: side.ownerId, cardId: copy.cardId, userCardId: copy.id })
        }
      }

      const trade = await Trade.create(
        {
          proposerId: proposer.id,
          recipientId: recipient.id,
          status: 'pending',
          expiresAt: DateTime.now().plus({ hours: trades.expiresAfterHours }),
          respondedAt: null,
        },
        { client: trx }
      )
      await trade.related('items').createMany(items)
      return trade
    })
  }

  /**
   * Swaps every copy between the two players, or nothing at all.
   */
  async accept(recipient: User, tradeId: number) {
    return db.transaction(async (trx) => {
      const trade = await this.lockPending(trx, tradeId, (t) => t.recipientId === recipient.id)
      const items = await TradeItem.query({ client: trx }).where('trade_id', trade.id).orderBy('id')

      const now = DateTime.now()
      const taken: number[] = []
      for (const item of items) {
        const [copy] = await this.pickCopies(
          trx,
          { ownerId: item.ownerId, cardIds: [item.cardId] },
          taken,
          item.userCardId
        )
        taken.push(copy.id)
        const newOwner = item.ownerId === trade.proposerId ? trade.recipientId : trade.proposerId
        copy.merge({ userId: newOwner, obtainedAt: now, boosterOpeningId: null })
        await copy.save()
        if (copy.id !== item.userCardId) {
          item.useTransaction(trx)
          item.userCardId = copy.id
          await item.save()
        }
      }

      trade.merge({ status: 'accepted', respondedAt: now })
      await trade.save()
      return trade
    })
  }

  async decline(recipient: User, tradeId: number) {
    return this.close(tradeId, 'declined', (t) => t.recipientId === recipient.id)
  }

  async cancel(proposer: User, tradeId: number) {
    return this.close(tradeId, 'cancelled', (t) => t.proposerId === proposer.id)
  }

  /**
   * Marks pending offers past their expiry date as expired.
   */
  async expireDue(now = DateTime.now()) {
    return Trade.query()
      .where('status', 'pending')
      .where('expires_at', '<=', now.toSQL()!)
      .update({ status: 'expired', respondedAt: now.toSQL(), updatedAt: now.toSQL() })
  }

  /**
   * Cards a player can put in a trade: at least one free copy.
   */
  tradableCards(ownerId: number) {
    return Card.query()
      .whereExists((copies) =>
        copies
          .from('user_cards')
          .whereColumn('user_cards.card_id', 'cards.id')
          .where('user_cards.user_id', ownerId)
          .whereNotExists((open) =>
            open
              .from('auctions')
              .whereColumn('auctions.user_card_id', 'user_cards.id')
              .where('auctions.status', 'open')
          )
      )
      .orderByRaw(`array_position(?::text[], rarity::text) desc`, [RARITIES as any])
      .orderBy('title')
      .limit(500)
  }

  pendingReceivedCount(user: User) {
    return Trade.query()
      .where('recipient_id', user.id)
      .where('status', 'pending')
      .where('expires_at', '>', DateTime.now().toSQL()!)
      .count('* as total')
      .firstOrFail()
      .then((row) => Number(row.$extras.total))
  }

  /**
   * One free copy per card, locked, owned by `side.ownerId`. `preferred`
   * is tried first; copies in `exclude` are skipped.
   */
  protected async pickCopies(
    trx: TransactionClientContract,
    side: Side,
    exclude: number[],
    preferred: number | null = null
  ) {
    const picked: UserCard[] = []
    for (const cardId of side.cardIds) {
      const query = UserCard.query({ client: trx })
        .where({ userId: side.ownerId, cardId })
        .withScopes((scopes) => scopes.free())
        .whereNotIn('id', [...exclude, ...picked.map((copy) => copy.id)])
        .forUpdate()
      if (preferred !== null) {
        query.orderByRaw('id = ? desc', [preferred])
      }
      const copy = await query.orderBy('obtained_at', 'desc').orderBy('id', 'desc').first()
      if (!copy) {
        throw new CardsUnavailableError()
      }
      picked.push(copy)
    }
    return picked
  }

  protected async lockPending(
    trx: TransactionClientContract,
    tradeId: number,
    allowed: (trade: Trade) => boolean
  ) {
    const trade = await Trade.query({ client: trx }).where('id', tradeId).forUpdate().firstOrFail()
    if (!allowed(trade) || trade.status !== 'pending' || trade.expiresAt <= DateTime.now()) {
      throw new TradeClosedError()
    }
    return trade
  }

  protected close(
    tradeId: number,
    status: 'declined' | 'cancelled',
    allowed: (trade: Trade) => boolean
  ) {
    return db.transaction(async (trx) => {
      const trade = await this.lockPending(trx, tradeId, allowed)
      trade.merge({ status, respondedAt: DateTime.now() })
      await trade.save()
      return trade
    })
  }
}
