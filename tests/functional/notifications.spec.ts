import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import Notification from '#models/notification'
import NotificationMail from '#mails/notification_mail'
import AuctionService from '#services/auction_service'
import TradeService, { CardsUnavailableError } from '#services/trade_service'
import { catalogueCard } from '#tests/helpers/catalogue'
import { createUser } from '#tests/helpers/users'
import { own } from '#tests/helpers/owned'

async function typesFor(userId: number) {
  const rows = await Notification.query().where('user_id', userId).orderBy('id')
  return rows.map((row) => row.type)
}

async function rich(balance: number) {
  const user = await createUser()
  user.balance = balance
  await user.save()
  return user
}

test.group('Notifications', (group) => {
  let fake: ReturnType<typeof mail.fake>

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => {
    fake = mail.fake()
    return () => mail.restore()
  })

  test('auction events notify the outbid player, the winner and the seller', async ({ assert }) => {
    const seller = await createUser()
    const [alice, bob] = [await rich(500), await rich(500)]
    const card = await catalogueCard('legendary', { title: 'Paris' })
    await own(seller, card)
    const auctions = await app.container.make(AuctionService)
    const auction = await auctions.create(seller, card.id, 50, 1)

    await auctions.bid(alice, auction.id, 50)
    await auctions.bid(bob, auction.id, 60)
    assert.deepEqual(await typesFor(alice.id), ['auction_outbid'])

    auction.endsAt = DateTime.now().minus({ minutes: 1 })
    await auction.save()
    await auctions.settleDue()

    assert.deepEqual(await typesFor(bob.id), ['auction_won'])
    assert.deepEqual(await typesFor(seller.id), ['auction_sold'])
    const sold = await Notification.findByOrFail('type', 'auction_sold')
    assert.deepEqual(sold.data, {
      auctionId: auction.id,
      cardTitle: 'Paris',
      amount: 60,
      username: bob.username,
    })
  })

  test('an auction without bids notifies the seller it ended unsold', async ({ assert }) => {
    const seller = await createUser()
    const card = await catalogueCard('rare')
    await own(seller, card)
    const auctions = await app.container.make(AuctionService)
    const auction = await auctions.create(seller, card.id, 10, 1)
    auction.endsAt = DateTime.now().minus({ minutes: 1 })
    await auction.save()
    await auctions.settleDue()
    assert.deepEqual(await typesFor(seller.id), ['auction_unsold'])
  })

  test('trade events notify the other side, never on a failed action', async ({ assert }) => {
    const [alice, bob] = [await createUser(), await createUser()]
    const [mine, theirs] = [await catalogueCard('rare'), await catalogueCard('common')]
    await own(alice, mine)
    await own(bob, theirs)
    const trades = new TradeService()

    const first = await trades.propose(alice, bob.username, [mine.id], [theirs.id])
    assert.deepEqual(await typesFor(bob.id), ['trade_received'])
    await trades.decline(bob, first.id)
    assert.deepEqual(await typesFor(alice.id), ['trade_declined'])

    const second = await trades.propose(alice, bob.username, [mine.id], [theirs.id])
    const auctions = await app.container.make(AuctionService)
    await auctions.create(alice, mine.id, 10, 24)
    await assert.rejects(() => trades.accept(bob, second.id), CardsUnavailableError.message)
    assert.deepEqual(await typesFor(alice.id), ['trade_declined'])
  })

  test('the page lists notifications and marks them read', async ({ client, assert }) => {
    const [alice, bob] = [await createUser(), await createUser()]
    const [mine, theirs] = [await catalogueCard('rare'), await catalogueCard('common')]
    await own(alice, mine)
    await own(bob, theirs)
    await new TradeService().propose(alice, bob.username, [mine.id], [theirs.id])

    const dashboard = await client.get('/dashboard').loginAs(bob).withInertia()
    assert.equal((dashboard.inertiaProps as any).unreadNotifications, 1)

    const page = await client.get('/notifications').loginAs(bob).withInertia()
    const [shown] = (page.inertiaProps as any).notifications
    assert.equal(shown.text, `${alice.username} te propose un échange.`)
    assert.equal(shown.url, '/trades?box=received')
    assert.isTrue(shown.unread)

    const after = await client.get('/dashboard').loginAs(bob).withInertia()
    assert.equal((after.inertiaProps as any).unreadNotifications, 0)
  })

  test('emails only players who opted in', async ({ client, assert }) => {
    const [alice, bob] = [await createUser(), await createUser()]
    const [mine, theirs] = [await catalogueCard('rare'), await catalogueCard('common')]
    await own(alice, mine)
    await own(bob, theirs)
    const trades = new TradeService()

    await trades.propose(alice, bob.username, [mine.id], [theirs.id])
    fake.mails.assertNoneSent()

    await client
      .put('/reglages')
      .form({ collectionPublic: '1', notifyByEmail: '1' })
      .loginAs(bob)
      .withCsrfToken()
    await bob.refresh()
    assert.isTrue(bob.notifyByEmail)
    await trades.propose(alice, bob.username, [mine.id], [theirs.id])
    await new Promise((resolve) => setTimeout(resolve, 50))
    fake.mails.assertSent(NotificationMail)
  })
})
