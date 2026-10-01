import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Card from '#models/card'
import User from '#models/user'
import UserCard from '#models/user_card'
import WalletTransaction from '#models/wallet_transaction'
import gameConfig, { type WalletKind } from '#config/game'
import { refilledStock } from '#services/booster_stock'

const { economy, boosters } = gameConfig

export class InsufficientFundsError extends Exception {
  static status = 422
  static code = 'E_INSUFFICIENT_FUNDS'
  static message = 'Solde insuffisant.'
}

export class NotADuplicateError extends Exception {
  static status = 422
  static code = 'E_NOT_A_DUPLICATE'
  static message = 'Seuls les doublons peuvent être revendus : garde au moins un exemplaire.'
}

export class StockNotEmptyError extends Exception {
  static status = 422
  static code = 'E_STOCK_NOT_EMPTY'
  static message = 'Un booster ne s’achète que quand ton stock est vide.'
}

/**
 * The only way to move wikis. Every call runs on a user row locked inside
 * `trx`, so concurrent movements serialise and the balance never goes
 * negative (also enforced by a check constraint).
 */
export default class WalletService {
  async lock(trx: TransactionClientContract, userId: number) {
    return User.query({ client: trx }).where('id', userId).forUpdate().firstOrFail()
  }

  async apply(
    trx: TransactionClientContract,
    user: User,
    amount: number,
    kind: WalletKind,
    refs: { cardId?: number | null; auctionId?: number | null } = {}
  ) {
    if (amount === 0) {
      return null
    }
    if (user.balance + amount < 0) {
      throw new InsufficientFundsError()
    }

    user.balance += amount
    user.useTransaction(trx)
    await user.save()

    return WalletTransaction.create(
      {
        userId: user.id,
        amount,
        kind,
        balanceAfter: user.balance,
        cardId: refs.cardId ?? null,
        auctionId: refs.auctionId ?? null,
      },
      { client: trx }
    )
  }

  /**
   * Credits the daily bonus once per calendar day. Returns the amount
   * credited, or null when already claimed today.
   */
  async claimDailyBonus(user: User): Promise<number | null> {
    const today = DateTime.now().setZone(economy.dayTimezone).toISODate()!
    if (user.dailyBonusClaimedOn?.toISODate() === today) {
      return null
    }

    return db.transaction(async (trx) => {
      const locked = await this.lock(trx, user.id)
      if (locked.dailyBonusClaimedOn?.toISODate() === today) {
        return null
      }

      locked.dailyBonusClaimedOn = DateTime.fromISO(today)
      await this.apply(trx, locked, economy.dailyBonus, 'daily_bonus')
      user.merge({ balance: locked.balance, dailyBonusClaimedOn: locked.dailyBonusClaimedOn })
      return economy.dailyBonus
    })
  }

  /**
   * Sells one spare copy of a card to the bank. The newest copy goes first.
   * Copies listed in an open auction do not count: two free copies are
   * needed so the player keeps one whatever the auction outcome.
   */
  async sellDuplicate(user: User, cardId: number): Promise<number> {
    return db.transaction(async (trx) => {
      const locked = await this.lock(trx, user.id)
      const copies = await UserCard.query({ client: trx })
        .where({ userId: user.id, cardId })
        .whereNotExists((open) =>
          open
            .from('auctions')
            .whereColumn('auctions.user_card_id', 'user_cards.id')
            .where('auctions.status', 'open')
        )
        .orderBy('obtained_at', 'desc')
        .orderBy('id', 'desc')
        .forUpdate()
      if (copies.length < 2) {
        throw new NotADuplicateError()
      }

      const card = await Card.findOrFail(cardId, { client: trx })
      const price = economy.bankSale[card.rarity]
      await copies[0].delete()
      await this.apply(trx, locked, price, 'bank_sale', { cardId })
      return price
    })
  }

  /**
   * Buys one booster when the stock is empty.
   */
  async buyBooster(user: User) {
    return db.transaction(async (trx) => {
      const locked = await this.lock(trx, user.id)
      const { stock, refilledAt } = refilledStock(locked, DateTime.now())
      if (stock > 0) {
        throw new StockNotEmptyError()
      }

      locked.merge({
        boosterStock: Math.min(boosters.maxStock, stock + 1),
        boosterRefilledAt: refilledAt,
      })
      await this.apply(trx, locked, -economy.boosterPrice, 'booster_purchase')
    })
  }

  history(user: User, page: number) {
    return WalletTransaction.query()
      .where('user_id', user.id)
      .preload('card')
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .paginate(page, 30)
  }
}
