import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Card from '#models/card'
import gameConfig from '#config/game'
import type { WikiArticle } from '#services/wikipedia_client'
import { rarityFor } from '#services/card_stats'

export type CardAttributes = ReturnType<CardFactory['attributes']>

/**
 * Turns Wikipedia articles into catalogue cards. A card is frozen on its
 * first draw: existing cards are returned untouched.
 */
export default class CardFactory {
  prepare(articles: WikiArticle[]): CardAttributes[] {
    const now = DateTime.now()
    return articles.map((article) => this.attributes(article, now))
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

  async persist(articles: WikiArticle[]): Promise<Card[]> {
    return this.save(this.prepare(articles))
  }

  protected attributes(article: WikiArticle, now: DateTime) {
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
      rarity: rarityFor(article.avgDailyViews),
      snapshotAt: now,
    }
  }
}
