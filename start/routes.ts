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
router.on('/confidentialite').renderInertia('legal/privacy', {}).as('legal.privacy')
router.on('/mentions-legales').renderInertia('legal/notice', {}).as('legal.notice')
router
  .get('/confirmer-email/:token', [controllers.Account, 'confirmEmail'])
  .as('account.confirm_email')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store']).use(authThrottle)

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store']).use(authThrottle)

    router
      .get('mot-de-passe-oublie', [controllers.PasswordReset, 'create'])
      .as('password_reset.create')
    router
      .post('mot-de-passe-oublie', [controllers.PasswordReset, 'store'])
      .as('password_reset.store')
      .use(authThrottle)
    router
      .get('reinitialiser/:token', [controllers.PasswordReset, 'edit'])
      .as('password_reset.edit')
    router
      .post('reinitialiser/:token', [controllers.PasswordReset, 'update'])
      .as('password_reset.update')
      .use(authThrottle)
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

    router.get('/trades', [controllers.Trades, 'index']).as('trades.index')
    router.get('/trades/new', [controllers.Trades, 'create']).as('trades.create')
    router.post('/trades', [controllers.Trades, 'store']).as('trades.store')
    for (const action of ['accept', 'decline', 'cancel'] as const) {
      router
        .post(`/trades/:id/${action}`, [controllers.Trades, action])
        .as(`trades.${action}`)
        .where('id', router.matchers.number())
    }

    router.get('/joueurs', [controllers.Players, 'index']).as('players.index')
    router.get('/joueurs/:username', [controllers.Players, 'show']).as('players.show')
    router.get('/reglages', [controllers.Settings, 'edit']).as('settings')
    router.put('/reglages', [controllers.Settings, 'update']).as('settings.update')
    router.get('/reglages/compte', [controllers.Account, 'edit']).as('settings.account')
    router
      .put('/reglages/mot-de-passe', [controllers.Account, 'updatePassword'])
      .as('settings.password')
    router.put('/reglages/email', [controllers.Account, 'updateEmail']).as('settings.email')
    router.delete('/reglages/compte', [controllers.Account, 'destroy']).as('settings.delete')

    router.post('/tags', [controllers.Tags, 'store']).as('tags.store')
    router
      .patch('/tags/:id', [controllers.Tags, 'update'])
      .as('tags.update')
      .where('id', router.matchers.number())
    router.post('/collection/bulk', [controllers.Collection, 'bulk']).as('collection.bulk')
    router.post('/collection/recycle', [controllers.Collection, 'recycle']).as('collection.recycle')
    router
      .delete('/tags/:id', [controllers.Tags, 'destroy'])
      .as('tags.destroy')
      .where('id', router.matchers.number())

    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
