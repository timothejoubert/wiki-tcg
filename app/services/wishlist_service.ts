import db from '@adonisjs/lucid/services/db'
import type User from '#models/user'
import WishlistItem from '#models/wishlist_item'

export type Owner = { username: string; copies: number }

/**
 * Cards a player is looking for, and who could trade them.
 */
export default class WishlistService {
  async has(user: User, cardId: number) {
    return (await WishlistItem.query().where({ userId: user.id, cardId }).first()) !== null
  }

  /**
   * Adds or removes the card. Returns whether it is now wished.
   */
  async toggle(user: User, cardId: number) {
    const existing = await WishlistItem.query().where({ userId: user.id, cardId }).first()
    if (existing) {
      await existing.delete()
      return false
    }
    await WishlistItem.create({ userId: user.id, cardId })
    return true
  }

  /**
   * Wished cards, newest first, with whether the player owns them now and
   * the public owners who hold them (spare copies first).
   */
  async list(user: User) {
    const items = await WishlistItem.query()
      .where('user_id', user.id)
      .preload('card')
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
    const cardIds = items.map((item) => item.cardId)
    if (cardIds.length === 0) return []

    const ownedRows: { card_id: number }[] = await db
      .from('user_cards')
      .where('user_id', user.id)
      .whereIn('card_id', cardIds)
      .distinct('card_id')
    const owned = new Set(ownedRows.map((row) => row.card_id))
    const rows: { card_id: number; username: string; copies: string }[] = await db
      .from('user_cards')
      .join('users', 'users.id', 'user_cards.user_id')
      .whereIn('user_cards.card_id', cardIds)
      .where('users.collection_public', true)
      .whereNot('users.id', user.id)
      .groupBy('user_cards.card_id', 'users.id', 'users.username')
      .select('user_cards.card_id', 'users.username')
      .count('user_cards.id as copies')
      .orderBy('copies', 'desc')
      .orderBy('users.username')

    const owners = new Map<number, Owner[]>()
    for (const row of rows) {
      const list = owners.get(row.card_id) ?? []
      if (list.length < 8) list.push({ username: row.username, copies: Number(row.copies) })
      owners.set(row.card_id, list)
    }

    return items.map((item) => ({
      card: item.card,
      owned: owned.has(item.cardId),
      owners: owners.get(item.cardId) ?? [],
    }))
  }
}
