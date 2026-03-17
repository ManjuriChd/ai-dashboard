/**
 * Live data stream: real WebSocket connection with fallback to polling.
 * Connect to ws://localhost:3001 (or VITE_WS_URL) when server is running;
 * otherwise falls back to simulated polling updates every 5–10 seconds.
 */

import type { AIModel, TeamUsage, LiveMetrics } from '@/types/market'

const POLL_INTERVAL_MIN = 5000
const POLL_INTERVAL_MAX = 10000

const WS_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL
  ? import.meta.env.VITE_WS_URL
  : 'ws://localhost:3001'

const SEED_MODELS: Omit<AIModel, 'isNew'>[] = [
  { id: 'g3', name: 'Gemini 3', company: 'Google', launchedDate: '2026-01-15', capabilities: ['Multimodal', 'Coding', 'Reasoning'], limitations: { contextWindow: 1_000_000, latency: '~200ms', computeCost: 'Medium' }, popularityScore: 94 },
  { id: 'gpt5', name: 'GPT-5', company: 'OpenAI', launchedDate: '2025-11-20', capabilities: ['Multimodal', 'Coding', 'Reasoning', 'Creative'], limitations: { contextWindow: 512_000, latency: '~150ms', computeCost: 'High' }, popularityScore: 98 },
  { id: 'claude4', name: 'Claude 4', company: 'Anthropic', launchedDate: '2026-02-01', capabilities: ['Multimodal', 'Reasoning', 'Legal', 'Analysis'], limitations: { contextWindow: 200_000, latency: '~180ms', computeCost: 'Medium' }, popularityScore: 92 },
  { id: 'mistral-xl', name: 'Mistral XL', company: 'Mistral', launchedDate: '2025-12-10', capabilities: ['Coding', 'Reasoning'], limitations: { contextWindow: 128_000, latency: '~220ms', computeCost: 'Low' }, popularityScore: 78 },
  { id: 'llama-4', name: 'Llama 4', company: 'Meta', launchedDate: '2026-01-05', capabilities: ['Multimodal', 'Coding', 'Creative'], limitations: { contextWindow: 256_000, latency: '~190ms', computeCost: 'Low' }, popularityScore: 85 },
  { id: 'gemini-2', name: 'Gemini 2 Pro', company: 'Google', launchedDate: '2025-09-01', capabilities: ['Multimodal', 'Coding'], limitations: { contextWindow: 1_000_000, latency: '~250ms', computeCost: 'Medium' }, popularityScore: 88 },
  { id: 'o1', name: 'o1', company: 'OpenAI', launchedDate: '2025-07-01', capabilities: ['Reasoning', 'Analysis'], limitations: { contextWindow: 200_000, latency: '~500ms', computeCost: 'High' }, popularityScore: 90 },
  { id: 'claude-3.5', name: 'Claude 3.5 Sonnet', company: 'Anthropic', launchedDate: '2025-06-01', capabilities: ['Coding', 'Creative', 'Analysis'], limitations: { contextWindow: 200_000, latency: '~200ms', computeCost: 'Medium' }, popularityScore: 87 },
]

const POTENTIAL_NEW_MODELS: Omit<AIModel, 'isNew'>[] = [
  { id: 'grok-3', name: 'Grok 3', company: 'Other', launchedDate: '2026-03-01', capabilities: ['Reasoning', 'Analysis'], limitations: { contextWindow: 100_000, latency: '~300ms', computeCost: 'High' }, popularityScore: 72 },
  { id: 'deepseek-r1', name: 'DeepSeek R1', company: 'Other', launchedDate: '2026-02-15', capabilities: ['Coding', 'Reasoning'], limitations: { contextWindow: 64_000, latency: '~400ms', computeCost: 'Low' }, popularityScore: 75 },
  { id: 'codestral-2', name: 'Codestral 2', company: 'Mistral', launchedDate: '2026-03-10', capabilities: ['Coding'], limitations: { contextWindow: 32_000, latency: '~120ms', computeCost: 'Low' }, popularityScore: 80 },
]

let allModelsCache: AIModel[] = [...SEED_MODELS.map(m => ({ ...m, isNew: false }))]
let nextNewModelIndex = 0

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function perturbMetrics(current: LiveMetrics): LiveMetrics {
  const modelDelta = randomBetween(-2, 5)
  const userDelta = randomBetween(500, 5000)
  return {
    modelCount: Math.max(12, current.modelCount + modelDelta),
    totalUsers: Math.max(100_000, current.totalUsers + userDelta),
    lastUpdated: new Date().toISOString(),
  }
}

function perturbTeamUsage(current: TeamUsage[]): TeamUsage[] {
  return current.map(t => ({
    ...t,
    percentage: Math.max(5, Math.min(45, t.percentage + randomBetween(-3, 3))),
  })).map(t => ({ ...t, percentage: Math.round(t.percentage) }))
}

function getNextPollInterval(): number {
  return randomBetween(POLL_INTERVAL_MIN, POLL_INTERVAL_MAX)
}

