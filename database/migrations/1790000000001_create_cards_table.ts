import { BaseSchema } from '@adonisjs/lucid/schema'
import { QUALITY_LABELS, RARITIES } from '#config/game'

export default class extends BaseSchema {
  protected tableName = 'cards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('lang', 8).notNullable()
      table.integer('wiki_page_id').notNullable()
      table.integer('wiki_revision_id').notNullable()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.text('thumbnail_url').nullable()

      table.integer('avg_daily_views').notNullable()
      table.integer('length_bytes').notNullable()
      table.enum('quality_label', [...QUALITY_LABELS]).nullable()
      table.float('quality_score').nullable()

      table
        .enum('rarity', [...RARITIES])
        .notNullable()
        .index()
      table.integer('attack').notNullable()
      table.integer('defense').notNullable()
      table.timestamp('snapshot_at').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['lang', 'wiki_page_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
