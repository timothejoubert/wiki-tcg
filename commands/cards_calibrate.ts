import { setTimeout } from 'node:timers/promises'
import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import gameConfig, { RARITIES, type Rarity } from '#config/game'
import Card from '#models/card'
import RarityRoller, { rarityFallbacks } from '#services/rarity_roller'
import WikipediaClient, { type WikiArticle } from '#services/wikipedia_client'
import { attackFor, defenseFor, rarityFor } from '#services/card_stats'

/**
 * Samples random articles to check how the thresholds of `config/game.ts`
 * spread rarities and stats, or with `--boosters` simulates openings against
 * the current catalogue. Nothing is written to the database.
 */
export default class CardsCalibrate extends BaseCommand {
  static commandName = 'cards:calibrate'
  static description = 'Sample random Wikipedia articles and print the rarity and stats spread'
  static options: CommandOptions = { startApp: true }

  @flags.number({ description: 'Number of articles to sample', default: 200 })
  declare samples: number

  @flags.boolean({ description: 'Also fetch Lift Wing quality scores (one call per article)' })
  declare quality: boolean

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

    const sample = [...articles.values()].slice(0, this.samples)
    const scores = new Map<number, number | null>()
    if (this.quality) {
      for (const article of sample.filter((a) => !a.qualityLabel)) {
        scores.set(article.pageId, await wikipedia.qualityScore(article.revisionId))
        await setTimeout(200)
      }
    }

    this.printRarities(sample)
    this.printStats(
      'Attack',
      sample.map((a) => attackFor(a.lengthBytes))
    )
    if (this.quality) {
      this.printStats(
        'Defense',
        sample.map((a) => defenseFor(a.qualityLabel, scores.get(a.pageId) ?? null))
      )
    }
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

  protected printStats(label: string, values: number[]) {
    const sorted = [...values].sort((a, b) => a - b)
    const at = (ratio: number) => String(sorted[Math.floor(ratio * (sorted.length - 1))])

    this.ui
      .table()
      .head([label, 'min', 'p25', 'median', 'p75', 'p95', 'max'])
      .row(['', at(0), at(0.25), at(0.5), at(0.75), at(0.95), at(1)])
      .render()
  }
}
