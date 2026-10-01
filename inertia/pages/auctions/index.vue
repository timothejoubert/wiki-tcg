<script setup lang="ts">
import type { Data } from '@generated/data'
import { router, usePage } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import TimeLeft from '~/components/time_left.vue'
import AppLayout from '~/layouts/app.vue'
import { formatWikis, rarities, rarityLabels, type Rarity } from '~/lib/game'

type Filters = {
  scope: 'all' | 'selling' | 'bidding'
  rarity?: Rarity
  sort?: string
  page?: number
}

const props = defineProps<{
  filters: Filters
  auctions: {
    data: Data.Auction[]
    metadata: { currentPage: number; lastPage: number; total: number }
  }
}>()

const page = usePage()
const scopes = [
  { value: 'all', label: 'En cours' },
  { value: 'selling', label: 'Mes ventes' },
  { value: 'bidding', label: 'Mes mises' },
] as const
const statusLabels: Record<string, string> = {
  open: 'En cours',
  sold: 'Vendue',
  unsold: 'Invendue',
  cancelled: 'Annulée',
}

function update(changes: Partial<Filters>) {
  const next = { ...props.filters, page: undefined, ...changes }
  const query = Object.fromEntries(
    Object.entries(next).filter(([, v]) => v !== undefined && v !== '')
  )
  router.get('/auctions', query, { preserveState: true, preserveScroll: true, replace: true })
}
</script>

<template>
  <AppLayout>
    <Page
      title="Enchères"
      description="Enchéris sur les cartes des autres joueurs, ou vends les tiennes depuis leur fiche."
    >
      <nav class="tabs" aria-label="Enchères">
        <button
          v-for="scope in scopes"
          :key="scope.value"
          type="button"
          class="tabs__item"
          :aria-current="filters.scope === scope.value ? 'page' : undefined"
          @click="update({ scope: scope.value })"
        >
          {{ scope.label }}
        </button>
      </nav>

      <form v-if="filters.scope === 'all'" class="filters" @submit.prevent>
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
        <div class="field">
          <label class="field__label" for="sort">Trier par</label>
          <select
            id="sort"
            class="field__input"
            :value="filters.sort ?? 'ending'"
            @change="update({ sort: ($event.target as HTMLSelectElement).value })"
          >
            <option value="ending">Fin la plus proche</option>
            <option value="newest">Plus récentes</option>
            <option value="price">Prix</option>
          </select>
        </div>
      </form>

      <ul v-if="auctions.data.length" class="card-grid">
        <li v-for="auction in auctions.data" :key="auction.id" class="auction-tile">
          <CardItem v-if="auction.card" :card="auction.card" :link="false" />
          <Link route="auctions.show" :params="{ id: auction.id }" class="auction-tile__link">
            <span class="auction-tile__price">
              {{ formatWikis(auction.currentPrice ?? auction.startingPrice) }}
            </span>
            <span class="auction-tile__meta">
              <template v-if="auction.status === 'open'">
                {{ auction.bidsCount }} {{ auction.bidsCount > 1 ? 'mises' : 'mise' }} ·
                <TimeLeft :until="String(auction.endsAt)" />
              </template>
              <template v-else>{{ statusLabels[auction.status] }}</template>
            </span>
            <span v-if="auction.leaderId === page.props.user?.id" class="auction-tile__lead"
              >Tu mènes</span
            >
            <span class="visually-hidden">Voir l'enchère</span>
          </Link>
        </li>
      </ul>
      <div v-else class="empty">
        <h2>Aucune enchère</h2>
        <p v-if="filters.scope === 'all'">
          Personne ne vend pour le moment. Mets une carte en vente depuis sa fiche.
        </p>
        <p v-else>Rien à afficher ici.</p>
      </div>

      <nav v-if="auctions.metadata.lastPage > 1" class="pager" aria-label="Pagination">
        <button
          type="button"
          class="btn btn--secondary btn--sm"
          :disabled="auctions.metadata.currentPage <= 1"
          @click="update({ page: auctions.metadata.currentPage - 1 })"
        >
          Précédente
        </button>
        <span>Page {{ auctions.metadata.currentPage }} / {{ auctions.metadata.lastPage }}</span>
        <button
          type="button"
          class="btn btn--secondary btn--sm"
          :disabled="auctions.metadata.currentPage >= auctions.metadata.lastPage"
          @click="update({ page: auctions.metadata.currentPage + 1 })"
        >
          Suivante
        </button>
      </nav>
    </Page>
  </AppLayout>
</template>
