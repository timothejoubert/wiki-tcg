import { DateTime } from 'luxon'
import User from '#models/user'
import gameConfig from '#config/game'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

/**
 * Local test accounts: `node ace db:seed` (development only). The second
 * one starts with wikis to bid on the first one's auctions.
 */
export const devPlayers = [
  { username: 'testeur', email: 'testeur@wiki-tcg.test', password: 'testeur-wiki-tcg', balance: 0 },
  { username: 'rival', email: 'rival@wiki-tcg.test', password: 'rival-wiki-tcg', balance: 500 },
]

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    for (const player of devPlayers) {
      await User.firstOrCreate(
        { username: player.username },
        {
          ...player,
          adultConfirmedAt: DateTime.now(),
          boosterStock: gameConfig.boosters.initialStock,
          boosterRefilledAt: DateTime.now(),
        }
      )
    }
  }
}
