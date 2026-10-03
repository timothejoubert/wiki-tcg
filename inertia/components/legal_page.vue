<script setup lang="ts">
import { Head, usePage } from '@inertiajs/vue3'
import { Link } from '@adonisjs/inertia/vue'
import MarketingLayout from '~/layouts/marketing.vue'
import { legal } from '~/lib/legal'

defineProps<{ title: string }>()
const page = usePage()
</script>

<template>
  <MarketingLayout>
    <Head :title="title" />
    <div class="legal-wrap">
      <article class="legal">
        <p v-if="page.props.user" class="legal__back">
          <Link route="dashboard" class="il">Retour au jeu</Link>
        </p>
        <h1>{{ title }}</h1>
        <p class="legal__updated">Dernière mise à jour : {{ legal.updatedOn }}</p>
        <slot />
        <nav class="legal__nav" aria-label="Informations légales">
          <Link route="legal.terms" class="il">Conditions d'utilisation</Link>
          <Link route="legal.rules" class="il">Règles de la communauté</Link>
          <Link route="legal.privacy" class="il">Confidentialité</Link>
          <Link route="legal.notice" class="il">Mentions légales</Link>
        </nav>
      </article>
    </div>
  </MarketingLayout>
</template>
