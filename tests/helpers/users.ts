import { DateTime } from 'luxon'
import User from '#models/user'

let sequence = 0

export function createUser(
  overrides: Partial<Pick<User, 'boosterStock' | 'boosterRefilledAt'>> = {}
) {
  sequence++
  return User.create({
    username: `player${sequence}`,
    email: `player${sequence}@example.com`,
    password: 'secret-password',
    adultConfirmedAt: DateTime.now(),
    boosterStock: 3,
    boosterRefilledAt: DateTime.now(),
    ...overrides,
  })
}
