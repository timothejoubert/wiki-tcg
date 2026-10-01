import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Personal tags: each player names their own and applies them to cards.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('tags', (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.string('name', 30).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
    this.schema.raw(
      'CREATE UNIQUE INDEX tags_user_id_lower_name_unique ON tags (user_id, lower(name))'
    )

    this.schema.createTable('card_tags', (table) => {
      table.increments('id').notNullable()
      table.integer('tag_id').notNullable().references('tags.id').onDelete('CASCADE')
      table.integer('card_id').notNullable().references('cards.id').onDelete('CASCADE')

      table.unique(['tag_id', 'card_id'])
      table.index(['card_id'])
    })
  }

  async down() {
    this.schema.dropTable('card_tags')
    this.schema.dropTable('tags')
  }
}
