import db from '@adonisjs/lucid/services/db'
import Card from '#models/card'
import Tag from '#models/tag'
import type User from '#models/user'
import UserCard from '#models/user_card'
import { RARITIES, type Rarity } from '#config/game'

export type CollectionFilters = {
  rarity?: Rarity
  duplicates?: boolean
  favorites?: boolean
  tag?: number
  q?: string
  sort?: 'recent' | 'title' | 'rarity'
  page?: number
}

export type Progression = {
  cards: number
  copies: number
  byRarity: Record<Rarity, { cards: number; copies: number }>
}

const PER_PAGE = 30

/**
 * Escapes LIKE wildcards so a search for « 100% » is literal.
 */
function likePattern(search: string) {
  return `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
}

/**
 * Read side of a player's album: owned cards with copies, favorites and
 * tags, plus the progression counters.
 */
export default class CollectionService {
  async list(user: User, filters: CollectionFilters) {
    const ownedBy = (query: any) => query.where('user_id', user.id)

    const query = Card.query()
      .select('cards.*')
      .select(
        db.raw(
          'exists(select 1 from card_favorites f where f.card_id = cards.id and f.user_id = ?) as is_favorite',
          [user.id]
        )
      )
      .whereHas('copies', ownedBy)
      .withCount('copies', ownedBy)
      .withAggregate('copies', (copies) =>
        ownedBy(copies).max('obtained_at').as('last_obtained_at')
      )
      .preload('tags', (tags) => tags.where('tags.user_id', user.id).orderBy('name'))

    if (filters.rarity) {
      query.where('rarity', filters.rarity)
    }
    if (filters.duplicates) {
      query.whereHas('copies', ownedBy, '>', 1)
    }
    if (filters.favorites) {
      query.whereExists((sub) =>
        sub
          .from('card_favorites')
          .whereColumn('card_favorites.card_id', 'cards.id')
          .where('card_favorites.user_id', user.id)
      )
    }
    if (filters.tag) {
      query.whereHas('tags', (tags) =>
        tags.where('tags.id', filters.tag!).where('tags.user_id', user.id)
      )
    }
    if (filters.q) {
      const pattern = likePattern(filters.q)
      query.where((search) =>
        search
          .whereRaw('unaccent(cards.title) ilike unaccent(?)', [pattern])
          .orWhereRaw("unaccent(coalesce(cards.description, '')) ilike unaccent(?)", [pattern])
      )
    }

    switch (filters.sort ?? 'recent') {
      case 'title':
        query.orderBy('title', 'asc')
        break
      case 'rarity':
        query.orderByRaw(`array_position(?::text[], rarity::text) desc`, [RARITIES as any])
        break
      default:
        query.orderBy('last_obtained_at', 'desc')
    }
    query.orderBy('id', 'asc')

    return query.paginate(filters.page ?? 1, PER_PAGE)
  }

  async progression(user: User): Promise<Progression> {
    const rows: { rarity: Rarity; cards: string; copies: string }[] = await db
      .from('user_cards')
      .join('cards', 'cards.id', 'user_cards.card_id')
      .where('user_cards.user_id', user.id)
      .select('cards.rarity')
      .countDistinct('cards.id as cards')
      .count('user_cards.id as copies')
      .groupBy('cards.rarity')

    const byRarity = Object.fromEntries(
      RARITIES.map((rarity) => [rarity, { cards: 0, copies: 0 }])
    ) as Progression['byRarity']
    for (const row of rows) {
      byRarity[row.rarity] = { cards: Number(row.cards), copies: Number(row.copies) }
    }

    return {
      cards: rows.reduce((sum, row) => sum + Number(row.cards), 0),
      copies: rows.reduce((sum, row) => sum + Number(row.copies), 0),
      byRarity,
    }
  }

  /**
   * Latest distinct cards obtained, newest first.
   */
  async recent(user: User, limit = 6): Promise<Card[]> {
    const copies = await UserCard.query()
      .where('user_id', user.id)
      .orderBy('obtained_at', 'desc')
      .orderBy('id', 'desc')
      .limit(limit * 5)
      .preload('card')

    const seen = new Set<number>()
    return copies
      .filter((copy) => !seen.has(copy.cardId) && seen.add(copy.cardId))
      .slice(0, limit)
      .map((copy) => copy.card)
  }

  tags(user: User) {
    return Tag.query()
      .where('user_id', user.id)
      .withCount('cards', (cards) =>
        cards.whereExists((sub) =>
          sub
            .from('user_cards')
            .whereColumn('user_cards.card_id', 'cards.id')
            .where('user_cards.user_id', user.id)
        )
      )
      .orderBy('name')
  }

  async owns(user: User, cardId: number) {
    const copy = await UserCard.query().where({ userId: user.id, cardId }).first()
    return copy !== null
  }
}
