<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { Data } from '@generated/data'
import { router } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import { X } from 'lucide-vue-next'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import ProgressionBand from '~/components/progression_band.vue'
import AppLayout from '~/layouts/app.vue'
import { rarities, rarityLabels, type Rarity } from '~/lib/game'

type Filters = {
  rarity?: Rarity
  duplicates?: boolean
  favorites?: boolean
  tag?: number
  q?: string
  sort?: string
  page?: number
}

const props = defineProps<{
  filters: Filters
  cards: { data: Data.Card[]; metadata: { currentPage: number; lastPage: number; total: number } }
  progression: {
    cards: number
    copies: number
    byRarity: Record<Rarity, { cards: number; copies: number }>
  }
  tags: Data.Tag[]
}>()

const sorts = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'rarity', label: 'Rareté' },
  { value: 'title', label: 'Titre' },
]

function update(changes: Filters) {
  const next = { ...props.filters, page: undefined, ...changes }
  const query = Object.fromEntries(
    Object.entries(next).filter(
      ([, value]) => value !== undefined && value !== '' && value !== false
    )
  )
  router.get('/collection', query, { preserveState: true, preserveScroll: true, replace: true })
}

const search = ref(props.filters.q ?? '')
let debounce: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => update({ q: value.trim() || undefined }), 300)
})
onBeforeUnmount(() => clearTimeout(debounce))

const hasFilters = () =>
  Boolean(
    props.filters.rarity ||
    props.filters.duplicates ||
    props.filters.favorites ||
    props.filters.tag ||
    props.filters.q
  )
</script>

<template>
  <AppLayout>
    <Page title="Ma collection">
      <ProgressionBand :progression="progression" />

      <form class="filters" role="search" @submit.prevent>
        <div class="field filters__search">
          <label class="field__label" for="q">Rechercher</label>
          <input
            id="q"
            v-model="search"
            type="search"
            class="field__input"
            placeholder="Titre ou description"
            autocomplete="off"
          />
        </div>

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
              {{ rarityLabels[rarity] }} ({{ progression.byRarity[rarity].cards }})
            </option>
          </select>
        </div>

        <div v-if="tags.length" class="field">
          <label class="field__label" for="tag">Tag</label>
          <select
            id="tag"
            class="field__input"
            :value="filters.tag ?? ''"
            @change="
              update({ tag: Number(($event.target as HTMLSelectElement).value) || undefined })
            "
          >
            <option value="">Tous</option>
            <option v-for="tag in tags" :key="tag.id" :value="tag.id">
              {{ tag.name }} ({{ tag.cards ?? 0 }})
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
            :checked="!!filters.favorites"
            @change="update({ favorites: ($event.target as HTMLInputElement).checked })"
          />
          Favoris
        </label>

        <label class="filters__check">
          <input
            type="checkbox"
            :checked="!!filters.duplicates"
            @change="update({ duplicates: ($event.target as HTMLInputElement).checked })"
          />
          Doublons
        </label>
      </form>

      <p class="filters__count" aria-live="polite">
        {{ cards.metadata.total }} {{ cards.metadata.total > 1 ? 'cartes' : 'carte' }}
        <button
          v-if="hasFilters()"
          type="button"
          class="il"
          @click="((search = ''), router.get('/collection'))"
        >
          Effacer les filtres
        </button>
      </p>

      <ul v-if="cards.data.length" class="card-grid">
        <li v-for="card in cards.data" :key="card.id"><CardItem :card="card" /></li>
      </ul>
      <div v-else class="empty">
        <template v-if="hasFilters()">
          <h2>Aucune carte ne correspond</h2>
          <p>Essaie d'autres filtres.</p>
        </template>
        <template v-else>
          <h2>Aucune carte ici</h2>
          <p>
            <Link route="dashboard" class="il">Ouvre un booster</Link> pour commencer ta collection.
          </p>
        </template>
      </div>

      <nav v-if="cards.metadata.lastPage > 1" class="pager" aria-label="Pagination">
        <button
          type="button"
          class="btn btn--secondary btn--sm"
          :disabled="cards.metadata.currentPage <= 1"
          @click="update({ ...filters, page: cards.metadata.currentPage - 1 })"
        >
          Précédente
        </button>
        <span>Page {{ cards.metadata.currentPage }} / {{ cards.metadata.lastPage }}</span>
        <button
          type="button"
          class="btn btn--secondary btn--sm"
          :disabled="cards.metadata.currentPage >= cards.metadata.lastPage"
          @click="update({ ...filters, page: cards.metadata.currentPage + 1 })"
        >
          Suivante
        </button>
      </nav>

      <section v-if="tags.length" class="tag-manager" aria-labelledby="tags-title">
        <h2 id="tags-title" class="tag-manager__title">Mes tags</h2>
        <ul class="tag-list">
          <li v-for="tag in tags" :key="tag.id" class="tag-chip">
            <span
              >{{ tag.name }} <span class="tag-chip__count">{{ tag.cards ?? 0 }}</span></span
            >
            <Form route="tags.destroy" :params="{ id: tag.id }" :options="{ preserveScroll: true }">
              <button
                type="submit"
                class="tag-chip__remove"
                :aria-label="`Supprimer le tag ${tag.name}`"
              >
                <X :size="12" aria-hidden="true" />
              </button>
            </Form>
          </li>
        </ul>
      </section>
    </Page>
  </AppLayout>
</template>
