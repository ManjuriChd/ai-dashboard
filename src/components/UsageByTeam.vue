<script setup lang="ts">
import { computed } from 'vue'
import { useMarketStore } from '@/store/marketStore'

const store = useMarketStore()

const dotColors = ['#10b981', '#3b82f6', '#a855f7', '#f97316', '#64748b']
const usageRows = computed(() =>
  store.teamUsage.map((t, idx) => ({
    team: t.team,
    percentage: t.percentage,
    left: `${Math.max(0, Math.min(100, t.percentage * 2))}%`,
    color: dotColors[idx % dotColors.length],
  })),
)

// Keep this shape for existing tests and future interoperability.
const chartData = computed(() => ({
  datasets: [
    {
      data: store.teamUsage.map((t, idx) => ({ x: t.percentage, y: idx })),
    },
  ],
}))

defineExpose({ chartData })

const highestTeam = computed(() => {
  if (!store.teamUsage.length) return null
  return store.teamUsage.reduce((best, curr) => (curr.percentage > best.percentage ? curr : best))
})

const teamBriefs = computed(() =>
  [...store.teamUsage]
    .sort((a, b) => b.percentage - a.percentage)
    .map((team) => ({
      ...team,
      status: team.percentage >= 28 ? 'High adoption' : team.percentage >= 16 ? 'Growing' : 'Emerging',
    })),
)
</script>

<template>
  <section id="usage" class="rounded-xl border border-cyber-border bg-white p-5 h-full" aria-labelledby="usage-heading">
    <h2 id="usage-heading" class="text-lg font-semibold text-slate-900 mb-4">
      Usage by team
    </h2>
    <p class="text-sm text-slate-600 mb-4">
      Software Engineering, Data Analytics, Creative Arts, Legal, Other
    </p>
    <div class="rounded-lg border border-slate-200 p-3" role="img" aria-label="Dot plot of AI tool usage by team segment (percent)">
      <div class="mb-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>0%</span>
        <span>Usage (%)</span>
        <span>50%</span>
      </div>
      <div class="space-y-3">
        <div v-for="row in usageRows" :key="row.team" class="grid grid-cols-[140px_1fr_45px] items-center gap-2">
          <span class="truncate text-xs font-medium text-slate-700">{{ row.team }}</span>
          <div class="relative h-2 rounded-full bg-slate-100">
            <div class="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white shadow-sm" :style="{ left: row.left, backgroundColor: row.color }" />
          </div>
          <span class="text-right text-xs font-semibold text-slate-700">{{ row.percentage }}%</span>
        </div>
      </div>
    </div>

    <div
      v-if="highestTeam"
      class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
      aria-label="Usage by team insights"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">Insight</p>
      <p class="mt-1 text-sm text-slate-700">
        Highest AI adoption is in
        <span class="font-semibold text-slate-900">{{ highestTeam.team }}</span>
        at <span class="font-semibold text-slate-900">{{ highestTeam.percentage }}%</span>.
      </p>
      <p class="mt-2 text-xs text-slate-600">
        Each dot corresponds to a team segment; further right indicates higher usage within that segment.
      </p>
    </div>

    <div class="mt-4 rounded-lg border border-slate-200 bg-white p-4" aria-label="Team adoption brief">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-600">Team adoption brief</h3>
      <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <article
          v-for="team in teamBriefs"
          :key="team.team"
          class="rounded-md border border-slate-200 bg-slate-50 p-3"
        >
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-slate-900">{{ team.team }}</p>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="{
                'bg-emerald-100 text-emerald-700': team.status === 'High adoption',
                'bg-sky-100 text-sky-700': team.status === 'Growing',
                'bg-amber-100 text-amber-700': team.status === 'Emerging',
              }"
            >
              {{ team.status }}
            </span>
          </div>
          <p class="mt-1 text-xs text-slate-600">
            Share of AI usage:
            <span class="font-semibold text-slate-900">{{ team.percentage }}%</span>
          </p>
          <p class="mt-2 text-xs text-slate-600">Frequently used models:</p>
          <p class="mt-0.5 text-xs text-slate-700">{{ team.models.join(', ') }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
