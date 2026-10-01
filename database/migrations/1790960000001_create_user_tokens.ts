import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Single-use tokens sent by email (password reset, email change). Only a
 * SHA-256 hash is stored: a database leak does not leak usable links.
 */
export default class extends BaseSchema {
  protected tableName = 'user_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE')
      table.enum('type', ['password_reset', 'email_change']).notNullable()
      table.string('token_hash', 64).notNullable().unique()
      table.string('email', 254).nullable()
      table.timestamp('expires_at').notNullable()
      table.timestamp('used_at').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['user_id', 'type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
