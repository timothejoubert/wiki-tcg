import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import User from '#models/user'
import Trade from '#models/trade'
import UserCard from '#models/user_card'
import UserToken from '#models/user_token'
import PasswordResetMail from '#mails/password_reset_mail'
import EmailChangeMail from '#mails/email_change_mail'
import EmailChangedNoticeMail from '#mails/email_changed_notice_mail'
import AuctionService from '#services/auction_service'
import TradeService from '#services/trade_service'
import { catalogueCard } from '#tests/helpers/catalogue'
import { createUser } from '#tests/helpers/users'
import { own } from '#tests/helpers/owned'

const PASSWORD = 'secret-password'

/**
 * The token at the end of the link carried by a fake-sent mail.
 */
function tokenOf(sent: unknown) {
  return String((sent as any).url)
    .split('/')
    .pop()!
}

test.group('Account', (group) => {
  let fake: ReturnType<typeof mail.fake>

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => limiter.clear())
  group.each.setup(() => {
    fake = mail.fake()
    return () => mail.restore()
  })

  test('password reset: same answer for unknown emails, single-use link', async ({
    client,
    assert,
  }) => {
    const user = await createUser()

    const unknown = await client
      .post('/mot-de-passe-oublie')
      .form({ email: 'nobody@example.com' })
      .withCsrfToken()
      .redirects(0)
    const known = await client
      .post('/mot-de-passe-oublie')
      .form({ email: user.email.toUpperCase() })
      .withCsrfToken()
      .redirects(0)
    assert.deepEqual(unknown.flashMessages().success, known.flashMessages().success)

    const [sent] = fake.mails.sent()
    assert.instanceOf(sent, PasswordResetMail)
    assert.lengthOf(fake.mails.sent(), 1)
    const token = tokenOf(sent)
    assert.notInclude(JSON.stringify(await UserToken.all()), token)

    const page = await client.get(`/reinitialiser/${token}`).withInertia()
    assert.isTrue((page.inertiaProps as any).valid)

    await client
      .post(`/reinitialiser/${token}`)
      .form({ password: 'brand-new-pass', passwordConfirmation: 'brand-new-pass' })
      .withCsrfToken()
      .redirects(0)
    await User.verifyCredentials(user.email, 'brand-new-pass')

    const reused = await client.get(`/reinitialiser/${token}`).withInertia()
    assert.isFalse((reused.inertiaProps as any).valid)
  })

  test('a new reset request invalidates the previous link, links expire', async ({
    client,
    assert,
  }) => {
    const user = await createUser()
    await client.post('/mot-de-passe-oublie').form({ email: user.email }).withCsrfToken()
    await client.post('/mot-de-passe-oublie').form({ email: user.email }).withCsrfToken()
    const [first, second] = fake.mails.sent().map(tokenOf)

    const old = await client.get(`/reinitialiser/${first}`).withInertia()
    assert.isFalse((old.inertiaProps as any).valid)

    await UserToken.query().update({ expiresAt: DateTime.now().minus({ minutes: 1 }).toSQL() })
    const expired = await client.get(`/reinitialiser/${second}`).withInertia()
    assert.isFalse((expired.inertiaProps as any).valid)
  })

  test('changes the password with the current one', async ({ client, assert }) => {
    const user = await createUser()

    const wrong = await client
      .put('/reglages/mot-de-passe')
      .form({
        currentPassword: 'nope',
        password: 'another-pass',
        passwordConfirmation: 'another-pass',
      })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    assert.properties(
      wrong.flashMessages().errorsBag ?? wrong.flashMessages().inputErrorsBag ?? {},
      ['currentPassword']
    )

    await client
      .put('/reglages/mot-de-passe')
      .form({
        currentPassword: PASSWORD,
        password: 'another-pass',
        passwordConfirmation: 'another-pass',
      })
      .loginAs(user)
      .withCsrfToken()
    await User.verifyCredentials(user.username, 'another-pass')
  })

  test('changes the email only once the new address is confirmed', async ({ client, assert }) => {
    const [user, other] = [await createUser(), await createUser()]
    const oldEmail = user.email

    await client
      .put('/reglages/email')
      .form({ currentPassword: PASSWORD, email: other.email })
      .loginAs(user)
      .withCsrfToken()
    fake.mails.assertNoneSent()

    await client
      .put('/reglages/email')
      .form({ currentPassword: PASSWORD, email: 'New@Example.com' })
      .loginAs(user)
      .withCsrfToken()
    const [request] = fake.mails.sent()
    assert.instanceOf(request, EmailChangeMail)
    await user.refresh()
    assert.equal(user.email, oldEmail)

    await client.get(`/confirmer-email/${tokenOf(request)}`).redirects(0)
    await user.refresh()
    assert.equal(user.email, 'new@example.com')
    fake.mails.assertSent(EmailChangedNoticeMail)

    const reused = await client.get(`/confirmer-email/${tokenOf(request)}`).redirects(0)
    reused.assertFlashMessage('error', 'Ce lien n’est plus valable. Fais une nouvelle demande.')
  })

  test('deletion is blocked by open auctions, then erases the player', async ({
    client,
    assert,
  }) => {
    const [user, other] = [await createUser(), await createUser()]
    const card = await catalogueCard('rare')
    const theirs = await catalogueCard('common')
    await own(user, card)
    await own(other, theirs)
    await new TradeService().propose(other, user.username, [theirs.id], [card.id])
    const auctions = await app.container.make(AuctionService)
    const auction = await auctions.create(user, card.id, 10, 24)

    const remove = () =>
      client
        .delete('/reglages/compte')
        .form({ currentPassword: PASSWORD, confirm: '1' })
        .loginAs(user)
        .withCsrfToken()
        .redirects(0)

    const blocked = await remove()
    blocked.assertFlashMessage(
      'error',
      'Tu as une vente aux enchères ou une mise en cours : attends leur clôture avant de supprimer ton compte.'
    )

    await auctions.cancel(user, auction.id)
    const done = await remove()
    done.assertHeader('location', '/')

    assert.isNull(await User.find(user.id))
    assert.lengthOf(await UserCard.query().where('user_id', user.id), 0)
    assert.lengthOf(await Trade.all(), 0)
    assert.isNotNull(await User.find(other.id))
  })

  test('deletion requires the password and the confirmation', async ({ client, assert }) => {
    const user = await createUser()
    const response = await client
      .delete('/reglages/compte')
      .form({ currentPassword: 'wrong' })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    assert.properties(response.flashMessages().inputErrorsBag, ['confirm'])
    assert.isNotNull(await User.find(user.id))
  })
})
