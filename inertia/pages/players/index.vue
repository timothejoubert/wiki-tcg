<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import AppLayout from '~/layouts/app.vue'
import { formatNumber } from '~/lib/game'

const props = defineProps<{
  q: string
  players: { username: string; isPublic: boolean; cards: number | null }[]
}>()

const search = ref(props.q)
let debounce: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(
    () =>
      router.get('/joueurs', value.trim() ? { q: value.trim() } : {}, {
        preserveState: true,
        replace: true,
      }),
    300
  )
})
onBeforeUnmount(() => clearTimeout(debounce))
</script>

<template>
  <AppLayout>
    <Page
      title="Joueurs"
      description="Retrouve un joueur pour voir sa collection ou lui proposer un échange."
    >
      <form class="filters" role="search" @submit.prevent>
        <div class="field filters__search">
          <label class="field__label" for="q">Identifiant</label>
          <input
            id="q"
            v-model="search"
            type="search"
            class="field__input"
            placeholder="Début de l'identifiant"
            autocomplete="off"
          />
        </div>
      </form>

      <ul v-if="players.length" class="player-list">
        <li v-for="player in players" :key="player.username" class="player-list__item">
          <Link route="players.show" :params="{ username: player.username }" class="il">{{
            player.username
          }}</Link>
          <span class="player-list__meta">
            <template v-if="player.isPublic">{{ formatNumber(player.cards ?? 0) }} cartes</template>
            <template v-else>Collection privée</template>
          </span>
          <Link
            route="trades.create"
            :qs="{ to: player.username }"
            class="btn btn--secondary btn--sm"
          >
            Proposer un échange
          </Link>
        </li>
      </ul>
      <div v-else-if="q" class="empty">
        <h2>Aucun joueur</h2>
        <p>Aucun identifiant ne commence par « {{ q }} ».</p>
      </div>
    </Page>
  </AppLayout>
</template>
