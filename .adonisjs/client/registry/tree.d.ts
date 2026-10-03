/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  legal: {
    rules: typeof routes['legal.rules']
    terms: typeof routes['legal.terms']
    privacy: typeof routes['legal.privacy']
    notice: typeof routes['legal.notice']
  }
  account: {
    confirmEmail: typeof routes['account.confirm_email']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  passwordReset: {
    create: typeof routes['password_reset.create']
    store: typeof routes['password_reset.store']
    edit: typeof routes['password_reset.edit']
    update: typeof routes['password_reset.update']
  }
  dashboard: typeof routes['dashboard']
  boosters: {
    store: typeof routes['boosters.store']
    buy: typeof routes['boosters.buy']
    show: typeof routes['boosters.show']
  }
  wallet: typeof routes['wallet']
  collection: typeof routes['collection'] & {
    bulk: typeof routes['collection.bulk']
    recycle: typeof routes['collection.recycle']
  }
  cards: {
    show: typeof routes['cards.show']
    favorite: typeof routes['cards.favorite']
    tags: {
      attach: typeof routes['cards.tags.attach']
      detach: typeof routes['cards.tags.detach']
    }
    sell: typeof routes['cards.sell']
    wish: typeof routes['cards.wish']
  }
  auctions: {
    index: typeof routes['auctions.index']
    store: typeof routes['auctions.store']
    show: typeof routes['auctions.show']
    bid: typeof routes['auctions.bid']
    cancel: typeof routes['auctions.cancel']
  }
  trades: {
    index: typeof routes['trades.index']
    create: typeof routes['trades.create']
    store: typeof routes['trades.store']
    accept: typeof routes['trades.accept']
    decline: typeof routes['trades.decline']
    cancel: typeof routes['trades.cancel']
  }
  notifications: typeof routes['notifications']
  wishlist: typeof routes['wishlist']
  players: {
    index: typeof routes['players.index']
    show: typeof routes['players.show']
  }
  settings: typeof routes['settings'] & {
    update: typeof routes['settings.update']
    account: typeof routes['settings.account']
    password: typeof routes['settings.password']
    email: typeof routes['settings.email']
    delete: typeof routes['settings.delete']
  }
  tags: {
    store: typeof routes['tags.store']
    update: typeof routes['tags.update']
    destroy: typeof routes['tags.destroy']
  }
}
