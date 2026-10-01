<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import Logo from '~/components/logo.vue'
import FlashToasts from '~/components/flash_toasts.vue'
import ThemeToggle from '~/components/theme_toggle.vue'

defineProps<{ title: string }>()
</script>

<template>
  <Head :title="title" />
  <div class="auth">
    <main class="auth__form-col">
      <Logo :size="28" />
      <div class="auth__form-wrap">
        <slot />
      </div>
      <div :style="{ height: '20px' }" />
    </main>

    <aside class="auth__aside">
      <div class="auth__aside-top">
        <ThemeToggle />
      </div>

      <p class="auth__quote">Chaque article de Wikipédia est une carte à collectionner.</p>

      <div>
        <div class="pitch__t">Comment ça marche ?</div>
        <p class="pitch__p">
          Un booster de 5 cartes toutes les 10 minutes. Plus un article est lu, plus sa carte est
          rare.
        </p>
      </div>
    </aside>
  </div>
  <FlashToasts />
</template>
