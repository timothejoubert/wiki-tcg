<script setup lang="ts">
/**
 * A collectible card. Rarity is always spelled out in text, never conveyed
 * by color alone.
 */
import type { Data } from '@generated/data'
import { Star } from 'lucide-vue-next'
import { Form, Link } from '@adonisjs/inertia/vue'
import { rarityLabels, rarityShort } from '~/lib/game'

withDefaults(defineProps<{ card: Data.Card; link?: boolean; favoriteToggle?: boolean }>(), {
  link: true,
  favoriteToggle: false,
})
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

    <Form
      v-if="favoriteToggle"
      v-slot="{ processing }"
      route="cards.favorite"
      :params="{ id: card.id }"
      :options="{ preserveScroll: true, preserveState: true }"
      class="tcg-card__favorite-form"
    >
      <button
        type="submit"
        class="tcg-card__favorite tcg-card__favorite--toggle"
        :class="{ 'is-on': card.isFavorite }"
        :aria-pressed="card.isFavorite ? 'true' : 'false'"
        :aria-label="
          card.isFavorite
            ? `Retirer ${card.title} des favoris`
            : `Ajouter ${card.title} aux favoris`
        "
        :disabled="processing"
      >
        <Star :size="14" :fill="card.isFavorite ? 'currentColor' : 'none'" aria-hidden="true" />
      </button>
    </Form>
    <span v-else-if="card.isFavorite" class="tcg-card__favorite" title="Favori">
      <Star :size="14" fill="currentColor" aria-hidden="true" />
      <span class="visually-hidden">Favori</span>
    </span>

    <span v-if="card.copies && card.copies > 1" class="tcg-card__copies">
      ×{{ card.copies }}<span class="visually-hidden"> exemplaires</span>
    </span>
  </article>
</template>
