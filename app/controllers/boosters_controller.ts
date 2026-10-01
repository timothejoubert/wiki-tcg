import BoosterOpening from '#models/booster_opening'
import CardTransformer from '#transformers/card_transformer'
import CollectionService from '#services/collection_service'
import WalletService from '#services/wallet_service'
import gameConfig from '#config/game'
import BoosterService, { NoBoosterAvailableError } from '#services/booster_service'
import { stockOf } from '#services/booster_stock'
import { WikipediaUnavailableError } from '#services/wikipedia_client'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class BoostersController {
  @inject()
  async index(
    { inertia, auth }: HttpContext,
    collection: CollectionService,
    wallet: WalletService
  ) {
    const user = auth.getUserOrFail()
    const dailyBonus = await wallet.claimDailyBonus(user)
    const stock = stockOf(user)

    return inertia.render('dashboard', {
      stock: { ...stock, nextRefillAt: stock.nextRefillAt?.toISO() ?? null },
      recent: CardTransformer.transform(await collection.recent(user)),
      dailyBonus,
      balance: user.balance,
      boosterPrice: gameConfig.economy.boosterPrice,
    })
  }

  @inject()
  async store({ auth, response, session }: HttpContext, boosters: BoosterService) {
    try {
      const opening = await boosters.open(auth.getUserOrFail())
      return response.redirect().withQs({ reveal: 1 }).toRoute('boosters.show', { id: opening.id })
    } catch (error) {
      if (error instanceof NoBoosterAvailableError) {
        session.flash('error', error.message)
      } else if (error instanceof WikipediaUnavailableError) {
        session.flash(
          'error',
          'Wikipédia ne répond pas, réessaie dans un instant. Ton booster est conservé.'
        )
      } else {
        throw error
      }
      return response.redirect().toRoute('dashboard')
    }
  }

  async show({ inertia, auth, params, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const opening = await BoosterOpening.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('cards', (query) =>
        query.preload('card', (cards) =>
          cards.withCount('copies', (copies) => copies.where('user_id', user.id))
        )
      )
      .firstOrFail()

    return inertia.render('boosters/show', {
      reveal: request.qs().reveal === '1',
      openedAt: opening.openedAt.toISO()!,
      cards: CardTransformer.transform(opening.cards.map((copy) => copy.card)),
    })
  }
}
