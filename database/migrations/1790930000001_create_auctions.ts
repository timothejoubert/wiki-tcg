import { BaseSchema } from '@adonisjs/lucid/schema'
import { AUCTION_STATUSES } from '#config/game'

/**
 * Auctions sell one copy. Bids are held on the bidder's balance and
 * refunded when outbid, so a winning bid is always paid.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('auctions', (table) => {
      table.increments('id').notNullable()
      table.integer('seller_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('user_card_id').notNullable().references('user_cards.id').onDelete('CASCADE')
      table.integer('card_id').notNullable().references('cards.id').onDelete('CASCADE')
      table.integer('starting_price').notNullable()
      table.integer('current_price').nullable()
      table.integer('leader_id').nullable().references('users.id').onDelete('SET NULL')
      table.integer('bids_count').notNullable().defaultTo(0)
      table.timestamp('ends_at').notNullable()
      table
        .enum('status', [...AUCTION_STATUSES])
        .notNullable()
        .defaultTo('open')
      table.timestamp('settled_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status', 'ends_at'])
    })
    // A copy can only be in one open auction at a time
    this.schema.raw(
      "CREATE UNIQUE INDEX auctions_open_user_card_unique ON auctions (user_card_id) WHERE status = 'open'"
    )

    this.schema.createTable('bids', (table) => {
      table.increments('id').notNullable()
      table.integer('auction_id').notNullable().references('auctions.id').onDelete('CASCADE')
      table.integer('bidder_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('amount').notNullable()
      table.timestamp('created_at').notNullable()

      table.index(['auction_id', 'created_at'])
    })

    this.schema.alterTable('wallet_transactions', (table) => {
      table.integer('auction_id').nullable().references('auctions.id').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable('wallet_transactions', (table) => {
      table.dropColumn('auction_id')
    })
    this.schema.dropTable('bids')
    this.schema.dropTable('auctions')
  }
}
