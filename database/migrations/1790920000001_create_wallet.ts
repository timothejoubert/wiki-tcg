import { BaseSchema } from '@adonisjs/lucid/schema'
import { WALLET_KINDS } from '#config/game'

/**
 * Wallet balance plus an append-only ledger: every movement is recorded
 * with the balance it left, so the history always adds up.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.integer('balance').notNullable().defaultTo(0)
      table.date('daily_bonus_claimed_on').nullable()
    })
    this.schema.raw(
      'ALTER TABLE users ADD CONSTRAINT users_balance_non_negative CHECK (balance >= 0)'
    )

    this.schema.createTable('wallet_transactions', (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('amount').notNullable()
      table.enum('kind', [...WALLET_KINDS]).notNullable()
      table.integer('balance_after').notNullable()
      table.integer('card_id').nullable().references('cards.id').onDelete('SET NULL')
      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable('wallet_transactions')
    this.schema.alterTable('users', (table) => {
      table.dropColumn('daily_bonus_claimed_on')
      table.dropColumn('balance')
    })
  }
}
