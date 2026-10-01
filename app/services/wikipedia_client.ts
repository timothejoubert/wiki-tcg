import env from '#start/env'
import type { DateTime } from 'luxon'
import { setTimeout } from 'node:timers/promises'
import logger from '@adonisjs/core/services/logger'
import gameConfig, { type QualityLabel } from '#config/game'
import { averageDailyViews } from '#services/card_stats'

export type WikiArticle = {
  pageId: number
  revisionId: number
  title: string
  description: string | null
  thumbnailUrl: string | null
  lengthBytes: number
  avgDailyViews: number
  qualityLabel: QualityLabel | null
}

type ApiPage = {
  pageid: number
  ns: number
  title: string
  lastrevid: number
  length: number
  missing?: boolean
  description?: string
  extract?: string
  thumbnail?: { source: string }
  pageviews?: Record<string, number | null>
  categories?: { title: string }[]
  pageprops?: { disambiguation?: string }
}

export class WikipediaUnavailableError extends Error {}

class HttpStatusError extends Error {
  constructor(
    host: string,
    public status: number,
    public retryAfterMs: number | null
  ) {
    super(`${host} responded ${status}`)
  }

  get retriable() {
    return this.status === 429 || this.status >= 500
  }
}

const { wikipedia } = gameConfig
const qualityCategories: Record<string, QualityLabel> = wikipedia.qualityCategories

/**
 * Thin client over the MediaWiki Action API and the Wikimedia Lift Wing
 * inference API. Bound in the container so tests can swap it.
 */
export default class WikipediaClient {
  protected lang = wikipedia.lang

  /**
   * Longest pause accepted before retrying. Kept short for players opening
   * a booster; batch commands can afford to wait out a rate limit.
   */
  maxRetryWaitMs = 2000
  maxAttempts = 2

  /**
   * Draws random main-namespace articles, skipping disambiguation pages.
   * The API caps extracts at 20 pages per request.
   */
  async randomArticles(limit = 20): Promise<WikiArticle[]> {
    return this.queryArticles({
      generator: 'random',
      grnnamespace: '0',
      grnfilterredir: 'nonredirects',
      grnlimit: String(Math.min(limit, 20)),
    })
  }

  /**
   * Articles by title, 20 at most. Redirects are followed; pages outside the
   * main namespace, missing or disambiguation pages are dropped.
   */
  async articlesByTitles(titles: string[]): Promise<WikiArticle[]> {
    if (titles.length === 0) {
      return []
    }

    return this.queryArticles({ titles: titles.slice(0, 20).join('|'), redirects: '1' })
  }

  /**
   * Titles of the 1000 most viewed pages of a day or a whole month (any
   * namespace: callers resolve them through `articlesByTitles`).
   */
  async topArticles(date: DateTime, period: 'day' | 'month'): Promise<string[]> {
    const day = period === 'day' ? date.toFormat('dd') : 'all-days'
    const data = await this.request<{ items?: { articles: { article: string }[] }[] }>(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${this.lang}.wikipedia/all-access/${date.toFormat('yyyy/MM')}/${day}`,
      {}
    )

    return (data.items?.[0]?.articles ?? []).map((entry) => entry.article.replaceAll('_', ' '))
  }

  /**
   * Language-agnostic quality score (0..1) of a revision, or null when the
   * model is unreachable: a card can still be drawn without it.
   */
  async qualityScore(revisionId: number): Promise<number | null> {
    try {
      const data = await this.request<{ score?: number }>(
        'https://api.wikimedia.org/service/lw/inference/v1/models/articlequality:predict',
        { body: { rev_id: revisionId, lang: this.lang } }
      )
      return typeof data.score === 'number' ? data.score : null
    } catch (error) {
      logger.warn({ err: error, revisionId }, 'Lift Wing quality score unavailable')
      return null
    }
  }

  protected async queryArticles(params: Record<string, string>): Promise<WikiArticle[]> {
    const data = await this.request<{ query?: { pages: ApiPage[] } }>(
      `https://${this.lang}.wikipedia.org/w/api.php`,
      {
        query: {
          action: 'query',
          format: 'json',
          formatversion: '2',
          prop: 'info|pageviews|pageimages|description|categories|pageprops|extracts',
          piprop: 'thumbnail',
          pithumbsize: '400',
          pvipdays: String(wikipedia.pageviewsDays),
          clcategories: Object.keys(qualityCategories).join('|'),
          ppprop: 'disambiguation',
          exintro: '1',
          explaintext: '1',
          exsentences: '1',
          exlimit: 'max',
          ...params,
        },
      }
    )

    return (data.query?.pages ?? [])
      .filter(
        (page) => page.ns === 0 && !page.missing && page.pageprops?.disambiguation === undefined
      )
      .map((page) => this.toArticle(page))
  }

  protected toArticle(page: ApiPage): WikiArticle {
    const label = page.categories
      ?.map((category) => qualityCategories[category.title])
      .find((value) => value !== undefined)

    return {
      pageId: page.pageid,
      revisionId: page.lastrevid,
      title: page.title,
      description: page.description ?? page.extract?.trim() ?? null,
      thumbnailUrl: page.thumbnail?.source ?? null,
      lengthBytes: page.length,
      avgDailyViews: averageDailyViews(page.pageviews),
      qualityLabel: label ?? null,
    }
  }

  /**
   * Retries network errors and 5xx/429 responses, honouring `Retry-After`
   * as long as the wait stays under `maxRetryWaitMs`.
   */
  protected async request<T>(
    url: string,
    options: { query?: Record<string, string>; body?: unknown },
    attempt = 1
  ): Promise<T> {
    const target = new URL(url)
    for (const [key, value] of Object.entries(options.query ?? {})) {
      target.searchParams.set(key, value)
    }

    try {
      const response = await fetch(target, {
        method: options.body ? 'POST' : 'GET',
        headers: {
          'User-Agent': env.get('WIKIPEDIA_USER_AGENT'),
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(wikipedia.timeoutMs),
      })

      if (!response.ok) {
        const retryAfter = Number(response.headers.get('retry-after'))
        throw new HttpStatusError(
          target.host,
          response.status,
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : null
        )
      }

      return (await response.json()) as T
    } catch (error) {
      const retriable = !(error instanceof HttpStatusError) || error.retriable
      const waitMs = (error instanceof HttpStatusError ? error.retryAfterMs : null) ?? 500 * attempt
      if (attempt < this.maxAttempts && retriable && waitMs <= this.maxRetryWaitMs) {
        await setTimeout(waitMs)
        return this.request<T>(url, options, attempt + 1)
      }
      throw new WikipediaUnavailableError(`Wikipedia request failed: ${target.host}`, {
        cause: error,
      })
    }
  }
}
