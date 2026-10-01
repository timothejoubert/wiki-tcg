import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import gameConfig from '#config/game'
import limiter from '@adonisjs/limiter/services/main'

const signup = {
  username: 'ada_l',
  email: 'Ada@Example.com',
  password: 'secret-password',
  passwordConfirmation: 'secret-password',
  adult: '1',
}

test.group('Auth', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => limiter.clear())

  test('signs up with the starting boosters', async ({ client, assert }) => {
    const response = await client.post('/signup').form(signup).withCsrfToken().redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/dashboard')

    const user = await User.findByOrFail('username', 'ada_l')
    assert.equal(user.email, 'ada@example.com')
    assert.equal(user.boosterStock, gameConfig.boosters.initialStock)
  })

  test('requires the adult confirmation', async ({ client, assert }) => {
    const { adult, ...withoutAdult } = signup
    const response = await client.post('/signup').form(withoutAdult).withCsrfToken().redirects(0)

    response.assertStatus(302)
    assert.properties(response.flashMessages().inputErrorsBag, ['adult'])
    assert.isNull(await User.findBy('username', 'ada_l'))
  })

  test('throttles repeated login attempts', async ({ client }) => {
    let last
    for (let attempt = 0; attempt < 6; attempt++) {
      last = await client
        .post('/login')
        .form({ login: 'ada_l', password: 'nope-nope' })
        .withCsrfToken()
        .redirects(0)
    }
    last!.assertStatus(429)
  })

  test('logs in with the username or the email', async ({ client }) => {
    await client.post('/signup').form(signup).withCsrfToken()

    for (const login of ['ada_l', 'ADA@example.com']) {
      const response = await client
        .post('/login')
        .form({ login, password: signup.password })
        .withCsrfToken()
        .redirects(0)
      response.assertHeader('location', '/dashboard')
    }
  })

  test('rejects wrong credentials with a French message', async ({ client }) => {
    await client.post('/signup').form(signup).withCsrfToken()
    const response = await client
      .post('/login')
      .form({ login: 'ada_l', password: 'nope-nope' })
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('error', 'Identifiant ou mot de passe incorrect.')
  })
})
