import db from '@adonisjs/lucid/services/db'
import Auction from '#models/auction'
import Card from '#models/card'
import UserCard from '#models/user_card'
import CardTransformer from '#transformers/card_transformer'
import TagTransformer from '#transformers/tag_transformer'
import CollectionService from '#services/collection_service'
import gameConfig from '#config/game'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class CardsController {
  @inject()
  async show({ inertia, auth, params }: HttpContext, collection: CollectionService) {
    const user = auth.getUserOrFail()
    const card = await Card.query()
      .select('cards.*')
      .select(
        db.raw(
          'exists(select 1 from card_favorites f where f.card_id = cards.id and f.user_id = ?) as is_favorite',
          [user.id]
        )
      )
      .where('id', params.id)
      .withCount('copies', (copies) => copies.where('user_id', user.id))
      .preload('tags', (tags) => tags.where('tags.user_id', user.id).orderBy('name'))
      .firstOrFail()

    const free = await UserCard.query()
      .where({ userId: user.id, cardId: card.id })
      .whereNotExists((open) =>
        open
          .from('auctions')
          .whereColumn('auctions.user_card_id', 'user_cards.id')
          .where('auctions.status', 'open')
      )
      .count('* as total')
      .firstOrFail()
    const openAuctions = await Auction.query()
      .where({ sellerId: user.id, cardId: card.id, status: 'open' })
      .select('id')

    return inertia.render('cards/show', {
      card: CardTransformer.transform(card),
      tags: TagTransformer.transform(await collection.tags(user)),
      salePrice: gameConfig.economy.bankSale[card.rarity],
      freeCopies: Number(free.$extras.total),
      openAuctionIds: openAuctions.map((auction) => auction.id),
      auctionRules: {
        minStartingPrice: gameConfig.economy.auctions.minStartingPrice,
        durationsHours: gameConfig.economy.auctions.durationsHours,
      },
    })
  }
}
