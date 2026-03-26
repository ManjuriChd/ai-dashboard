<script setup lang="ts">
import { computed } from 'vue'
import { useMarketStore } from '@/store/marketStore'

const store = useMarketStore()

const chartRows = computed(() =>
  store.popularModels.map((m) => ({
    id: m.id,
    name: m.name,
    company: m.company,
    score: m.popularityScore,
    left: `${m.popularityScore}%`,
  })),
)

// Keep this shape for existing tests and future interoperability.
const chartData = computed(() => ({
  datasets: [
    {
      data: store.popularModels.map((m, idx) => ({ x: m.popularityScore, y: idx })),
    },
  ],
}))

defineExpose({ chartData })
</script>

<template>
  <section id="popular" class="rounded-xl border border-cyber-border bg-white p-5" aria-labelledby="popular-heading">
    <h2 id="popular-heading" class="text-lg font-semibold text-slate-900 mb-4">
      Popular models of 2026
    </h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="flex flex-wrap gap-3">
        <div
          v-for="model in store.popularModels"
          :key="model.id"
          class="flex items-center gap-2 rounded-lg border border-cyber-border bg-slate-50 px-4 py-2"
        >
          <span class="font-medium text-slate-900">{{ model.name }}</span>
          <span class="text-xs text-slate-500">— {{ model.company }}</span>
        </div>
      </div>
      <div class="rounded-lg border border-slate-200 p-3" role="img" aria-label="Dot plot of model popularity scores (0 to 100)">
        <div class="mb-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>0</span>
          <span>Popularity score (0-100)</span>
          <span>100</span>
        </div>
        <div class="space-y-3">
          <div v-for="row in chartRows" :key="row.id" class="grid grid-cols-[120px_1fr_40px] items-center gap-2">
            <span class="truncate text-xs font-medium text-slate-700">{{ row.name }}</span>
            <div class="relative h-2 rounded-full bg-slate-100">
              <div class="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-indigo-600 shadow-sm" :style="{ left: row.left }" />
            </div>
            <span class="text-right text-xs font-semibold text-slate-700">{{ row.score }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
