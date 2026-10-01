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
    router
      .get('/boosters/:id', [controllers.Boosters, 'show'])
      .as('boosters.show')
      .where('id', router.matchers.number())

    router.get('/collection', [controllers.Collection, 'index']).as('collection')
    router
      .get('/cards/:id', [controllers.Cards, 'show'])
      .as('cards.show')
      .where('id', router.matchers.number())

    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
