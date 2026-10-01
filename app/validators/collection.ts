import vine from '@vinejs/vine'
import { RARITIES } from '#config/game'

export const collectionFiltersValidator = vine.create({
  rarity: vine.enum(RARITIES).optional(),
  duplicates: vine.boolean().optional(),
  favorites: vine.boolean().optional(),
  tag: vine.number().withoutDecimals().positive().optional(),
  q: vine.string().trim().maxLength(100).optional(),
  sort: vine.enum(['recent', 'title', 'rarity'] as const).optional(),
  page: vine.number().min(1).optional(),
})
