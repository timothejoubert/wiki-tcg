import { WishlistItemSchema } from '#database/schema'
import Card from '#models/card'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class WishlistItem extends WishlistItemSchema {
  @belongsTo(() => Card)
  declare card: BelongsTo<typeof Card>
}
