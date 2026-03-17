<script setup lang="ts">
import { computed } from 'vue'

type IndustryStage = 'Mature' | 'Scaling' | 'Early'

interface IndustryImpact {
  name: string
  segment: 'Healthcare' | 'Financial Services' | 'Telecommunications' | 'Manufacturing' | 'Retail & E‑commerce' | 'Public Sector'
  manualReduction: number // % of repetitive/operational work reduced
  aiUsageExamples: string
  stage: IndustryStage
}

const industries: IndustryImpact[] = [
  {
    name: 'Healthcare',
    segment: 'Healthcare',
    manualReduction: 45,
    aiUsageExamples: 'Clinical documentation, triage chatbots, revenue-cycle automation',
    stage: 'Scaling',
  },
  {
    name: 'Financial Services',
    segment: 'Financial Services',
    manualReduction: 55,
    aiUsageExamples: 'KYC checks, fraud review, report generation, compliance workflows',
    stage: 'Mature',
  },
  {
    name: 'Telecommunications',
    segment: 'Telecommunications',
    manualReduction: 40,
    aiUsageExamples: 'Network incident triage, customer support, provisioning workflows',
    stage: 'Scaling',
  },
  {
    name: 'Manufacturing',
    segment: 'Manufacturing',
    manualReduction: 38,
    aiUsageExamples: 'Quality inspection, preventive maintenance, shop-floor instructions',
    stage: 'Early',
  },
  {
    name: 'Retail & E‑commerce',
    segment: 'Retail & E‑commerce',
    manualReduction: 32,
    aiUsageExamples: 'Product copy generation, support chat, catalog operations',
    stage: 'Scaling',
  },
  {
    name: 'Public Sector',
    segment: 'Public Sector',
    manualReduction: 18,
    aiUsageExamples: 'Case-work summarization, citizen Q&A, document drafting',
    stage: 'Early',
  },
]

const totalIndustries = industries.length
const scalingOrMatureCount = computed(
  () => industries.filter(i => i.stage === 'Scaling' || i.stage === 'Mature').length,
)
const stillSpeedingUpCount = computed(
  () => industries.filter(i => i.stage === 'Early').length,
)
</script>

<template>
  <section
    id="industry"
    class="rounded-xl border border-cyber-border bg-white p-5"
    aria-labelledby="industry-heading"
  >
    <div class="flex flex-wrap items-end justify-between gap-4 mb-4">
      <div>
        <h2 id="industry-heading" class="text-lg font-semibold text-slate-900">
          Industry impact
        </h2>
        <p class="mt-1 text-sm text-slate-600 max-w-xl">
          How different industries are reducing manual and repetitive work with AI assistants and automation.
        </p>
      </div>
      <div class="text-right text-xs text-slate-500 space-y-0.5">
        <p>
          <span class="font-semibold text-slate-900">{{ scalingOrMatureCount }}</span>
          of {{ totalIndustries }} industries have **scaled** AI for repetitive work.
        </p>
        <p>
          <span class="font-semibold text-slate-900">{{ stillSpeedingUpCount }}</span>
          industries are still **speeding up** adoption.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <article
        v-for="industry in industries"
        :key="industry.segment"
        class="rounded-lg border border-cyber-border bg-slate-50 px-4 py-3 flex flex-col gap-2"
      >
        <header class="flex items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-slate-900">
            {{ industry.name }}
          </h3>
          <span
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
            :class="{
              'bg-emerald-600': industry.stage === 'Mature',
              'bg-sky-600': industry.stage === 'Scaling',
              'bg-amber-500': industry.stage === 'Early',
            }"
          >
            {{ industry.stage === 'Early' ? 'Speeding up adoption' : industry.stage }}
          </span>
        </header>

        <p class="text-xs text-slate-600">
          Manual / repetitive work reduced:
          <span class="font-semibold text-emerald-600">{{ industry.manualReduction }}%</span>
        </p>

        <p class="text-xs text-slate-700 leading-snug">
          {{ industry.aiUsageExamples }}
        </p>
      </article>
    </div>
  </section>
</template>