export type DataStreamCallbacks = {
  onMetrics: (metrics: LiveMetrics) => void
  onTeamUsage: (usage: TeamUsage[]) => void
  onModels: (models: AIModel[]) => void
  onNewLaunch?: (model: AIModel) => void
}

const DEFAULT_TEAM_USAGE: TeamUsage[] = [
  { team: 'Software Engineering', percentage: 34, models: ['GPT-5', 'Claude 4', 'Gemini 3'] },
  { team: 'Data Analytics', percentage: 26, models: ['Gemini 3', 'o1', 'Claude 4'] },
  { team: 'Creative Arts', percentage: 20, models: ['GPT-5', 'Claude 4', 'Llama 4'] },
  { team: 'Legal', percentage: 12, models: ['Claude 4', 'GPT-5'] },
  { team: 'Other', percentage: 8, models: ['Gemini 2 Pro', 'Mistral XL'] },
]

let teamUsageState = DEFAULT_TEAM_USAGE.map(u => ({ ...u }))
let metricsState: LiveMetrics = {
  modelCount: 18,
  totalUsers: 1247500,
  lastUpdated: new Date().toISOString(),
}

export function getInitialModels(): AIModel[] {
  return allModelsCache.map(m => ({ ...m }))
}

export function getInitialMetrics(): LiveMetrics {
  return { ...metricsState }
}

export function getInitialTeamUsage(): TeamUsage[] {
  return teamUsageState.map(u => ({ ...u }))
}

/** Fallback: polling-based updates when WebSocket is unavailable */
function startPolling(callbacks: DataStreamCallbacks): () => void {
  let timeoutId: ReturnType<typeof setTimeout>
  let launchCooldown = false

  function tick() {
    metricsState = perturbMetrics(metricsState)
    callbacks.onMetrics({ ...metricsState })

    teamUsageState = perturbTeamUsage(teamUsageState)
    callbacks.onTeamUsage(teamUsageState.map(u => ({ ...u })))

    const shouldInjectNew = !launchCooldown && POTENTIAL_NEW_MODELS.length > 0 && Math.random() < 0.25
    if (shouldInjectNew && nextNewModelIndex < POTENTIAL_NEW_MODELS.length) {
      const newModel: AIModel = {
        ...POTENTIAL_NEW_MODELS[nextNewModelIndex],
        isNew: true,
      }
      nextNewModelIndex += 1
      allModelsCache = [newModel, ...allModelsCache]
      callbacks.onModels([...allModelsCache])
      callbacks.onNewLaunch?.(newModel)
      launchCooldown = true
      setTimeout(() => { launchCooldown = false }, 60000)
    } else {
      allModelsCache = allModelsCache.map(m => ({
        ...m,
        popularityScore: Math.max(50, Math.min(99, m.popularityScore + randomBetween(-2, 2))),
        isNew: false,
      }))
      callbacks.onModels([...allModelsCache])
    }

    timeoutId = setTimeout(tick, getNextPollInterval())
  }

  timeoutId = setTimeout(tick, getNextPollInterval())
  return () => clearTimeout(timeoutId)
}

/** Start live stream: WebSocket with fallback to polling */
export function startDataStream(callbacks: DataStreamCallbacks): () => void {
  let stopPolling: (() => void) | null = null
  let ws: WebSocket | null = null
  let closed = false

  function cleanup() {
    if (stopPolling) {
      stopPolling()
      stopPolling = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
  }

  try {
    ws = new WebSocket(WS_URL)
  } catch {
    stopPolling = startPolling(callbacks)
    return cleanup
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data as string) as { type: string; payload?: unknown }
      if (msg.type === 'init' && msg.payload && typeof msg.payload === 'object') {
        const p = msg.payload as { metrics?: LiveMetrics; teamUsage?: TeamUsage[]; models?: AIModel[] }
        if (p.metrics) callbacks.onMetrics(p.metrics)
        if (p.teamUsage) callbacks.onTeamUsage(p.teamUsage)
        if (p.models) callbacks.onModels(p.models)
      } else if (msg.type === 'update' && msg.payload && typeof msg.payload === 'object') {
        const p = msg.payload as { metrics?: LiveMetrics; teamUsage?: TeamUsage[]; models?: AIModel[] }
        if (p.metrics) callbacks.onMetrics(p.metrics)
        if (p.teamUsage) callbacks.onTeamUsage(p.teamUsage)
        if (p.models) callbacks.onModels(p.models)
      } else if (msg.type === 'newLaunch' && msg.payload && typeof msg.payload === 'object') {
        const p = msg.payload as { model?: AIModel }
        if (p.model) callbacks.onNewLaunch?.(p.model)
      }
    } catch {
      // ignore parse errors
    }
  }

  ws.onclose = () => {
    if (closed) return
    ws = null
    stopPolling = startPolling(callbacks)
  }

  ws.onerror = () => {
    if (ws) ws.close()
  }

  return () => {
    closed = true
    cleanup()
  }
}
