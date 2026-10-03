/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'legal.rules': {
    methods: ["GET","HEAD"]
    pattern: '/regles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'legal.terms': {
    methods: ["GET","HEAD"]
    pattern: '/conditions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'legal.privacy': {
    methods: ["GET","HEAD"]
    pattern: '/confidentialite'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'legal.notice': {
    methods: ["GET","HEAD"]
    pattern: '/mentions-legales'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'account.confirm_email': {
    methods: ["GET","HEAD"]
    pattern: '/confirmer-email/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_controller').default['confirmEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_controller').default['confirmEmail']>>>
    }
  }
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password_reset.create': {
    methods: ["GET","HEAD"]
    pattern: '/mot-de-passe-oublie'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['create']>>>
    }
  }
  'password_reset.store': {
    methods: ["POST"]
    pattern: '/mot-de-passe-oublie'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password_reset.edit': {
    methods: ["GET","HEAD"]
    pattern: '/reinitialiser/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['edit']>>>
    }
  }
  'password_reset.update': {
    methods: ["POST"]
    pattern: '/reinitialiser/:token'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').resetPasswordValidator)>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/boosters_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/boosters_controller').default['index']>>>
    }
  }
  'boosters.store': {
    methods: ["POST"]
    pattern: '/boosters'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/boosters_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/boosters_controller').default['store']>>>
    }
  }
  'boosters.buy': {
    methods: ["POST"]
    pattern: '/boosters/buy'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['buyBooster']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['buyBooster']>>>
    }
  }
  'wallet': {
    methods: ["GET","HEAD"]
    pattern: '/wallet'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['index']>>>
    }
  }
  'boosters.show': {
    methods: ["GET","HEAD"]
    pattern: '/boosters/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/boosters_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/boosters_controller').default['show']>>>
    }
  }
  'collection': {
    methods: ["GET","HEAD"]
    pattern: '/collection'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/collection').collectionFiltersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collection_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collection_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cards.show': {
    methods: ["GET","HEAD"]
    pattern: '/cards/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/cards_controller').default['show']>>>
    }
  }
  'cards.favorite': {
    methods: ["POST"]
    pattern: '/cards/:id/favorite'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/favorites_controller').default['toggle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/favorites_controller').default['toggle']>>>
    }
  }
  'cards.tags.attach': {
    methods: ["POST"]
    pattern: '/cards/:id/tags'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/tag').attachTagValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/tag').attachTagValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['attach']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['attach']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cards.tags.detach': {
    methods: ["DELETE"]
    pattern: '/cards/:id/tags/:tagId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; tagId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['detach']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['detach']>>>
    }
  }
  'cards.sell': {
    methods: ["POST"]
    pattern: '/cards/:id/sell'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['sell']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/wallet_controller').default['sell']>>>
    }
  }
  'auctions.index': {
    methods: ["GET","HEAD"]
    pattern: '/auctions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/auction').auctionFiltersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auctions.store': {
    methods: ["POST"]
    pattern: '/auctions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auction').createAuctionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auction').createAuctionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auctions.show': {
    methods: ["GET","HEAD"]
    pattern: '/auctions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['show']>>>
    }
  }
  'auctions.bid': {
    methods: ["POST"]
    pattern: '/auctions/:id/bids'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auction').bidValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/auction').bidValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['bid']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['bid']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auctions.cancel': {
    methods: ["POST"]
    pattern: '/auctions/:id/cancel'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auctions_controller').default['cancel']>>>
    }
  }
  'trades.index': {
    methods: ["GET","HEAD"]
    pattern: '/trades'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['index']>>>
    }
  }
  'trades.create': {
    methods: ["GET","HEAD"]
    pattern: '/trades/new'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['create']>>>
    }
  }
  'trades.store': {
    methods: ["POST"]
    pattern: '/trades'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/trade').proposeTradeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/trade').proposeTradeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'trades.accept': {
    methods: ["POST"]
    pattern: '/trades/:id/accept'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['accept']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['accept']>>>
    }
  }
  'trades.decline': {
    methods: ["POST"]
    pattern: '/trades/:id/decline'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['decline']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['decline']>>>
    }
  }
  'trades.cancel': {
    methods: ["POST"]
    pattern: '/trades/:id/cancel'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/trades_controller').default['cancel']>>>
    }
  }
  'players.index': {
    methods: ["GET","HEAD"]
    pattern: '/joueurs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/players_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/players_controller').default['index']>>>
    }
  }
  'players.show': {
    methods: ["GET","HEAD"]
    pattern: '/joueurs/:username'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { username: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/collection').collectionFiltersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/players_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/players_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings': {
    methods: ["GET","HEAD"]
    pattern: '/reglages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['edit']>>>
    }
  }
  'settings.update': {
    methods: ["PUT"]
    pattern: '/reglages'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['update']>>>
    }
  }
  'settings.account': {
    methods: ["GET","HEAD"]
    pattern: '/reglages/compte'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_controller').default['edit']>>>
    }
  }
  'settings.password': {
    methods: ["PUT"]
    pattern: '/reglages/mot-de-passe'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').changePasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').changePasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_controller').default['updatePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_controller').default['updatePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.email': {
    methods: ["PUT"]
    pattern: '/reglages/email'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').changeEmailValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').changeEmailValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_controller').default['updateEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_controller').default['updateEmail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.delete': {
    methods: ["DELETE"]
    pattern: '/reglages/compte'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').deleteAccountValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').deleteAccountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/account_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/account_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'tags.store': {
    methods: ["POST"]
    pattern: '/tags'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/tag').createTagValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/tag').createTagValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'tags.update': {
    methods: ["PATCH"]
    pattern: '/tags/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/tag').renameTagValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/tag').renameTagValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'collection.bulk': {
    methods: ["POST"]
    pattern: '/collection/bulk'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/tag').bulkValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/tag').bulkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collection_controller').default['bulk']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collection_controller').default['bulk']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'collection.recycle': {
    methods: ["POST"]
    pattern: '/collection/recycle'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collection_controller').default['recycle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collection_controller').default['recycle']>>>
    }
  }
  'tags.destroy': {
    methods: ["DELETE"]
    pattern: '/tags/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['destroy']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
}
