import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Tag from '#models/tag'
import CardFavorite from '#models/card_favorite'
import { catalogueCard } from '#tests/helpers/catalogue'
import { createUser } from '#tests/helpers/users'
import { own } from '#tests/helpers/owned'

test.group('Album extras', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('renames a tag, keeping names unique per player', async ({ client, assert }) => {
    const [user, other] = [await createUser(), await createUser()]
    const tag = await Tag.create({ userId: user.id, name: 'Geo' })
    await Tag.create({ userId: user.id, name: 'Histoire' })
    const foreign = await Tag.create({ userId: other.id, name: 'Perso' })

    await client
      .patch(`/tags/${tag.id}`)
      .form({ name: 'GEO' })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    await tag.refresh()
    assert.equal(tag.name, 'GEO')

    const clash = await client
      .patch(`/tags/${tag.id}`)
      .form({ name: 'histoire' })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    assert.properties(clash.flashMessages().inputErrorsBag, ['name'])

    const stolen = await client
      .patch(`/tags/${foreign.id}`)
      .form({ name: 'X' })
      .loginAs(user)
      .withCsrfToken()
    stolen.assertStatus(404)
  })

  test('applies bulk actions to owned cards only', async ({ client, assert }) => {
    const user = await createUser()
    const [a, b, notMine] = [
      await catalogueCard('rare'),
      await catalogueCard('common'),
      await catalogueCard('legendary'),
    ]
    await own(user, a)
    await own(user, b)
    const tag = await Tag.create({ userId: user.id, name: 'Lot' })
    const ids = [a.id, b.id, notMine.id]

    const bulk = (form: Record<string, unknown>) =>
      client.post('/collection/bulk').form(form).loginAs(user).withCsrfToken().redirects(0)

    const favorited = await bulk({ 'cardIds[]': ids, 'action': 'favorite' })
    favorited.assertFlashMessage('success', '2 cartes modifiées.')
    // Repeating is harmless
    await bulk({ 'cardIds[]': ids, 'action': 'favorite' })
    assert.lengthOf(await CardFavorite.all(), 2)

    await bulk({ 'cardIds[]': [a.id], 'action': 'unfavorite' })
    const favorites = await CardFavorite.all()
    assert.deepEqual(
      favorites.map((f) => f.cardId),
      [b.id]
    )

    await bulk({ 'cardIds[]': ids, 'action': 'tag', 'tagId': tag.id })
    await tag.load('cards')
    assert.sameMembers(
      tag.cards.map((card) => card.id),
      [a.id, b.id]
    )

    await bulk({ 'cardIds[]': [b.id], 'action': 'untag', 'tagId': tag.id })
    await tag.load('cards')
    assert.deepEqual(
      tag.cards.map((card) => card.id),
      [a.id]
    )

    const missingTag = await bulk({ 'cardIds[]': ids, 'action': 'tag' })
    assert.properties(missingTag.flashMessages().inputErrorsBag, ['tagId'])
  })

  test("refuses to bulk-apply another player's tag", async ({ client, assert }) => {
    const [user, other] = [await createUser(), await createUser()]
    const card = await catalogueCard('rare')
    await own(user, card)
    const foreign = await Tag.create({ userId: other.id, name: 'Autre' })

    const response = await client
      .post('/collection/bulk')
      .form({ 'cardIds[]': [card.id], 'action': 'tag', 'tagId': foreign.id })
      .loginAs(user)
      .withCsrfToken()
    response.assertStatus(404)
    await foreign.load('cards')
    assert.lengthOf(foreign.cards, 0)
  })
})
