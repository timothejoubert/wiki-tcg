import gameConfig, { type Rarity } from '#config/game'

const { rarityThresholds } = gameConfig

/**
 * Average of the daily pageviews, ignoring days the API has no data for.
 */
export function averageDailyViews(pageviews: Record<string, number | null> | undefined): number {
  const values = Object.values(pageviews ?? {}).filter((value): value is number => value !== null)
  if (values.length === 0) {
    return 0
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export function rarityFor(avgDailyViews: number): Rarity {
  return rarityThresholds.find((tier) => avgDailyViews >= tier.minDailyViews)?.rarity ?? 'common'
}
