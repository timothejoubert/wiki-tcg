import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { refilledStock } from '#services/booster_stock'

const start = DateTime.fromISO('2026-10-01T12:00:00Z')

test.group('Booster stock', () => {
  test('earns one booster every 10 minutes', ({ assert }) => {
    const user = { boosterStock: 2, boosterRefilledAt: start }

    assert.equal(refilledStock(user, start.plus({ minutes: 9, seconds: 59 })).stock, 2)
    assert.equal(refilledStock(user, start.plus({ minutes: 10 })).stock, 3)
    assert.equal(refilledStock(user, start.plus({ minutes: 35 })).stock, 5)
  })

  test('keeps the progress towards the next booster', ({ assert }) => {
    const user = { boosterStock: 0, boosterRefilledAt: start }
    const { refilledAt } = refilledStock(user, start.plus({ minutes: 25 }))

    assert.equal(refilledAt.toISO(), start.plus({ minutes: 20 }).toISO())
  })

  test('caps the stock at 10 and restarts the timer once full', ({ assert }) => {
    const user = { boosterStock: 8, boosterRefilledAt: start }
    const now = start.plus({ hours: 5 })
    const result = refilledStock(user, now)

    assert.equal(result.stock, 10)
    assert.equal(result.refilledAt.toISO(), now.toISO())
  })
})
