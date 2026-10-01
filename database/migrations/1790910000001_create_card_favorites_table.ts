import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Favorites are per card, not per copy: starring a card stars all its copies.
 */
export default class extends BaseSchema {
  protected tableName = 'card_favorites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('card_id').notNullable().references('cards.id').onDelete('CASCADE')
      table.timestamp('created_at').notNullable()

      table.unique(['user_id', 'card_id'])
    })

    this.schema.alterTable('user_cards', (table) => {
      table.dropColumn('is_favorite')
    })
  }

  async down() {
    this.schema.alterTable('user_cards', (table) => {
      table.boolean('is_favorite').notNullable().defaultTo(false)
    })
    this.schema.dropTable(this.tableName)
  }
}
