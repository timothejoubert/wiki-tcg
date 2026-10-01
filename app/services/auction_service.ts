import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Auction from '#models/auction'
import Bid from '#models/bid'
import type User from '#models/user'
import UserCard from '#models/user_card'
import gameConfig from '#config/game'
import WalletService from '#services/wallet_service'

const { auctions } = gameConfig.economy

export class AuctionError extends Exception {
  static status = 422
}

export class NoCopyAvailableError extends AuctionError {
  static code = 'E_NO_COPY_AVAILABLE'
  static message = 'Aucun exemplaire libre : il est peut-être déjà en vente.'
}

export class AuctionClosedError extends AuctionError {
  static code = 'E_AUCTION_CLOSED'
  static message = 'Cette enchère est terminée.'
}

export class OwnAuctionError extends AuctionError {
  static code = 'E_OWN_AUCTION'
  static message = 'Tu ne peux pas enchérir sur ta propre vente.'
}

export class AlreadyLeadingError extends AuctionError {
  static code = 'E_ALREADY_LEADING'
  static message = 'Tu es déjà en tête de cette enchère.'
}

export class BidTooLowError extends AuctionError {
  static code = 'E_BID_TOO_LOW'

  constructor(public minimum: number) {
    super(`La mise minimale est de ${minimum} wikis.`)
  }
}

export class CannotCancelError extends AuctionError {
  static code = 'E_CANNOT_CANCEL'
  static message = 'Une vente ne s’annule que tant que personne n’a enchéri.'
}

export function minNextBid(auction: Pick<Auction, 'startingPrice' | 'currentPrice'>) {
  if (auction.currentPrice === null) {
    return auction.startingPrice
  }
  return (
    auction.currentPrice + Math.max(1, Math.ceil(auction.currentPrice * auctions.minIncrementRatio))
  )
}

/**
 * Auctions of single copies. Bids are held on the bidder's balance and the
 * previous leader is refunded in the same transaction; settlement hands the
 * copy to the leader and pays the seller.
 */
@inject()
export default class AuctionService {
  constructor(protected wallet: WalletService) {}

  /**
   * Lists the oldest free copy of a card (not already in an open auction).
   */
  async create(seller: User, cardId: number, startingPrice: number, durationHours: number) {
    return db.transaction(async (trx) => {
      const copy = await UserCard.query({ client: trx })
        .where({ userId: seller.id, cardId })
        .withScopes((scopes) => scopes.free())
        .orderBy('obtained_at', 'asc')
        .orderBy('id', 'asc')
        .forUpdate()
        .first()
      if (!copy) {
        throw new NoCopyAvailableError()
      }

      return Auction.create(
        {
          sellerId: seller.id,
          userCardId: copy.id,
          cardId,
          startingPrice,
          currentPrice: null,
          leaderId: null,
          bidsCount: 0,
          endsAt: DateTime.now().plus({ hours: durationHours }),
          status: 'open',
          settledAt: null,
        },
        { client: trx }
      )
    })
  }

  async bid(bidder: User, auctionId: number, amount: number) {
    return db.transaction(async (trx) => {
      const auction = await this.lockAuction(trx, auctionId)
      if (auction.status !== 'open' || auction.endsAt <= DateTime.now()) {
        throw new AuctionClosedError()
      }
      if (auction.sellerId === bidder.id) {
        throw new OwnAuctionError()
      }
      if (auction.leaderId === bidder.id) {
        throw new AlreadyLeadingError()
      }
      const minimum = minNextBid(auction)
      if (amount < minimum) {
        throw new BidTooLowError(minimum)
      }

      // Lock both players in id order so concurrent bids cannot deadlock
      const previous = auction.leaderId
      const ids = [bidder.id, previous]
        .filter((id): id is number => id !== null)
        .sort((a, b) => a - b)
      const locked = new Map<number, User>()
      for (const id of ids) {
        locked.set(id, await this.wallet.lock(trx, id))
      }

      const refs = { cardId: auction.cardId, auctionId: auction.id }
      await this.wallet.apply(trx, locked.get(bidder.id)!, -amount, 'auction_hold', refs)
      if (previous !== null) {
        await this.wallet.apply(
          trx,
          locked.get(previous)!,
          auction.currentPrice!,
          'auction_refund',
          refs
        )
      }

      auction.merge({ currentPrice: amount, leaderId: bidder.id, bidsCount: auction.bidsCount + 1 })
      await auction.save()
      await Bid.create({ auctionId: auction.id, bidderId: bidder.id, amount }, { client: trx })
      return auction
    })
  }

  async cancel(seller: User, auctionId: number) {
    return db.transaction(async (trx) => {
      const auction = await this.lockAuction(trx, auctionId)
      if (auction.sellerId !== seller.id || auction.status !== 'open' || auction.bidsCount > 0) {
        throw new CannotCancelError()
      }
      auction.merge({ status: 'cancelled', settledAt: DateTime.now() })
      await auction.save()
    })
  }

  /**
   * Closes every auction past its end. Safe to run concurrently: each
   * settlement re-checks the auction under its lock.
   */
  async settleDue(now = DateTime.now()) {
    const due = await Auction.query()
      .where('status', 'open')
      .where('ends_at', '<=', now.toSQL()!)
      .select('id')
    for (const { id } of due) {
      await this.settle(id, now)
    }
    return due.length
  }

  async settle(auctionId: number, now = DateTime.now()) {
    return db.transaction(async (trx) => {
      const auction = await this.lockAuction(trx, auctionId)
      if (auction.status !== 'open' || auction.endsAt > now) {
        return auction
      }

      if (auction.leaderId === null) {
        auction.merge({ status: 'unsold', settledAt: now })
        await auction.save()
        return auction
      }

      const seller = await this.wallet.lock(trx, auction.sellerId)
      const copy = await UserCard.query({ client: trx })
        .where('id', auction.userCardId)
        .forUpdate()
        .firstOrFail()
      copy.merge({ userId: auction.leaderId, obtainedAt: now, boosterOpeningId: null })
      await copy.save()
      await this.wallet.apply(trx, seller, auction.currentPrice!, 'auction_sale', {
        cardId: auction.cardId,
        auctionId: auction.id,
      })

      auction.merge({ status: 'sold', settledAt: now })
      await auction.save()
      return auction
    })
  }

  protected lockAuction(trx: TransactionClientContract, id: number) {
    return Auction.query({ client: trx }).where('id', id).forUpdate().firstOrFail()
  }
}
