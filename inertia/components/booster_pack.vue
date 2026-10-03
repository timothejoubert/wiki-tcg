<script setup lang="ts">
/**
 * The sealed booster. Slice it open by dragging along the top strip (finger
 * or mouse); a short drag springs back. The button below opens it too, for
 * keyboards and reduced motion.
 */
import { ref } from 'vue'
import { vibrate } from '~/lib/haptics'

defineProps<{ tearing: boolean }>()
const emit = defineEmits<{ open: [] }>()

const root = ref<HTMLElement | null>(null)
const progress = ref(0)
const dragging = ref(false)
let startX = 0
let width = 1

function down(event: PointerEvent) {
  const box = root.value!.getBoundingClientRect()
  // Only the top band starts a cut
  if (event.clientY - box.top > box.height * 0.32) return
  dragging.value = true
  startX = event.clientX
  width = box.width
  root.value!.setPointerCapture(event.pointerId)
}

function move(event: PointerEvent) {
  if (!dragging.value) return
  const next = Math.min(1, Math.abs(event.clientX - startX) / (width * 0.75))
  if (Math.floor(next * 4) > Math.floor(progress.value * 4)) vibrate(6)
  progress.value = next
  if (next >= 1) finish()
}

function up() {
  if (!dragging.value) return
  dragging.value = false
  if (progress.value < 1) progress.value = 0
}

function finish() {
  dragging.value = false
  vibrate([20, 30, 40])
  emit('open')
}
</script>

<template>
  <div class="booster-pack-wrap">
    <div
      ref="root"
      class="booster-pack"
      :class="{ 'is-tearing': tearing, 'is-dragging': dragging }"
      :style="{ '--cut': progress }"
      aria-hidden="true"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
    >
      <span class="booster-pack__strip">
        <span class="booster-pack__perforation" />
        <span class="booster-pack__cut" />
      </span>
      <span class="booster-pack__body">
        <span class="booster-pack__brand">Wiki TCG</span>
        <span class="booster-pack__count">5 cartes</span>
        <span class="booster-pack__grain" />
      </span>
    </div>
    <p class="reveal-stage__hint">Glisse le long du haut du paquet pour le trancher</p>
    <button type="button" class="btn btn--secondary btn--sm" :disabled="tearing" @click="finish">
      Ouvrir le paquet
    </button>
  </div>
</template>
