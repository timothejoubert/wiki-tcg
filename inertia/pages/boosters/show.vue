<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import CardBack from '~/components/card_back.vue'
import BoosterPack from '~/components/booster_pack.vue'
import AppLayout from '~/layouts/app.vue'
import { rarityLabels, type Rarity } from '~/lib/game'

const props = defineProps<{ reveal: boolean; openedAt: string; cards: Data.Card[] }>()

type Stage = 'sealed' | 'tearing' | 'revealing' | 'done'
const stage = ref<Stage>(props.reveal ? 'sealed' : 'done')
const flipped = ref<boolean[]>(props.cards.map(() => !props.reveal))
const burst = ref<number | null>(null)
const announcement = ref('')

const loud: Rarity[] = ['rare', 'super_rare', 'legendary']
const nextIndex = computed(() => flipped.value.findIndex((value) => !value))

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stage.value = 'done'
    flipped.value = props.cards.map(() => true)
  }
})

function openPack() {
  stage.value = 'tearing'
  setTimeout(() => (stage.value = 'revealing'), 650)
}

function flip(index: number) {
  if (stage.value !== 'revealing' || index !== nextIndex.value) return
  flipped.value[index] = true
  const card = props.cards[index]
  announcement.value = `Carte ${index + 1} sur ${props.cards.length} : ${card.title}, ${rarityLabels[card.rarity]}.`
  if (loud.includes(card.rarity)) {
    burst.value = index
    setTimeout(() => burst.value === index && (burst.value = null), 1400)
  }
  if (flipped.value.every(Boolean)) {
    setTimeout(() => (stage.value = 'done'), 700)
  }
}

function flipAll() {
  flipped.value = props.cards.map(() => true)
  announcement.value = `Toutes les cartes sont retournées.`
  stage.value = 'done'
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
          @click="flipAll"
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
        <p class="reveal-stage__hint">Touche le paquet pour l'ouvrir</p>
      </div>

      <template v-else>
        <p v-if="stage === 'revealing' && nextIndex >= 0" class="reveal-stage__hint">
          Touche la carte suivante pour la retourner ({{ nextIndex + 1 }}/{{ cards.length }})
        </p>
        <ol class="card-grid reveal-grid">
          <li
            v-for="(card, index) in cards"
            :key="card.id"
            class="reveal-slot"
            :class="[
              `reveal-slot--${card.rarity}`,
              {
                'is-flipped': flipped[index],
                'is-next': stage === 'revealing' && index === nextIndex,
                'is-burst': burst === index,
              },
            ]"
            :style="{ '--i': index }"
          >
            <button
              v-if="!flipped[index]"
              type="button"
              class="reveal-slot__hit"
              :disabled="index !== nextIndex"
              :aria-label="`Retourner la carte ${index + 1}`"
              @click="flip(index)"
            />
            <div class="flip">
              <div class="flip__face flip__back"><CardBack /></div>
              <div class="flip__face flip__front">
                <CardItem :card="card" :link="stage === 'done'" />
              </div>
            </div>
            <span v-if="burst === index" class="reveal-slot__label" aria-hidden="true">
              {{ rarityLabels[card.rarity] }} !
            </span>
            <p v-if="stage === 'done' && card.copies === 1" class="card-grid__new">
              Nouvelle carte
            </p>
          </li>
        </ol>
      </template>
    </Page>
  </AppLayout>
</template>
