<script setup lang="ts">
/**
 * Cards discovered one at a time: tap the top card to flip it, then swipe
 * it away (or use the buttons) to reveal the next one.
 */
import { computed, ref } from 'vue'
import type { Data } from '@generated/data'
import CardItem from '~/components/card_item.vue'
import CardBack from '~/components/card_back.vue'
import { rarityLabels } from '~/lib/game'
import { vibrate, vibrateFor } from '~/lib/haptics'

const props = defineProps<{ cards: Data.Card[] }>()
const emit = defineEmits<{ done: []; announce: [message: string] }>()

const index = ref(0)
const flipped = ref(false)
const burst = ref(false)
const dx = ref(0)
const dragging = ref(false)
const leaving = ref<0 | 1 | -1>(0)

const current = computed(() => props.cards[index.value])
const remaining = computed(() => props.cards.slice(index.value + 1, index.value + 3))
const loud = computed(() => ['rare', 'super_rare', 'legendary'].includes(current.value.rarity))

let startX = 0
let lastX = 0
let lastT = 0
let velocity = 0
let moved = false

function flip() {
  if (flipped.value) return
  flipped.value = true
  const card = current.value
  emit(
    'announce',
    `Carte ${index.value + 1} sur ${props.cards.length} : ${card.title}, ${rarityLabels[card.rarity]}.`
  )
  vibrateFor(card.rarity)
  if (loud.value) {
    burst.value = true
    setTimeout(() => (burst.value = false), 1400)
  }
}

function next(direction: 1 | -1 = 1) {
  if (!flipped.value || leaving.value) return
  leaving.value = direction
  vibrate(8)
  setTimeout(() => {
    leaving.value = 0
    dx.value = 0
    burst.value = false
    if (index.value >= props.cards.length - 1) {
      emit('done')
      return
    }
    index.value++
    flipped.value = false
  }, 280)
}

function down(event: PointerEvent) {
  if (leaving.value) return
  dragging.value = true
  moved = false
  startX = lastX = event.clientX
  lastT = event.timeStamp
  velocity = 0
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function move(event: PointerEvent) {
  if (!dragging.value) return
  const delta = event.clientX - startX
  if (Math.abs(delta) > 6) moved = true
  // Unflipped cards resist: a swipe flips them instead of throwing them
  dx.value = flipped.value ? delta : delta * 0.25
  const dt = Math.max(1, event.timeStamp - lastT)
  velocity = (event.clientX - lastX) / dt
  lastX = event.clientX
  lastT = event.timeStamp
}

function up() {
  if (!dragging.value) return
  dragging.value = false
  if (!moved) {
    flipped.value ? next(1) : flip()
    dx.value = 0
    return
  }
  if (!flipped.value) {
    flip()
    dx.value = 0
    return
  }
  const thrown = Math.abs(dx.value) > 90 || Math.abs(velocity) > 0.6
  if (thrown) next(dx.value + velocity * 100 >= 0 ? 1 : -1)
  else dx.value = 0
}
</script>

<template>
  <div class="pile">
    <p class="pile__count" aria-hidden="true">{{ index + 1 }} / {{ cards.length }}</p>

    <div class="pile__stack">
      <div
        v-for="(card, offset) in remaining"
        :key="card.id"
        class="pile__under"
        :style="{ '--depth': offset + 1 }"
        aria-hidden="true"
      >
        <CardBack />
      </div>

      <div
        :key="current.id"
        class="pile__top"
        :class="[
          `pile__top--${current.rarity}`,
          {
            'is-flipped': flipped,
            'is-dragging': dragging,
            'is-burst': burst,
            'is-leaving': leaving !== 0,
          },
        ]"
        :style="{
          '--dx': `${leaving ? leaving * 160 : 0}%`,
          '--drag': `${dx}px`,
          '--tilt': `${leaving ? leaving * 18 : dx / 18}deg`,
        }"
        aria-hidden="true"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
      >
        <div class="flip">
          <div class="flip__face flip__back"><CardBack /></div>
          <div class="flip__face flip__front"><CardItem :card="current" :link="false" /></div>
        </div>
        <span v-if="burst" class="pile__label">{{ rarityLabels[current.rarity] }} !</span>
      </div>
    </div>

    <p class="reveal-stage__hint">
      {{
        flipped
          ? 'Glisse la carte sur le côté pour voir la suivante'
          : 'Touche la carte pour la retourner'
      }}
    </p>
    <div class="pile__actions">
      <button v-if="!flipped" type="button" class="btn btn--primary btn--sm" @click="flip">
        Retourner
      </button>
      <button v-else type="button" class="btn btn--primary btn--sm" @click="next(1)">
        {{ index < cards.length - 1 ? 'Suivante' : 'Voir mon booster' }}
      </button>
    </div>
    <p v-if="flipped" class="visually-hidden">
      {{ current.title }}, {{ rarityLabels[current.rarity] }}. {{ current.description }}
    </p>
  </div>
</template>
