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
    show: typeof routes['boosters.show']
  }
  collection: typeof routes['collection']
  cards: {
    show: typeof routes['cards.show']
  }
}
