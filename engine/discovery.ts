import { getApps, type AppCategory, type AppDefinition } from './apps'
import type { AssessmentInput } from './types'

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

const CATEGORY_ACTION_MULTIPLIER: Partial<Record<AppCategory, number>> = {
  crm: 1.05,
  finance: 1.18,
  commerce: 1.16,
  data: 1.2,
  developer: 1.18,
  ai: 1.22,
  erp: 1.25,
}

export type DiscoveryProfile = {
  apps: AppDefinition[]
  knownApps: number
  unknownSystems: number
  categoryCounts: Map<AppCategory, number>
  categoryCount: number
  crmApps: AppDefinition[]
  microsoftApps: AppDefinition[]
  automationApps: AppDefinition[]
  apiFirstApps: AppDefinition[]
  enterpriseApps: AppDefinition[]
  primarySystem: AppDefinition | null
  microsoftShare: number
  crmCenteredSignal: boolean
  microsoftFirstSignal: boolean
  apiPressure: number
  integrationDifficulty: number
  estimatedActionsPerRun: number
  estimatedActionsPerMonth: number
  workloadBand: 'light' | 'moderate' | 'heavy' | 'very-heavy'
}

export type QuestionPlan = {
  needsPrimarySystem: boolean
  needsApiQuestion: boolean
  needsWorkflowDepth: boolean
  needsReliability: boolean
  needsGovernance: boolean
  needsDataQuestion: boolean
  needsAiQuestion: boolean
  needsApprovalQuestion: boolean
}

export function inferEnvironment(input: AssessmentInput): DiscoveryProfile {
  const apps = getApps(input.selectedApps)
  const categoryCounts = new Map<AppCategory, number>()
  for (const app of apps) categoryCounts.set(app.category, (categoryCounts.get(app.category) ?? 0) + 1)

  const crmApps = apps.filter((app) => app.category === 'crm')
  const microsoftApps = apps.filter((app) => app.vendor === 'microsoft')
  const automationApps = apps.filter((app) => app.category === 'automation')
  const apiFirstApps = apps.filter((app) => app.connectivity === 'api-first')
  const enterpriseApps = apps.filter((app) => app.connectivity === 'enterprise')
  const primarySystem = (input.primarySystemId ? apps.find((app) => app.id === input.primarySystemId) : null) ?? (crmApps.length === 1 ? crmApps[0] : null)
  const unknownSystems = Math.max(0, input.otherSystemsCount) + input.customSystems.length
  const totalSystems = Math.max(1, apps.length + unknownSystems)
  const microsoftShare = microsoftApps.length / totalSystems

  const crmCenteredSignal = Boolean(primarySystem?.category === 'crm') && totalSystems <= 7 && (categoryCounts.get('crm') ?? 0) <= 2
  const microsoftFirstSignal = microsoftShare >= 0.42 || (microsoftApps.length >= 3 && microsoftApps.length >= apps.length / 2)

  let apiPressure = unknownSystems * 8
  apiPressure += apiFirstApps.length * 3.5
  apiPressure += enterpriseApps.length * 2
  if (input.unknownSystemsRequireApi) apiPressure += 28
  if (input.customApi) apiPressure += 32
  if (input.databaseWork) apiPressure += 12
  apiPressure = clamp(apiPressure)

  let integrationDifficulty = 12
  integrationDifficulty += Math.min(28, apps.length * 2.4)
  integrationDifficulty += Math.min(20, categoryCounts.size * 2.7)
  integrationDifficulty += Math.min(26, unknownSystems * 5)
  integrationDifficulty += apiPressure * 0.28
  if (enterpriseApps.length >= 2) integrationDifficulty += 8
  if (microsoftFirstSignal) integrationDifficulty -= 5
  if (crmCenteredSignal && totalSystems <= 4) integrationDifficulty -= 10
  integrationDifficulty = Math.round(clamp(integrationDifficulty))

  const portfolioMultiplier = {
    'mostly-simple': 0.72,
    mixed: 1,
    advanced: 1.45,
    'product-like': 1.85,
  }[input.portfolioShape]
  const categoryMultiplier = apps.length
    ? apps.reduce((sum, app) => sum + (CATEGORY_ACTION_MULTIPLIER[app.category] ?? 1), 0) / apps.length
    : 1
  const estimatedActionsPerRun = Math.max(
    1,
    Math.round(Math.max(2, input.typicalSteps) * portfolioMultiplier * categoryMultiplier),
  )
  const estimatedActionsPerMonth = Math.round(Math.max(0, input.monthlyRuns) * estimatedActionsPerRun)
  const workloadBand = estimatedActionsPerMonth < 8_000
    ? 'light'
    : estimatedActionsPerMonth < 60_000
      ? 'moderate'
      : estimatedActionsPerMonth < 300_000
        ? 'heavy'
        : 'very-heavy'

  return {
    apps,
    knownApps: apps.length,
    unknownSystems,
    categoryCounts,
    categoryCount: categoryCounts.size,
    crmApps,
    microsoftApps,
    automationApps,
    apiFirstApps,
    enterpriseApps,
    primarySystem,
    microsoftShare,
    crmCenteredSignal,
    microsoftFirstSignal,
    apiPressure,
    integrationDifficulty,
    estimatedActionsPerRun,
    estimatedActionsPerMonth,
    workloadBand,
  }
}

export function getQuestionPlan(input: AssessmentInput): QuestionPlan {
  const discovery = inferEnvironment(input)
  const financialOrTransactional = discovery.apps.some((app) => app.category === 'finance' || app.category === 'commerce' || app.category === 'erp')
  const dataHeavy = discovery.apps.some((app) => app.category === 'data' || app.category === 'developer')
  const aiPresent = discovery.apps.some((app) => app.category === 'ai')
  const approvalLikely = discovery.apps.some((app) => app.category === 'finance' || app.category === 'hr' || app.category === 'erp')

  return {
    needsPrimarySystem: discovery.crmApps.length > 1 || (discovery.crmApps.length === 1 && discovery.knownApps >= 5),
    needsApiQuestion: discovery.unknownSystems > 0 || discovery.apiFirstApps.length >= 2 || dataHeavy,
    needsWorkflowDepth: discovery.integrationDifficulty >= 42 || input.futureWorkflows >= 15 || discovery.knownApps + discovery.unknownSystems >= 6,
    needsReliability: financialOrTransactional || input.monthlyRuns >= 10_000 || input.futureWorkflows >= 20 || input.portfolioShape !== 'mostly-simple',
    needsGovernance: input.futureWorkflows >= 25 || input.departments >= 3 || discovery.enterpriseApps.length >= 2,
    needsDataQuestion: dataHeavy || input.portfolioShape === 'advanced' || input.portfolioShape === 'product-like',
    needsAiQuestion: aiPresent || input.portfolioShape === 'advanced' || input.portfolioShape === 'product-like',
    needsApprovalQuestion: approvalLikely || input.departments >= 2,
  }
}
