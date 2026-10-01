import { TagSchema } from '#database/schema'
import Card from '#models/card'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Tag extends TagSchema {
  @manyToMany(() => Card, { pivotTable: 'card_tags' })
  declare cards: ManyToMany<typeof Card>
}
