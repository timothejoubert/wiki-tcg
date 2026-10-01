import { TradeItemSchema } from '#database/schema'
import Card from '#models/card'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class TradeItem extends TradeItemSchema {
  @belongsTo(() => Card)
  declare card: BelongsTo<typeof Card>
}
