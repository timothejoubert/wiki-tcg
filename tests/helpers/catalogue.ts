import { DateTime } from 'luxon'
import Card from '#models/card'
import type { Rarity } from '#config/game'

let sequence = 900_000

/**
 * A card already in the catalogue, as left by a previous draw or a harvest.
 */
export function catalogueCard(rarity: Rarity, overrides: Partial<Card> = {}) {
  sequence++
  return Card.create({
    lang: 'fr',
    wikiPageId: sequence,
    wikiRevisionId: sequence * 10,
    title: `Catalogue ${sequence}`,
    description: null,
    thumbnailUrl: null,
    avgDailyViews: 0,
    lengthBytes: 1000,
    qualityLabel: null,
    rarity,
    snapshotAt: DateTime.now(),
    ...overrides,
  })
}
