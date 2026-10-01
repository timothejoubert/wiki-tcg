import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * One row per owned copy, so a copy can later be traded or auctioned on its own.
 */
export default class extends BaseSchema {
  protected tableName = 'user_cards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('card_id').notNullable().references('cards.id').onDelete('CASCADE')
      table
        .integer('booster_opening_id')
        .nullable()
        .references('booster_openings.id')
        .onDelete('SET NULL')
      table.boolean('is_favorite').notNullable().defaultTo(false)
      table.timestamp('obtained_at').notNullable()

      table.index(['user_id', 'card_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
