import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import CardTransformer from '#transformers/card_transformer'
import CollectionService from '#services/collection_service'
import { collectionFiltersValidator } from '#validators/collection'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class PlayersController {
  constructor(protected collection: CollectionService) {}

  /**
   * Players whose username starts with `q`.
   */
  async index({ inertia, request }: HttpContext) {
    const q = String(request.qs().q ?? '')
      .trim()
      .slice(0, 32)
    const players = q
      ? await User.query()
          .whereRaw("lower(username) like lower(?) escape '\\'", [
            `${q.replace(/[\\%_]/g, (char) => `\\${char}`)}%`,
          ])
          .orderByRaw('length(username)')
          .orderBy('username')
          .limit(20)
      : []

    const counts: { user_id: number; cards: string }[] = players.length
      ? await db
          .from('user_cards')
          .whereIn(
            'user_id',
            players.filter((player) => player.collectionPublic).map((player) => player.id)
          )
          .groupBy('user_id')
          .select('user_id')
          .countDistinct('card_id as cards')
      : []
    const cardsByUser = new Map(counts.map((row) => [row.user_id, Number(row.cards)]))

    return inertia.render('players/index', {
      q,
      players: players.map((player) => ({
        username: player.username,
        isPublic: player.collectionPublic,
        cards: player.collectionPublic ? (cardsByUser.get(player.id) ?? 0) : null,
      })),
    })
  }

  async show({ inertia, auth, params, request }: HttpContext) {
    const viewer = auth.getUserOrFail()
    const player = await User.query()
      .whereRaw('lower(username) = lower(?)', [params.username])
      .firstOrFail()
    const isSelf = player.id === viewer.id
    const visible = isSelf || player.collectionPublic

    if (!visible) {
      return inertia.render('players/show', {
        player: { username: player.username, isPublic: false },
        isSelf,
        filters: {},
        progression: null,
        cards: null,
      })
    }

    const { favorites, tag, ...filters } = await collectionFiltersValidator.validate(request.qs())
    const cards = await this.collection.list(player, filters, { personal: false })
    return inertia.render('players/show', {
      player: { username: player.username, isPublic: player.collectionPublic },
      isSelf,
      filters,
      progression: await this.collection.progression(player),
      cards: CardTransformer.paginate(cards.all(), cards.getMeta()),
    })
  }
}
