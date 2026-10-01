<script setup lang="ts">
import { computed } from 'vue'
import type { Data } from '@generated/data'
import { Form, Link } from '@adonisjs/inertia/vue'
import { Star, X } from 'lucide-vue-next'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import AppLayout from '~/layouts/app.vue'
import { formatNumber, formatWikis, rarityLabels } from '~/lib/game'

const props = defineProps<{ card: Data.Card; tags: Data.Tag[]; salePrice: number }>()

const qualityLabels = { featured: 'Article de qualité', good: 'Bon article' } as const
const owned = computed(() => (props.card.copies ?? 0) > 0)
const available = computed(() => {
  const applied = new Set((props.card.tags ?? []).map((tag) => tag.id))
  return props.tags.filter((tag) => !applied.has(tag.id))
})
</script>

<template>
  <AppLayout>
    <Page :title="card.title">
      <template #actions>
        <Link route="collection" class="btn btn--secondary btn--sm">Retour à la collection</Link>
      </template>

      <div class="card-detail">
        <CardItem :card="card" :link="false" />

        <div class="card-detail__info">
          <Form
            v-if="owned"
            v-slot="{ processing }"
            route="cards.favorite"
            :params="{ id: card.id }"
            :options="{ preserveScroll: true }"
          >
            <button
              type="submit"
              class="btn btn--secondary btn--sm favorite-toggle"
              :aria-pressed="card.isFavorite ? 'true' : 'false'"
              :disabled="processing"
            >
              <Star
                :size="15"
                :fill="card.isFavorite ? 'currentColor' : 'none'"
                aria-hidden="true"
              />
              {{ card.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
            </button>
          </Form>

          <Form
            v-if="(card.copies ?? 0) > 1"
            v-slot="{ processing }"
            route="cards.sell"
            :params="{ id: card.id }"
            :options="{ preserveScroll: true }"
            class="card-detail__sell"
          >
            <button type="submit" class="btn btn--secondary btn--sm" :disabled="processing">
              Revendre un doublon · +{{ formatWikis(salePrice) }}
            </button>
          </Form>

          <dl class="card-detail__list">
            <div>
              <dt>Rareté</dt>
              <dd>{{ rarityLabels[card.rarity] }}</dd>
            </div>
            <div>
              <dt>Exemplaires possédés</dt>
              <dd>{{ card.copies ?? 0 }}</dd>
            </div>
            <div>
              <dt>Lecteurs par jour (moyenne)</dt>
              <dd>{{ formatNumber(card.avgDailyViews) }}</dd>
            </div>
            <div>
              <dt>Longueur de l'article</dt>
              <dd>{{ formatNumber(card.lengthBytes) }} octets</dd>
            </div>
            <div>
              <dt>Label de qualité</dt>
              <dd>{{ card.qualityLabel ? qualityLabels[card.qualityLabel] : 'Aucun' }}</dd>
            </div>
          </dl>

          <section v-if="owned" class="card-tags" aria-labelledby="card-tags-title">
            <h2 id="card-tags-title" class="card-tags__title">Tags</h2>

            <ul v-if="card.tags?.length" class="tag-list">
              <li v-for="tag in card.tags" :key="tag.id" class="tag-chip">
                <span>{{ tag.name }}</span>
                <Form
                  route="cards.tags.detach"
                  :params="{ id: card.id, tagId: tag.id }"
                  :options="{ preserveScroll: true }"
                >
                  <button
                    type="submit"
                    class="tag-chip__remove"
                    :aria-label="`Retirer le tag ${tag.name}`"
                  >
                    <X :size="12" aria-hidden="true" />
                  </button>
                </Form>
              </li>
            </ul>
            <p v-else class="card-tags__empty">Aucun tag sur cette carte.</p>

            <Form
              v-if="available.length"
              v-slot="{ processing }"
              route="cards.tags.attach"
              :params="{ id: card.id }"
              class="card-tags__form"
              :options="{ preserveScroll: true }"
            >
              <label class="visually-hidden" for="tagId">Tag existant</label>
              <select id="tagId" name="tagId" class="field__input" required>
                <option v-for="tag in available" :key="tag.id" :value="tag.id">
                  {{ tag.name }}
                </option>
              </select>
              <button type="submit" class="btn btn--secondary btn--sm" :disabled="processing">
                Ajouter
              </button>
            </Form>

            <Form
              v-slot="{ processing, errors }"
              route="tags.store"
              class="card-tags__form"
              :options="{ preserveScroll: true }"
              reset-on-success
            >
              <input type="hidden" name="cardId" :value="card.id" />
              <label class="visually-hidden" for="name">Nouveau tag</label>
              <input
                id="name"
                name="name"
                class="field__input"
                maxlength="30"
                placeholder="Nouveau tag"
                :aria-invalid="errors.name ? 'true' : 'false'"
                :aria-describedby="errors.name ? 'name-error' : undefined"
                required
              />
              <button type="submit" class="btn btn--secondary btn--sm" :disabled="processing">
                Créer
              </button>
              <span v-if="errors.name" id="name-error" class="field__error">{{ errors.name }}</span>
            </Form>
          </section>

          <p class="card-detail__source">
            Contenu issu de l'article
            <a :href="card.wikipediaUrl" class="il" target="_blank" rel="noreferrer">
              « {{ card.title }} » sur Wikipédia<span class="visually-hidden">
                (nouvelle fenêtre)</span
              > </a
            >, sous licence
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr"
              class="il"
              target="_blank"
              rel="noreferrer license"
              >CC BY-SA 4.0<span class="visually-hidden"> (nouvelle fenêtre)</span></a
            >.
          </p>
        </div>
      </div>
    </Page>
  </AppLayout>
</template>
