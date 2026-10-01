import { BidSchema } from '#database/schema'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Bid extends BidSchema {
  @belongsTo(() => User, { foreignKey: 'bidderId' })
  declare bidder: BelongsTo<typeof User>
}
