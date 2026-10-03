import type { Rarity } from '~/lib/game'

/**
 * Short vibrations where the device supports them (most Android phones;
 * iOS Safari ignores the API). Patterns grow with the rarity.
 */
const patterns: Record<Rarity, number | number[]> = {
  common: 0,
  uncommon: 12,
  rare: 25,
  super_rare: [30, 50, 30],
  legendary: [40, 60, 40, 60, 90],
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator && pattern) {
    navigator.vibrate(pattern)
  }
}

export function vibrateFor(rarity: Rarity) {
  vibrate(patterns[rarity])
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
