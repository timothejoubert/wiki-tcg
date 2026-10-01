<script setup lang="ts">
import type { Data } from '@generated/data'
import { router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import AppLayout from '~/layouts/app.vue'
import { formatWikis, walletKindLabels } from '~/lib/game'

defineProps<{
  balance: number
  history: {
    data: Data.WalletTransaction[]
    metadata: { currentPage: number; lastPage: number; total: number }
  }
}>()

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
const goTo = (page: number) => router.get('/wallet', { page }, { preserveScroll: true })
</script>

<template>
  <AppLayout>
    <Page title="Porte-monnaie">
      <section class="wallet-balance" aria-labelledby="balance-title">
        <h2 id="balance-title" class="wallet-balance__label">Solde</h2>
        <p class="wallet-balance__amount">{{ formatWikis(balance) }}</p>
        <p class="wallet-balance__help">
          Gagne des wikis avec le bonus quotidien, chaque nouvelle carte et la revente de tes
          doublons depuis leur fiche.
        </p>
      </section>

      <table v-if="history.data.length" class="ledger">
        <caption class="visually-hidden">
          Historique des mouvements
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Mouvement</th>
            <th scope="col" class="ledger__num">Montant</th>
            <th scope="col" class="ledger__num">Solde</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in history.data" :key="row.id">
            <td>{{ dateFormat.format(new Date(String(row.createdAt))) }}</td>
            <td>
              {{ walletKindLabels[row.kind] ?? row.kind }}
              <template v-if="row.card">
                ·
                <Link route="cards.show" :params="{ id: row.card.id }" class="il">{{
                  row.card.title
                }}</Link>
              </template>
            </td>
            <td class="ledger__num" :class="row.amount > 0 ? 'ledger__in' : 'ledger__out'">
              {{ row.amount > 0 ? '+' : '−' }}{{ formatWikis(Math.abs(row.amount)) }}
            </td>
            <td class="ledger__num">{{ formatWikis(row.balanceAfter) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">
        <h2>Aucun mouvement</h2>
        <p>Ouvre un booster : chaque nouvelle carte te rapporte des wikis.</p>
      </div>

      <nav v-if="history.metadata.lastPage > 1" class="pager" aria-label="Pagination">
        <button
          type="button"
          class="btn btn--secondary btn--sm"
          :disabled="history.metadata.currentPage <= 1"
          @click="goTo(history.metadata.currentPage - 1)"
        >
          Précédente
        </button>
        <span>Page {{ history.metadata.currentPage }} / {{ history.metadata.lastPage }}</span>
        <button
          type="button"
          class="btn btn--secondary btn--sm"
          :disabled="history.metadata.currentPage >= history.metadata.lastPage"
          @click="goTo(history.metadata.currentPage + 1)"
        >
          Suivante
        </button>
      </nav>
    </Page>
  </AppLayout>
</template>
