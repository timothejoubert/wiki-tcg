import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Tag from '#models/tag'
import CardFavorite from '#models/card_favorite'
import { createUser } from '#tests/helpers/users'
import { catalogueCard } from '#tests/helpers/catalogue'
import { own } from '#tests/helpers/owned'

test.group('Album', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('toggles a favorite on an owned card and filters on it', async ({ client, assert }) => {
    const user = await createUser()
    const [starred, other] = [await catalogueCard('rare'), await catalogueCard('common')]
    await own(user, starred, 2)
    await own(user, other)

    await client.post(`/cards/${starred.id}/favorite`).loginAs(user).withCsrfToken()
    assert.lengthOf(await CardFavorite.all(), 1)

    const favorites = await client.get('/collection?favorites=1').loginAs(user).withInertia()
    const props = favorites.inertiaProps as any
    assert.equal(props.cards.metadata.total, 1)
    assert.isTrue(props.cards.data[0].isFavorite)

    await client.post(`/cards/${starred.id}/favorite`).loginAs(user).withCsrfToken()
    assert.lengthOf(await CardFavorite.all(), 0)
  })

  test('refuses to favorite or tag a card the player does not own', async ({ client, assert }) => {
    const user = await createUser()
    const card = await catalogueCard('legendary')
    const tag = await Tag.create({ userId: user.id, name: 'Lieux' })

    const favorite = await client.post(`/cards/${card.id}/favorite`).loginAs(user).withCsrfToken()
    favorite.assertStatus(404)

    const attach = await client
      .post(`/cards/${card.id}/tags`)
      .form({ tagId: tag.id })
      .loginAs(user)
      .withCsrfToken()
    attach.assertStatus(404)
    assert.lengthOf(await CardFavorite.all(), 0)
  })

  test('creates a tag on a card, unique per player ignoring case', async ({ client, assert }) => {
    const [alice, bob] = [await createUser(), await createUser()]
    const card = await catalogueCard('common')
    await own(alice, card)

    await client
      .post('/tags')
      .form({ name: ' Géographie ', cardId: card.id })
      .loginAs(alice)
      .withCsrfToken()
    const tag = await Tag.query().where('user_id', alice.id).preload('cards').firstOrFail()
    assert.equal(tag.name, 'Géographie')
    assert.deepEqual(
      tag.cards.map((c) => c.id),
      [card.id]
    )

    const duplicate = await client
      .post('/tags')
      .form({ name: 'GÉOGRAPHIE' })
      .loginAs(alice)
      .withCsrfToken()
      .redirects(0)
    assert.properties(duplicate.flashMessages().inputErrorsBag, ['name'])

    await client.post('/tags').form({ name: 'Géographie' }).loginAs(bob).withCsrfToken()
    assert.lengthOf(await Tag.all(), 2)
  })

  test("a player cannot use or delete another player's tag", async ({ client, assert }) => {
    const [alice, bob] = [await createUser(), await createUser()]
    const card = await catalogueCard('common')
    await own(bob, card)
    const alicesTag = await Tag.create({ userId: alice.id, name: 'Perso' })

    const attach = await client
      .post(`/cards/${card.id}/tags`)
      .form({ tagId: alicesTag.id })
      .loginAs(bob)
      .withCsrfToken()
    attach.assertStatus(404)

    const destroy = await client.delete(`/tags/${alicesTag.id}`).loginAs(bob).withCsrfToken()
    destroy.assertStatus(404)
    assert.isNotNull(await Tag.find(alicesTag.id))
  })

  test('attaches, filters by and detaches a tag', async ({ client, assert }) => {
    const user = await createUser()
    const [tagged, untagged] = [await catalogueCard('rare'), await catalogueCard('rare')]
    await own(user, tagged)
    await own(user, untagged)
    const tag = await Tag.create({ userId: user.id, name: 'À échanger' })

    await client
      .post(`/cards/${tagged.id}/tags`)
      .form({ tagId: tag.id })
      .loginAs(user)
      .withCsrfToken()
    // Attaching twice keeps a single link
    await client
      .post(`/cards/${tagged.id}/tags`)
      .form({ tagId: tag.id })
      .loginAs(user)
      .withCsrfToken()

    const filtered = await client.get(`/collection?tag=${tag.id}`).loginAs(user).withInertia()
    const props = filtered.inertiaProps as any
    assert.equal(props.cards.metadata.total, 1)
    assert.deepEqual(props.cards.data[0].tags, [{ id: tag.id, name: 'À échanger' }])
    assert.equal(props.tags[0].cards, 1)

    await client.delete(`/cards/${tagged.id}/tags/${tag.id}`).loginAs(user).withCsrfToken()
    await tag.load('cards')
    assert.lengthOf(tag.cards, 0)
  })

  test('searches titles and descriptions without accents nor wildcards', async ({
    client,
    assert,
  }) => {
    const user = await createUser()
    await own(user, await catalogueCard('common', { title: 'Évêché de Metz' }))
    await own(
      user,
      await catalogueCard('common', { title: 'Lac', description: 'plan d’eau élevé' })
    )
    await own(user, await catalogueCard('common', { title: '100 % Dragon' }))
    await own(user, await catalogueCard('common', { title: '1000 Dragons' }))

    const search = async (q: string) => {
      const response = await client
        .get(`/collection?q=${encodeURIComponent(q)}`)
        .loginAs(user)
        .withInertia()
      return (response.inertiaProps as any).cards.data.map((card: any) => card.title)
    }

    assert.deepEqual(await search('eveche'), ['Évêché de Metz'])
    assert.deepEqual(await search('ELEVE'), ['Lac'])
    assert.deepEqual(await search('100 %'), ['100 % Dragon'])
  })

  test('reports the progression per rarity and the latest cards', async ({ client, assert }) => {
    const user = await createUser()
    const common = await catalogueCard('common')
    const legendary = await catalogueCard('legendary')
    await own(user, common, 3)
    await own(user, legendary)

    const collection = await client.get('/collection').loginAs(user).withInertia()
    const { progression } = collection.inertiaProps as any
    assert.equal(progression.cards, 2)
    assert.equal(progression.copies, 4)
    assert.deepEqual(progression.byRarity.common, { cards: 1, copies: 3 })
    assert.deepEqual(progression.byRarity.legendary, { cards: 1, copies: 1 })
    assert.deepEqual(progression.byRarity.rare, { cards: 0, copies: 0 })

    const dashboard = await client.get('/dashboard').loginAs(user).withInertia()
    const recent = (dashboard.inertiaProps as any).recent.map((card: any) => card.id)
    assert.deepEqual(recent, [legendary.id, common.id])
  })
})
