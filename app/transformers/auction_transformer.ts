import type Auction from '#models/auction'
import CardTransformer from '#transformers/card_transformer'
import { minNextBid } from '#services/auction_service'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class AuctionTransformer extends BaseTransformer<Auction> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'startingPrice',
        'currentPrice',
        'bidsCount',
        'endsAt',
        'status',
        'sellerId',
        'leaderId',
      ]),
      minNextBid: minNextBid(this.resource),
      seller: this.resource.seller ? { username: this.resource.seller.username } : null,
      leader: this.resource.leader ? { username: this.resource.leader.username } : null,
      card: CardTransformer.transform(this.whenLoaded(this.resource.card)),
    }
  }
}
