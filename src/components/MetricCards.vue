<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMarketStore } from '@/store/marketStore'

const store = useMarketStore()

const modelCount = computed(() => store.liveMetrics.modelCount)
const totalUsers = computed(() => store.liveMetrics.totalUsers)

// Animated counter: ease-out from current to target over ~600ms
function useAnimatedCounter(source: { value: number }, duration = 600) {
  const display = ref(0)
  let rafId = 0
  let startTime = 0
  let startVal = 0

  function animate(t: number) {
    if (!startTime) startTime = t
    const elapsed = t - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - (1 - progress) ** 2
    const target = source.value
    display.value = Math.round(startVal + (target - startVal) * eased)
    if (progress < 1) rafId = requestAnimationFrame(animate)
  }

  watch(source, () => {
    startVal = display.value
    startTime = 0
    cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(animate)
  }, { immediate: true })

  return display
}

const displayModelCount = useAnimatedCounter(modelCount)
const displayTotalUsers = useAnimatedCounter(totalUsers)
</script>

<template>
  <section id="metrics" class="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-labelledby="metrics-heading">
    <h2 id="metrics-heading" class="sr-only">Live metrics</h2>
    <div
      class="rounded-xl border border-cyber-border bg-white p-5 shadow-sm transition-shadow hover:shadow-cyber-glow/20"
      aria-label="Live model count"
    >
      <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Live model count</p>
      <p class="mt-2 text-3xl font-bold tabular-nums text-emerald-600" aria-live="polite">
        {{ displayModelCount }}
      </p>
      <p class="mt-1 text-xs text-slate-500">Tracked models</p>
    </div>
    <div
      class="rounded-xl border border-cyber-border bg-white p-5 shadow-sm transition-shadow hover:shadow-cyber-glow/20"
      aria-label="Total global users"
    >
      <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Total global users</p>
      <p class="mt-2 text-3xl font-bold tabular-nums text-emerald-600" aria-live="polite">
        {{ displayTotalUsers.toLocaleString() }}
      </p>
      <p class="mt-1 text-xs text-slate-500">Active users</p>
    </div>
  </section>
</template>
