import User from '#models/user'
import Trade from '#models/trade'
import CardTransformer from '#transformers/card_transformer'
import TradeTransformer from '#transformers/trade_transformer'
import TradeService, { TradeError } from '#services/trade_service'
import { proposeTradeValidator } from '#validators/trade'
import gameConfig from '#config/game'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

const BOXES = ['received', 'sent', 'history'] as const

@inject()
export default class TradesController {
  constructor(protected trades: TradeService) {}

  async index({ inertia, auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    await this.trades.expireDue()
    const box = BOXES.find((name) => name === request.qs().box) ?? 'received'

    const query = Trade.query()
      .preload('proposer')
      .preload('recipient')
      .preload('items', (items) => items.preload('card').orderBy('id'))
      .orderBy('created_at', 'desc')
    if (box === 'received') {
      query.where('recipient_id', user.id).where('status', 'pending')
    } else if (box === 'sent') {
      query.where('proposer_id', user.id).where('status', 'pending')
    } else {
      query
        .where((own) => own.where('recipient_id', user.id).orWhere('proposer_id', user.id))
        .whereNot('status', 'pending')
    }

    return inertia.render('trades/index', {
      box,
      trades: TradeTransformer.transform(await query.limit(50)),
    })
  }

  async create({ inertia, auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const to = String(request.qs().to ?? '').trim()
    const recipient = to
      ? await User.query().whereRaw('lower(username) = lower(?)', [to]).first()
      : null

    return inertia.render('trades/new', {
      to,
      recipient: recipient && recipient.id !== user.id ? { username: recipient.username } : null,
      notFound: Boolean(to) && (!recipient || recipient.id === user.id),
      mine: CardTransformer.transform(await this.trades.tradableCards(user.id)),
      theirs:
        recipient && recipient.id !== user.id
          ? CardTransformer.transform(await this.trades.tradableCards(recipient.id))
          : [],
      maxCardsPerSide: gameConfig.economy.trades.maxCardsPerSide,
      want: Number(request.qs().want) || null,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const { recipient, offered, requested } = await request.validateUsing(proposeTradeValidator)
    try {
      await this.trades.propose(auth.getUserOrFail(), recipient, offered, requested)
      session.flash('success', `Proposition envoyée à ${recipient}.`)
      return response.redirect().toPath('/trades?box=sent')
    } catch (error) {
      if (!(error instanceof TradeError)) throw error
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async accept(ctx: HttpContext) {
    return this.respond(
      ctx,
      () => this.trades.accept(ctx.auth.getUserOrFail(), Number(ctx.params.id)),
      'Échange accepté : les cartes ont changé de main.'
    )
  }

  async decline(ctx: HttpContext) {
    return this.respond(
      ctx,
      () => this.trades.decline(ctx.auth.getUserOrFail(), Number(ctx.params.id)),
      'Proposition refusée.'
    )
  }

  async cancel(ctx: HttpContext) {
    return this.respond(
      ctx,
      () => this.trades.cancel(ctx.auth.getUserOrFail(), Number(ctx.params.id)),
      'Proposition annulée.'
    )
  }

  protected async respond(
    { response, session }: HttpContext,
    action: () => Promise<unknown>,
    success: string
  ) {
    try {
      await action()
      session.flash('success', success)
    } catch (error) {
      if (!(error instanceof TradeError)) throw error
      session.flash('error', error.message)
    }
    return response.redirect().back()
  }
}
