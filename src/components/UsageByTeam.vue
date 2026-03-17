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
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, ScatterController, PointElement, Tooltip)

const store = useMarketStore()

const teamLabels = computed(() => store.teamUsage.map(t => t.team))

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Team usage',
      data: store.teamUsage.map((t, idx) => ({ x: t.percentage, y: idx })),
      pointRadius: 7,
      pointHoverRadius: 9,
      pointBackgroundColor: [
        'rgb(16, 185, 129)', // Software Engineering
        'rgb(59, 130, 246)', // Data Analytics
        'rgb(168, 85, 247)', // Creative Arts
        'rgb(249, 115, 22)', // Legal
        'rgb(100, 116, 139)', // Other
      ],
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
          return teamLabels.value[idx] ?? 'Team'
        },
        label: (item: any) => `Usage: ${Number(item?.raw?.x ?? 0)}%`,
      },
    },
  },
  layout: { padding: { left: 12, right: 8, top: 8, bottom: 0 } },
  scales: {
    x: {
      min: 0,
      max: 50,
      grid: { color: '#e5e7eb' },
      ticks: { color: '#334155' },
      title: { display: true, text: 'Usage (%)', color: '#334155' },
    },
    y: {
      type: 'linear' as const,
      min: -0.5,
      max: Math.max(teamLabels.value.length - 0.5, 0.5),
      grid: { display: false },
      ticks: {
        stepSize: 1,
        autoSkip: false,
        padding: 10,
        color: '#334155',
        font: { size: 12, weight: 600 },
        callback: (value: any) => teamLabels.value[Number(value)] ?? '',
      },
    },
  },
}
</script>

<template>
  <section id="usage" class="rounded-xl border border-cyber-border bg-white p-5 h-full" aria-labelledby="usage-heading">
    <h2 id="usage-heading" class="text-lg font-semibold text-slate-900 mb-4">
      Usage by team
    </h2>
    <p class="text-sm text-slate-600 mb-4">
      Software Engineering, Data Analytics, Creative Arts, Legal, Other
    </p>
    <div class="h-64" role="img" aria-label="Dot plot of AI tool usage by team segment (percent)">
      <Scatter :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>
