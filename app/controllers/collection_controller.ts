import Card from '#models/card'
import { RARITIES } from '#config/game'
import CardTransformer from '#transformers/card_transformer'
import { collectionFiltersValidator } from '#validators/collection'
import type { HttpContext } from '@adonisjs/core/http'

const PER_PAGE = 30

export default class CollectionController {
  async index({ inertia, auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const filters = await collectionFiltersValidator.validate(request.qs())
    const ownedBy = (query: any) => query.where('user_id', user.id)

    const query = Card.query()
      .whereHas('copies', ownedBy)
      .withCount('copies', ownedBy)
      .withAggregate('copies', (copies) =>
        ownedBy(copies).max('obtained_at').as('last_obtained_at')
      )

    if (filters.rarity) {
      query.where('rarity', filters.rarity)
    }
    if (filters.duplicates) {
      query.whereHas('copies', ownedBy, '>', 1)
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

    const cards = await query.paginate(filters.page ?? 1, PER_PAGE)
    const totals = await Card.query()
      .whereHas('copies', ownedBy)
      .select('rarity')
      .count('* as total')
      .groupBy('rarity')

    return inertia.render('collection', {
      filters,
      cards: CardTransformer.paginate(cards.all(), cards.getMeta()),
      totals: Object.fromEntries(totals.map((row) => [row.rarity, Number(row.$extras.total)])),
    })
  }
}
