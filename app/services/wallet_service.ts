import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Card from '#models/card'
import User from '#models/user'
import UserCard from '#models/user_card'
import WalletTransaction from '#models/wallet_transaction'
import gameConfig, { type Rarity, type WalletKind } from '#config/game'
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
        .withScopes((scopes) => scopes.free())
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
   * Spare free copies of the player's cards, optionally limited to some
   * cards: how many copies would go and what the bank would pay.
   */
  async recyclePreview(user: User, cardIds?: number[]) {
    const rows = await this.spareCopies(db, user.id, cardIds)
    return {
      copies: rows.reduce((sum, row) => sum + row.spare, 0),
      wikis: rows.reduce((sum, row) => sum + row.spare * economy.bankSale[row.rarity], 0),
    }
  }

  /**
   * Sells every spare free copy to the bank, keeping the oldest free copy
   * of each card (same rule as `sellDuplicate`). One ledger row per card.
   */
  async recycleDuplicates(user: User, cardIds?: number[]) {
    return db.transaction(async (trx) => {
      const locked = await this.lock(trx, user.id)
      const rows = await this.spareCopies(trx, user.id, cardIds)
      let copies = 0
      let wikis = 0

      for (const row of rows) {
        const free = await UserCard.query({ client: trx })
          .where({ userId: user.id, cardId: row.card_id })
          .withScopes((scopes) => scopes.free())
          .orderBy('obtained_at', 'asc')
          .orderBy('id', 'asc')
          .forUpdate()
        const spare = free.slice(1)
        if (spare.length === 0) continue

        await UserCard.query({ client: trx })
          .whereIn(
            'id',
            spare.map((copy) => copy.id)
          )
          .delete()
        const amount = spare.length * economy.bankSale[row.rarity]
        await this.apply(trx, locked, amount, 'bank_sale', { cardId: row.card_id })
        copies += spare.length
        wikis += amount
      }

      return { cards: rows.length, copies, wikis }
    })
  }

  protected async spareCopies(
    client: TransactionClientContract | typeof db,
    userId: number,
    cardIds?: number[]
  ): Promise<{ card_id: number; rarity: Rarity; spare: number }[]> {
    const query = client
      .from('user_cards')
      .join('cards', 'cards.id', 'user_cards.card_id')
      .where('user_cards.user_id', userId)
      .whereNotExists((open) =>
        open
          .from('auctions')
          .whereColumn('auctions.user_card_id', 'user_cards.id')
          .where('auctions.status', 'open')
      )
      .groupBy('user_cards.card_id', 'cards.rarity')
      .havingRaw('count(*) > 1')
      .select('user_cards.card_id', 'cards.rarity')
      .select(client.raw('count(*) - 1 as spare'))
    if (cardIds) {
      query.whereIn('user_cards.card_id', cardIds)
    }
    const rows = await query
    return rows.map((row: any) => ({ ...row, spare: Number(row.spare) }))
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
