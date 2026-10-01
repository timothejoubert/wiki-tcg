import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import Card from '#models/card'
import User from '#models/user'
import UserCard from '#models/user_card'
import BoosterService, { NoBoosterAvailableError } from '#services/booster_service'
import RarityRoller from '#services/rarity_roller'
import WikipediaClient from '#services/wikipedia_client'
import FakeRarityRoller from '#tests/helpers/fake_rarity_roller'
import FakeWikipediaClient, { article } from '#tests/helpers/fake_wikipedia_client'
import { createUser } from '#tests/helpers/users'
import { catalogueCard } from '#tests/helpers/catalogue'

async function openBooster(user: Parameters<BoosterService['open']>[0]) {
  const boosters = await app.container.make(BoosterService)
  return boosters.open(user)
}

test.group('Boosters', (group) => {
  let wikipedia: FakeWikipediaClient
  let roller: FakeRarityRoller

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => {
    wikipedia = new FakeWikipediaClient()
    roller = new FakeRarityRoller()
    app.container.swap(WikipediaClient, () => wikipedia)
    app.container.swap(RarityRoller, () => roller)
    return () => app.container.restoreAll([WikipediaClient, RarityRoller])
  })

  test('opening a booster grants 5 cards and spends one booster', async ({ client, assert }) => {
    const user = await createUser({ boosterStock: 3 })

    const response = await client.post('/boosters').loginAs(user).withCsrfToken().redirects(0)
    response.assertStatus(302)
    assert.match(response.header('location') ?? '', /^\/boosters\/\d+$/)

    await user.refresh()
    assert.equal(user.boosterStock, 2)
    assert.lengthOf(await UserCard.query().where('user_id', user.id), 5)
  })

  test('computes the rarity from the article audience', async ({ assert }) => {
    const user = await createUser()
    wikipedia.articles = [
      article({ pageId: 1, avgDailyViews: 12_000, qualityLabel: 'featured', lengthBytes: 300_000 }),
      article({ pageId: 2, avgDailyViews: 60 }),
      article({ pageId: 3, avgDailyViews: 150 }),
      article({ pageId: 4 }),
      article({ pageId: 5 }),
    ]
    roller.boosters = [['common', 'common', 'rare', 'super_rare', 'legendary']]

    await openBooster(user)

    const featured = await Card.findByOrFail('wikiPageId', 1)
    assert.equal(featured.rarity, 'legendary')
    assert.equal(featured.qualityLabel, 'featured')

    const scored = await Card.findByOrFail('wikiPageId', 2)
    assert.equal(scored.rarity, 'rare')

    const popular = await Card.findByOrFail('wikiPageId', 3)
    assert.equal(popular.rarity, 'super_rare')
  })

  test('a card drawn twice is shared and its snapshot is kept', async ({ assert }) => {
    const [alice, bob] = [await createUser(), await createUser()]
    wikipedia.articles = [1, 2, 3, 4, 5].map((pageId) => article({ pageId }))
    const boosters = await app.container.make(BoosterService)

    await boosters.open(alice)
    // Same pages, now popular: they still come out as the frozen commons
    wikipedia.articles = wikipedia.articles.map((a) => ({ ...a, avgDailyViews: 99_999 }))
    const legendaries = Array.from({ length: 5 }, () => 'legendary' as const)
    roller.boosters = [legendaries, legendaries]
    await boosters.open(bob)
    await boosters.open(alice)

    assert.lengthOf(await Card.all(), 5)
    const first = await Card.findByOrFail('wikiPageId', 1)
    assert.equal(first.rarity, 'common')
    assert.lengthOf(await UserCard.query().where('user_id', alice.id), 10)
  })

  test('refuses to open without stock and keeps cards untouched', async ({ client, assert }) => {
    const user = await createUser({ boosterStock: 0, boosterRefilledAt: DateTime.now() })

    const response = await client.post('/boosters').loginAs(user).withCsrfToken().redirects(0)

    response.assertHeader('location', '/dashboard')
    response.assertFlashMessage('error', new NoBoosterAvailableError().message)
    assert.equal(wikipedia.calls, 0)
    assert.lengthOf(await UserCard.all(), 0)
  })

  test('a Wikipedia outage does not consume the booster', async ({ client, assert }) => {
    const user = await createUser({ boosterStock: 1 })
    wikipedia.failing = true

    const response = await client.post('/boosters').loginAs(user).withCsrfToken().redirects(0)

    response.assertHeader('location', '/dashboard')
    await user.refresh()
    assert.equal(user.boosterStock, 1)
  })

  test('concurrent openings cannot spend the same booster twice', async ({ assert }) => {
    const user = await createUser({ boosterStock: 1 })
    const boosters = await app.container.make(BoosterService)

    const results = await Promise.allSettled([
      boosters.open(await User.findOrFail(user.id)),
      boosters.open(await User.findOrFail(user.id)),
    ])

    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1)
    const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult
    assert.instanceOf(rejected.reason, NoBoosterAvailableError)

    await user.refresh()
    assert.equal(user.boosterStock, 0)
    assert.lengthOf(await UserCard.query().where('user_id', user.id), 5)
  })

  test('high rarity slots are served from the catalogue', async ({ assert }) => {
    const user = await createUser()
    const legendary = await catalogueCard('legendary')
    roller.boosters = [['common', 'common', 'common', 'common', 'legendary']]

    const opening = await openBooster(user)
    await opening.load('cards', (query) => query.orderBy('id'))

    assert.lengthOf(opening.cards, 5)
    assert.equal(opening.cards[4].cardId, legendary.id)
  })

  test('a slot falls back to the next lower rarity available', async ({ assert }) => {
    const user = await createUser()
    wikipedia.articles = [
      ...[1, 2, 3, 4].map((pageId) => article({ pageId })),
      article({ pageId: 5, avgDailyViews: 20 }),
    ]
    roller.boosters = [['common', 'common', 'common', 'common', 'legendary']]

    const opening = await openBooster(user)
    await opening.load('cards', (query) => query.orderBy('id').preload('card'))

    assert.equal(opening.cards[4].card.rarity, 'rare')
  })

  test('live articles of high rarity are kept in the catalogue', async ({ assert }) => {
    const user = await createUser()
    wikipedia.articles = [
      ...[1, 2, 3, 4, 5].map((pageId) => article({ pageId })),
      article({ pageId: 6, avgDailyViews: 300 }),
      article({ pageId: 7, avgDailyViews: 4 }),
    ]

    await openBooster(user)

    const kept = await Card.findByOrFail('wikiPageId', 6)
    assert.equal(kept.rarity, 'super_rare')
    assert.lengthOf(await UserCard.query().where('card_id', kept.id), 0)
    assert.isNull(await Card.findBy('wikiPageId', 7))
  })

  test('the catalogue serves boosters during a Wikipedia outage', async ({ assert }) => {
    const user = await createUser({ boosterStock: 1 })
    for (let index = 0; index < 5; index++) {
      await catalogueCard('common')
    }
    wikipedia.failing = true

    await openBooster(user)

    await user.refresh()
    assert.equal(user.boosterStock, 0)
    assert.lengthOf(await UserCard.query().where('user_id', user.id), 5)
  })

  test('only the owner can see a booster opening', async ({ client }) => {
    const [alice, bob] = [await createUser(), await createUser()]
    const opening = await openBooster(alice)

    const own = await client.get(`/boosters/${opening.id}`).loginAs(alice).withInertia()
    own.assertInertiaComponent('boosters/show')

    const other = await client.get(`/boosters/${opening.id}`).loginAs(bob).withInertia()
    other.assertStatus(404)
  })
})
