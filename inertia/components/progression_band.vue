<script setup lang="ts">
import { formatNumber, rarities, rarityLabels, type Rarity } from '~/lib/game'

defineProps<{
  progression: {
    cards: number
    copies: number
    byRarity: Record<Rarity, { cards: number; copies: number }>
  }
}>()
</script>

<template>
  <section class="progression" aria-labelledby="progression-title">
    <h2 id="progression-title" class="visually-hidden">Progression</h2>
    <p class="progression__total">
      <strong>{{ formatNumber(progression.cards) }}</strong> cartes différentes
      <span>· {{ formatNumber(progression.copies) }} exemplaires</span>
    </p>
    <dl class="progression__rarities">
      <div
        v-for="rarity in [...rarities].reverse()"
        :key="rarity"
        class="progression__rarity"
        :class="`progression__rarity--${rarity}`"
      >
        <dt>{{ rarityLabels[rarity] }}</dt>
        <dd>
          {{ formatNumber(progression.byRarity[rarity].cards) }}
          <span v-if="progression.byRarity[rarity].copies > progression.byRarity[rarity].cards">
            ({{ formatNumber(progression.byRarity[rarity].copies) }} ex.)
          </span>
        </dd>
      </div>
    </dl>
  </section>
</template>
