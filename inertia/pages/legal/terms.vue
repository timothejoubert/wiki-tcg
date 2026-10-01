<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import MarketingLayout from '~/layouts/marketing.vue'
</script>

<template>
  <MarketingLayout>
    <Head title="Conditions d'utilisation" />
    <div class="home">
      <article class="prose-card legal">
        <h1 class="pc-lead">Conditions d'utilisation</h1>
        <p class="pc-para">
          Texte provisoire, à rédiger avant toute mise en ligne publique (mentions légales, données
          personnelles, durée de conservation, suppression du compte).
        </p>
        <p class="pc-para">
          Le contenu des cartes provient de Wikipédia et reste soumis à la licence CC BY-SA 4.0 ;
          chaque carte renvoie vers son article source.
        </p>
      </article>
    </div>
  </MarketingLayout>
</template>
