import CardTransformer from '#transformers/card_transformer'
import TagTransformer from '#transformers/tag_transformer'
import CollectionService from '#services/collection_service'
import { collectionFiltersValidator } from '#validators/collection'
import { bulkValidator } from '#validators/tag'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class CollectionController {
  @inject()
  async index({ inertia, auth, request }: HttpContext, collection: CollectionService) {
    const user = auth.getUserOrFail()
    const filters = await collectionFiltersValidator.validate(request.qs())
    const cards = await collection.list(user, filters)

    return inertia.render('collection', {
      filters,
      cards: CardTransformer.paginate(cards.all(), cards.getMeta()),
      progression: await collection.progression(user),
      tags: TagTransformer.transform(await collection.tags(user)),
    })
  }

  @inject()
  async bulk({ auth, request, response, session }: HttpContext, collection: CollectionService) {
    const { cardIds, action, tagId } = await request.validateUsing(bulkValidator)
    const count = await collection.bulk(auth.getUserOrFail(), cardIds, action, tagId)
    session.flash('success', `${count} ${count > 1 ? 'cartes modifiées' : 'carte modifiée'}.`)
    return response.redirect().back()
  }
}
