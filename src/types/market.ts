export type Company = 'Google' | 'OpenAI' | 'Anthropic' | 'Mistral' | 'Meta' | 'Other'

export type Capability = 'Multimodal' | 'Coding' | 'Reasoning' | 'Creative' | 'Analysis' | 'Legal'

export type TeamSegment =
  | 'Software Engineering'
  | 'Data Analytics'
  | 'Creative Arts'
  | 'Legal'
  | 'Other'

export interface AIModel {
  id: string
  name: string
  company: Company
  launchedDate: string
  capabilities: Capability[]
  limitations: {
    contextWindow?: number
    latency?: string
    computeCost?: string
  }
  popularityScore: number
  isNew?: boolean
}

export interface TeamUsage {
  team: TeamSegment
  percentage: number
  models: string[]
}

export interface LiveMetrics {
  modelCount: number
  totalUsers: number
  lastUpdated: string
}

export interface MarketState {
  models: AIModel[]
  popularModels: AIModel[]
  teamUsage: TeamUsage[]
  liveMetrics: LiveMetrics
  filterCompany: Company | null
  filterCapability: Capability | null
  newLaunchToast: { visible: boolean; modelName: string }
}
