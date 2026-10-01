<script setup lang="ts">
import { computed } from 'vue'
import type { Data } from '@generated/data'
import { router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import AppLayout from '~/layouts/app.vue'
import { formatNumber, rarities, rarityLabels, type Rarity } from '~/lib/game'

type Filters = { rarity?: Rarity; duplicates?: boolean; sort?: string; page?: number }

const props = defineProps<{
  filters: Filters
  cards: { data: Data.Card[]; metadata: { currentPage: number; lastPage: number; total: number } }
  totals: Partial<Record<Rarity, number>>
}>()

const sorts = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'rarity', label: 'Rareté' },
  { value: 'title', label: 'Titre' },
]

const totalCards = computed(() => Object.values(props.totals).reduce((sum, n) => sum + (n ?? 0), 0))

function update(changes: Filters) {
  const next = { ...props.filters, page: undefined, ...changes }
  const query = Object.fromEntries(
    Object.entries(next).filter(
      ([, value]) => value !== undefined && value !== '' && value !== false
    )
  )
  router.get('/collection', query, { preserveState: true, preserveScroll: true })
}
</script>

<template>
  <AppLayout>
    <Page title="Ma collection" :description="`${formatNumber(totalCards)} cartes différentes`">
      <form class="filters" @submit.prevent>
        <div class="field">
          <label class="field__label" for="rarity">Rareté</label>
          <select
            id="rarity"
            class="field__input"
            :value="filters.rarity ?? ''"
            @change="
              update({
                rarity: (($event.target as HTMLSelectElement).value || undefined) as Rarity,
              })
            "
          >
            <option value="">Toutes</option>
            <option v-for="rarity in rarities" :key="rarity" :value="rarity">
              {{ rarityLabels[rarity] }} ({{ totals[rarity] ?? 0 }})
            </option>
          </select>
        </div>

        <div class="field">
          <label class="field__label" for="sort">Trier par</label>
          <select
            id="sort"
            class="field__input"
            :value="filters.sort ?? 'recent'"
            @change="update({ sort: ($event.target as HTMLSelectElement).value })"
          >
            <option v-for="sort in sorts" :key="sort.value" :value="sort.value">
              {{ sort.label }}
            </option>
          </select>
        </div>

        <label class="filters__check">
          <input
            type="checkbox"
            :checked="!!filters.duplicates"
            @change="update({ duplicates: ($event.target as HTMLInputElement).checked })"
          />
          Doublons uniquement
        </label>
      </form>

      <ul v-if="cards.data.length" class="card-grid">
        <li v-for="card in cards.data" :key="card.id"><CardItem :card="card" /></li>
      </ul>
      <div v-else class="empty">
        <h2>Aucune carte ici</h2>
        <p>
          <Link route="dashboard" class="il">Ouvre un booster</Link> pour commencer ta collection.
        </p>
      </div>

      <nav v-if="cards.metadata.lastPage > 1" class="pager" aria-label="Pagination">
        <button
          type="button"
          class="btn btn--secondary btn--sm"
          :disabled="cards.metadata.currentPage <= 1"
          @click="update({ page: cards.metadata.currentPage - 1 })"
        >
          Précédente
        </button>
        <span>Page {{ cards.metadata.currentPage }} / {{ cards.metadata.lastPage }}</span>
        <button
          type="button"
          class="btn btn--secondary btn--sm"
          :disabled="cards.metadata.currentPage >= cards.metadata.lastPage"
          @click="update({ page: cards.metadata.currentPage + 1 })"
        >
          Suivante
        </button>
      </nav>
    </Page>
  </AppLayout>
</template>
