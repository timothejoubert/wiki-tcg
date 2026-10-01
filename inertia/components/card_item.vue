<script setup lang="ts">
/**
 * A collectible card. The holographic treatment grows with the rarity:
 * matte common, iridescent edge from uncommon, light streak from rare, holo
 * art from super rare, full foil card with a gold frame for legendary.
 * Rarity is always spelled out in text, never conveyed by color alone.
 */
import { computed, ref } from 'vue'
import type { Data } from '@generated/data'
import { Star } from 'lucide-vue-next'
import { Form, Link } from '@adonisjs/inertia/vue'
import { rarityLabels, rarityShort } from '~/lib/game'
import { useHolo } from '~/composables/use_holo'

const props = withDefaults(
  defineProps<{ card: Data.Card; link?: boolean; favoriteToggle?: boolean }>(),
  { link: true, favoriteToggle: false }
)

const root = ref<HTMLElement | null>(null)
const { active } = useHolo(root, () => props.card.rarity !== 'common')

/**
 * Initials of the first two words, shown when the article has no image.
 */
const monogram = computed(() => {
  const words = props.card.title
    .replace(/[^\p{L}\s-]/gu, ' ')
    .split(/[\s-]+/)
    .filter(Boolean)
  if (words.length === 0) return '·'
  return (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase()
})
</script>

<template>
  <article
    ref="root"
    class="tcg-card"
    :class="[`tcg-card--${card.rarity}`, { 'is-active': active }]"
  >
    <div class="tcg-card__art" :class="{ 'tcg-card__art--empty': !card.thumbnailUrl }">
      <img v-if="card.thumbnailUrl" :src="card.thumbnailUrl" alt="" loading="lazy" />
      <span v-else class="tcg-card__monogram" aria-hidden="true">{{ monogram }}</span>
      <span class="tcg-card__grain" aria-hidden="true" />
      <span class="tcg-card__streak" aria-hidden="true" />

      <span v-if="card.copies && card.copies > 1" class="tcg-card__copies">
        ×{{ card.copies }}<span class="visually-hidden"> exemplaires</span>
      </span>
      <span class="tcg-card__badge">
        <abbr :title="rarityLabels[card.rarity]">{{ rarityShort[card.rarity] }}</abbr>
        <span class="visually-hidden">{{ rarityLabels[card.rarity] }}</span>
      </span>
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

    <span class="tcg-card__sheen" aria-hidden="true" />

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
  </article>
</template>
