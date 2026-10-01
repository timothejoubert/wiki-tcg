import Card from '#models/card'
import CardTransformer from '#transformers/card_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class CardsController {
  async show({ inertia, auth, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const card = await Card.query()
      .where('id', params.id)
      .withCount('copies', (copies) => copies.where('user_id', user.id))
      .firstOrFail()

    return inertia.render('cards/show', { card: CardTransformer.transform(card) })
  }
}
