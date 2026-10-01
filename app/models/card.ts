import { CardSchema } from '#database/schema'
import Tag from '#models/tag'
import UserCard from '#models/user_card'
import { hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Card extends CardSchema {
  @hasMany(() => UserCard)
  declare copies: HasMany<typeof UserCard>

  /**
   * Tags of every player: always scope by `tags.user_id`.
   */
  @manyToMany(() => Tag, { pivotTable: 'card_tags' })
  declare tags: ManyToMany<typeof Tag>

  get wikipediaUrl() {
    return `https://${this.lang}.wikipedia.org/wiki/${encodeURIComponent(this.title.replaceAll(' ', '_'))}`
  }
}
