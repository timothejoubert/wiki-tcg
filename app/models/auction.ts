import { AuctionSchema } from '#database/schema'
import Bid from '#models/bid'
import Card from '#models/card'
import User from '#models/user'
import UserCard from '#models/user_card'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class Auction extends AuctionSchema {
  @belongsTo(() => Card)
  declare card: BelongsTo<typeof Card>

  @belongsTo(() => UserCard)
  declare userCard: BelongsTo<typeof UserCard>

  @belongsTo(() => User, { foreignKey: 'sellerId' })
  declare seller: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'leaderId' })
  declare leader: BelongsTo<typeof User>

  @hasMany(() => Bid)
  declare bids: HasMany<typeof Bid>
}
