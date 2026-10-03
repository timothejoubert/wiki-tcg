<script setup lang="ts">
import { computed } from 'vue'
import type { Data } from '@generated/data'
import { Form, Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import AppLayout from '~/layouts/app.vue'

const props = defineProps<{
  cards: Data.Card[]
  details: { owned: boolean; owners: { username: string; copies: number }[] }[]
}>()

const items = computed(() => props.cards.map((card, index) => ({ card, ...props.details[index] })))
</script>

<template>
  <AppLayout>
    <Page
      title="Mes souhaits"
      description="Les cartes que tu cherches, et les joueurs qui pourraient te les échanger."
    >
      <ul v-if="items.length" class="wish-list">
        <li v-for="item in items" :key="item.card.id" class="wish">
          <div class="wish__card"><CardItem :card="item.card" /></div>
          <div class="wish__info">
            <p v-if="item.owned" class="wish__owned">Obtenue : elle est dans ta collection.</p>
            <h2 class="card-tags__title">Ils la possèdent</h2>
            <ul v-if="item.owners.length" class="card-owners__list">
              <li v-for="owner in item.owners" :key="owner.username">
                <Link route="players.show" :params="{ username: owner.username }" class="il">
                  {{ owner.username }}
                </Link>
                <span v-if="owner.copies > 1" class="wish__spare">doublon ×{{ owner.copies }}</span>
                <Link
                  route="trades.create"
                  :qs="{ to: owner.username, want: item.card.id }"
                  class="card-owners__trade"
                >
                  Proposer un échange
                </Link>
              </li>
            </ul>
            <p v-else class="card-tags__empty">
              Personne ne la montre pour l'instant : tu seras averti si elle passe aux enchères.
            </p>
            <Form
              v-slot="{ processing }"
              route="cards.wish"
              :params="{ id: item.card.id }"
              :options="{ preserveScroll: true }"
            >
              <button type="submit" class="il wish__remove" :disabled="processing">
                Retirer de mes souhaits
              </button>
            </Form>
          </div>
        </li>
      </ul>
      <div v-else class="empty">
        <h2>Aucune carte recherchée</h2>
        <p>
          Sur la fiche d'une carte (aux <Link route="auctions.index" class="il">enchères</Link>, sur
          un <Link route="players.index" class="il">profil</Link>…), touche « Je la cherche ».
        </p>
      </div>
    </Page>
  </AppLayout>
</template>
