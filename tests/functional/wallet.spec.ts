import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import UserCard from '#models/user_card'
import WalletTransaction from '#models/wallet_transaction'
import gameConfig from '#config/game'
import BoosterService from '#services/booster_service'
import RarityRoller from '#services/rarity_roller'
import WikipediaClient from '#services/wikipedia_client'
import WalletService, { NotADuplicateError } from '#services/wallet_service'
import FakeRarityRoller from '#tests/helpers/fake_rarity_roller'
import FakeWikipediaClient, { article } from '#tests/helpers/fake_wikipedia_client'
import { catalogueCard } from '#tests/helpers/catalogue'
import { createUser } from '#tests/helpers/users'
import { own } from '#tests/helpers/owned'

const { economy } = gameConfig

test.group('Wallet', (group) => {
  let wikipedia: FakeWikipediaClient

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => {
    wikipedia = new FakeWikipediaClient()
    app.container.swap(WikipediaClient, () => wikipedia)
    app.container.swap(RarityRoller, () => new FakeRarityRoller())
    return () => app.container.restoreAll([WikipediaClient, RarityRoller])
  })

  test('credits the daily bonus once per day', async ({ client, assert }) => {
    const user = await createUser()

    const first = await client.get('/dashboard').loginAs(user).withInertia()
    assert.equal((first.inertiaProps as any).dailyBonus, economy.dailyBonus)
    const second = await client.get('/dashboard').loginAs(user).withInertia()
    assert.isNull((second.inertiaProps as any).dailyBonus)

    await user.refresh()
    assert.equal(user.balance, economy.dailyBonus)

    user.dailyBonusClaimedOn = DateTime.now().minus({ days: 1 })
    await user.save()
    await client.get('/dashboard').loginAs(user).withInertia()
    await user.refresh()
    assert.equal(user.balance, economy.dailyBonus * 2)
    assert.lengthOf(await WalletTransaction.query().where('kind', 'daily_bonus'), 2)
  })

  test('pays a bonus for the first copy of a card only', async ({ assert }) => {
    const user = await createUser({ boosterStock: 2 })
    wikipedia.articles = [1, 2, 3, 4, 5].map((pageId) => article({ pageId }))
    const boosters = await app.container.make(BoosterService)

    await boosters.open(user)
    await user.refresh()
    assert.equal(user.balance, 5 * economy.newCardBonus.common)

    await boosters.open(user)
    await user.refresh()
    assert.equal(user.balance, 5 * economy.newCardBonus.common)
    assert.lengthOf(await WalletTransaction.query().where('kind', 'new_card'), 5)
  })

  test('sells a duplicate to the bank, never the last copy', async ({ client, assert }) => {
    const user = await createUser()
    const card = await catalogueCard('super_rare')
    await own(user, card, 2)

    await client.post(`/cards/${card.id}/sell`).loginAs(user).withCsrfToken().redirects(0)
    await user.refresh()
    assert.equal(user.balance, economy.bankSale.super_rare)
    assert.lengthOf(await UserCard.query().where('user_id', user.id), 1)

    const refused = await client
      .post(`/cards/${card.id}/sell`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    refused.assertFlashMessage('error', new NotADuplicateError().message)
    assert.lengthOf(await UserCard.query().where('user_id', user.id), 1)

    const sale = await WalletTransaction.findByOrFail('kind', 'bank_sale')
    assert.equal(sale.cardId, card.id)
    assert.equal(sale.balanceAfter, economy.bankSale.super_rare)
  })

  test('concurrent sales cannot sell the last copy', async ({ assert }) => {
    const user = await createUser()
    const card = await catalogueCard('rare')
    await own(user, card, 2)
    const wallet = new WalletService()

    const results = await Promise.allSettled([
      wallet.sellDuplicate(await User.findOrFail(user.id), card.id),
      wallet.sellDuplicate(await User.findOrFail(user.id), card.id),
    ])

    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1)
    assert.lengthOf(await UserCard.query().where('user_id', user.id), 1)
    await user.refresh()
    assert.equal(user.balance, economy.bankSale.rare)
  })

  test('buys a booster only with an empty stock and enough wikis', async ({ client, assert }) => {
    const user = await createUser({ boosterStock: 1, boosterRefilledAt: DateTime.now() })
    user.balance = economy.boosterPrice - 1
    await user.save()

    const withStock = await client.post('/boosters/buy').loginAs(user).withCsrfToken().redirects(0)
    withStock.assertFlashMessage('error', 'Un booster ne s’achète que quand ton stock est vide.')

    user.boosterStock = 0
    await user.save()
    const tooPoor = await client.post('/boosters/buy').loginAs(user).withCsrfToken().redirects(0)
    tooPoor.assertFlashMessage('error', 'Solde insuffisant.')

    user.balance = economy.boosterPrice + 5
    await user.save()
    await client.post('/boosters/buy').loginAs(user).withCsrfToken().redirects(0)
    await user.refresh()
    assert.equal(user.boosterStock, 1)
    assert.equal(user.balance, 5)
  })

  test('lists the history newest first with running balances', async ({ client, assert }) => {
    const user = await createUser()
    const card = await catalogueCard('legendary')
    await own(user, card, 2)
    await client.get('/dashboard').loginAs(user)
    await client.post(`/cards/${card.id}/sell`).loginAs(user).withCsrfToken().redirects(0)

    const response = await client.get('/wallet').loginAs(user).withInertia()
    const { balance, history } = response.inertiaProps as any
    assert.equal(balance, economy.dailyBonus + economy.bankSale.legendary)
    assert.deepEqual(
      history.data.map((row: any) => [row.kind, row.amount, row.balanceAfter]),
      [
        ['bank_sale', economy.bankSale.legendary, balance],
        ['daily_bonus', economy.dailyBonus, economy.dailyBonus],
      ]
    )
    assert.equal(history.data[0].card.id, card.id)
  })
})
