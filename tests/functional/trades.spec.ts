import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import Trade from '#models/trade'
import TradeItem from '#models/trade_item'
import UserCard from '#models/user_card'
import type User from '#models/user'
import type Card from '#models/card'
import AuctionService from '#services/auction_service'
import WalletService from '#services/wallet_service'
import TradeService, {
  CardsUnavailableError,
  SelfTradeError,
  TradeClosedError,
  UnknownPlayerError,
} from '#services/trade_service'
import { catalogueCard } from '#tests/helpers/catalogue'
import { createUser } from '#tests/helpers/users'
import { own } from '#tests/helpers/owned'

async function owners(card: Card) {
  const copies = await UserCard.query().where('card_id', card.id).orderBy('id')
  return copies.map((copy) => copy.userId)
}

test.group('Trades', (group) => {
  let trades: TradeService
  let alice: User
  let bob: User
  let aliceCard: Card
  let bobCard: Card

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(async () => {
    trades = new TradeService()
    alice = await createUser()
    bob = await createUser()
    aliceCard = await catalogueCard('rare')
    bobCard = await catalogueCard('legendary')
    await own(alice, aliceCard)
    await own(bob, bobCard)
  })

  test('validates the offer', async ({ assert }) => {
    await assert.rejects(
      () => trades.propose(alice, 'nobody', [aliceCard.id], [bobCard.id]),
      UnknownPlayerError.message
    )
    await assert.rejects(
      () => trades.propose(alice, alice.username, [aliceCard.id], [bobCard.id]),
      SelfTradeError.message
    )
    // Alice asks for a card Bob does not have
    await assert.rejects(
      () => trades.propose(alice, bob.username, [aliceCard.id], [aliceCard.id]),
      CardsUnavailableError.message
    )
    assert.lengthOf(await Trade.all(), 0)
  })

  test('accepting swaps every copy at once', async ({ assert }) => {
    const extra = await catalogueCard('common')
    await own(alice, extra)
    const trade = await trades.propose(
      alice,
      bob.username.toUpperCase(),
      [aliceCard.id, extra.id],
      [bobCard.id]
    )

    await trades.accept(bob, trade.id)

    assert.deepEqual(await owners(aliceCard), [bob.id])
    assert.deepEqual(await owners(extra), [bob.id])
    assert.deepEqual(await owners(bobCard), [alice.id])
    await trade.refresh()
    assert.equal(trade.status, 'accepted')
    await assert.rejects(() => trades.accept(bob, trade.id), TradeClosedError.message)
  })

  test('another free copy stands in for one that is gone', async ({ assert }) => {
    await own(alice, aliceCard)
    const trade = await trades.propose(alice, bob.username, [aliceCard.id], [bobCard.id])
    const item = await TradeItem.query()
      .where({ tradeId: trade.id, ownerId: alice.id })
      .firstOrFail()
    await UserCard.query().where('id', item.userCardId!).delete()

    await trades.accept(bob, trade.id)
    assert.deepEqual(await owners(aliceCard), [bob.id])
  })

  test('nothing moves when a card is no longer available', async ({ assert }) => {
    const trade = await trades.propose(alice, bob.username, [aliceCard.id], [bobCard.id])
    const auctions = await app.container.make(AuctionService)
    await auctions.create(alice, aliceCard.id, 10, 24)

    await assert.rejects(() => trades.accept(bob, trade.id), CardsUnavailableError.message)
    assert.deepEqual(await owners(aliceCard), [alice.id])
    assert.deepEqual(await owners(bobCard), [bob.id])
    await trade.refresh()
    assert.equal(trade.status, 'pending')
  })

  test('only the recipient answers, only the proposer cancels', async ({ assert }) => {
    const trade = await trades.propose(alice, bob.username, [aliceCard.id], [bobCard.id])

    await assert.rejects(() => trades.accept(alice, trade.id), TradeClosedError.message)
    await assert.rejects(() => trades.decline(alice, trade.id), TradeClosedError.message)
    await assert.rejects(() => trades.cancel(bob, trade.id), TradeClosedError.message)

    await trades.decline(bob, trade.id)
    await trade.refresh()
    assert.equal(trade.status, 'declined')

    const second = await trades.propose(alice, bob.username, [aliceCard.id], [bobCard.id])
    await trades.cancel(alice, second.id)
    await second.refresh()
    assert.equal(second.status, 'cancelled')
  })

  test('offers expire', async ({ assert }) => {
    const trade = await trades.propose(alice, bob.username, [aliceCard.id], [bobCard.id])
    trade.expiresAt = DateTime.now().minus({ minutes: 1 })
    await trade.save()

    await assert.rejects(() => trades.accept(bob, trade.id), TradeClosedError.message)
    assert.equal(await trades.expireDue(), 1)
    await trade.refresh()
    assert.equal(trade.status, 'expired')
  })

  test('selling the traded copy to the bank is still possible meanwhile', async ({ assert }) => {
    await own(alice, aliceCard)
    await trades.propose(alice, bob.username, [aliceCard.id], [bobCard.id])
    await new WalletService().sellDuplicate(alice, aliceCard.id)
    assert.lengthOf(await UserCard.query().where({ userId: alice.id, cardId: aliceCard.id }), 1)
  })

  test('proposes through the form and lists pending offers', async ({ client, assert }) => {
    const response = await client
      .post('/trades')
      .form({ 'recipient': bob.username, 'offered[]': [aliceCard.id], 'requested[]': [bobCard.id] })
      .loginAs(alice)
      .withCsrfToken()
      .redirects(0)
    response.assertHeader('location', '/trades?box=sent')

    const received = await client.get('/trades').loginAs(bob).withInertia()
    const props = received.inertiaProps as any
    assert.equal(props.pendingTrades, 1)
    assert.lengthOf(props.trades, 1)
    assert.deepEqual(
      props.trades[0].offered.map((card: any) => card.id),
      [aliceCard.id]
    )
    assert.deepEqual(
      props.trades[0].requested.map((card: any) => card.id),
      [bobCard.id]
    )

    const sent = await client.get('/trades?box=sent').loginAs(alice).withInertia()
    assert.lengthOf((sent.inertiaProps as any).trades, 1)
    assert.equal((sent.inertiaProps as any).pendingTrades, 0)

    const builder = await client.get(`/trades/new?to=${bob.username}`).loginAs(alice).withInertia()
    const choices = builder.inertiaProps as any
    assert.deepEqual(
      choices.theirs.map((card: any) => card.id),
      [bobCard.id]
    )
    assert.deepEqual(
      choices.mine.map((card: any) => card.id),
      [aliceCard.id]
    )
  })
})
