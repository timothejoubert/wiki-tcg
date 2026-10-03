import { BaseSchema } from '@adonisjs/lucid/schema'
import { NOTIFICATION_TYPES } from '#config/game'

/**
 * In-app notifications, written in the same transaction as the event they
 * describe. `data` holds what the UI needs to render and link them.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.createTable('notifications', (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.enum('type', [...NOTIFICATION_TYPES]).notNullable()
      table.jsonb('data').notNullable().defaultTo('{}')
      table.timestamp('read_at').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'created_at'])
    })
    this.schema.raw(
      'CREATE INDEX notifications_unread ON notifications (user_id) WHERE read_at IS NULL'
    )

    this.schema.alterTable('users', (table) => {
      table.boolean('notify_by_email').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('notify_by_email')
    })
    this.schema.dropTable('notifications')
  }
}
