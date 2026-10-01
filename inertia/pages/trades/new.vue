<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Data } from '@generated/data'
import { Form, Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import AppLayout from '~/layouts/app.vue'
import { rarityLabels, rarityShort } from '~/lib/game'

const props = defineProps<{
  to: string
  recipient: { username: string } | null
  notFound: boolean
  mine: Data.Card[]
  theirs: Data.Card[]
  maxCardsPerSide: number
}>()

const offered = ref<number[]>([])
const requested = ref<number[]>([])
const mineFilter = ref('')
const theirsFilter = ref('')

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
const filtered = (cards: Data.Card[], query: string) =>
  query ? cards.filter((card) => normalize(card.title).includes(normalize(query))) : cards
const mineShown = computed(() => filtered(props.mine, mineFilter.value))
const theirsShown = computed(() => filtered(props.theirs, theirsFilter.value))
const ready = computed(
  () =>
    offered.value.length > 0 &&
    requested.value.length > 0 &&
    offered.value.length <= props.maxCardsPerSide &&
    requested.value.length <= props.maxCardsPerSide
)
</script>

<template>
  <AppLayout>
    <Page title="Nouvelle proposition">
      <template #actions>
        <Link route="trades.index" class="btn btn--secondary btn--sm">Retour aux échanges</Link>
      </template>

      <form class="filters" method="get" action="/trades/new">
        <div class="field filters__search">
          <label class="field__label" for="to">Échanger avec</label>
          <input
            id="to"
            name="to"
            class="field__input"
            :value="to"
            placeholder="Identifiant du joueur"
            autocomplete="off"
            :aria-invalid="notFound ? 'true' : 'false'"
            :aria-describedby="notFound ? 'to-error' : undefined"
            required
          />
          <span v-if="notFound" id="to-error" class="field__error"
            >Aucun autre joueur ne porte cet identifiant.</span
          >
        </div>
        <button type="submit" class="btn btn--secondary btn--sm">Choisir</button>
      </form>

      <Form
        v-if="recipient"
        v-slot="{ processing, errors }"
        route="trades.store"
        class="trade-builder"
      >
        <input type="hidden" name="recipient" :value="recipient.username" />

        <fieldset class="trade-builder__side">
          <legend>Tu donnes ({{ offered.length }}/{{ maxCardsPerSide }})</legend>
          <label class="visually-hidden" for="mine-filter">Filtrer mes cartes</label>
          <input
            id="mine-filter"
            v-model="mineFilter"
            type="search"
            class="field__input"
            placeholder="Filtrer"
          />
          <ul class="pick-list pick-list--scroll">
            <li
              v-for="card in mineShown"
              :key="card.id"
              class="pick-list__item"
              :class="`pick-list__item--${card.rarity}`"
            >
              <label>
                <input
                  v-model="offered"
                  type="checkbox"
                  name="offered[]"
                  :value="card.id"
                  :disabled="!offered.includes(card.id) && offered.length >= maxCardsPerSide"
                />
                <abbr class="pick-list__rarity" :title="rarityLabels[card.rarity]">{{
                  rarityShort[card.rarity]
                }}</abbr>
                {{ card.title }}
              </label>
            </li>
          </ul>
          <span v-if="errors.offered" class="field__error">{{ errors.offered }}</span>
        </fieldset>

        <fieldset class="trade-builder__side">
          <legend>
            {{ recipient.username }} donne ({{ requested.length }}/{{ maxCardsPerSide }})
          </legend>
          <label class="visually-hidden" for="theirs-filter">Filtrer ses cartes</label>
          <input
            id="theirs-filter"
            v-model="theirsFilter"
            type="search"
            class="field__input"
            placeholder="Filtrer"
          />
          <ul v-if="theirs.length" class="pick-list pick-list--scroll">
            <li
              v-for="card in theirsShown"
              :key="card.id"
              class="pick-list__item"
              :class="`pick-list__item--${card.rarity}`"
            >
              <label>
                <input
                  v-model="requested"
                  type="checkbox"
                  name="requested[]"
                  :value="card.id"
                  :disabled="!requested.includes(card.id) && requested.length >= maxCardsPerSide"
                />
                <abbr class="pick-list__rarity" :title="rarityLabels[card.rarity]">{{
                  rarityShort[card.rarity]
                }}</abbr>
                {{ card.title }}
              </label>
            </li>
          </ul>
          <p v-else class="card-tags__empty">Ce joueur n'a aucune carte disponible.</p>
          <span v-if="errors.requested" class="field__error">{{ errors.requested }}</span>
        </fieldset>

        <div class="trade-builder__submit">
          <button type="submit" class="btn btn--primary" :disabled="processing || !ready">
            Envoyer la proposition
          </button>
          <p class="field__hint">
            Les cartes ne sont pas bloquées : tout est vérifié au moment où
            {{ recipient.username }} accepte.
          </p>
        </div>
      </Form>
    </Page>
  </AppLayout>
</template>
