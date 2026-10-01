import { DateTime } from 'luxon'
import UserCard from '#models/user_card'
import type User from '#models/user'
import type Card from '#models/card'

/**
 * Gives `copies` copies of a catalogue card to a player.
 */
export async function own(user: User, card: Card, copies = 1) {
  for (let index = 0; index < copies; index++) {
    await UserCard.create({
      userId: user.id,
      cardId: card.id,
      boosterOpeningId: null,
      obtainedAt: DateTime.now().plus({ milliseconds: index }),
    })
  }
}
