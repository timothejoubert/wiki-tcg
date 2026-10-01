import { test } from '@japa/runner'
import { attackFor, averageDailyViews, defenseFor, rarityFor } from '#services/card_stats'

test.group('Card stats', () => {
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

  test('scales attack logarithmically with article length', ({ assert }) => {
    assert.equal(attackFor(0), 0)
    assert.equal(attackFor(500), 0)
    assert.equal(attackFor(300_000), 10_000)
    assert.equal(attackFor(450_000), 10_000)

    const short = attackFor(5_000)
    const long = attackFor(50_000)
    assert.isAbove(short, 0)
    assert.isAbove(long, short)
    assert.equal(short % 10, 0)
  })

  test('derives defense from the quality label first, then the score', ({ assert }) => {
    assert.equal(defenseFor('featured', 0.1), 10_000)
    assert.equal(defenseFor('good', null), 8_000)
    assert.equal(defenseFor(null, 1), 8_000)
    assert.equal(defenseFor(null, 0.5), 4_000)
    assert.equal(defenseFor(null, null), 0)
  })
})
