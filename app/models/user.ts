import { UserSchema } from '#database/schema'
import UserCard from '#models/user_card'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

export default class User extends compose(
  UserSchema,
  withAuthFinder(hash, { uids: ['email', 'username'] })
) {
  @hasMany(() => UserCard)
  declare cards: HasMany<typeof UserCard>

  get initials() {
    return this.username.slice(0, 2).toUpperCase()
  }
}
