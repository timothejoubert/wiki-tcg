import { UserCardSchema } from '#database/schema'
import Card from '#models/card'
import User from '#models/user'
import BoosterOpening from '#models/booster_opening'
import { belongsTo, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UserCard extends UserCardSchema {
  /**
   * Copies not listed in an open auction: free to sell, list or trade.
   */
  static free = scope((query) => {
    query.whereNotExists((open) =>
      open
        .from('auctions')
        .whereColumn('auctions.user_card_id', 'user_cards.id')
        .where('auctions.status', 'open')
    )
  })

  @belongsTo(() => Card)
  declare card: BelongsTo<typeof Card>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => BoosterOpening)
  declare boosterOpening: BelongsTo<typeof BoosterOpening>
}
