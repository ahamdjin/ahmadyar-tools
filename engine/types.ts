export type TeamProfile = 'business' | 'automation' | 'developer' | 'mixed'
export type MaintenanceCapacity = 'low' | 'medium' | 'high'
export type ProcessStability = 'changing' | 'mostly-stable' | 'stable'
export type IntegrationNeed = 'standard' | 'broad' | 'custom'
export type BranchingNeed = 'none' | 'simple' | 'advanced'
export type FailureImpact = 'low' | 'medium' | 'high' | 'critical'
export type SelfHostingNeed = 'none' | 'preferred' | 'required'
export type Priority = 'ease' | 'speed' | 'cost' | 'reliability' | 'control' | 'scale'
export type TechnicalOwner = 'none' | 'power-user' | 'automation-specialist' | 'developer'
export type BudgetBand = 'under-100' | '100-300' | '300-1000' | '1000-5000' | 'flexible'
export type PortfolioShape = 'mostly-simple' | 'mixed' | 'advanced' | 'product-like'
export type ChangeFrequency = 'rare' | 'monthly' | 'weekly' | 'daily'
export type PlatformId =
  | 'crm-native'
  | 'hubspot-native'
  | 'gohighlevel-native'
  | 'salesforce-flow'
  | 'shopify-flow'
  | 'zapier'
  | 'make'
  | 'n8n-cloud'
  | 'n8n-self-hosted'
  | 'power-automate'
  | 'activepieces'
  | 'pipedream'
  | 'trigger-dev'
  | 'workato'
  | 'tray'
  | 'mulesoft'
  | 'custom-code'
export type ArchitectureKind = 'native-automation' | 'integration-automation' | 'orchestration' | 'human-in-the-loop' | 'data-pipeline' | 'application'

export type AssessmentInput = {
  selectedApps: string[]
  customSystems: string[]
  otherSystemsCount: number
  unknownSystemsRequireApi: boolean
  primarySystemId: string | null
  currentWorkflows: number
  futureWorkflows: number
  monthlyRuns: number
  departments: number
  portfolioShape: PortfolioShape
  technicalOwner: TechnicalOwner
  budget: BudgetBand
  changeFrequency: ChangeFrequency
  appsPerWorkflow: number
  typicalSteps: number
  team: TeamProfile
  maintenance: MaintenanceCapacity
  processStability: ProcessStability
  integrationNeed: IntegrationNeed
  branching: BranchingNeed
  loopsOrBatching: boolean
  durableJobs: boolean
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
  economics: number
}

export type PlatformResult = {
  id: PlatformId
  name: string
  score: number
  eligible: boolean
  dimensions: DimensionScores
  reasons: string[]
  cautions: string[]
  strengths: string[]
  tradeoffs: string[]
  winsWhen: string[]
  costPressure: number
  supportFit: number
}

export type ArchitectureMetrics = {
  automationPotential: number
  complexity: number
  scale: number
  reliabilityRisk: number
  maintenanceBurden: number
  integrationDifficulty: number
  ownershipRisk: number
  costPressure: number
  confidence: number
}

export type PortfolioLane = {
  id: 'native' | 'integration' | 'orchestration' | 'application'
  label: string
  platform: PlatformId
  platformName: string
  purpose: string
  useWhen: string
}

export type UsageEstimate = {
  estimatedExecutionsPerMonth: number
  estimatedActionsPerMonth: number
  workloadBand: 'light' | 'moderate' | 'heavy' | 'very-heavy'
  billingInsight: string
}

export type EnvironmentSummary = {
  knownApps: number
  unknownSystems: number
  categories: number
  primarySystemName: string | null
  microsoftShare: number
  crmCount: number
  existingAutomationPlatforms: string[]
}

export type ArchitectureAdvice = {
  kind: ArchitectureKind
  kindLabel: string
  primary: PlatformResult
  alternatives: PlatformResult[]
  platformMix: PlatformId[]
  portfolioPlan: PortfolioLane[]
  usage: UsageEstimate
  environment: EnvironmentSummary
  metrics: ArchitectureMetrics
  summary: string
  keepNative: string[]
  orchestrationResponsibilities: string[]
  safeguards: string[]
  humanCheckpoints: string[]
  nextQuestions: string[]
  ranking: PlatformResult[]
}
