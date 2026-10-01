<script setup lang="ts">
import { Link } from '@adonisjs/inertia/vue'
import Logo from '~/components/logo.vue'
import FlashToasts from '~/components/flash_toasts.vue'
import ThemeToggle from '~/components/theme_toggle.vue'
</script>

<template>
  <header class="header header--floating">
    <div class="header__inner">
      <Logo :size="28" />
      <div class="header__right">
        <ThemeToggle />
        <Link route="session.create" class="btn btn--ghost btn--sm">Se connecter</Link>
        <Link route="new_account.create" class="btn btn--primary btn--sm">S'inscrire</Link>
      </div>
    </div>
  </header>
  <main>
    <slot />
  </main>
  <footer class="app-footer">
    Contenu encyclopédique issu de Wikipédia, sous licence
    <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" class="il" rel="license"
      >CC BY-SA 4.0</a
    >. · <Link route="legal.terms" class="il">Conditions d'utilisation</Link> ·
    <Link route="legal.rules" class="il">Règles de la communauté</Link>
  </footer>
  <FlashToasts />
</template>
