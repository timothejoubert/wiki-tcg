<script setup lang="ts">
import type { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import AppLayout from '~/layouts/app.vue'

defineProps<{ openedAt: string; cards: Data.Card[] }>()
</script>

<template>
  <AppLayout>
    <Page title="Nouveau booster" description="Voici les 5 articles que tu viens de tirer.">
      <template #actions>
        <Link route="dashboard" class="btn btn--secondary btn--sm">Boosters</Link>
        <Link route="collection" class="btn btn--primary btn--sm">Ma collection</Link>
      </template>

      <ol class="card-grid card-grid--reveal">
        <li v-for="(card, index) in cards" :key="card.id" :style="{ '--i': index }">
          <CardItem :card="card" />
          <p v-if="card.copies === 1" class="card-grid__new">Nouvelle carte</p>
        </li>
      </ol>
    </Page>
  </AppLayout>
</template>
