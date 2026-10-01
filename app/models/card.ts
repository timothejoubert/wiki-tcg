import { CardSchema } from '#database/schema'
import UserCard from '#models/user_card'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Card extends CardSchema {
  @hasMany(() => UserCard)
  declare copies: HasMany<typeof UserCard>

  get wikipediaUrl() {
    return `https://${this.lang}.wikipedia.org/wiki/${encodeURIComponent(this.title.replaceAll(' ', '_'))}`
  }
}
