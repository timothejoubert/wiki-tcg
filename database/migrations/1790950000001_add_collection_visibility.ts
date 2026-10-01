import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Collections are public to signed-in players unless the owner hides it.
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('collection_public').notNullable().defaultTo(true)
    })
    this.schema.raw(
      'CREATE INDEX users_lower_username_prefix ON users (lower(username) text_pattern_ops)'
    )
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS users_lower_username_prefix')
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('collection_public')
    })
  }
}
