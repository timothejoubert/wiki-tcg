import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import ace from '@adonisjs/core/services/ace'
import testUtils from '@adonisjs/core/services/test_utils'
import Card from '#models/card'
import gameConfig from '#config/game'
import CardsHarvest from '#commands/cards_harvest'
import WikipediaClient from '#services/wikipedia_client'
import FakeWikipediaClient, { article } from '#tests/helpers/fake_wikipedia_client'

test.group('cards:harvest', (group) => {
  let wikipedia: FakeWikipediaClient

  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => {
    wikipedia = new FakeWikipediaClient()
    app.container.swap(WikipediaClient, () => wikipedia)
    const pauseMs = gameConfig.harvest.pauseMs
    gameConfig.harvest.pauseMs = 0
    return () => {
      gameConfig.harvest.pauseMs = pauseMs
      app.container.restore(WikipediaClient)
    }
  })

  test('imports top articles from the minimum rarity up', async ({ assert }) => {
    wikipedia.topTitles = ['Paris', 'Obscur', 'Spécial:Recherche']
    wikipedia.byTitle.set('Paris', article({ pageId: 1, title: 'Paris', avgDailyViews: 8000 }))
    wikipedia.byTitle.set('Obscur', article({ pageId: 2, title: 'Obscur', avgDailyViews: 3 }))

    const command = await ace.create(CardsHarvest, ['--top'])
    await command.exec()
    command.assertSucceeded()

    const cards = await Card.all()
    assert.lengthOf(cards, 1)
    assert.equal(cards[0].rarity, 'legendary')
  })

  test('sifts random batches and keeps existing cards frozen', async ({ assert }) => {
    wikipedia.articles = [
      article({ pageId: 1, avgDailyViews: 40 }),
      article({ pageId: 2, avgDailyViews: 1 }),
    ]

    const first = await ace.create(CardsHarvest, ['--random=2'])
    await first.exec()
    first.assertSucceeded()

    assert.lengthOf(await Card.all(), 1)
    const card = await Card.findByOrFail('wikiPageId', 1)
    assert.equal(card.rarity, 'rare')
  })
})
