<script setup lang="ts">
import { computed } from 'vue'
import type { Data } from '@generated/data'
import { usePage } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import TimeLeft from '~/components/time_left.vue'
import AppLayout from '~/layouts/app.vue'
import { formatWikis } from '~/lib/game'

const props = defineProps<{
  auction: Data.Auction
  bids: { id: number; amount: number; bidder: string; createdAt: string }[]
}>()

const page = usePage()
const me = computed(() => page.props.user)
const isSeller = computed(() => me.value?.id === props.auction.sellerId)
const isLeading = computed(() => me.value?.id === props.auction.leaderId)
const isOpen = computed(() => props.auction.status === 'open')
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
const outcome: Record<string, string> = {
  sold: 'Vendue',
  unsold: 'Terminée sans mise : la carte reste au vendeur.',
  cancelled: 'Vente annulée par le vendeur.',
}
</script>

<template>
  <AppLayout>
    <Page :title="auction.card ? `Enchère · ${auction.card.title}` : 'Enchère'">
      <template #actions>
        <Link route="auctions.index" class="btn btn--secondary btn--sm">Toutes les enchères</Link>
      </template>

      <div class="card-detail">
        <CardItem v-if="auction.card" :card="auction.card" />

        <div class="card-detail__info">
          <dl class="card-detail__list">
            <div>
              <dt>Vendeur</dt>
              <dd>{{ isSeller ? 'Toi' : auction.seller?.username }}</dd>
            </div>
            <div>
              <dt>{{ auction.currentPrice === null ? 'Prix de départ' : 'Meilleure mise' }}</dt>
              <dd class="mono">{{ formatWikis(auction.currentPrice ?? auction.startingPrice) }}</dd>
            </div>
            <div v-if="auction.leader">
              <dt>En tête</dt>
              <dd>{{ isLeading ? 'Toi' : auction.leader.username }}</dd>
            </div>
            <div>
              <dt>{{ isOpen ? 'Fin dans' : 'Statut' }}</dt>
              <dd>
                <TimeLeft v-if="isOpen" :until="String(auction.endsAt)" />
                <template v-else-if="auction.status === 'sold'">
                  Vendue à {{ isLeading ? 'toi' : auction.leader?.username }}
                </template>
                <template v-else>{{ outcome[auction.status] }}</template>
              </dd>
            </div>
          </dl>

          <Form
            v-if="isOpen && !isSeller && !isLeading"
            v-slot="{ processing, errors }"
            route="auctions.bid"
            :params="{ id: auction.id }"
            class="bid-form"
          >
            <div class="field">
              <label class="field__label" for="amount"
                >Ta mise (minimum {{ formatWikis(auction.minNextBid) }})</label
              >
              <input
                id="amount"
                name="amount"
                type="number"
                class="field__input"
                :min="auction.minNextBid"
                :value="auction.minNextBid"
                :aria-invalid="errors.amount ? 'true' : 'false'"
                required
              />
              <span class="field__hint">
                Le montant est bloqué sur ton solde, et rendu si quelqu'un surenchérit.
              </span>
              <span v-if="errors.amount" class="field__error">{{ errors.amount }}</span>
            </div>
            <button type="submit" class="btn btn--primary" :disabled="processing">Enchérir</button>
          </Form>
          <p v-else-if="isOpen && isLeading" class="bid-form__note">
            Tu es en tête de cette enchère.
          </p>

          <Form
            v-if="isOpen && isSeller && auction.bidsCount === 0"
            v-slot="{ processing }"
            route="auctions.cancel"
            :params="{ id: auction.id }"
          >
            <button type="submit" class="btn btn--secondary btn--sm" :disabled="processing">
              Annuler la vente
            </button>
          </Form>

          <section v-if="bids.length" class="bid-history" aria-labelledby="bids-title">
            <h2 id="bids-title" class="card-tags__title">Mises</h2>
            <ol class="bid-history__list">
              <li v-for="bid in bids" :key="bid.id">
                <span class="mono">{{ formatWikis(bid.amount) }}</span>
                <span>{{ bid.bidder === me?.username ? 'Toi' : bid.bidder }}</span>
                <time :datetime="bid.createdAt">{{
                  dateFormat.format(new Date(bid.createdAt))
                }}</time>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </Page>
  </AppLayout>
</template>
