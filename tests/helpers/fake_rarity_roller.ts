import type { Rarity } from '#config/game'
import RarityRoller from '#services/rarity_roller'

/**
 * Serves the queued slot rarities, one booster at a time; all commons once
 * the queue is empty.
 */
export default class FakeRarityRoller extends RarityRoller {
  boosters: Rarity[][] = []

  rollBooster(): Rarity[] {
    return this.boosters.shift() ?? ['common', 'common', 'common', 'common', 'common']
  }
}
