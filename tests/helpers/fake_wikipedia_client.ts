import WikipediaClient, {
  type WikiArticle,
  WikipediaUnavailableError,
} from '#services/wikipedia_client'

/**
 * Deterministic stand-in for the Wikipedia APIs. Each draw returns fresh
 * articles unless `articles` is set; `failing` simulates an outage.
 */
export default class FakeWikipediaClient extends WikipediaClient {
  calls = 0
  failing = false
  articles: WikiArticle[] | null = null
  qualityScores = new Map<number, number | null>()
  topTitles: string[] = []
  byTitle = new Map<string, WikiArticle>()

  async randomArticles(limit = 20): Promise<WikiArticle[]> {
    this.calls++
    if (this.failing) {
      throw new WikipediaUnavailableError('down')
    }
    if (this.articles) {
      return this.articles
    }

    return Array.from({ length: limit }, (_, index) => {
      const pageId = this.calls * 1000 + index
      return article({ pageId, title: `Article ${pageId}` })
    })
  }

  async articlesByTitles(titles: string[]) {
    return titles.slice(0, 20).flatMap((title) => this.byTitle.get(title) ?? [])
  }

  async topArticles() {
    return this.topTitles
  }

  async qualityScore(revisionId: number) {
    return this.qualityScores.has(revisionId) ? this.qualityScores.get(revisionId)! : 0.5
  }
}

export function article(overrides: Partial<WikiArticle> & { pageId: number }): WikiArticle {
  return {
    revisionId: overrides.pageId * 10,
    title: `Article ${overrides.pageId}`,
    description: 'Une description.',
    thumbnailUrl: null,
    lengthBytes: 12_000,
    avgDailyViews: 1,
    qualityLabel: null,
    ...overrides,
  }
}
