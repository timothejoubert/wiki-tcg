import { test } from '@japa/runner'
import { averageDailyViews, rarityFor } from '#services/card_stats'

test.group('Card rarity', () => {
  test('averages pageviews, ignoring days without data', ({ assert }) => {
    assert.equal(averageDailyViews({ '2026-01-01': 10, '2026-01-02': null, '2026-01-03': 20 }), 15)
    assert.equal(averageDailyViews({}), 0)
    assert.equal(averageDailyViews(undefined), 0)
  })

  test('maps average daily views to rarity tiers', ({ assert }) => {
    assert.equal(rarityFor(0), 'common')
    assert.equal(rarityFor(1), 'common')
    assert.equal(rarityFor(2), 'uncommon')
    assert.equal(rarityFor(15), 'rare')
    assert.equal(rarityFor(99), 'rare')
    assert.equal(rarityFor(100), 'super_rare')
    assert.equal(rarityFor(1000), 'legendary')
    assert.equal(rarityFor(1_000_000), 'legendary')
  })
})
