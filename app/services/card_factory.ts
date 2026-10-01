import { DateTime } from 'luxon'
import { inject } from '@adonisjs/core'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Card from '#models/card'
import gameConfig from '#config/game'
import WikipediaClient, { type WikiArticle } from '#services/wikipedia_client'
import { attackFor, defenseFor, rarityFor } from '#services/card_stats'

export type CardAttributes = ReturnType<CardFactory['attributes']>

/**
 * Turns Wikipedia articles into catalogue cards. A card is frozen on its
 * first draw: existing cards are returned untouched.
 */
@inject()
export default class CardFactory {
  constructor(protected wikipedia: WikipediaClient) {}

  /**
   * Computes card attributes, fetching a Lift Wing score for articles
   * without a community label. Network only: call it outside transactions.
   */
  async prepare(articles: WikiArticle[], concurrency = Infinity): Promise<CardAttributes[]> {
    const now = DateTime.now()
    const attributes: CardAttributes[] = []
    const size = Math.max(1, Math.min(concurrency, articles.length))

    for (let index = 0; index < articles.length; index += size) {
      const chunk = articles.slice(index, index + size)
      attributes.push(
        ...(await Promise.all(
          chunk.map(async (article) => {
            const qualityScore = article.qualityLabel
              ? null
              : await this.wikipedia.qualityScore(article.revisionId)
            return this.attributes(article, qualityScore, now)
          })
        ))
      )
    }

    return attributes
  }

  /**
   * Creates the missing cards and returns all of them.
   */
  async save(attributes: CardAttributes[], trx?: TransactionClientContract): Promise<Card[]> {
    if (attributes.length === 0) {
      return []
    }
    return Card.fetchOrCreateMany(['lang', 'wikiPageId'], attributes, { client: trx })
  }

  /**
   * Like `prepare` + `save`, but skips articles whose quality could not be
   * scored: batch jobs retry them later instead of freezing a 0 defense.
   */
  async persist(articles: WikiArticle[], concurrency?: number): Promise<Card[]> {
    const attributes = await this.prepare(articles, concurrency)
    return this.save(attributes.filter((card) => card.qualityLabel || card.qualityScore !== null))
  }

  /**
   * Scores cards frozen without quality (Lift Wing was down on their first
   * draw). The only exception to the snapshot rule: missing data, not drift.
   */
  async repairMissingQuality(): Promise<number> {
    const cards = await Card.query().whereNull('quality_label').whereNull('quality_score')
    let repaired = 0

    for (const card of cards) {
      const qualityScore = await this.wikipedia.qualityScore(card.wikiRevisionId)
      if (qualityScore !== null) {
        card.merge({ qualityScore, defense: defenseFor(null, qualityScore) })
        await card.save()
        repaired++
      }
    }

    return repaired
  }

  protected attributes(article: WikiArticle, qualityScore: number | null, now: DateTime) {
    return {
      lang: gameConfig.wikipedia.lang,
      wikiPageId: article.pageId,
      wikiRevisionId: article.revisionId,
      title: article.title,
      description: article.description,
      thumbnailUrl: article.thumbnailUrl,
      avgDailyViews: article.avgDailyViews,
      lengthBytes: article.lengthBytes,
      qualityLabel: article.qualityLabel,
      qualityScore,
      rarity: rarityFor(article.avgDailyViews),
      attack: attackFor(article.lengthBytes),
      defense: defenseFor(article.qualityLabel, qualityScore),
      snapshotAt: now,
    }
  }
}
