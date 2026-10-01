<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { router } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import { Package } from 'lucide-vue-next'
import type { Data } from '@generated/data'
import Page from '~/components/page.vue'
import { formatWikis } from '~/lib/game'
import CardItem from '~/components/card_item.vue'
import AppLayout from '~/layouts/app.vue'

const props = defineProps<{
  stock: { available: number; max: number; nextRefillAt: string | null }
  recent: Data.Card[]
  dailyBonus: number | null
  balance: number
  boosterPrice: number
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
      <p v-if="dailyBonus" class="daily-bonus" role="status">
        Bonus quotidien : <strong>+{{ formatWikis(dailyBonus) }}</strong>
      </p>

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

        <Form
          v-if="stock.available < 1"
          v-slot="{ processing }"
          route="boosters.buy"
          class="booster-panel__buy"
        >
          <button
            type="submit"
            class="btn btn--secondary"
            :disabled="processing || balance < boosterPrice"
          >
            Acheter un booster · {{ formatWikis(boosterPrice) }}
          </button>
          <p v-if="balance < boosterPrice" class="booster-panel__hint">
            Il te manque {{ formatWikis(boosterPrice - balance) }}.
          </p>
        </Form>

        <p class="booster-panel__foot">
          <Link route="collection" class="il">Voir ma collection</Link>
        </p>
      </section>

      <section v-if="recent.length" class="recent" aria-labelledby="recent-title">
        <h2 id="recent-title" class="recent__title">Dernières cartes obtenues</h2>
        <ul class="card-grid">
          <li v-for="card in recent" :key="card.id"><CardItem :card="card" /></li>
        </ul>
      </section>
    </Page>
  </AppLayout>
</template>
