import { BaseSchema } from '@adonisjs/lucid/schema'
import { NOTIFICATION_TYPES } from '#config/game'

/**
 * Cards a player is looking for. Also allows the new notification type
 * sent when one of them is listed in an auction.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('wishlist_items', (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.integer('card_id').notNullable().references('cards.id').onDelete('CASCADE')
      table.timestamp('created_at').notNullable()

      table.unique(['user_id', 'card_id'])
      table.index(['card_id'])
    })

    this.schema.raw('ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check')
    this.schema.raw(
      `ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (${NOTIFICATION_TYPES.map((t) => `'${t}'`).join(', ')}))`
    )
  }

  async down() {
    this.schema.dropTable('wishlist_items')
  }
}
