import type Trade from '#models/trade'
import CardTransformer from '#transformers/card_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TradeTransformer extends BaseTransformer<Trade> {
  toObject() {
    const items = this.resource.items ?? []
    const side = (ownerId: number) =>
      CardTransformer.transform(
        items.filter((item) => item.ownerId === ownerId).map((item) => item.card)
      )

    return {
      ...this.pick(this.resource, [
        'id',
        'status',
        'proposerId',
        'recipientId',
        'expiresAt',
        'respondedAt',
        'createdAt',
      ]),
      proposer: { username: this.resource.proposer.username },
      recipient: { username: this.resource.recipient.username },
      offered: side(this.resource.proposerId),
      requested: side(this.resource.recipientId),
    }
  }
}
