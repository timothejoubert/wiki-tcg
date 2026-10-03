import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.rules': { paramsTuple?: []; params?: {} }
    'legal.terms': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'legal.notice': { paramsTuple?: []; params?: {} }
    'account.confirm_email': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password_reset.create': { paramsTuple?: []; params?: {} }
    'password_reset.store': { paramsTuple?: []; params?: {} }
    'password_reset.edit': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password_reset.update': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'boosters.store': { paramsTuple?: []; params?: {} }
    'boosters.buy': { paramsTuple?: []; params?: {} }
    'wallet': { paramsTuple?: []; params?: {} }
    'boosters.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection': { paramsTuple?: []; params?: {} }
    'cards.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.favorite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.tags.attach': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.tags.detach': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'tagId': ParamValue} }
    'cards.sell': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auctions.index': { paramsTuple?: []; params?: {} }
    'auctions.store': { paramsTuple?: []; params?: {} }
    'auctions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auctions.bid': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auctions.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'trades.index': { paramsTuple?: []; params?: {} }
    'trades.create': { paramsTuple?: []; params?: {} }
    'trades.store': { paramsTuple?: []; params?: {} }
    'trades.accept': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'trades.decline': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'trades.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'players.index': { paramsTuple?: []; params?: {} }
    'players.show': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'settings': { paramsTuple?: []; params?: {} }
    'settings.update': { paramsTuple?: []; params?: {} }
    'settings.account': { paramsTuple?: []; params?: {} }
    'settings.password': { paramsTuple?: []; params?: {} }
    'settings.email': { paramsTuple?: []; params?: {} }
    'settings.delete': { paramsTuple?: []; params?: {} }
    'tags.store': { paramsTuple?: []; params?: {} }
    'tags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.bulk': { paramsTuple?: []; params?: {} }
    'collection.recycle': { paramsTuple?: []; params?: {} }
    'tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.rules': { paramsTuple?: []; params?: {} }
    'legal.terms': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'legal.notice': { paramsTuple?: []; params?: {} }
    'account.confirm_email': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password_reset.create': { paramsTuple?: []; params?: {} }
    'password_reset.edit': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'wallet': { paramsTuple?: []; params?: {} }
    'boosters.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection': { paramsTuple?: []; params?: {} }
    'cards.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auctions.index': { paramsTuple?: []; params?: {} }
    'auctions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'trades.index': { paramsTuple?: []; params?: {} }
    'trades.create': { paramsTuple?: []; params?: {} }
    'players.index': { paramsTuple?: []; params?: {} }
    'players.show': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'settings': { paramsTuple?: []; params?: {} }
    'settings.account': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.rules': { paramsTuple?: []; params?: {} }
    'legal.terms': { paramsTuple?: []; params?: {} }
    'legal.privacy': { paramsTuple?: []; params?: {} }
    'legal.notice': { paramsTuple?: []; params?: {} }
    'account.confirm_email': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password_reset.create': { paramsTuple?: []; params?: {} }
    'password_reset.edit': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'wallet': { paramsTuple?: []; params?: {} }
    'boosters.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection': { paramsTuple?: []; params?: {} }
    'cards.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auctions.index': { paramsTuple?: []; params?: {} }
    'auctions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'trades.index': { paramsTuple?: []; params?: {} }
    'trades.create': { paramsTuple?: []; params?: {} }
    'players.index': { paramsTuple?: []; params?: {} }
    'players.show': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'settings': { paramsTuple?: []; params?: {} }
    'settings.account': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password_reset.store': { paramsTuple?: []; params?: {} }
    'password_reset.update': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'boosters.store': { paramsTuple?: []; params?: {} }
    'boosters.buy': { paramsTuple?: []; params?: {} }
    'cards.favorite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.tags.attach': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.sell': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auctions.store': { paramsTuple?: []; params?: {} }
    'auctions.bid': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auctions.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'trades.store': { paramsTuple?: []; params?: {} }
    'trades.accept': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'trades.decline': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'trades.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tags.store': { paramsTuple?: []; params?: {} }
    'collection.bulk': { paramsTuple?: []; params?: {} }
    'collection.recycle': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'cards.tags.detach': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'tagId': ParamValue} }
    'settings.delete': { paramsTuple?: []; params?: {} }
    'tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'settings.update': { paramsTuple?: []; params?: {} }
    'settings.password': { paramsTuple?: []; params?: {} }
    'settings.email': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'tags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}