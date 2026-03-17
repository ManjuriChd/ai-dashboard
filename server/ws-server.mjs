/**
 * Mock WebSocket server for the AI Market Intelligence Dashboard.
 * Sends live metrics, team usage, and model list updates; can simulate new model launches.
 * Run: node server/ws-server.mjs
 * Default: ws://localhost:3001
 */

import { WebSocketServer } from 'ws'

const PORT = Number(process.env.WS_PORT) || 3001
const POLL_INTERVAL_MIN = 5000
const POLL_INTERVAL_MAX = 10000

const SEED_MODELS = [
  { id: 'g3', name: 'Gemini 3', company: 'Google', launchedDate: '2026-01-15', capabilities: ['Multimodal', 'Coding', 'Reasoning'], limitations: { contextWindow: 1_000_000, latency: '~200ms', computeCost: 'Medium' }, popularityScore: 94 },
  { id: 'gpt5', name: 'GPT-5', company: 'OpenAI', launchedDate: '2025-11-20', capabilities: ['Multimodal', 'Coding', 'Reasoning', 'Creative'], limitations: { contextWindow: 512_000, latency: '~150ms', computeCost: 'High' }, popularityScore: 98 },
  { id: 'claude4', name: 'Claude 4', company: 'Anthropic', launchedDate: '2026-02-01', capabilities: ['Multimodal', 'Reasoning', 'Legal', 'Analysis'], limitations: { contextWindow: 200_000, latency: '~180ms', computeCost: 'Medium' }, popularityScore: 92 },
  { id: 'mistral-xl', name: 'Mistral XL', company: 'Mistral', launchedDate: '2025-12-10', capabilities: ['Coding', 'Reasoning'], limitations: { contextWindow: 128_000, latency: '~220ms', computeCost: 'Low' }, popularityScore: 78 },
  { id: 'llama-4', name: 'Llama 4', company: 'Meta', launchedDate: '2026-01-05', capabilities: ['Multimodal', 'Coding', 'Creative'], limitations: { contextWindow: 256_000, latency: '~190ms', computeCost: 'Low' }, popularityScore: 85 },
  { id: 'gemini-2', name: 'Gemini 2 Pro', company: 'Google', launchedDate: '2025-09-01', capabilities: ['Multimodal', 'Coding'], limitations: { contextWindow: 1_000_000, latency: '~250ms', computeCost: 'Medium' }, popularityScore: 88 },
  { id: 'o1', name: 'o1', company: 'OpenAI', launchedDate: '2025-07-01', capabilities: ['Reasoning', 'Analysis'], limitations: { contextWindow: 200_000, latency: '~500ms', computeCost: 'High' }, popularityScore: 90 },
  { id: 'claude-3.5', name: 'Claude 3.5 Sonnet', company: 'Anthropic', launchedDate: '2025-06-01', capabilities: ['Coding', 'Creative', 'Analysis'], limitations: { contextWindow: 200_000, latency: '~200ms', computeCost: 'Medium' }, popularityScore: 87 },
]

const POTENTIAL_NEW_MODELS = [
  { id: 'grok-3', name: 'Grok 3', company: 'Other', launchedDate: '2026-03-01', capabilities: ['Reasoning', 'Analysis'], limitations: { contextWindow: 100_000, latency: '~300ms', computeCost: 'High' }, popularityScore: 72 },
  { id: 'deepseek-r1', name: 'DeepSeek R1', company: 'Other', launchedDate: '2026-02-15', capabilities: ['Coding', 'Reasoning'], limitations: { contextWindow: 64_000, latency: '~400ms', computeCost: 'Low' }, popularityScore: 75 },
  { id: 'codestral-2', name: 'Codestral 2', company: 'Mistral', launchedDate: '2026-03-10', capabilities: ['Coding'], limitations: { contextWindow: 32_000, latency: '~120ms', computeCost: 'Low' }, popularityScore: 80 },
]

const DEFAULT_TEAM_USAGE = [
  { team: 'Software Engineering', percentage: 34, models: ['GPT-5', 'Claude 4', 'Gemini 3'] },
  { team: 'Data Analytics', percentage: 26, models: ['Gemini 3', 'o1', 'Claude 4'] },
  { team: 'Creative Arts', percentage: 20, models: ['GPT-5', 'Claude 4', 'Llama 4'] },
  { team: 'Legal', percentage: 12, models: ['Claude 4', 'GPT-5'] },
  { team: 'Other', percentage: 8, models: ['Gemini 2 Pro', 'Mistral XL'] },
]

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

let allModelsCache = SEED_MODELS.map((m) => ({ ...m, isNew: false }))
let nextNewModelIndex = 0
let teamUsageState = DEFAULT_TEAM_USAGE.map((u) => ({ ...u }))
let metricsState = {
  modelCount: 18,
  totalUsers: 1247500,
  lastUpdated: new Date().toISOString(),
}

function perturbMetrics() {
  const modelDelta = randomBetween(-2, 5)
  const userDelta = randomBetween(500, 5000)
  metricsState = {
    modelCount: Math.max(12, metricsState.modelCount + modelDelta),
    totalUsers: Math.max(100_000, metricsState.totalUsers + userDelta),
    lastUpdated: new Date().toISOString(),
  }
}

function perturbTeamUsage() {
  teamUsageState = teamUsageState
    .map((t) => ({
      ...t,
      percentage: Math.max(5, Math.min(45, t.percentage + randomBetween(-3, 3))),
    }))
    .map((t) => ({ ...t, percentage: Math.round(t.percentage) }))
}

function scheduleNext() {
  return randomBetween(POLL_INTERVAL_MIN, POLL_INTERVAL_MAX)
}

function broadcast(wss, payload) {
  const data = JSON.stringify(payload)
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(data)
  })
}

const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (ws) => {
  // Send full state on connect
  ws.send(
    JSON.stringify({
      type: 'init',
      payload: {
        metrics: { ...metricsState },
        teamUsage: teamUsageState.map((u) => ({ ...u })),
        models: allModelsCache.map((m) => ({ ...m })),
      },
    })
  )
})

function tick() {
  perturbMetrics()
  perturbTeamUsage()

  const shouldInjectNew =
    POTENTIAL_NEW_MODELS.length > 0 &&
    nextNewModelIndex < POTENTIAL_NEW_MODELS.length &&
    Math.random() < 0.25

  if (shouldInjectNew) {
    const newModel = { ...POTENTIAL_NEW_MODELS[nextNewModelIndex], isNew: true }
    nextNewModelIndex += 1
    allModelsCache = [newModel, ...allModelsCache]
    broadcast(wss, { type: 'newLaunch', payload: { model: newModel } })
  } else {
    allModelsCache = allModelsCache.map((m) => ({
      ...m,
      popularityScore: Math.max(50, Math.min(99, m.popularityScore + randomBetween(-2, 2))),
      isNew: false,
    }))
  }

  broadcast(wss, {
    type: 'update',
    payload: {
      metrics: { ...metricsState },
      teamUsage: teamUsageState.map((u) => ({ ...u })),
      models: allModelsCache.map((m) => ({ ...m })),
    },
  })

  setTimeout(tick, scheduleNext())
}

setTimeout(tick, scheduleNext())

console.log(`WebSocket server listening on ws://localhost:${PORT}`)
