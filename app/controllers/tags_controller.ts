import Tag from '#models/tag'
import CollectionService from '#services/collection_service'
import { attachTagValidator, createTagValidator } from '#validators/tag'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class TagsController {
  /**
   * Creates a tag, and applies it right away when `cardId` is an owned card.
   */
  @inject()
  async store({ auth, request, response }: HttpContext, collection: CollectionService) {
    const user = auth.getUserOrFail()
    const { name, cardId } = await request.validateUsing(createTagValidator, {
      meta: { userId: user.id },
    })
    if (cardId && !(await collection.owns(user, cardId))) {
      return response.notFound()
    }

    const tag = await Tag.create({ userId: user.id, name })
    if (cardId) {
      await tag.related('cards').attach([cardId])
    }

    return response.redirect().back()
  }

  async destroy({ auth, params, response }: HttpContext) {
    const tag = await Tag.query()
      .where('id', params.id)
      .where('user_id', auth.getUserOrFail().id)
      .firstOrFail()
    await tag.delete()

    return response.redirect().back()
  }

  @inject()
  async attach({ auth, params, request, response }: HttpContext, collection: CollectionService) {
    const user = auth.getUserOrFail()
    const { tagId } = await request.validateUsing(attachTagValidator)
    const tag = await Tag.query().where('id', tagId).where('user_id', user.id).firstOrFail()
    if (!(await collection.owns(user, Number(params.id)))) {
      return response.notFound()
    }

    await tag.related('cards').sync([Number(params.id)], false)
    return response.redirect().back()
  }

  async detach({ auth, params, response }: HttpContext) {
    const tag = await Tag.query()
      .where('id', params.tagId)
      .where('user_id', auth.getUserOrFail().id)
      .firstOrFail()
    await tag.related('cards').detach([Number(params.id)])

    return response.redirect().back()
  }
}
