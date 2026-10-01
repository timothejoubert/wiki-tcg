/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'legal.rules': {
    methods: ["GET","HEAD"],
    pattern: '/regles',
    tokens: [{"old":"/regles","type":0,"val":"regles","end":""}],
    types: placeholder as Registry['legal.rules']['types'],
  },
  'legal.terms': {
    methods: ["GET","HEAD"],
    pattern: '/conditions',
    tokens: [{"old":"/conditions","type":0,"val":"conditions","end":""}],
    types: placeholder as Registry['legal.terms']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'boosters.store': {
    methods: ["POST"],
    pattern: '/boosters',
    tokens: [{"old":"/boosters","type":0,"val":"boosters","end":""}],
    types: placeholder as Registry['boosters.store']['types'],
  },
  'boosters.show': {
    methods: ["GET","HEAD"],
    pattern: '/boosters/:id',
    tokens: [{"old":"/boosters/:id","type":0,"val":"boosters","end":""},{"old":"/boosters/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['boosters.show']['types'],
  },
  'collection': {
    methods: ["GET","HEAD"],
    pattern: '/collection',
    tokens: [{"old":"/collection","type":0,"val":"collection","end":""}],
    types: placeholder as Registry['collection']['types'],
  },
  'cards.show': {
    methods: ["GET","HEAD"],
    pattern: '/cards/:id',
    tokens: [{"old":"/cards/:id","type":0,"val":"cards","end":""},{"old":"/cards/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['cards.show']['types'],
  },
  'cards.favorite': {
    methods: ["POST"],
    pattern: '/cards/:id/favorite',
    tokens: [{"old":"/cards/:id/favorite","type":0,"val":"cards","end":""},{"old":"/cards/:id/favorite","type":1,"val":"id","end":""},{"old":"/cards/:id/favorite","type":0,"val":"favorite","end":""}],
    types: placeholder as Registry['cards.favorite']['types'],
  },
  'cards.tags.attach': {
    methods: ["POST"],
    pattern: '/cards/:id/tags',
    tokens: [{"old":"/cards/:id/tags","type":0,"val":"cards","end":""},{"old":"/cards/:id/tags","type":1,"val":"id","end":""},{"old":"/cards/:id/tags","type":0,"val":"tags","end":""}],
    types: placeholder as Registry['cards.tags.attach']['types'],
  },
  'cards.tags.detach': {
    methods: ["DELETE"],
    pattern: '/cards/:id/tags/:tagId',
    tokens: [{"old":"/cards/:id/tags/:tagId","type":0,"val":"cards","end":""},{"old":"/cards/:id/tags/:tagId","type":1,"val":"id","end":""},{"old":"/cards/:id/tags/:tagId","type":0,"val":"tags","end":""},{"old":"/cards/:id/tags/:tagId","type":1,"val":"tagId","end":""}],
    types: placeholder as Registry['cards.tags.detach']['types'],
  },
  'tags.store': {
    methods: ["POST"],
    pattern: '/tags',
    tokens: [{"old":"/tags","type":0,"val":"tags","end":""}],
    types: placeholder as Registry['tags.store']['types'],
  },
  'tags.destroy': {
    methods: ["DELETE"],
    pattern: '/tags/:id',
    tokens: [{"old":"/tags/:id","type":0,"val":"tags","end":""},{"old":"/tags/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tags.destroy']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
