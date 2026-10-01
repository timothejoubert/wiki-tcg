<script setup lang="ts">
import type { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/vue'
import Page from '~/components/page.vue'
import CardItem from '~/components/card_item.vue'
import AppLayout from '~/layouts/app.vue'
import { formatNumber, rarityLabels } from '~/lib/game'

defineProps<{ card: Data.Card }>()

const qualityLabels = { featured: 'Article de qualité', good: 'Bon article' } as const
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
