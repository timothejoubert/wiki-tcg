import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import ace from '@adonisjs/core/services/ace'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import Auction from '#models/auction'
import User from '#models/user'
import UserCard from '#models/user_card'
import WalletTransaction from '#models/wallet_transaction'
import AuctionsSettle from '#commands/auctions_settle'
import AuctionService, {
  AlreadyLeadingError,
  BidTooLowError,
  CannotCancelError,
  NoCopyAvailableError,
  OwnAuctionError,
  minNextBid,
} from '#services/auction_service'
import WalletService, { InsufficientFundsError, NotADuplicateError } from '#services/wallet_service'
import { catalogueCard } from '#tests/helpers/catalogue'
import { createUser } from '#tests/helpers/users'
import { own } from '#tests/helpers/owned'

async function player(balance = 0) {
  const user = await createUser()
  user.balance = balance
  await user.save()
  return user
}

async function expire(auction: Auction) {
  auction.endsAt = DateTime.now().minus({ minutes: 1 })
  await auction.save()
}

test.group('Auctions', (group) => {
  let auctions: AuctionService

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(async () => {
    auctions = await app.container.make(AuctionService)
  })

  test('reserves the listed copy', async ({ assert }) => {
    const seller = await player()
    const card = await catalogueCard('rare')
    await own(seller, card, 2)

    await auctions.create(seller, card.id, 10, 24)
    await auctions.create(seller, card.id, 10, 24)
    await assert.rejects(
      () => auctions.create(seller, card.id, 10, 24),
      NoCopyAvailableError.message
    )

    // Both copies are listed: none is free for the bank either
    await assert.rejects(
      () => new WalletService().sellDuplicate(seller, card.id),
      NotADuplicateError.message
    )
  })

  test('holds bids, refunds the outbid player and enforces the increment', async ({ assert }) => {
    const seller = await player()
    const [alice, bob] = [await player(500), await player(500)]
    const card = await catalogueCard('legendary')
    await own(seller, card)
    const auction = await auctions.create(seller, card.id, 100, 24)

    await assert.rejects(() => auctions.bid(alice, auction.id, 99), new BidTooLowError(100).message)
    await auctions.bid(alice, auction.id, 100)
    await assert.rejects(() => auctions.bid(alice, auction.id, 200), AlreadyLeadingError.message)
    await assert.rejects(() => auctions.bid(seller, auction.id, 200), OwnAuctionError.message)

    await auction.refresh()
    assert.equal(minNextBid(auction), 105)
    await assert.rejects(() => auctions.bid(bob, auction.id, 104), new BidTooLowError(105).message)
    await auctions.bid(bob, auction.id, 105)

    await alice.refresh()
    await bob.refresh()
    assert.equal(alice.balance, 500)
    assert.equal(bob.balance, 395)
    const aliceRows = await WalletTransaction.query().where('user_id', alice.id).orderBy('id')
    const kinds = aliceRows.map((row) => [row.kind, row.amount])
    assert.deepEqual(kinds, [
      ['auction_hold', -100],
      ['auction_refund', 100],
    ])
  })

  test('refuses a bid the player cannot afford', async ({ assert }) => {
    const seller = await player()
    const poor = await player(50)
    const card = await catalogueCard('rare')
    await own(seller, card)
    const auction = await auctions.create(seller, card.id, 60, 24)

    await assert.rejects(() => auctions.bid(poor, auction.id, 60), InsufficientFundsError.message)
    await auction.refresh()
    assert.isNull(auction.leaderId)
  })

  test('concurrent bids at the same price: only one wins the lead', async ({ assert }) => {
    const seller = await player()
    const [alice, bob] = [await player(100), await player(100)]
    const card = await catalogueCard('rare')
    await own(seller, card)
    const auction = await auctions.create(seller, card.id, 50, 24)

    const results = await Promise.allSettled([
      auctions.bid(await User.findOrFail(alice.id), auction.id, 50),
      auctions.bid(await User.findOrFail(bob.id), auction.id, 50),
    ])
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1)

    await auction.refresh()
    const bidders = await User.query().whereIn('id', [alice.id, bob.id])
    const total = bidders.reduce((sum, u) => sum + u.balance, 0)
    assert.equal(total, 150)
    assert.equal(auction.currentPrice, 50)
  })

  test('settles a sold auction once: copy to the winner, wikis to the seller', async ({
    assert,
  }) => {
    const seller = await player()
    const buyer = await player(300)
    const card = await catalogueCard('super_rare')
    await own(seller, card)
    const auction = await auctions.create(seller, card.id, 80, 1)
    await auctions.bid(buyer, auction.id, 120)
    await expire(auction)

    await auctions.settleDue()
    await auctions.settleDue()
    await auctions.settle(auction.id)

    await auction.refresh()
    assert.equal(auction.status, 'sold')
    const copy = await UserCard.findOrFail(auction.userCardId)
    assert.equal(copy.userId, buyer.id)
    await seller.refresh()
    await buyer.refresh()
    assert.equal(seller.balance, 120)
    assert.equal(buyer.balance, 180)
    assert.lengthOf(await WalletTransaction.query().where('kind', 'auction_sale'), 1)
  })

  test('an auction without bids ends unsold and frees the copy', async ({ assert }) => {
    const seller = await player()
    const card = await catalogueCard('rare')
    await own(seller, card)
    const auction = await auctions.create(seller, card.id, 10, 1)
    await expire(auction)

    const command = await ace.create(AuctionsSettle, [])
    await command.exec()
    command.assertSucceeded()

    await auction.refresh()
    assert.equal(auction.status, 'unsold')
    const copy = await UserCard.findOrFail(auction.userCardId)
    assert.equal(copy.userId, seller.id)
    await auctions.create(seller, card.id, 10, 24)
  })

  test('the seller can cancel only before the first bid', async ({ assert }) => {
    const seller = await player()
    const bidder = await player(100)
    const card = await catalogueCard('rare')
    await own(seller, card, 2)
    const quiet = await auctions.create(seller, card.id, 10, 24)
    const busy = await auctions.create(seller, card.id, 10, 24)
    await auctions.bid(bidder, busy.id, 10)

    await auctions.cancel(seller, quiet.id)
    await quiet.refresh()
    assert.equal(quiet.status, 'cancelled')
    await assert.rejects(() => auctions.cancel(seller, busy.id), CannotCancelError.message)
    await assert.rejects(() => auctions.cancel(bidder, quiet.id), CannotCancelError.message)
  })

  test('lists open auctions and the player’s sales and bids', async ({ client, assert }) => {
    const seller = await player()
    const bidder = await player(100)
    const card = await catalogueCard('legendary')
    await own(seller, card)

    const created = await client
      .post('/auctions')
      .form({ cardId: card.id, startingPrice: 20, durationHours: 6 })
      .loginAs(seller)
      .withCsrfToken()
      .redirects(0)
    const auction = await Auction.firstOrFail()
    created.assertHeader('location', `/auctions/${auction.id}`)

    const invalid = await client
      .post('/auctions')
      .form({ cardId: card.id, startingPrice: 5, durationHours: 5 })
      .loginAs(seller)
      .withCsrfToken()
      .redirects(0)
    assert.properties(invalid.flashMessages().inputErrorsBag, ['startingPrice', 'durationHours'])

    await client
      .post(`/auctions/${auction.id}/bids`)
      .form({ amount: 20 })
      .loginAs(bidder)
      .withCsrfToken()
      .redirects(0)

    const open = await client.get('/auctions').loginAs(bidder).withInertia()
    const listed = (open.inertiaProps as any).auctions.data
    assert.lengthOf(listed, 1)
    assert.equal(listed[0].currentPrice, 20)
    assert.equal(listed[0].card.id, card.id)

    const mine = await client.get('/auctions?scope=bidding').loginAs(bidder).withInertia()
    assert.lengthOf((mine.inertiaProps as any).auctions.data, 1)
    const selling = await client.get('/auctions?scope=selling').loginAs(bidder).withInertia()
    assert.lengthOf((selling.inertiaProps as any).auctions.data, 0)

    const show = await client.get(`/auctions/${auction.id}`).loginAs(seller).withInertia()
    show.assertInertiaComponent('auctions/show')
    const props = show.inertiaProps as any
    assert.equal(props.auction.minNextBid, 21)
    assert.deepEqual(
      props.bids.map((bid: any) => [bid.amount, bid.bidder]),
      [[20, bidder.username]]
    )
  })
})
