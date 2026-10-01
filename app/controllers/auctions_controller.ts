import Auction from '#models/auction'
import Bid from '#models/bid'
import gameConfig from '#config/game'
import AuctionTransformer from '#transformers/auction_transformer'
import AuctionService, { AuctionError } from '#services/auction_service'
import { InsufficientFundsError } from '#services/wallet_service'
import { auctionFiltersValidator, bidValidator, createAuctionValidator } from '#validators/auction'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AuctionsController {
  constructor(protected auctions: AuctionService) {}

  async index({ inertia, auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    await this.auctions.settleDue()
    const filters = await auctionFiltersValidator.validate(request.qs())
    const scope = filters.scope ?? 'all'

    const query = Auction.query().preload('card').preload('seller').preload('leader')
    if (scope === 'selling') {
      query.where('seller_id', user.id).orderBy('created_at', 'desc')
    } else if (scope === 'bidding') {
      query.whereHas('bids', (bids) => bids.where('bidder_id', user.id)).orderBy('ends_at', 'desc')
    } else {
      query.where('status', 'open')
    }
    if (filters.rarity) {
      query.whereHas('card', (card) => card.where('rarity', filters.rarity!))
    }
    if (scope === 'all') {
      switch (filters.sort ?? 'ending') {
        case 'newest':
          query.orderBy('created_at', 'desc')
          break
        case 'price':
          query.orderByRaw('coalesce(current_price, starting_price) desc')
          break
        default:
          query.orderBy('ends_at', 'asc')
      }
    }
    query.orderBy('id', 'desc')

    const page = await query.paginate(filters.page ?? 1, 24)
    return inertia.render('auctions/index', {
      filters: { ...filters, scope },
      auctions: AuctionTransformer.paginate(page.all(), page.getMeta()),
    })
  }

  async show({ inertia, params }: HttpContext) {
    await this.auctions.settle(Number(params.id))
    const auction = await Auction.query()
      .where('id', params.id)
      .preload('card')
      .preload('seller')
      .preload('leader')
      .firstOrFail()
    const bids = await Bid.query()
      .where('auction_id', auction.id)
      .preload('bidder')
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .limit(20)

    return inertia.render('auctions/show', {
      auction: AuctionTransformer.transform(auction),
      bids: bids.map((bid) => ({
        id: bid.id,
        amount: bid.amount,
        bidder: bid.bidder.username,
        createdAt: bid.createdAt.toISO()!,
      })),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const { cardId, startingPrice, durationHours } =
      await request.validateUsing(createAuctionValidator)
    try {
      const auction = await this.auctions.create(
        auth.getUserOrFail(),
        cardId,
        startingPrice,
        durationHours
      )
      session.flash('success', 'Ta carte est en vente.')
      return response.redirect().toRoute('auctions.show', { id: auction.id })
    } catch (error) {
      if (!(error instanceof AuctionError)) throw error
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async bid({ auth, params, request, response, session }: HttpContext) {
    const { amount } = await request.validateUsing(bidValidator)
    try {
      await this.auctions.bid(auth.getUserOrFail(), Number(params.id), amount)
      session.flash('success', `Mise de ${amount} ${gameConfig.economy.currency.many} enregistrée.`)
    } catch (error) {
      if (!(error instanceof AuctionError || error instanceof InsufficientFundsError)) throw error
      session.flash('error', error.message)
    }
    return response.redirect().toRoute('auctions.show', { id: params.id })
  }

  async cancel({ auth, params, response, session }: HttpContext) {
    try {
      await this.auctions.cancel(auth.getUserOrFail(), Number(params.id))
      session.flash('success', 'Vente annulée.')
    } catch (error) {
      if (!(error instanceof AuctionError)) throw error
      session.flash('error', error.message)
    }
    return response.redirect().toRoute('auctions.show', { id: params.id })
  }
}
