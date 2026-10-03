import CardTransformer from '#transformers/card_transformer'
import TagTransformer from '#transformers/tag_transformer'
import CollectionService from '#services/collection_service'
import WalletService from '#services/wallet_service'
import { collectionFiltersValidator } from '#validators/collection'
import { bulkValidator } from '#validators/tag'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class CollectionController {
  @inject()
  async index(
    { inertia, auth, request }: HttpContext,
    collection: CollectionService,
    wallet: WalletService
  ) {
    const user = auth.getUserOrFail()
    const filters = await collectionFiltersValidator.validate(request.qs())
    const cards = await collection.list(user, filters)

    return inertia.render('collection', {
      filters,
      cards: CardTransformer.paginate(cards.all(), cards.getMeta()),
      progression: await collection.progression(user),
      tags: TagTransformer.transform(await collection.tags(user)),
      recycle: await wallet.recyclePreview(user),
    })
  }

  @inject()
  async bulk(
    { auth, request, response, session }: HttpContext,
    collection: CollectionService,
    wallet: WalletService
  ) {
    const { cardIds, action, tagId } = await request.validateUsing(bulkValidator)
    if (action === 'recycle') {
      this.flashRecycle(session, await wallet.recycleDuplicates(auth.getUserOrFail(), cardIds))
      return response.redirect().back()
    }
    const count = await collection.bulk(auth.getUserOrFail(), cardIds, action, tagId)
    session.flash('success', `${count} ${count > 1 ? 'cartes modifiées' : 'carte modifiée'}.`)
    return response.redirect().back()
  }

  /**
   * Recycles every spare copy of the collection.
   */
  @inject()
  async recycle({ auth, response, session }: HttpContext, wallet: WalletService) {
    this.flashRecycle(session, await wallet.recycleDuplicates(auth.getUserOrFail()))
    return response.redirect().back()
  }

  protected flashRecycle(
    session: HttpContext['session'],
    result: { copies: number; wikis: number }
  ) {
    if (result.copies === 0) {
      session.flash('error', 'Aucun doublon à recycler.')
      return
    }
    session.flash(
      'success',
      `${result.copies} ${result.copies > 1 ? 'doublons recyclés' : 'doublon recyclé'} : +${result.wikis} ${result.wikis > 1 ? 'wikis' : 'wiki'}.`
    )
  }
}
