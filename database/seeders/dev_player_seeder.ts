import { DateTime } from 'luxon'
import User from '#models/user'
import gameConfig from '#config/game'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

/**
 * Local test account: `node ace db:seed` (development only).
 */
export const devPlayer = {
  username: 'testeur',
  email: 'testeur@wiki-tcg.test',
  password: 'testeur-wiki-tcg',
}

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    await User.firstOrCreate(
      { username: devPlayer.username },
      {
        ...devPlayer,
        adultConfirmedAt: DateTime.now(),
        boosterStock: gameConfig.boosters.initialStock,
        boosterRefilledAt: DateTime.now(),
      }
    )
  }
}
