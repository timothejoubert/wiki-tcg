import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import BoosterService from '#services/booster_service'
import RarityRoller from '#services/rarity_roller'
import WikipediaClient from '#services/wikipedia_client'
import FakeRarityRoller from '#tests/helpers/fake_rarity_roller'
import FakeWikipediaClient, { article } from '#tests/helpers/fake_wikipedia_client'
import { createUser } from '#tests/helpers/users'

async function openBooster(user: Parameters<BoosterService['open']>[0]) {
  const boosters = await app.container.make(BoosterService)
  return boosters.open(user)
}

test.group('Collection', (group) => {
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

  test('lists owned cards with copies, filters and rarity totals', async ({ client, assert }) => {
    const user = await createUser()
    const boosters = await app.container.make(BoosterService)

    roller.boosters = [
      ['super_rare', 'common', 'common', 'common', 'common'],
      ['super_rare', 'common', 'common', 'common', 'common'],
    ]
    wikipedia.articles = [1, 2, 3, 4, 5].map((pageId) =>
      article({ pageId, avgDailyViews: pageId === 1 ? 600 : 1 })
    )
    await boosters.open(user)
    wikipedia.articles = [1, 6, 7, 8, 9].map((pageId) =>
      article({ pageId, avgDailyViews: pageId === 1 ? 600 : 1 })
    )
    await boosters.open(user)

    const all = await client.get('/collection').loginAs(user).withInertia()
    all.assertInertiaComponent('collection')
    const props = all.inertiaProps as any
    assert.equal(props.cards.metadata.total, 9)
    assert.equal(props.progression.byRarity.common.cards, 8)
    assert.equal(props.progression.byRarity.super_rare.cards, 1)
    assert.equal(props.progression.byRarity.super_rare.copies, 2)

    const duplicates = await client.get('/collection?duplicates=1').loginAs(user).withInertia()
    const [duplicate] = (duplicates.inertiaProps as any).cards.data
    assert.equal((duplicates.inertiaProps as any).cards.metadata.total, 1)
    assert.strictEqual(duplicate.copies, 2)

    for (const sort of ['rarity', 'title', 'recent']) {
      const sorted = await client.get(`/collection?sort=${sort}`).loginAs(user).withInertia()
      sorted.assertStatus(200)
      if (sort === 'rarity') {
        assert.equal((sorted.inertiaProps as any).cards.data[0].rarity, 'super_rare')
      }
    }
  })

  test('shows a card with its Wikipedia attribution', async ({ client, assert }) => {
    const user = await createUser()
    wikipedia.articles = [1, 2, 3, 4, 5].map((pageId) =>
      article({ pageId, title: pageId === 1 ? 'Tour Eiffel' : `Article ${pageId}` })
    )
    const opening = await openBooster(user)
    await opening.load('cards')

    const cardId = opening.cards.find(() => true)!.cardId
    const response = await client.get(`/cards/${cardId}`).loginAs(user).withInertia()
    const card = (response.inertiaProps as any).card

    assert.equal(card.copies, 1)
    assert.match(card.wikipediaUrl, /^https:\/\/fr\.wikipedia\.org\/wiki\//)
  })

  test('guests are redirected to login', async ({ client }) => {
    const response = await client.get('/collection').redirects(0)
    response.assertHeader('location', '/login')
  })
})
