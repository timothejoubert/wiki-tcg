<script setup lang="ts">
/**
 * One side of a trade, as a compact list of cards.
 */
import type { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/vue'
import { rarityLabels, rarityShort } from '~/lib/game'

defineProps<{ title: string; cards: Data.Card[] }>()
</script>

<template>
  <div class="trade-side">
    <h3 class="trade-side__title">{{ title }}</h3>
    <ul class="pick-list">
      <li
        v-for="card in cards"
        :key="card.id"
        class="pick-list__item"
        :class="`pick-list__item--${card.rarity}`"
      >
        <abbr class="pick-list__rarity" :title="rarityLabels[card.rarity]">{{
          rarityShort[card.rarity]
        }}</abbr>
        <Link route="cards.show" :params="{ id: card.id }" class="il">{{ card.title }}</Link>
      </li>
    </ul>
  </div>
</template>
