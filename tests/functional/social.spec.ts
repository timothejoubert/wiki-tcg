import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Tag from '#models/tag'
import CardFavorite from '#models/card_favorite'
import { catalogueCard } from '#tests/helpers/catalogue'
import { createUser } from '#tests/helpers/users'
import { own } from '#tests/helpers/owned'

test.group('Social', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('a public profile shows the collection without personal data', async ({
    client,
    assert,
  }) => {
    const [owner, visitor] = [await createUser(), await createUser()]
    const card = await catalogueCard('legendary')
    await own(owner, card, 2)
    await CardFavorite.create({ userId: owner.id, cardId: card.id })
    const tag = await Tag.create({ userId: owner.id, name: 'Secret' })
    await tag.related('cards').attach([card.id])

    const response = await client
      .get(`/joueurs/${owner.username.toUpperCase()}`)
      .loginAs(visitor)
      .withInertia()
    response.assertInertiaComponent('players/show')
    const props = response.inertiaProps as any
    assert.equal(props.progression.byRarity.legendary.cards, 1)
    const [shown] = props.cards.data
    assert.equal(shown.copies, 2)
    assert.isUndefined(shown.isFavorite)
    assert.isUndefined(shown.tags)

    const unknown = await client.get('/joueurs/nobody').loginAs(visitor).withInertia()
    unknown.assertStatus(404)
  })

  test('a private profile only shows the username, except to its owner', async ({
    client,
    assert,
  }) => {
    const [owner, visitor] = [await createUser(), await createUser()]
    await own(owner, await catalogueCard('rare'))
    await client.put('/reglages').form({}).loginAs(owner).withCsrfToken()
    await owner.refresh()
    assert.isFalse(owner.collectionPublic)

    const hidden = await client.get(`/joueurs/${owner.username}`).loginAs(visitor).withInertia()
    assert.isNull((hidden.inertiaProps as any).cards)
    assert.isNull((hidden.inertiaProps as any).progression)

    const self = await client.get(`/joueurs/${owner.username}`).loginAs(owner).withInertia()
    assert.equal((self.inertiaProps as any).cards.metadata.total, 1)

    await client.put('/reglages').form({ collectionPublic: '1' }).loginAs(owner).withCsrfToken()
    await owner.refresh()
    assert.isTrue(owner.collectionPublic)
  })

  test('finds players by username prefix', async ({ client, assert }) => {
    const viewer = await createUser()
    for (const username of ['Marie_C', 'marius', 'amarante', 'ma%x']) {
      const player = await createUser()
      player.username = username
      await player.save()
    }

    const search = async (q: string) => {
      const response = await client
        .get(`/joueurs?q=${encodeURIComponent(q)}`)
        .loginAs(viewer)
        .withInertia()
      return (response.inertiaProps as any).players.map((p: any) => p.username)
    }

    assert.deepEqual(await search('mar'), ['marius', 'Marie_C'])
    assert.deepEqual(await search('ma%'), ['ma%x'])
    assert.deepEqual(await search(''), [])
  })

  test('the card page lists other public owners', async ({ client, assert }) => {
    const [viewer, open, hidden] = [await createUser(), await createUser(), await createUser()]
    hidden.collectionPublic = false
    await hidden.save()
    const card = await catalogueCard('super_rare')
    for (const player of [viewer, open, hidden]) await own(player, card)
    await own(open, card)

    const response = await client.get(`/cards/${card.id}`).loginAs(viewer).withInertia()
    assert.deepEqual((response.inertiaProps as any).owners, [
      { username: open.username, copies: 2 },
    ])
  })
})
