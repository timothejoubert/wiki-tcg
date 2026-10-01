import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Feeds `--mx`, `--my` (0..100 %) and a small tilt to the element while the
 * pointer moves over it, so CSS can place the holographic sheen. Does
 * nothing for coarse pointers or when the user prefers reduced motion.
 */
export function useHolo(target: Ref<HTMLElement | null>, enabled: () => boolean) {
  const active = ref(false)
  let frame = 0

  const move = (event: PointerEvent) => {
    const element = target.value
    if (!element) return
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const box = element.getBoundingClientRect()
      const x = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
      const y = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height))
      element.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
      element.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
      element.style.setProperty('--rx', `${((0.5 - y) * 8).toFixed(2)}deg`)
      element.style.setProperty('--ry', `${((x - 0.5) * 10).toFixed(2)}deg`)
    })
  }
  const enter = () => (active.value = true)
  const leave = () => {
    active.value = false
    const element = target.value
    if (!element) return
    for (const name of ['--mx', '--my', '--rx', '--ry']) element.style.removeProperty(name)
  }

  onMounted(() => {
    const element = target.value
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!element || !finePointer || reduced || !enabled()) return
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerenter', enter)
    element.addEventListener('pointerleave', leave)
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    const element = target.value
    if (!element) return
    element.removeEventListener('pointermove', move)
    element.removeEventListener('pointerenter', enter)
    element.removeEventListener('pointerleave', leave)
  })

  return { active }
}
