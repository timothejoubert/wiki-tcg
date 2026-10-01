import { BaseSchema } from '@adonisjs/lucid/schema'
import { TRADE_STATUSES } from '#config/game'

/**
 * Card-for-card trade offers. Items point at the copies picked when the
 * offer was made; acceptance re-checks them and swaps owners atomically.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('trades', (table) => {
      table.increments('id').notNullable()
      table.integer('proposer_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('recipient_id').notNullable().references('users.id').onDelete('CASCADE')
      table
        .enum('status', [...TRADE_STATUSES])
        .notNullable()
        .defaultTo('pending')
      table.timestamp('expires_at').notNullable()
      table.timestamp('responded_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['recipient_id', 'status'])
      table.index(['proposer_id', 'status'])
    })

    this.schema.createTable('trade_items', (table) => {
      table.increments('id').notNullable()
      table.integer('trade_id').notNullable().references('trades.id').onDelete('CASCADE')
      table.integer('owner_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('card_id').notNullable().references('cards.id').onDelete('CASCADE')
      table.integer('user_card_id').nullable().references('user_cards.id').onDelete('SET NULL')

      table.index(['trade_id'])
    })
  }

  async down() {
    this.schema.dropTable('trade_items')
    this.schema.dropTable('trades')
  }
}
