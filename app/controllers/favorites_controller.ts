import CardFavorite from '#models/card_favorite'
import CollectionService from '#services/collection_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class FavoritesController {
  /**
   * Stars or unstars an owned card.
   */
  @inject()
  async toggle({ auth, params, response }: HttpContext, collection: CollectionService) {
    const user = auth.getUserOrFail()
    const cardId = Number(params.id)
    if (!(await collection.owns(user, cardId))) {
      return response.notFound()
    }

    const favorite = await CardFavorite.query().where({ userId: user.id, cardId }).first()
    if (favorite) {
      await favorite.delete()
    } else {
      await CardFavorite.create({ userId: user.id, cardId })
    }

    return response.redirect().back()
  }
}
