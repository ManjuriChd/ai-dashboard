<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import MetricCards from '@/components/MetricCards.vue'
import PopularModels from '@/components/PopularModels.vue'
import UsageByTeam from '@/components/UsageByTeam.vue'
import IndustryImpact from '@/components/IndustryImpact.vue'
import ModelExplorer from '@/components/ModelExplorer.vue'
import NewLaunchToast from '@/components/NewLaunchToast.vue'
import { useMarketStore } from '@/store/marketStore'

const store = useMarketStore()

onMounted(() => {
  store.startLiveStream()
})
onUnmounted(() => {
  store.stopLiveStream()
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
      <div class="mx-auto max-w-7xl space-y-6">
        <MetricCards />
        <PopularModels />
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div class="xl:col-span-2">
            <UsageByTeam />
          </div>
          <div class="xl:col-span-1">
            <!-- Company / capability filter card can sit here or in ModelExplorer -->
          </div>
        </div>
        <IndustryImpact />
        <ModelExplorer />
      </div>
    </main>
  </div>
  <NewLaunchToast
    v-if="store.newLaunchToast.visible"
    :model-name="store.newLaunchToast.modelName"
    @dismiss="store.dismissToast"
  />
</template>
