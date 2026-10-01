/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  legal: {
    rules: typeof routes['legal.rules']
    terms: typeof routes['legal.terms']
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
  dashboard: typeof routes['dashboard']
  boosters: {
    store: typeof routes['boosters.store']
    buy: typeof routes['boosters.buy']
    show: typeof routes['boosters.show']
  }
  wallet: typeof routes['wallet']
  collection: typeof routes['collection']
  cards: {
    show: typeof routes['cards.show']
    favorite: typeof routes['cards.favorite']
    tags: {
      attach: typeof routes['cards.tags.attach']
      detach: typeof routes['cards.tags.detach']
    }
    sell: typeof routes['cards.sell']
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
  tags: {
    store: typeof routes['tags.store']
    destroy: typeof routes['tags.destroy']
  }
}
