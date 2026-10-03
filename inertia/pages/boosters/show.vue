<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import BoosterPack from '~/components/booster_pack.vue'
import RevealPile from '~/components/reveal_pile.vue'
import AppLayout from '~/layouts/app.vue'
import { prefersReducedMotion } from '~/lib/haptics'

const props = defineProps<{ reveal: boolean; openedAt: string; cards: Data.Card[] }>()

type Stage = 'sealed' | 'tearing' | 'revealing' | 'done'
const stage = ref<Stage>(props.reveal ? 'sealed' : 'done')
const announcement = ref('')

onMounted(() => {
  if (prefersReducedMotion()) stage.value = 'done'
})

function openPack() {
  stage.value = 'tearing'
  setTimeout(() => (stage.value = 'revealing'), 650)
}

function finish() {
  stage.value = 'done'
  announcement.value = 'Toutes les cartes sont révélées.'
}
</script>

<template>
  <AppLayout>
    <Page
      title="Nouveau booster"
      :description="stage === 'done' ? 'Voici les 5 articles que tu viens de tirer.' : undefined"
    >
      <template #actions>
        <button
          v-if="stage === 'revealing'"
          type="button"
          class="btn btn--secondary btn--sm"
          @click="finish"
        >
          Tout retourner
        </button>
        <template v-if="stage === 'done'">
          <Link route="dashboard" class="btn btn--secondary btn--sm">Boosters</Link>
          <Link route="collection" class="btn btn--primary btn--sm">Ma collection</Link>
        </template>
      </template>

      <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>

      <div v-if="stage === 'sealed' || stage === 'tearing'" class="reveal-stage">
        <BoosterPack :tearing="stage === 'tearing'" @open="openPack" />
      </div>

      <RevealPile
        v-else-if="stage === 'revealing'"
        :cards="cards"
        @announce="(message) => (announcement = message)"
        @done="finish"
      />

      <ol v-else class="card-grid reveal-grid">
        <li
          v-for="(card, index) in cards"
          :key="card.id"
          class="reveal-slot"
          :style="{ '--i': index }"
        >
          <CardItem :card="card" />
          <p v-if="card.copies === 1" class="card-grid__new">Nouvelle carte</p>
        </li>
      </ol>
    </Page>
  </AppLayout>
</template>
