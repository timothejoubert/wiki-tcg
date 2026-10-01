import { BoosterOpeningSchema } from '#database/schema'
import UserCard from '#models/user_card'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class BoosterOpening extends BoosterOpeningSchema {
  @hasMany(() => UserCard)
  declare cards: HasMany<typeof UserCard>
}
