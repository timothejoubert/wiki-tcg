import { setTimeout } from 'node:timers/promises'
import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import gameConfig, { RARITIES, type Rarity } from '#config/game'
import Card from '#models/card'
import RarityRoller, { rarityFallbacks } from '#services/rarity_roller'
import WikipediaClient, { type WikiArticle } from '#services/wikipedia_client'
import { rarityFor } from '#services/card_stats'

/**
 * Samples random articles to check how the thresholds of `config/game.ts`
 * spread rarities, or with `--boosters` simulates openings against
 * the current catalogue. Nothing is written to the database.
 */
export default class CardsCalibrate extends BaseCommand {
  static commandName = 'cards:calibrate'
  static description = 'Sample random Wikipedia articles and print the rarity spread'
  static options: CommandOptions = { startApp: true }

  @flags.number({ description: 'Number of articles to sample', default: 200 })
  declare samples: number

  @flags.number({ description: 'Simulate N booster openings on the catalogue instead' })
  declare boosters: number | undefined

  async run() {
    if (this.boosters) {
      return this.simulateBoosters(this.boosters)
    }

    const wikipedia = await this.app.container.make(WikipediaClient)
    wikipedia.maxRetryWaitMs = 60_000
    wikipedia.maxAttempts = 5
    const articles = new Map<number, WikiArticle>()

    while (articles.size < this.samples) {
      for (const article of await wikipedia.randomArticles()) {
        articles.set(article.pageId, article)
      }
      this.logger.info(`${Math.min(articles.size, this.samples)}/${this.samples} articles`)
      await setTimeout(1000)
    }

    this.printRarities([...articles.values()].slice(0, this.samples))
  }

  /**
   * Rolls slots like a real opening. A slot is served at its rarity when the
   * catalogue has at least one card of it; commons are always available
   * through live draws.
   */
  protected async simulateBoosters(count: number) {
    const roller = await this.app.container.make(RarityRoller)
    const rows = await Card.query().select('rarity').count('* as total').groupBy('rarity')
    const catalogue = Object.fromEntries(
      rows.map((row) => [row.rarity, Number(row.$extras.total)])
    ) as Partial<Record<Rarity, number>>

    const rolled = new Map<Rarity, number>()
    const served = new Map<Rarity, number>()
    for (let index = 0; index < count; index++) {
      for (const slot of roller.rollBooster()) {
        const rarity =
          rarityFallbacks(slot).find((r) => r === 'common' || (catalogue[r] ?? 0) > 0) ?? 'common'
        rolled.set(slot, (rolled.get(slot) ?? 0) + 1)
        served.set(rarity, (served.get(rarity) ?? 0) + 1)
      }
    }

    const slots = count * gameConfig.boosters.cardsPerBooster
    const share = (n = 0) => `${((n / slots) * 100).toFixed(1)} %`
    const table = this.ui.table().head(['Rarity', 'Catalogue', 'Rolled', 'Served'])
    for (const rarity of [...RARITIES].reverse()) {
      table.row([
        rarity,
        String(catalogue[rarity] ?? 0),
        share(rolled.get(rarity)),
        share(served.get(rarity)),
      ])
    }
    table.render()
  }

  protected printRarities(sample: WikiArticle[]) {
    const table = this.ui.table().head(['Rarity', 'Min daily views', 'Cards', 'Share'])
    for (const rarity of [...RARITIES].reverse()) {
      const count = sample.filter((a) => rarityFor(a.avgDailyViews) === rarity).length
      const threshold = gameConfig.rarityThresholds.find((tier) => tier.rarity === rarity)
      table.row([
        rarity,
        String(threshold?.minDailyViews ?? 0),
        String(count),
        `${((count / sample.length) * 100).toFixed(1)} %`,
      ])
    }
    table.render()
  }
}
