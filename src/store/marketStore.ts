import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getInitialModels,
  getInitialMetrics,
  getInitialTeamUsage,
  startDataStream,
} from '@/services/dataStream'
import type { AIModel, LiveMetrics, TeamUsage } from '@/types/market'
import type { Company, Capability } from '@/types/market'

export const useMarketStore = defineStore('market', () => {
  const models = ref<AIModel[]>(getInitialModels())
  const liveMetrics = ref<LiveMetrics>(getInitialMetrics())
  const teamUsage = ref<TeamUsage[]>(getInitialTeamUsage())
  const newLaunchToast = ref<{ visible: boolean; modelName: string }>({
    visible: false,
    modelName: '',
  })
  const filterCompany = ref<Company | null>(null)
  const filterCapability = ref<Capability | null>(null)

  const popularModels = computed(() =>
    [...models.value]
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 6)
  )

  const filteredModels = computed(() => {
    let list = models.value
    if (filterCompany.value) {
      list = list.filter(m => m.company === filterCompany.value)
    }
    if (filterCapability.value) {
      list = list.filter(m => m.capabilities.includes(filterCapability.value!))
    }
    return list
  })

  function setMetrics(metrics: LiveMetrics) {
    liveMetrics.value = metrics
  }

  function setTeamUsage(usage: TeamUsage[]) {
    teamUsage.value = usage
  }

  function setModels(newModels: AIModel[]) {
    models.value = newModels
  }

  function showNewLaunchToast(modelName: string) {
    newLaunchToast.value = { visible: true, modelName }
    setTimeout(() => {
      newLaunchToast.value = { visible: false, modelName: '' }
    }, 5000)
  }

  function dismissToast() {
    newLaunchToast.value = { visible: false, modelName: '' }
  }

  function setFilterCompany(company: Company | null) {
    filterCompany.value = company
  }

  function setFilterCapability(capability: Capability | null) {
    filterCapability.value = capability
  }

  let stopStream: (() => void) | null = null

  function startLiveStream() {
    if (stopStream) return
    stopStream = startDataStream({
      onMetrics: setMetrics,
      onTeamUsage: setTeamUsage,
      onModels: setModels,
      onNewLaunch: (model) => showNewLaunchToast(model.name),
    })
  }

  function stopLiveStream() {
    if (stopStream) {
      stopStream()
      stopStream = null
    }
  }

  return {
    models,
    liveMetrics,
    teamUsage,
    newLaunchToast,
    filterCompany,
    filterCapability,
    popularModels,
    filteredModels,
    setMetrics,
    setTeamUsage,
    setModels,
    showNewLaunchToast,
    dismissToast,
    setFilterCompany,
    setFilterCapability,
    startLiveStream,
    stopLiveStream,
  }
})
