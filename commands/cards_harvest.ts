import { DateTime } from 'luxon'
import { setTimeout } from 'node:timers/promises'
import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import gameConfig, { RARITIES, type Rarity } from '#config/game'
import CardFactory from '#services/card_factory'
import { rarityFor } from '#services/card_stats'
import { isAtLeast } from '#services/rarity_roller'
import WikipediaClient, { type WikiArticle } from '#services/wikipedia_client'

/**
 * Grows the catalogue with high rarity cards, which random live draws almost
 * never surface: `--top` imports the most viewed articles (legendaries),
 * `--random` sifts random batches for rare and super rare articles.
 */
export default class CardsHarvest extends BaseCommand {
  static commandName = 'cards:harvest'
  static description = 'Add high rarity cards to the catalogue from Wikipedia'
  static options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Import the most viewed articles of yesterday and last month' })
  declare top: boolean

  @flags.number({ description: 'Number of random batches of 20 articles to sift', default: 0 })
  declare random: number

  @flags.number({ description: 'Resolve at most N top titles' })
  declare limit: number | undefined

  @flags.string({
    description: 'Lowest rarity kept',
    default: gameConfig.harvest.minRarity as string,
  })
  declare minRarity: string

  async run() {
    if (!RARITIES.includes(this.minRarity as Rarity)) {
      this.logger.error(`--min-rarity must be one of: ${RARITIES.join(', ')}`)
      this.exitCode = 1
      return
    }
    if (!this.top && !this.random) {
      this.logger.info('Nothing to do: pass --top and/or --random=<batches>')
      return
    }

    const wikipedia = await this.app.container.make(WikipediaClient)
    wikipedia.maxRetryWaitMs = 60_000
    wikipedia.maxAttempts = 5
    const factory = await this.app.container.make(CardFactory)
    const created = new Map<number, Rarity>()

    const keep = async (articles: WikiArticle[]) => {
      const kept = articles.filter((article) =>
        isAtLeast(rarityFor(article.avgDailyViews), this.minRarity as Rarity)
      )
      for (const card of await factory.persist(kept)) {
        if (card.$isLocal) {
          created.set(card.id, card.rarity)
        }
      }
    }

    if (this.top) {
      const yesterday = DateTime.utc().minus({ days: 1 })
      const titles = new Set([
        ...(await wikipedia.topArticles(yesterday, 'day')),
        ...(await wikipedia.topArticles(yesterday.minus({ months: 1 }), 'month')),
      ])
      this.logger.info(`${Math.min(titles.size, this.limit ?? Infinity)} top titles to resolve`)

      const list = [...titles].slice(0, this.limit ?? titles.size)
      for (let index = 0; index < list.length; index += 20) {
        await keep(await wikipedia.articlesByTitles(list.slice(index, index + 20)))
        this.logger.info(`${Math.min(index + 20, list.length)}/${list.length} top titles`)
        await setTimeout(gameConfig.harvest.pauseMs)
      }
    }

    for (let batch = 1; batch <= this.random; batch++) {
      await keep(await wikipedia.randomArticles())
      this.logger.info(`random batch ${batch}/${this.random}`)
      await setTimeout(gameConfig.harvest.pauseMs)
    }

    const byRarity = [...RARITIES]
      .reverse()
      .map((rarity) => `${rarity}: ${[...created.values()].filter((r) => r === rarity).length}`)
    this.logger.success(`${created.size} new cards (${byRarity.join(', ')})`)
  }
}
