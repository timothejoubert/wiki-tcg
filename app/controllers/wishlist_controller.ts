import Card from '#models/card'
import CardTransformer from '#transformers/card_transformer'
import WishlistService from '#services/wishlist_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class WishlistController {
  constructor(protected wishlist: WishlistService) {}

  async index({ inertia, auth }: HttpContext) {
    const items = await this.wishlist.list(auth.getUserOrFail())
    return inertia.render('wishlist', {
      cards: CardTransformer.transform(items.map((item) => item.card)),
      // Same order as `cards`
      details: items.map((item) => ({ owned: item.owned, owners: item.owners })),
    })
  }

  async toggle({ auth, params, response, session }: HttpContext) {
    const card = await Card.findOrFail(params.id)
    const wished = await this.wishlist.toggle(auth.getUserOrFail(), card.id)
    session.flash(
      'success',
      wished
        ? `« ${card.title} » ajoutée à tes souhaits.`
        : `« ${card.title} » retirée de tes souhaits.`
    )
    return response.redirect().back()
  }
}
