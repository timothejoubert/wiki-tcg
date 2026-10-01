import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Cards no longer carry attack/defense stats, nor the Lift Wing quality
 * score that only fed the defense.
 */
export default class extends BaseSchema {
  protected tableName = 'cards'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('attack')
      table.dropColumn('defense')
      table.dropColumn('quality_score')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.float('quality_score').nullable()
      table.integer('attack').notNullable().defaultTo(0)
      table.integer('defense').notNullable().defaultTo(0)
    })
  }
}
