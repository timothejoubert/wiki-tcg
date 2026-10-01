import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.rules': { paramsTuple?: []; params?: {} }
    'legal.terms': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'boosters.store': { paramsTuple?: []; params?: {} }
    'boosters.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection': { paramsTuple?: []; params?: {} }
    'cards.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.favorite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.tags.attach': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.tags.detach': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'tagId': ParamValue} }
    'tags.store': { paramsTuple?: []; params?: {} }
    'tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.rules': { paramsTuple?: []; params?: {} }
    'legal.terms': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'boosters.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection': { paramsTuple?: []; params?: {} }
    'cards.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'legal.rules': { paramsTuple?: []; params?: {} }
    'legal.terms': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'boosters.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection': { paramsTuple?: []; params?: {} }
    'cards.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'boosters.store': { paramsTuple?: []; params?: {} }
    'cards.favorite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cards.tags.attach': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'tags.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'cards.tags.detach': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'tagId': ParamValue} }
    'tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}