<script setup lang="ts">
import type { Data } from '@generated/data'
import { router, usePage } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import TimeLeft from '~/components/time_left.vue'
import TradeSide from '~/components/trade_side.vue'
import AppLayout from '~/layouts/app.vue'

defineProps<{ box: 'received' | 'sent' | 'history'; trades: Data.Trade[] }>()

const page = usePage()
const boxes = [
  { value: 'received', label: 'Reçues' },
  { value: 'sent', label: 'Envoyées' },
  { value: 'history', label: 'Historique' },
] as const
const statusLabels: Record<string, string> = {
  accepted: 'Acceptée',
  declined: 'Refusée',
  cancelled: 'Annulée',
  expired: 'Expirée',
}
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
</script>

<template>
  <AppLayout>
    <Page title="Échanges" description="Propose tes cartes contre celles d'un autre joueur.">
      <template #actions>
        <Link route="trades.create" class="btn btn--primary btn--sm">Nouvelle proposition</Link>
      </template>

      <nav class="tabs" aria-label="Échanges">
        <button
          v-for="item in boxes"
          :key="item.value"
          type="button"
          class="tabs__item"
          :aria-current="box === item.value ? 'page' : undefined"
          @click="router.get('/trades', { box: item.value }, { preserveScroll: true })"
        >
          {{ item.label }}
        </button>
      </nav>

      <ul v-if="trades.length" class="trade-list">
        <li v-for="trade in trades" :key="trade.id" class="trade">
          <header class="trade__head">
            <span v-if="trade.proposerId === page.props.user?.id">
              Pour <strong>{{ trade.recipient.username }}</strong>
            </span>
            <span v-else>
              De <strong>{{ trade.proposer.username }}</strong>
            </span>
            <span class="trade__meta">
              <template v-if="trade.status === 'pending'">
                expire dans <TimeLeft :until="String(trade.expiresAt)" />
              </template>
              <template v-else>
                {{ statusLabels[trade.status] }} ·
                {{ dateFormat.format(new Date(String(trade.respondedAt ?? trade.createdAt))) }}
              </template>
            </span>
          </header>

          <div class="trade__sides">
            <TradeSide
              :title="
                trade.proposerId === page.props.user?.id
                  ? 'Tu donnes'
                  : `${trade.proposer.username} donne`
              "
              :cards="trade.offered"
            />
            <TradeSide
              :title="
                trade.recipientId === page.props.user?.id
                  ? 'Tu donnes'
                  : `${trade.recipient.username} donne`
              "
              :cards="trade.requested"
            />
          </div>

          <footer v-if="trade.status === 'pending'" class="trade__actions">
            <template v-if="trade.recipientId === page.props.user?.id">
              <Form
                v-slot="{ processing }"
                route="trades.accept"
                :params="{ id: trade.id }"
                :options="{ preserveScroll: true }"
              >
                <button type="submit" class="btn btn--primary btn--sm" :disabled="processing">
                  Accepter
                </button>
              </Form>
              <Form
                v-slot="{ processing }"
                route="trades.decline"
                :params="{ id: trade.id }"
                :options="{ preserveScroll: true }"
              >
                <button type="submit" class="btn btn--secondary btn--sm" :disabled="processing">
                  Refuser
                </button>
              </Form>
            </template>
            <Form
              v-else
              v-slot="{ processing }"
              route="trades.cancel"
              :params="{ id: trade.id }"
              :options="{ preserveScroll: true }"
            >
              <button type="submit" class="btn btn--secondary btn--sm" :disabled="processing">
                Annuler
              </button>
            </Form>
          </footer>
        </li>
      </ul>
      <div v-else class="empty">
        <h2>Rien ici</h2>
        <p v-if="box === 'received'">Aucune proposition en attente.</p>
        <p v-else-if="box === 'sent'">Tu n'as aucune proposition en cours.</p>
        <p v-else>Aucun échange terminé pour l'instant.</p>
      </div>
    </Page>
  </AppLayout>
</template>
