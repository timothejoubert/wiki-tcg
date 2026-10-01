import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'booster_openings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE').index()
      table.timestamp('opened_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
