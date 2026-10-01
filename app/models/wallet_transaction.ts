import { WalletTransactionSchema } from '#database/schema'
import Card from '#models/card'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class WalletTransaction extends WalletTransactionSchema {
  @belongsTo(() => Card)
  declare card: BelongsTo<typeof Card>
}
