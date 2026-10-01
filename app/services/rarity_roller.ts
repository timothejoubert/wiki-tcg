import gameConfig, { RARITIES, type Rarity } from '#config/game'

const { boosters } = gameConfig

/**
 * Rarities from `rarity` down to common, the order slots fall back in when
 * no card of the rolled rarity is available.
 */
export function rarityFallbacks(rarity: Rarity): Rarity[] {
  return RARITIES.slice(0, RARITIES.indexOf(rarity) + 1).reverse()
}

export function isAtLeast(rarity: Rarity, minRarity: Rarity) {
  return RARITIES.indexOf(rarity) >= RARITIES.indexOf(minRarity)
}

/**
 * Rolls the rarity of each booster slot from the configured drop rates.
 * Bound in the container so tests can force the outcome.
 */
export default class RarityRoller {
  random: () => number = Math.random

  roll(minRarity: Rarity = 'common'): Rarity {
    const eligible = RARITIES.filter((rarity) => isAtLeast(rarity, minRarity))
    const total = eligible.reduce((sum, rarity) => sum + boosters.dropRates[rarity], 0)

    let ticket = this.random() * total
    for (const rarity of eligible) {
      ticket -= boosters.dropRates[rarity]
      if (ticket < 0) {
        return rarity
      }
    }

    return eligible[eligible.length - 1]
  }

  /**
   * One rarity per slot, the guaranteed slot last.
   */
  rollBooster(): Rarity[] {
    return [
      ...Array.from({ length: boosters.cardsPerBooster - 1 }, () => this.roll()),
      this.roll(boosters.guaranteedSlot.minRarity),
    ]
  }
}
