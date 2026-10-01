import vine from '@vinejs/vine'
import gameConfig, { RARITIES } from '#config/game'

const { auctions } = gameConfig.economy

export const createAuctionValidator = vine.create({
  cardId: vine.number().withoutDecimals().positive(),
  startingPrice: vine.number().withoutDecimals().min(auctions.minStartingPrice).max(1_000_000),
  durationHours: vine.number().in(auctions.durationsHours),
})

export const bidValidator = vine.create({
  amount: vine.number().withoutDecimals().positive().max(1_000_000_000),
})

export const auctionFiltersValidator = vine.create({
  scope: vine.enum(['all', 'selling', 'bidding'] as const).optional(),
  rarity: vine.enum(RARITIES).optional(),
  sort: vine.enum(['ending', 'newest', 'price'] as const).optional(),
  page: vine.number().min(1).optional(),
})
