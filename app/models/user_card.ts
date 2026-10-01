import { UserCardSchema } from '#database/schema'
import Card from '#models/card'
import User from '#models/user'
import BoosterOpening from '#models/booster_opening'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UserCard extends UserCardSchema {
  @belongsTo(() => Card)
  declare card: BelongsTo<typeof Card>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => BoosterOpening)
  declare boosterOpening: BelongsTo<typeof BoosterOpening>
}
