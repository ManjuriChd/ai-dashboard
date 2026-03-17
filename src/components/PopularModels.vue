<script setup lang="ts">
import { computed } from 'vue'
import { useMarketStore } from '@/store/marketStore'
import { Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  ScatterController,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, ScatterController, PointElement, Tooltip, Legend)

const store = useMarketStore()

const modelLabels = computed(() => store.popularModels.map(m => m.name))

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Popularity score',
      data: store.popularModels.map((m, idx) => ({ x: m.popularityScore, y: idx })),
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgb(79, 70, 229)', // indigo-600
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#020617',
      titleColor: '#f9fafb',
      callbacks: {
        title: (items: any[]) => {
          const idx = Number(items?.[0]?.raw?.y)
          return modelLabels.value[idx] ?? 'Model'
        },
        label: (item: any) => `Popularity: ${Number(item?.raw?.x ?? 0)}/100`,
      },
    },
  },
  layout: {
    padding: { left: 12, right: 8, top: 8, bottom: 0 },
  },
  scales: {
    x: {
      min: 0,
      max: 100,
      grid: { color: '#e5e7eb' },
      ticks: { color: '#334155' },
      title: { display: true, text: 'Popularity (0–100)', color: '#334155' },
    },
    y: {
      type: 'linear' as const,
      min: -0.5,
      max: Math.max(modelLabels.value.length - 0.5, 0.5),
      grid: { display: false },
      ticks: {
        stepSize: 1,
        color: '#334155',
        padding: 10,
        font: { size: 12, weight: 600 },
        autoSkip: false,
        callback: (value: any) => modelLabels.value[Number(value)] ?? '',
      },
    },
  },
}
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
      <div class="h-64" role="img" aria-label="Dot plot of model popularity scores (0 to 100)">
        <Scatter :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </section>
</template>
