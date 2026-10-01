import vine from '@vinejs/vine'
import gameConfig from '#config/game'

const side = () =>
  vine
    .array(vine.number().withoutDecimals().positive())
    .minLength(1)
    .maxLength(gameConfig.economy.trades.maxCardsPerSide)
    .distinct()

export const proposeTradeValidator = vine.create({
  recipient: vine.string().trim().minLength(1).maxLength(32),
  offered: side(),
  requested: side(),
})
