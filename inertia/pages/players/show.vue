<script setup lang="ts">
import type { Data } from '@generated/data'
import { router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import { Lock } from 'lucide-vue-next'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import ProgressionBand from '~/components/progression_band.vue'
import AppLayout from '~/layouts/app.vue'
import { rarities, rarityLabels, type Rarity } from '~/lib/game'

type Filters = { rarity?: Rarity; sort?: string; page?: number; q?: string; duplicates?: boolean }

const props = defineProps<{
  player: { username: string; isPublic: boolean }
  isSelf: boolean
  filters: Filters
  progression: {
    cards: number
    copies: number
    byRarity: Record<Rarity, { cards: number; copies: number }>
  } | null
  cards: {
    data: Data.Card[]
    metadata: { currentPage: number; lastPage: number; total: number }
  } | null
}>()

function update(changes: Filters) {
  const next = { ...props.filters, page: undefined, ...changes }
  const query = Object.fromEntries(
    Object.entries(next).filter(([, v]) => v !== undefined && v !== '' && v !== false)
  )
  router.get(`/joueurs/${encodeURIComponent(props.player.username)}`, query, {
    preserveState: true,
    preserveScroll: true,
    replace: true,
  })
}
</script>

<template>
  <AppLayout>
    <Page :title="player.username">
      <template #actions>
        <Link
          v-if="!isSelf"
          route="trades.create"
          :qs="{ to: player.username }"
          class="btn btn--primary btn--sm"
        >
          Proposer un échange
        </Link>
        <Link v-else route="settings" class="btn btn--secondary btn--sm">
          {{ player.isPublic ? 'Profil public · réglages' : 'Profil privé · réglages' }}
        </Link>
      </template>

      <div v-if="!progression || !cards" class="empty">
        <div class="empty__mark"><Lock :size="22" aria-hidden="true" /></div>
        <h2>Collection privée</h2>
        <p>{{ player.username }} ne montre pas sa collection.</p>
      </div>

      <template v-else>
        <ProgressionBand :progression="progression" />

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
                {{ rarityLabels[rarity] }}
              </option>
            </select>
          </div>
          <label class="filters__check">
            <input
              type="checkbox"
              :checked="!!filters.duplicates"
              @change="update({ duplicates: ($event.target as HTMLInputElement).checked })"
            />
            Doublons
          </label>
        </form>

        <ul v-if="cards.data.length" class="card-grid">
          <li v-for="card in cards.data" :key="card.id"><CardItem :card="card" /></li>
        </ul>
        <div v-else class="empty"><h2>Aucune carte</h2></div>

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
      </template>
    </Page>
  </AppLayout>
</template>
