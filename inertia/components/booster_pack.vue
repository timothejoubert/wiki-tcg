<script setup lang="ts">
/**
 * The sealed booster: a holographic foil pouch torn open on click.
 */
defineProps<{ tearing: boolean }>()
defineEmits<{ open: [] }>()
</script>

<template>
  <button
    type="button"
    class="booster-pack"
    :class="{ 'is-tearing': tearing }"
    :disabled="tearing"
    @click="$emit('open')"
  >
    <span class="booster-pack__strip" aria-hidden="true" />
    <span class="booster-pack__body" aria-hidden="true">
      <span class="booster-pack__brand">Wiki TCG</span>
      <span class="booster-pack__count">5 cartes</span>
      <span class="booster-pack__grain" />
    </span>
    <span class="visually-hidden">Déchirer le paquet</span>
  </button>
</template>
