<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import { Package } from 'lucide-vue-next'
import Page from '~/components/page.vue'
import AppLayout from '~/layouts/app.vue'

const props = defineProps<{
  stock: { available: number; max: number; nextRefillAt: string | null }
}>()

const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined

const remainingMs = computed(() =>
  props.stock.nextRefillAt ? Math.max(0, Date.parse(props.stock.nextRefillAt) - now.value) : null
)
const countdown = computed(() => {
  if (remainingMs.value === null) return null
  const seconds = Math.ceil(remainingMs.value / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
})

onMounted(() => {
  ticker = setInterval(() => {
    now.value = Date.now()
    if (remainingMs.value === 0) {
      router.reload({ only: ['stock'] })
    }
  }, 1000)
})
onBeforeUnmount(() => clearInterval(ticker))
</script>

<template>
  <AppLayout>
    <Page title="Boosters" description="Un booster de 5 cartes tiré au hasard dans Wikipédia.">
      <section class="booster-panel" aria-labelledby="stock-title">
        <div class="booster-panel__mark" aria-hidden="true"><Package :size="28" /></div>
        <h2 id="stock-title" class="booster-panel__count">
          {{ stock.available }} <span>/ {{ stock.max }} boosters</span>
        </h2>

        <p class="booster-panel__timer" aria-live="polite">
          <template v-if="countdown"
            >Prochain booster dans <strong class="mono">{{ countdown }}</strong></template
          >
          <template v-else>Stock plein : ouvre un booster pour relancer le compteur.</template>
        </p>

        <Form v-slot="{ processing }" route="boosters.store">
          <button
            type="submit"
            class="btn btn--primary booster-panel__open"
            :disabled="processing || stock.available < 1"
          >
            {{ processing ? 'Tirage en cours…' : 'Ouvrir un booster' }}
          </button>
        </Form>

        <p class="booster-panel__foot">
          <Link route="collection" class="il">Voir ma collection</Link>
        </p>
      </section>
    </Page>
  </AppLayout>
</template>
