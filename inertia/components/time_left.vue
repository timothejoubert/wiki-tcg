<script setup lang="ts">
/**
 * Remaining time until `until`, refreshed every 30 s.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{ until: string }>()
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined
onMounted(() => (ticker = setInterval(() => (now.value = Date.now()), 30_000)))
onBeforeUnmount(() => clearInterval(ticker))

const label = computed(() => {
  const minutes = Math.max(0, Math.ceil((Date.parse(props.until) - now.value) / 60_000))
  if (minutes === 0) return 'terminée'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours} h ${String(minutes % 60).padStart(2, '0')}`
  return `${Math.floor(hours / 24)} j ${hours % 24} h`
})
</script>

<template>
  <time :datetime="until">{{ label }}</time>
</template>
