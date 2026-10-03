import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import UserCard from '#models/user_card'
import WalletTransaction from '#models/wallet_transaction'
import gameConfig from '#config/game'
import AuctionService from '#services/auction_service'
import WalletService from '#services/wallet_service'
import { catalogueCard } from '#tests/helpers/catalogue'
import { createUser } from '#tests/helpers/users'
import { own } from '#tests/helpers/owned'

const { bankSale } = gameConfig.economy

async function copiesOf(userId: number, cardId: number) {
  const copies = await UserCard.query().where({ userId, cardId })
  return copies.length
}

test.group('Recycling', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('recycles every spare copy and keeps one of each card', async ({ client, assert }) => {
    const user = await createUser()
    const [common, rare, single] = [
      await catalogueCard('common'),
      await catalogueCard('rare'),
      await catalogueCard('legendary'),
    ]
    await own(user, common, 4)
    await own(user, rare, 2)
    await own(user, single)

    const page = await client.get('/collection').loginAs(user).withInertia()
    const expected = 3 * bankSale.common + bankSale.rare
    assert.deepEqual((page.inertiaProps as any).recycle, { copies: 4, wikis: expected })

    const response = await client
      .post('/collection/recycle')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    response.assertFlashMessage('success', `4 doublons recyclés : +${expected} wikis.`)

    assert.equal(await copiesOf(user.id, common.id), 1)
    assert.equal(await copiesOf(user.id, rare.id), 1)
    assert.equal(await copiesOf(user.id, single.id), 1)
    await user.refresh()
    assert.equal(user.balance, expected)
    const rows = await WalletTransaction.query().where('kind', 'bank_sale').orderBy('id')
    assert.sameDeepMembers(
      rows.map((row) => [row.cardId, row.amount]),
      [
        [common.id, 3 * bankSale.common],
        [rare.id, bankSale.rare],
      ]
    )

    const again = await client
      .post('/collection/recycle')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    again.assertFlashMessage('error', 'Aucun doublon à recycler.')
  })

  test('copies listed in an auction are neither sold nor counted as kept', async ({ assert }) => {
    const user = await createUser()
    const card = await catalogueCard('super_rare')
    await own(user, card, 3)
    const auctions = await app.container.make(AuctionService)
    await auctions.create(user, card.id, 10, 24)

    const wallet = new WalletService()
    assert.deepEqual(await wallet.recyclePreview(user), { copies: 1, wikis: bankSale.super_rare })
    await wallet.recycleDuplicates(user)
    // One listed copy + the one free copy kept
    assert.equal(await copiesOf(user.id, card.id), 2)
  })

  test('recycles only the selected cards, never another player’s', async ({ client, assert }) => {
    const [user, other] = [await createUser(), await createUser()]
    const [picked, untouched] = [await catalogueCard('common'), await catalogueCard('common')]
    await own(user, picked, 3)
    await own(user, untouched, 3)
    await own(other, picked, 3)

    await client
      .post('/collection/bulk')
      .form({ 'cardIds[]': [picked.id], 'action': 'recycle' })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    assert.equal(await copiesOf(user.id, picked.id), 1)
    assert.equal(await copiesOf(user.id, untouched.id), 3)
    assert.equal(await copiesOf(other.id, picked.id), 3)
  })
})
