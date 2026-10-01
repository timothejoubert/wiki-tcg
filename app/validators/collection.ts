import vine from '@vinejs/vine'
import { RARITIES } from '#config/game'

export const collectionFiltersValidator = vine.create({
  rarity: vine.enum(RARITIES).optional(),
  duplicates: vine.boolean().optional(),
  sort: vine.enum(['recent', 'title', 'rarity'] as const).optional(),
  page: vine.number().min(1).optional(),
})
