import { DateTime } from 'luxon'
import gameConfig from '#config/game'
import type User from '#models/user'

const { boosters } = gameConfig
const refillEvery = { minutes: boosters.refillEveryMinutes }

export type BoosterStock = {
  available: number
  max: number
  nextRefillAt: DateTime | null
}

/**
 * Boosters refill lazily: the stored stock is only brought up to date when
 * it is read or spent, so no scheduler is needed.
 */
export function refilledStock(
  user: Pick<User, 'boosterStock' | 'boosterRefilledAt'>,
  now: DateTime
) {
  const intervalMs = boosters.refillEveryMinutes * 60_000
  const elapsed = Math.max(0, now.toMillis() - user.boosterRefilledAt.toMillis())
  const accrued = Math.floor(elapsed / intervalMs)

  if (user.boosterStock + accrued >= boosters.maxStock) {
    return { stock: Math.max(user.boosterStock, boosters.maxStock), refilledAt: now }
  }

  return {
    stock: user.boosterStock + accrued,
    refilledAt: user.boosterRefilledAt.plus({ milliseconds: accrued * intervalMs }),
  }
}

export function stockOf(user: User, now = DateTime.now()): BoosterStock {
  const { stock, refilledAt } = refilledStock(user, now)

  return {
    available: stock,
    max: boosters.maxStock,
    nextRefillAt: stock < boosters.maxStock ? refilledAt.plus(refillEvery) : null,
  }
}
