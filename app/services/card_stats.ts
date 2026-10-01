import gameConfig, { type QualityLabel, type Rarity } from '#config/game'

const { stats, rarityThresholds } = gameConfig

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

/**
 * Article length mapped on a log scale between `attackMinBytes` and
 * `attackMaxBytes`, rounded to the ten.
 */
export function attackFor(lengthBytes: number): number {
  const min = Math.log(stats.attackMinBytes)
  const max = Math.log(stats.attackMaxBytes)
  const ratio = (Math.log(Math.max(lengthBytes, 1)) - min) / (max - min)

  return roundToTen(clamp(ratio) * stats.max)
}

/**
 * Community labels win; otherwise the Lift Wing quality score (0..1)
 * scales up to `defenseUnlabelledMax`.
 */
export function defenseFor(qualityLabel: QualityLabel | null, qualityScore: number | null): number {
  if (qualityLabel) {
    return stats.defenseByLabel[qualityLabel]
  }

  return roundToTen(clamp(qualityScore ?? 0) * stats.defenseUnlabelledMax)
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function roundToTen(value: number) {
  return Math.round(value / 10) * 10
}
