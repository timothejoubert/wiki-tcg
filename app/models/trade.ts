import { TradeSchema } from '#database/schema'
import TradeItem from '#models/trade_item'
import User from '#models/user'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class Trade extends TradeSchema {
  @belongsTo(() => User, { foreignKey: 'proposerId' })
  declare proposer: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'recipientId' })
  declare recipient: BelongsTo<typeof User>

  @hasMany(() => TradeItem)
  declare items: HasMany<typeof TradeItem>
}
