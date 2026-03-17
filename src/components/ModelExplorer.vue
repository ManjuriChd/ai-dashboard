<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMarketStore } from '@/store/marketStore'
import type { Company, Capability } from '@/types/market'
import type { AIModel } from '@/types/market'

const store = useMarketStore()
const expandedId = ref<string | null>(null)

const companies: Company[] = ['Google', 'OpenAI', 'Anthropic', 'Mistral', 'Meta', 'Other']
const capabilities: Capability[] = ['Multimodal', 'Coding', 'Reasoning', 'Creative', 'Analysis', 'Legal']

const filteredList = computed(() => store.filteredModels)

function toggleRow(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function setCompanyFilter(value: Company | '') {
  store.setFilterCompany(value || null)
}

function setCapabilityFilter(value: Capability | '') {
  store.setFilterCapability(value || null)
}

function escapeCsvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function exportToCsv() {
  const rows = filteredList.value
  if (rows.length === 0) return
  const headers = [
    'Name',
    'Company',
    'Launched Date',
    'Capabilities',
    'Context Window',
    'Latency',
    'Compute Cost',
    'Popularity Score',
  ]
  const toRow = (m: AIModel) => [
    escapeCsvCell(m.name),
    escapeCsvCell(m.company),
    escapeCsvCell(m.launchedDate),
    escapeCsvCell(m.capabilities.join('; ')),
    escapeCsvCell(m.limitations.contextWindow),
    escapeCsvCell(m.limitations.latency),
    escapeCsvCell(m.limitations.computeCost),
    escapeCsvCell(m.popularityScore),
  ]
  const csvContent = [
    headers.join(','),
    ...rows.map(r => toRow(r).join(',')),
  ].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-models-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section id="explorer" class="rounded-xl border border-cyber-border bg-white p-5" aria-labelledby="explorer-heading">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-4">
      <h2 id="explorer-heading" class="text-lg font-semibold text-slate-900">
        Model explorer
      </h2>
      <button
        type="button"
        class="rounded-lg border border-cyber-border bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-accent"
        :disabled="filteredList.length === 0"
        aria-label="Export current model list to CSV"
        @click="exportToCsv"
      >
        Export to CSV
      </button>
    </div>

    <div class="flex flex-wrap gap-4 mb-4">
      <div>
        <label for="filter-company" class="block text-xs font-medium text-slate-500 mb-1">Company</label>
        <select
          id="filter-company"
          :value="store.filterCompany ?? ''"
          class="rounded-lg border border-cyber-border bg-white text-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-cyber-accent focus:border-transparent"
          aria-label="Filter models by company"
          @change="setCompanyFilter(($event.target as HTMLSelectElement).value as Company | '')"
        >
          <option value="">All companies</option>
          <option v-for="c in companies" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <label for="filter-capability" class="block text-xs font-medium text-slate-500 mb-1">Capability</label>
        <select
          id="filter-capability"
          :value="store.filterCapability ?? ''"
          class="rounded-lg border border-cyber-border bg-white text-slate-900 px-3 py-2 text-sm focus:ring-2 focus:ring-cyber-accent focus:border-transparent"
          aria-label="Filter models by capability"
          @change="setCapabilityFilter(($event.target as HTMLSelectElement).value as Capability | '')"
        >
          <option value="">All capabilities</option>
          <option v-for="cap in capabilities" :key="cap" :value="cap">{{ cap }}</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-800" role="table" aria-label="AI models explorer table">
        <thead>
          <tr class="border-b border-cyber-border text-slate-500">
            <th scope="col" class="py-3 px-2 font-medium">Model</th>
            <th scope="col" class="py-3 px-2 font-medium">Company</th>
            <th scope="col" class="py-3 px-2 font-medium">Launched</th>
            <th scope="col" class="py-3 px-2 font-medium">Capabilities</th>
            <th scope="col" class="py-3 px-2 w-10" aria-label="Expand row" />
          </tr>
        </thead>
        <tbody>
          <template v-for="model in filteredList" :key="model.id">
            <tr
              class="border-b border-cyber-border/70 hover:bg-slate-50 cursor-pointer transition-colors"
              @click="toggleRow(model.id)"
            >
              <td class="py-3 px-2">
                <span class="font-medium text-slate-900">{{ model.name }}</span>
                <span v-if="model.isNew" class="ml-2 text-xs bg-cyber-accent/20 text-cyber-accent px-2 py-0.5 rounded">New</span>
              </td>
              <td class="py-3 px-2 text-slate-700">{{ model.company }}</td>
              <td class="py-3 px-2 text-slate-700">{{ model.launchedDate }}</td>
              <td class="py-3 px-2">
                <span class="text-slate-700">{{ model.capabilities.join(', ') }}</span>
              </td>
              <td class="py-3 px-2">
                <span class="inline-block transition-transform" :class="{ 'rotate-180': expandedId === model.id }">
                  <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </td>
            </tr>
            <tr v-if="expandedId === model.id" class="border-b border-cyber-border bg-slate-50">
              <td colspan="5" class="py-4 px-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                  <div>
                    <h4 class="text-xs font-semibold text-slate-400 uppercase mb-2">Limitations</h4>
                    <ul class="space-y-1 text-sm">
                      <li v-if="model.limitations.contextWindow">Context window: {{ model.limitations.contextWindow.toLocaleString() }}</li>
                      <li v-if="model.limitations.latency">Latency: {{ model.limitations.latency }}</li>
                      <li v-if="model.limitations.computeCost">Compute cost: {{ model.limitations.computeCost }}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="text-xs font-semibold text-slate-400 uppercase mb-2">Developer</h4>
                    <p class="text-sm">{{ model.company }}</p>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <p v-if="filteredList.length === 0" class="py-8 text-center text-slate-500">
      No models match the current filters.
    </p>
  </section>
</template>
