/**
 * Game design knobs. Tweak values here, then run `node ace cards:calibrate`
 * to see how the rarity distribution reacts on a random sample.
 */

export const RARITIES = ['common', 'uncommon', 'rare', 'super_rare', 'legendary'] as const
export type Rarity = (typeof RARITIES)[number]

export const QUALITY_LABELS = ['featured', 'good'] as const
export type QualityLabel = (typeof QUALITY_LABELS)[number]

const gameConfig = {
  wikipedia: {
    lang: 'fr',
    /**
     * Number of days of pageviews used to compute the average audience.
     */
    pageviewsDays: 60,
    /**
     * Categories flagging the community quality labels on fr.wikipedia.
     */
    qualityCategories: {
      'Catégorie:Article de qualité': 'featured',
      'Catégorie:Bon article': 'good',
    } satisfies Record<string, QualityLabel>,
    timeoutMs: 8000,
  },

  /**
   * Minimum average daily pageviews to reach each rarity, highest first.
   * Anything below the last threshold is common.
   */
  rarityThresholds: [
    { rarity: 'legendary', minDailyViews: 1000 },
    { rarity: 'super_rare', minDailyViews: 100 },
    { rarity: 'rare', minDailyViews: 15 },
    { rarity: 'uncommon', minDailyViews: 2 },
  ] satisfies { rarity: Rarity; minDailyViews: number }[],

  boosters: {
    /**
     * Boosters granted on signup, so new players can open right away.
     */
    initialStock: 3,
    cardsPerBooster: 5,
    refillEveryMinutes: 10,
    maxStock: 10,
    /**
     * Chance (in %) for a card slot to roll each rarity. Rolled first, then
     * filled with a card of that rarity (live draw or catalogue).
     */
    dropRates: {
      common: 60,
      uncommon: 25,
      rare: 10,
      super_rare: 4,
      legendary: 1,
    } satisfies Record<Rarity, number>,
    /**
     * The last slot only rolls rarities from `minRarity` up, with the same
     * relative weights (rare 10 : super rare 4 : legendary 1).
     */
    guaranteedSlot: { minRarity: 'rare' } satisfies { minRarity: Rarity },
  },

  harvest: {
    /**
     * Live draws and `cards:harvest` keep articles from this rarity up in the
     * catalogue, so high rarity slots have cards to serve.
     */
    minRarity: 'rare' as Rarity,
    /**
     * Pause between two Wikipedia requests in batch mode.
     */
    pauseMs: 1000,
  },
}

export default gameConfig
