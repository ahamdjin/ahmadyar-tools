export type TeamProfile = 'business' | 'automation' | 'developer' | 'mixed'
export type MaintenanceCapacity = 'low' | 'medium' | 'high'
export type ProcessStability = 'changing' | 'mostly-stable' | 'stable'
export type IntegrationNeed = 'standard' | 'broad' | 'custom'
export type BranchingNeed = 'none' | 'simple' | 'advanced'
export type FailureImpact = 'low' | 'medium' | 'high' | 'critical'
export type SelfHostingNeed = 'none' | 'preferred' | 'required'
export type Priority = 'ease' | 'speed' | 'cost' | 'reliability' | 'control' | 'scale'
export type PlatformId = 'crm-native' | 'zapier' | 'make' | 'n8n' | 'power-automate' | 'activepieces' | 'custom-code'
export type ArchitectureKind = 'native-automation' | 'integration-automation' | 'orchestration' | 'human-in-the-loop' | 'data-pipeline' | 'application'

export type AssessmentInput = {
  currentWorkflows: number
  futureWorkflows: number
  monthlyRuns: number
  appsPerWorkflow: number
  typicalSteps: number
  team: TeamProfile
  maintenance: MaintenanceCapacity
  processStability: ProcessStability
  integrationNeed: IntegrationNeed
  branching: BranchingNeed
  loopsOrBatching: boolean
  humanApprovals: boolean
  customApi: boolean
  aiSteps: boolean
  filesOrDocuments: boolean
  databaseWork: boolean
  realtime: boolean
  crmCentered: boolean
  microsoftFirst: boolean
  failureImpact: FailureImpact
  duplicateUnsafe: boolean
  retriesRequired: boolean
  sensitiveData: boolean
  selfHosting: SelfHostingNeed
  governance: boolean
  productLogic: boolean
  priorities: Priority[]
}

export type DimensionScores = {
  ownership: number
  simplicity: number
  integration: number
  complexity: number
  scale: number
  reliability: number
  control: number
  ecosystem: number
}

export type PlatformResult = {
  id: PlatformId
  name: string
  score: number
  eligible: boolean
  dimensions: DimensionScores
  reasons: string[]
  cautions: string[]
}

export type ArchitectureMetrics = {
  automationPotential: number
  complexity: number
  scale: number
  reliabilityRisk: number
  maintenanceBurden: number
  confidence: number
}

export type ArchitectureAdvice = {
  kind: ArchitectureKind
  kindLabel: string
  primary: PlatformResult
  alternatives: PlatformResult[]
  platformMix: PlatformId[]
  metrics: ArchitectureMetrics
  summary: string
  keepNative: string[]
  orchestrationResponsibilities: string[]
  safeguards: string[]
  humanCheckpoints: string[]
  nextQuestions: string[]
  ranking: PlatformResult[]
}
