import type Card from '#models/card'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class CardTransformer extends BaseTransformer<Card> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'description',
        'thumbnailUrl',
        'wikipediaUrl',
        'rarity',
        'qualityLabel',
        'avgDailyViews',
        'lengthBytes',
        'snapshotAt',
      ]),
      /**
       * Copies owned by the current player, when loaded with `withCount`.
       */
      copies: this.resource.$extras.copies_count as number | undefined,
    }
  }
}
