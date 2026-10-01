import type Tag from '#models/tag'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TagTransformer extends BaseTransformer<Tag> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'name']),
      /**
       * Owned cards carrying the tag, when loaded with `withCount`.
       */
      cards:
        this.resource.$extras.cards_count === undefined
          ? undefined
          : Number(this.resource.$extras.cards_count),
    }
  }
}
