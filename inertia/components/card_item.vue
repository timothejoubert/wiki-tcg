<script setup lang="ts">
/**
 * A collectible card. Rarity is always spelled out in text, never conveyed
 * by color alone.
 */
import type { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/vue'
import { rarityLabels, rarityShort } from '~/lib/game'

withDefaults(defineProps<{ card: Data.Card; link?: boolean }>(), { link: true })
</script>

<template>
  <article class="tcg-card" :class="`tcg-card--${card.rarity}`">
    <div class="tcg-card__art">
      <img v-if="card.thumbnailUrl" :src="card.thumbnailUrl" alt="" loading="lazy" />
      <span v-else class="tcg-card__placeholder" aria-hidden="true">W</span>
    </div>

    <div class="tcg-card__body">
      <h3 class="tcg-card__title">
        <Link v-if="link" route="cards.show" :params="{ id: card.id }" class="tcg-card__link">
          {{ card.title }}
        </Link>
        <template v-else>{{ card.title }}</template>
      </h3>
      <p v-if="card.description" class="tcg-card__desc">{{ card.description }}</p>
    </div>

    <footer class="tcg-card__foot">
      <span class="tcg-card__rarity">
        <abbr :title="rarityLabels[card.rarity]">{{ rarityShort[card.rarity] }}</abbr>
        <span class="visually-hidden">{{ rarityLabels[card.rarity] }}</span>
      </span>
    </footer>

    <span v-if="card.copies && card.copies > 1" class="tcg-card__copies">
      ×{{ card.copies }}<span class="visually-hidden"> exemplaires</span>
    </span>
  </article>
</template>
