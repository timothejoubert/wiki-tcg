/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { authThrottle } from '#start/limiter'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home').use(middleware.guest())
router.on('/regles').renderInertia('legal/rules', {}).as('legal.rules')
router.on('/conditions').renderInertia('legal/terms', {}).as('legal.terms')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store']).use(authThrottle)

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store']).use(authThrottle)
  })
  .use(middleware.guest())

router
  .group(() => {
    router.get('/dashboard', [controllers.Boosters, 'index']).as('dashboard')
    router.post('/boosters', [controllers.Boosters, 'store']).as('boosters.store')
    router.post('/boosters/buy', [controllers.Wallet, 'buyBooster']).as('boosters.buy')
    router.get('/wallet', [controllers.Wallet, 'index']).as('wallet')
    router
      .get('/boosters/:id', [controllers.Boosters, 'show'])
      .as('boosters.show')
      .where('id', router.matchers.number())

    router.get('/collection', [controllers.Collection, 'index']).as('collection')
    router
      .get('/cards/:id', [controllers.Cards, 'show'])
      .as('cards.show')
      .where('id', router.matchers.number())
    router
      .post('/cards/:id/favorite', [controllers.Favorites, 'toggle'])
      .as('cards.favorite')
      .where('id', router.matchers.number())
    router
      .post('/cards/:id/tags', [controllers.Tags, 'attach'])
      .as('cards.tags.attach')
      .where('id', router.matchers.number())
    router
      .delete('/cards/:id/tags/:tagId', [controllers.Tags, 'detach'])
      .as('cards.tags.detach')
      .where('id', router.matchers.number())
      .where('tagId', router.matchers.number())

    router
      .post('/cards/:id/sell', [controllers.Wallet, 'sell'])
      .as('cards.sell')
      .where('id', router.matchers.number())

    router.get('/auctions', [controllers.Auctions, 'index']).as('auctions.index')
    router.post('/auctions', [controllers.Auctions, 'store']).as('auctions.store')
    router
      .get('/auctions/:id', [controllers.Auctions, 'show'])
      .as('auctions.show')
      .where('id', router.matchers.number())
    router
      .post('/auctions/:id/bids', [controllers.Auctions, 'bid'])
      .as('auctions.bid')
      .where('id', router.matchers.number())
    router
      .post('/auctions/:id/cancel', [controllers.Auctions, 'cancel'])
      .as('auctions.cancel')
      .where('id', router.matchers.number())

    router.post('/tags', [controllers.Tags, 'store']).as('tags.store')
    router
      .delete('/tags/:id', [controllers.Tags, 'destroy'])
      .as('tags.destroy')
      .where('id', router.matchers.number())

    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
