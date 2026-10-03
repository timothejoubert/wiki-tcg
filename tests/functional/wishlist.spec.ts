import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import Notification from '#models/notification'
import WishlistItem from '#models/wishlist_item'
import AuctionService from '#services/auction_service'
import { catalogueCard } from '#tests/helpers/catalogue'
import { createUser } from '#tests/helpers/users'
import { own } from '#tests/helpers/owned'

test.group('Wishlist', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => {
    mail.fake()
    return () => mail.restore()
  })

  test('toggles a card from its page', async ({ client, assert }) => {
    const user = await createUser()
    const card = await catalogueCard('legendary', { title: 'Paris' })

    const added = await client
      .post(`/cards/${card.id}/wish`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    added.assertFlashMessage('success', '« Paris » ajoutée à tes souhaits.')
    const page = await client.get(`/cards/${card.id}`).loginAs(user).withInertia()
    assert.isTrue((page.inertiaProps as any).wished)

    await client.post(`/cards/${card.id}/wish`).loginAs(user).withCsrfToken()
    assert.lengthOf(await WishlistItem.all(), 0)
  })

  test('lists public owners, spare copies first, and the owned status', async ({
    client,
    assert,
  }) => {
    const [user, single, spare, hidden] = [
      await createUser(),
      await createUser(),
      await createUser(),
      await createUser(),
    ]
    hidden.collectionPublic = false
    await hidden.save()
    const [wanted, obtained] = [await catalogueCard('super_rare'), await catalogueCard('rare')]
    await own(single, wanted)
    await own(spare, wanted, 3)
    await own(hidden, wanted, 5)
    await own(user, obtained)
    await WishlistItem.createMany([
      { userId: user.id, cardId: obtained.id },
      { userId: user.id, cardId: wanted.id },
    ])

    const response = await client.get('/souhaits').loginAs(user).withInertia()
    const { cards, details } = response.inertiaProps as any
    assert.deepEqual(
      cards.map((card: any) => card.id),
      [wanted.id, obtained.id]
    )
    assert.deepEqual(details[0], {
      owned: false,
      owners: [
        { username: spare.username, copies: 3 },
        { username: single.username, copies: 1 },
      ],
    })
    assert.isTrue(details[1].owned)
  })

  test('alerts wishers when the card is listed in an auction', async ({ assert }) => {
    const [seller, wisher] = [await createUser(), await createUser()]
    const card = await catalogueCard('legendary', { title: 'Paris' })
    await own(seller, card)
    await WishlistItem.createMany([
      { userId: wisher.id, cardId: card.id },
      { userId: seller.id, cardId: card.id },
    ])

    const auctions = await app.container.make(AuctionService)
    const auction = await auctions.create(seller, card.id, 10, 24)

    const alerts = await Notification.query().where('type', 'wishlist_auction')
    assert.lengthOf(alerts, 1)
    assert.equal(alerts[0].userId, wisher.id)
    assert.deepEqual(alerts[0].data, {
      auctionId: auction.id,
      cardTitle: 'Paris',
      username: seller.username,
    })
  })

  test('the trade builder pre-selects the wanted card', async ({ client, assert }) => {
    const [user, owner] = [await createUser(), await createUser()]
    const card = await catalogueCard('rare')
    await own(owner, card)
    await own(user, await catalogueCard('common'))

    const response = await client
      .get(`/trades/new?to=${owner.username}&want=${card.id}`)
      .loginAs(user)
      .withInertia()
    assert.equal((response.inertiaProps as any).want, card.id)
  })
})
