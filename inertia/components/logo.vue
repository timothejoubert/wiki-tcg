<script setup lang="ts">
import { Link } from '@adonisjs/inertia/vue'

withDefaults(defineProps<{ size?: number }>(), { size: 26 })
</script>

<template>
  <Link route="home" class="logo" aria-label="Wiki TCG, accueil">
    <svg :width="size" :height="size" viewBox="0 0 32 32" aria-hidden="true">
      <rect
        x="5"
        y="3"
        width="18"
        height="24"
        rx="3"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      <rect
        x="10"
        y="6"
        width="18"
        height="24"
        rx="3"
        fill="var(--card)"
        stroke="currentColor"
        stroke-width="2"
      />
      <text
        x="19"
        y="23"
        text-anchor="middle"
        font-family="var(--serif)"
        font-size="13"
        font-weight="700"
        fill="currentColor"
      >
        W
      </text>
    </svg>
    <span class="logo__name">Wiki TCG</span>
  </Link>
</template>
