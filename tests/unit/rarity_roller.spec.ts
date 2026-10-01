import { test } from '@japa/runner'
import RarityRoller, { isAtLeast, rarityFallbacks } from '#services/rarity_roller'

function rollerAt(...values: number[]) {
  const roller = new RarityRoller()
  roller.random = () => values.shift() ?? 0
  return roller
}

test.group('Rarity roller', () => {
  test('maps the drop rates 60/25/10/4/1 on the random ticket', ({ assert }) => {
    assert.equal(rollerAt(0).roll(), 'common')
    assert.equal(rollerAt(0.5999).roll(), 'common')
    assert.equal(rollerAt(0.6).roll(), 'uncommon')
    assert.equal(rollerAt(0.8499).roll(), 'uncommon')
    assert.equal(rollerAt(0.85).roll(), 'rare')
    assert.equal(rollerAt(0.95).roll(), 'super_rare')
    assert.equal(rollerAt(0.99).roll(), 'legendary')
    assert.equal(rollerAt(0.999_999).roll(), 'legendary')
  })

  test('rescales the rates above a minimum rarity', ({ assert }) => {
    // rare 10 : super rare 4 : legendary 1, out of 15
    assert.equal(rollerAt(0).roll('rare'), 'rare')
    assert.equal(rollerAt(9.99 / 15).roll('rare'), 'rare')
    assert.equal(rollerAt(10 / 15).roll('rare'), 'super_rare')
    assert.equal(rollerAt(14 / 15).roll('rare'), 'legendary')
  })

  test('guarantees at least a rare in the last slot', ({ assert }) => {
    const slots = rollerAt(0, 0, 0, 0, 0).rollBooster()

    assert.deepEqual(slots, ['common', 'common', 'common', 'common', 'rare'])
  })

  test('respects the rates over many boosters', ({ assert }) => {
    const roller = new RarityRoller()
    const counts: Record<string, number> = {}
    for (let index = 0; index < 20_000; index++) {
      for (const rarity of roller.rollBooster().slice(0, 4)) {
        counts[rarity] = (counts[rarity] ?? 0) + 1
      }
    }

    assert.closeTo(counts.common / 80_000, 0.6, 0.01)
    assert.closeTo(counts.uncommon / 80_000, 0.25, 0.01)
    assert.closeTo(counts.rare / 80_000, 0.1, 0.01)
  })

  test('falls back from a rarity down to common', ({ assert }) => {
    assert.deepEqual(rarityFallbacks('super_rare'), ['super_rare', 'rare', 'uncommon', 'common'])
    assert.deepEqual(rarityFallbacks('common'), ['common'])
    assert.isTrue(isAtLeast('legendary', 'rare'))
    assert.isFalse(isAtLeast('uncommon', 'rare'))
  })
})
