<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import MarketingLayout from '~/layouts/marketing.vue'
</script>

<template>
  <MarketingLayout>
    <Head title="Collectionne Wikipédia" />
    <div class="home">
      <article class="prose-card">
        <h1 class="pc-lead">Chaque article de Wikipédia est une carte à collectionner.</h1>

        <p class="pc-para">
          Ouvre un booster toutes les 10 minutes et découvre 5 articles tirés au hasard parmi les
          2,7 millions de la Wikipédia francophone.
        </p>

        <ul class="rules">
          <li><strong>Rareté</strong> : le nombre de lecteurs de l'article.</li>
          <li><strong>Attaque</strong> : la longueur de son contenu.</li>
          <li><strong>Défense</strong> : sa qualité.</li>
        </ul>

        <p>
          <Link route="new_account.create" class="btn btn--primary">Commencer ma collection</Link>
        </p>
      </article>
    </div>
  </MarketingLayout>
</template>
