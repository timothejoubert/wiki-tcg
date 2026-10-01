import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Accent-insensitive collection search (« eveque » finds « Évêque »).
 * Requires a role allowed to create extensions.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS unaccent')
  }

  async down() {
    this.schema.raw('DROP EXTENSION IF EXISTS unaccent')
  }
}
