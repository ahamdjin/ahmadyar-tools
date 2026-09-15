import { decisionPolicy } from './decision-policy'
import { inferEnvironment, type DiscoveryProfile } from './discovery'
import { appAffinityBonus, getPlatformKnowledge, PRIMARY_NATIVE_PLATFORM_BY_APP } from './platform-knowledge'
import { PLATFORMS, type PlatformProfile } from './platforms'
import type {
  ArchitectureAdvice,
  ArchitectureKind,
  AssessmentInput,
  DimensionScores,
  PlatformId,
  PlatformResult,
  PortfolioLane,
  Priority,
} from './types'

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 70

const impactValue = { low: 20, medium: 46, high: 76, critical: 100 } as const
const stabilityValue = { changing: 34, 'mostly-stable': 72, stable: 100 } as const
const branchingValue = { none: 0, simple: 34, advanced: 86 } as const
const ownerCapability = { none: 14, 'power-user': 38, 'automation-specialist': 72, developer: 100 } as const
const budgetCapacity = { 'under-100': 1, '100-300': 2, '300-1000': 3, '1000-5000': 4, flexible: 5 } as const
const portfolioBase = { 'mostly-simple': 22, mixed: 46, advanced: 72, 'product-like': 92 } as const

type ScoredPlatform = PlatformResult & { decisionScore: number }

function workflowComplexity(input: AssessmentInput, discovery: DiscoveryProfile) {
  let score = portfolioBase[input.portfolioShape] * 0.44
  score += Math.min(22, input.typicalSteps * 1.35)
  score += branchingValue[input.branching] * 0.18
  score += Math.min(12, Math.max(0, input.appsPerWorkflow - 2) * 1.8)
  score += discovery.apiPressure * 0.12
  if (input.loopsOrBatching) score += 8
  if (input.durableJobs) score += 7
  if (input.customApi) score += 10
  if (input.aiSteps) score += 6
  if (input.humanApprovals) score += 4
  if (input.databaseWork) score += 8
  if (input.realtime) score += 7
  if (input.productLogic) score += 20
  return Math.round(clamp(score))
}

function scaleScore(input: AssessmentInput, discovery: DiscoveryProfile) {
  const runScore = Math.min(42, Math.log10(Math.max(10, input.monthlyRuns)) * 10.5)
  const portfolioScore = Math.min(32, input.futureWorkflows * 0.58)
  const systemScore = Math.min(14, (discovery.knownApps + discovery.unknownSystems) * 1.5)
  const departmentScore = Math.min(12, Math.max(0, input.departments - 1) * 3)
  return Math.round(clamp(runScore + portfolioScore + systemScore + departmentScore))
}

function reliabilityRisk(input: AssessmentInput, discovery: DiscoveryProfile) {
  let score = impactValue[input.failureImpact] * 0.56
  if (input.duplicateUnsafe) score += 14
  if (input.retriesRequired) score += 8
  if (input.durableJobs) score += 4
  if (input.realtime) score += 6
  if (input.sensitiveData) score += 8
  if (discovery.apps.some((app) => app.category === 'finance' || app.category === 'erp')) score += 5
  return Math.round(clamp(score))
}

function classifyArchitecture(input: AssessmentInput, discovery: DiscoveryProfile, complexity: number, scale: number): ArchitectureKind {
  const crmCentered = input.crmCentered || discovery.crmCenteredSignal
  const explicitNative = discovery.primarySystem ? PRIMARY_NATIVE_PLATFORM_BY_APP[discovery.primarySystem.id] : undefined
  if (input.productLogic || input.portfolioShape === 'product-like' || (input.failureImpact === 'critical' && input.databaseWork && input.realtime && complexity >= 74)) return 'application'
  if (input.humanApprovals && (input.aiSteps || input.filesOrDocuments || input.failureImpact === 'high' || input.failureImpact === 'critical')) return 'human-in-the-loop'
  if (input.databaseWork && (input.loopsOrBatching || discovery.categoryCounts.has('data')) && input.monthlyRuns >= 25_000 && scale >= 68) return 'data-pipeline'
  if ((crmCentered || explicitNative) && input.appsPerWorkflow <= 3 && complexity < 45 && discovery.unknownSystems <= 1) return 'native-automation'
  if (complexity >= 62 || input.customApi || discovery.apiPressure >= 48 || input.branching === 'advanced' || input.durableJobs) return 'orchestration'
  return 'integration-automation'
}

function kindLabel(kind: ArchitectureKind) {
  return {
    'native-automation': 'Native automation',
    'integration-automation': 'Integration automation',
    orchestration: 'Workflow orchestration',
    'human-in-the-loop': 'Human-in-the-loop system',
    'data-pipeline': 'Automation data pipeline',
    application: 'Application / product infrastructure',
  }[kind]
}

function priorityWeight(priorities: Priority[], priority: Priority) {
  return priorities.includes(priority) ? 1.4 : 1
}

function supportForApp(platform: PlatformProfile, app: DiscoveryProfile['apps'][number]) {
  const categoryFit = platform.categoryFit[app.category] ?? platform.standardIntegrationBreadth
  if (app.connectivity === 'microsoft') return Math.round(categoryFit * 0.42 + platform.microsoftFit * 0.58)
  if (app.connectivity === 'api-first') return Math.round(categoryFit * 0.42 + platform.customApiFit * 0.58)
  if (app.connectivity === 'enterprise') return Math.round(categoryFit * 0.4 + platform.customApiFit * 0.25 + platform.governanceFit * 0.35)
  if (app.connectivity === 'limited') return Math.round(categoryFit * 0.5 + platform.standardIntegrationBreadth * 0.25 + platform.customApiFit * 0.25)
  if (app.connectivity === 'native-heavy' && app.category === 'crm') return Math.round(categoryFit * 0.5 + platform.crmNativeFit * 0.5)
  return Math.round(categoryFit * 0.58 + platform.standardIntegrationBreadth * 0.42)
}

function ownershipFit(platform: PlatformProfile, input: AssessmentInput) {
  const capability = ownerCapability[input.technicalOwner]
  const gap = platform.technicalRequirement - capability
  if (gap <= 0) return Math.round(clamp(96 - Math.abs(gap) * 0.08))
  return Math.round(clamp(96 - gap * 1.2))
}

function economicsFit(platform: PlatformProfile, input: AssessmentInput, discovery: DiscoveryProfile) {
  const capacity = budgetCapacity[input.budget]
  const budgetGap = Math.max(0, platform.budgetFloor - capacity)
  const budgetFit = budgetGap === 0 ? 96 : Math.max(18, 92 - budgetGap * 28)
  let fit = platform.volumeEconomics[discovery.workloadBand] * 0.64 + budgetFit * 0.36
  if ((platform.id === 'n8n-self-hosted' || platform.id === 'activepieces' || platform.id === 'trigger-dev') && input.selfHosting === 'required' && input.technicalOwner === 'none') fit -= 28
  if (platform.id === 'n8n-self-hosted' && input.maintenance === 'low') fit -= 18
  if (platform.id === 'custom-code' && input.technicalOwner !== 'developer') fit -= 28
  return Math.round(clamp(fit))
}

function dynamicPlatformName(platform: PlatformProfile, discovery: DiscoveryProfile) {
  if (platform.id === 'crm-native' && discovery.primarySystem?.category === 'crm') return `${discovery.primarySystem.name} native automation`
  return platform.name
}

function scorePlatform(platform: PlatformProfile, input: AssessmentInput, discovery: DiscoveryProfile, complexity: number, scale: number, risk: number): ScoredPlatform {
  let eligible = true
  const reasons: string[] = []
  const cautions: string[] = []
  const knowledge = getPlatformKnowledge(platform.id)
  const effectiveCrmCentered = input.crmCentered || discovery.crmCenteredSignal
  const effectiveMicrosoftFirst = input.microsoftFirst || discovery.microsoftFirstSignal
  const capacity = budgetCapacity[input.budget]
  const primaryId = discovery.primarySystem?.id

  if (input.selfHosting === 'required' && platform.selfHostFit < 90) {
    eligible = false
    cautions.push('Eliminated because self-hosting is a hard requirement.')
  }
  if (platform.procurement === 'enterprise' && capacity < 4) {
    eligible = false
    cautions.push('Eliminated because the selected budget does not match an enterprise integration-platform procurement model.')
  }
  if (platform.id === 'mulesoft' && capacity < 5) {
    eligible = false
    cautions.push('MuleSoft only enters the shortlist when enterprise API-platform investment is realistically on the table.')
  }

  const knownSupport = average(discovery.apps.map((app) => supportForApp(platform, app)))
  const unknownShare = discovery.unknownSystems / Math.max(1, discovery.knownApps + discovery.unknownSystems)
  const supportFit = Math.round(clamp(knownSupport * (1 - unknownShare * 0.6) + platform.customApiFit * unknownShare * 0.6))
  const ownerFit = Math.round((ownershipFit(platform, input) * 0.72) + (platform.teamFit[input.team] * 0.28))
  const simplicityFit = complexity < 46 ? platform.simpleWorkflowFit : Math.round(platform.simpleWorkflowFit * 0.28 + platform.complexWorkflowFit * 0.72)
  const complexityFit = complexity < 42
    ? Math.round(platform.simpleWorkflowFit * 0.86 + (100 - Math.abs(platform.technicalDepth - 28)) * 0.14)
    : Math.round(platform.complexWorkflowFit * 0.82 + (100 - Math.abs(platform.technicalDepth - complexity)) * 0.18)
  const scaleFit = Math.round(platform.scaleFit * 0.7 + platform.volumeEconomics[discovery.workloadBand] * 0.3)
  const reliabilityFit = Math.round(platform.reliabilityFit * 0.8 + (100 - Math.abs(platform.reliabilityFit - risk)) * 0.2)
  const controlFit = input.selfHosting === 'required'
    ? platform.selfHostFit
    : input.selfHosting === 'preferred'
      ? Math.round(platform.selfHostFit * 0.72 + platform.customApiFit * 0.28)
      : platform.customApiFit

  let ecosystemFit = 68
  if (effectiveCrmCentered) ecosystemFit = platform.crmNativeFit
  if (effectiveMicrosoftFirst) ecosystemFit = Math.max(ecosystemFit, platform.microsoftFit)
  const economics = economicsFit(platform, input, discovery)

  const dimensions: DimensionScores = {
    ownership: ownerFit,
    simplicity: simplicityFit,
    integration: supportFit,
    complexity: complexityFit,
    scale: scaleFit,
    reliability: reliabilityFit,
    control: controlFit,
    ecosystem: ecosystemFit,
    economics,
  }

  const weights = {
    ownership: 17 * priorityWeight(input.priorities, 'ease'),
    simplicity: (complexity < 46 ? 11 : 4) * priorityWeight(input.priorities, 'speed'),
    integration: 18,
    complexity: 17,
    scale: 11 * priorityWeight(input.priorities, 'scale'),
    reliability: 11 * priorityWeight(input.priorities, 'reliability'),
    control: 7 * priorityWeight(input.priorities, 'control'),
    ecosystem: 10,
    economics: 11 * priorityWeight(input.priorities, 'cost'),
  }

  let numerator = 0
  let denominator = 0
  for (const [key, fit] of Object.entries(dimensions) as Array<[keyof DimensionScores, number]>) {
    numerator += fit * weights[key]
    denominator += weights[key]
  }
  let score = numerator / denominator

  const affinity = appAffinityBonus(platform.id, input.selectedApps)
  if (affinity > 0) {
    score += affinity
    if (affinity >= 4) reasons.push('Several systems in your stack are a natural fit for this platform’s operating model.')
  }

  const existingPlatformIds = new Set(discovery.automationApps.map((app) => app.id))
  const existingMatch =
    (platform.id === 'zapier' && existingPlatformIds.has('zapier')) ||
    (platform.id === 'make' && existingPlatformIds.has('make')) ||
    ((platform.id === 'n8n-cloud' || platform.id === 'n8n-self-hosted') && existingPlatformIds.has('n8n')) ||
    (platform.id === 'power-automate' && existingPlatformIds.has('power-automate')) ||
    (platform.id === 'activepieces' && existingPlatformIds.has('activepieces')) ||
    (platform.id === 'pipedream' && existingPlatformIds.has('pipedream')) ||
    (platform.id === 'trigger-dev' && existingPlatformIds.has('trigger-dev')) ||
    (platform.id === 'workato' && existingPlatformIds.has('workato')) ||
    (platform.id === 'tray' && existingPlatformIds.has('tray'))

  if (existingMatch) {
    score += 5
    reasons.push('You already use this platform, so switching cost and team familiarity work in its favor.')
  }
  if (platform.id === 'crm-native' && effectiveCrmCentered && complexity < 48 && input.appsPerWorkflow <= 3) {
    score += 18
    reasons.push('Most of the work can stay in the system of record, removing an unnecessary automation layer.')
  }
  if (platform.id === 'hubspot-native') {
    if (primaryId === 'hubspot' && complexity < 60 && input.appsPerWorkflow <= 4 && input.integrationNeed !== 'broad' && !input.productLogic) {
      score += 26
      reasons.push('HubSpot is the system of record and can own the CRM-centered workflow without an extra orchestration layer.')
    }
    if (input.customApi || discovery.unknownSystems >= 2 || complexity >= 68 || input.integrationNeed === 'broad') {
      score -= 14
      cautions.push('The workflow is moving beyond a HubSpot-centered boundary and may need an external orchestration layer.')
    }
  }
  if (platform.id === 'gohighlevel-native') {
    if (primaryId === 'gohighlevel' && complexity < 62 && input.appsPerWorkflow <= 4 && !input.productLogic) {
      score += 28
      reasons.push('GoHighLevel already owns the lead, messaging, appointment, opportunity, and follow-up context, so keeping this native removes avoidable infrastructure.')
    }
    if (input.customApi || discovery.unknownSystems >= 3 || complexity >= 70 || input.databaseWork) {
      score -= 13
      cautions.push('The workload is becoming a cross-system/data orchestration problem rather than mainly a HighLevel workflow problem.')
    }
  }
  if (platform.id === 'salesforce-flow') {
    if (primaryId === 'salesforce' && (input.governance || input.departments >= 2) && input.appsPerWorkflow <= 4 && discovery.enterpriseApps.length <= 2 && !input.customApi && !input.productLogic) {
      score += 24
      reasons.push('Salesforce owns the business state and the governance needs favor keeping core CRM process logic in Flow.')
    }
    if (discovery.unknownSystems >= 4 || input.customApi || (discovery.enterpriseApps.length >= 3 && input.appsPerWorkflow >= 5)) {
      score -= 12
      cautions.push('A broader integration/API layer may still be needed around Salesforce for cross-system orchestration.')
    }
  }
  if (platform.id === 'shopify-flow') {
    if (input.selectedApps.includes('shopify') && complexity < 52 && input.appsPerWorkflow <= 4 && !input.customApi && !input.productLogic) {
      score += 22
      reasons.push('The workflow is store-centered and simple enough that Shopify should own the event logic before another platform is introduced.')
    }
    if (input.databaseWork || input.customApi || complexity >= 64) {
      score -= 14
      cautions.push('The workflow has crossed beyond straightforward store-event automation.')
    }
  }
  if (platform.id === 'zapier' && (input.technicalOwner === 'none' || input.technicalOwner === 'power-user') && complexity < 58 && discovery.apiPressure < 48) {
    score += 12
    reasons.push('Common SaaS connections plus low-maintenance ownership are more important here than deep infrastructure control.')
  }
  if (platform.id === 'zapier' && (discovery.workloadBand === 'heavy' || discovery.workloadBand === 'very-heavy')) {
    score -= 11
    cautions.push('The estimated successful-action volume makes per-action economics worth comparing carefully.')
  }
  if (platform.id === 'make' && (input.branching !== 'none' || input.loopsOrBatching) && complexity >= 42 && input.technicalOwner !== 'none') {
    score += 10
    reasons.push('Visual branching and transformations fit the workflow shape without forcing a developer-only operating model.')
  }
  if (platform.id === 'n8n-cloud' && (input.customApi || discovery.apiPressure >= 45) && (input.technicalOwner === 'automation-specialist' || input.technicalOwner === 'developer')) {
    score += 13
    reasons.push('API-heavy orchestration is justified, and a technical owner is available without requiring you to run the infrastructure yourself.')
  }
  if (platform.id === 'n8n-cloud' && complexity < 42 && discovery.apiPressure < 28) {
    score -= 14
    cautions.push('This adds technical depth to a workflow portfolio that does not currently need it.')
  }
  if (platform.id === 'n8n-self-hosted') {
    if (input.selfHosting === 'required') {
      score += 18
      reasons.push('Self-hosting is mandatory and the workflow needs a deep orchestration layer.')
    } else if (input.selfHosting === 'preferred') {
      score += 9
      reasons.push('Infrastructure control is a stated preference and the team can own a more technical runtime.')
    } else {
      score -= 10
      cautions.push('Running your own automation infrastructure is extra responsibility unless control or economics clearly justify it.')
    }
    if (input.technicalOwner === 'none' || input.technicalOwner === 'power-user') {
      score -= 24
      cautions.push('Self-hosting needs a stronger technical owner for upgrades, monitoring, backups, credentials, and incident recovery.')
    }
  }
  if (platform.id === 'power-automate' && effectiveMicrosoftFirst) {
    score += 20
    reasons.push('Microsoft is an environment constraint, not just another connector, so identity, governance, and native services matter.')
  }
  if (platform.id === 'activepieces' && input.selfHosting !== 'none' && (input.technicalOwner === 'automation-specialist' || input.technicalOwner === 'developer')) {
    score += input.customApi || complexity >= 70 ? 7 : 14
    reasons.push('Open-source/self-hosting flexibility matches the ownership model without requiring the deepest developer-first runtime.')
  }
  if (platform.id === 'pipedream' && input.technicalOwner === 'developer' && discovery.apiPressure >= 42) {
    score += 14
    reasons.push('A developer owns the system and API/code-heavy event workflows are central, which fits a code-friendly execution model.')
  }
  if (platform.id === 'pipedream' && input.durableJobs) {
    score -= 7
    cautions.push('Durable long-running job orchestration is important enough that a purpose-built background-job platform deserves stronger consideration.')
  }
  if (platform.id === 'trigger-dev') {
    if (input.durableJobs && input.technicalOwner === 'developer') {
      score += 30
      reasons.push('Durable background jobs, queues, retries, or long-running tasks are core requirements and a developer owns the system.')
    }
    if (input.durableJobs && (input.aiSteps || input.realtime || input.retriesRequired)) score += 8
    if (!input.durableJobs) {
      score -= 18
      cautions.push('The workload does not currently need a dedicated durable background-job runtime.')
    }
    if (input.technicalOwner !== 'developer') {
      score -= 30
      cautions.push('Trigger.dev is developer-first and should not become a business team’s primary no-code automation platform.')
    }
  }
  if ((platform.id === 'workato' || platform.id === 'tray') && input.futureWorkflows >= 45 && input.departments >= 3 && (input.governance || input.sensitiveData)) {
    score += 14
    reasons.push('The workflow portfolio is becoming a cross-team integration program where governance and reusable platform capabilities justify enterprise tooling.')
  }
  if (platform.id === 'workato' && input.team === 'mixed' && discovery.enterpriseApps.length >= 2 && input.governance) {
    score += 12
    reasons.push('The environment spans governed business systems and a mixed team, which favors an enterprise integration operating model.')
  }
  if (platform.id === 'tray' && input.technicalOwner === 'developer' && input.customApi && input.futureWorkflows >= 50 && input.departments >= 3) {
    score += 16
    reasons.push('A technical integration team needs reusable API-led capabilities across a large workflow portfolio.')
  }
  if (platform.id === 'mulesoft' && input.futureWorkflows >= 80 && discovery.enterpriseApps.length >= 3 && input.technicalOwner === 'developer' && input.governance && (discovery.unknownSystems >= 2 || input.selectedApps.includes('sap'))) {
    score += 24
    reasons.push('This resembles an enterprise API and integration architecture problem rather than a collection of business automations.')
  }
  if (platform.id === 'custom-code' && (input.productLogic || input.portfolioShape === 'product-like')) {
    score += 30
    reasons.push('The core is becoming stateful product/application logic where owning the domain model is cleaner than stretching a workflow tool.')
  }
  if (platform.id === 'custom-code' && !input.productLogic && input.portfolioShape !== 'product-like' && complexity < 82) {
    score -= 30
    cautions.push('Custom software creates engineering ownership before the process justifies it.')
  }

  const policy = decisionPolicy(platform.id, input, discovery, complexity)
  score += policy.adjustment
  if (policy.reason) reasons.push(policy.reason)
  if (policy.caution) cautions.push(policy.caution)

  if (input.technicalOwner === 'none' && platform.technicalRequirement >= 70) cautions.push('Day-to-day ownership is substantially more technical than the team profile you selected.')
  if (input.futureWorkflows >= 40 && platform.id === 'zapier') cautions.push('At this portfolio size, standards, governance, and usage economics need closer review.')
  if (effectiveMicrosoftFirst && platform.microsoftFit < 68) cautions.push('This is not a natural first choice for a Microsoft-centered environment.')
  if (effectiveCrmCentered && platform.crmNativeFit < 58) cautions.push('It may pull logic away from the system of record without enough benefit.')
  if (discovery.unknownSystems >= 3 && platform.customApiFit < 80) cautions.push('Several unknown/internal systems increase the chance that generic API work will be required.')

  const decisionScore = eligible ? score : Math.min(score, 35)
  const displayScore = eligible
    ? Math.round(clamp(72 + (decisionScore - 72) * 0.55, 18, 98))
    : Math.round(clamp(decisionScore, 10, 35))

  return {
    id: platform.id,
    name: dynamicPlatformName(platform, discovery),
    score: displayScore,
    decisionScore,
    eligible,
    dimensions,
    reasons: reasons.slice(0, 5),
    cautions: cautions.slice(0, 5),
    strengths: knowledge.strengths,
    tradeoffs: knowledge.tradeoffs,
    winsWhen: knowledge.winsWhen,
    costPressure: Math.round(clamp(100 - economics)),
    supportFit,
  }
}

function buildSafeguards(input: AssessmentInput) {
  const items: string[] = []
  if (input.duplicateUnsafe) items.push('Use idempotency or a deduplication key before any action that must never happen twice.')
  if (input.retriesRequired) items.push('Separate retryable failures from permanent failures and send exhausted retries to a visible fallback queue.')
  if (input.durableJobs) items.push('Define queue/concurrency limits, retry policy, timeout expectations, and a replay strategy for durable background work.')
  if (input.failureImpact === 'high' || input.failureImpact === 'critical') items.push('Add failure alerts, a named owner, and a recovery path instead of silently retrying forever.')
  if (input.aiSteps) items.push('Put confidence thresholds and deterministic validation around AI output before it can trigger high-impact actions.')
  if (input.sensitiveData) items.push('Minimize sensitive fields crossing systems and review retention, permissions, logs, and data residency before launch.')
  if (input.realtime) items.push('Design for bursts, timeouts, and degraded dependencies instead of assuming every upstream service responds immediately.')
  if (input.futureWorkflows >= 30) items.push('Standardize credentials, naming, ownership, and error handling before the workflow portfolio becomes hard to govern.')
  return items.length ? items : ['Keep visible execution history and a simple manual recovery path for failed runs.']
}

function architectureSummary(kind: ArchitectureKind, primary: PlatformResult, discovery: DiscoveryProfile) {
  if (kind === 'native-automation') return `Keep the center of gravity in ${discovery.primarySystem?.name ?? 'the system of record'}. ${primary.name} is the cleanest first choice because another automation layer would add more maintenance than capability right now.`
  if (kind === 'application') return `Treat the core as software architecture, not one giant workflow. ${primary.name} should own stateful or transactional logic; automation platforms can still handle replaceable integrations around the edges.`
  if (kind === 'human-in-the-loop') return `Automate preparation, routing, and repetitive work, but preserve explicit human approval around decisions where mistakes, money, sensitive data, or uncertain AI output matter.`
  if (kind === 'data-pipeline') return `Design this as a repeatable data-processing system with batching, checkpoints, replay, and monitoring. ${primary.name} is the strongest current fit for the orchestration layer.`
  if (kind === 'orchestration') return `${primary.name} is the strongest orchestration fit for the systems and workflow shape you described. Keep systems of record native and use the orchestration layer for cross-system logic, APIs, transformations, durable work, and recovery.`
  return `${primary.name} is the strongest starting point for this integration workload. Keep the architecture simple until branching, scale, APIs, or governance genuinely require another layer.`
}

function bestEligible(ranking: PlatformResult[], ids: PlatformId[]) {
  return ranking.find((item) => item.eligible && ids.includes(item.id))
}

function buildPortfolioPlan(input: AssessmentInput, discovery: DiscoveryProfile, ranking: PlatformResult[], kind: ArchitectureKind, complexity: number): PortfolioLane[] {
  const lanes: PortfolioLane[] = []
  const native = bestEligible(ranking, ['hubspot-native', 'gohighlevel-native', 'salesforce-flow', 'shopify-flow', 'crm-native', 'power-automate'])
  const integration = bestEligible(ranking, ['zapier', 'make', 'power-automate', 'activepieces'])
  const orchestration = bestEligible(ranking, ['make', 'n8n-cloud', 'n8n-self-hosted', 'pipedream', 'trigger-dev', 'workato', 'tray', 'mulesoft', 'activepieces'])
  const application = bestEligible(ranking, ['custom-code', 'trigger-dev', 'pipedream', 'n8n-self-hosted'])

  if ((input.crmCentered || discovery.crmCenteredSignal || input.portfolioShape === 'mostly-simple' || Boolean(discovery.primarySystem && PRIMARY_NATIVE_PLATFORM_BY_APP[discovery.primarySystem.id])) && native) {
    lanes.push({
      id: 'native',
      label: 'Simple / native workflows',
      platform: native.id,
      platformName: native.name,
      purpose: 'Keep lifecycle actions, simple routing, notifications, and record updates close to the system that owns the data.',
      useWhen: 'One main system can do the job without complex cross-system logic.',
    })
  }
  if (discovery.knownApps + discovery.unknownSystems >= 2 && integration) {
    lanes.push({
      id: 'integration',
      label: 'Common app handoffs',
      platform: integration.id,
      platformName: integration.name,
      purpose: 'Handle routine SaaS-to-SaaS handoffs without giving every simple workflow a heavy orchestration layer.',
      useWhen: 'The flow is predictable, connector-led, and easy for the owning team to support.',
    })
  }
  if ((kind === 'orchestration' || kind === 'data-pipeline' || kind === 'human-in-the-loop' || complexity >= 54 || discovery.apiPressure >= 38 || input.durableJobs) && orchestration) {
    lanes.push({
      id: 'orchestration',
      label: input.durableJobs ? 'Complex / durable orchestration' : 'Complex orchestration',
      platform: orchestration.id,
      platformName: orchestration.name,
      purpose: 'Own cross-system branching, APIs, transformations, reusable logic, AI controls, queues, retries, and more complex recovery paths.',
      useWhen: 'A workflow has enough complexity or durability requirements that keeping it in a simple connector tool becomes fragile or expensive.',
    })
  }
  if ((kind === 'application' || input.productLogic || input.portfolioShape === 'product-like') && application) {
    lanes.push({
      id: 'application',
      label: 'Product / transactional core',
      platform: application.id,
      platformName: application.name,
      purpose: 'Keep persistent state, transactions, customer-facing behavior, and domain rules in software built and tested like an application.',
      useWhen: 'The workflow has crossed the boundary from automation into product or application infrastructure.',
    })
  }
  return lanes.filter((lane, index, list) => list.findIndex((candidate) => candidate.id === lane.id) === index)
}

export function analyzeArchitecture(input: AssessmentInput): ArchitectureAdvice {
  const discovery = inferEnvironment(input)
  const complexity = workflowComplexity(input, discovery)
  const scale = scaleScore(input, discovery)
  const risk = reliabilityRisk(input, discovery)
  const kind = classifyArchitecture(input, discovery, complexity, scale)
  const explicitNative = discovery.primarySystem ? PRIMARY_NATIVE_PLATFORM_BY_APP[discovery.primarySystem.id] : undefined

  const candidateProfiles = PLATFORMS.filter((platform) => {
    if (platform.requiresSelectedApp && !input.selectedApps.includes(platform.requiresSelectedApp)) return false
    if (platform.id === 'crm-native' && explicitNative) return false
    return true
  })

  const ranking = candidateProfiles
    .map((platform) => scorePlatform(platform, input, discovery, complexity, scale, risk))
    .sort((a, b) => (Number(b.eligible) - Number(a.eligible)) || b.decisionScore - a.decisionScore)

  const primary = ranking.find((item) => item.eligible) ?? ranking[0]
  const alternatives = ranking.filter((item) => item.eligible && item.id !== primary.id).slice(0, 3)
  const portfolioPlan = buildPortfolioPlan(input, discovery, ranking, kind, complexity)
  const platformMix = [...new Set([primary.id, ...portfolioPlan.map((lane) => lane.platform)])]

  const primaryProfile = candidateProfiles.find((item) => item.id === primary.id) ?? PLATFORMS.find((item) => item.id === primary.id)!
  const ownerGap = Math.max(0, primaryProfile.technicalRequirement - ownerCapability[input.technicalOwner])
  const maintenanceBurden = Math.round(clamp(ownerGap * 0.54 + input.futureWorkflows * 0.45 + complexity * 0.2 + (input.changeFrequency === 'daily' ? 12 : input.changeFrequency === 'weekly' ? 7 : 0)))
  const automationPotential = Math.round(clamp(stabilityValue[input.processStability] * 0.38 + Math.min(100, input.monthlyRuns / 150) * 0.24 + Math.min(100, input.currentWorkflows * 7) * 0.16 + (100 - Math.min(100, risk * 0.38)) * 0.22))
  const ownershipRisk = Math.round(clamp(ownerGap + Math.max(0, input.futureWorkflows - 20) * 0.6 + (input.departments > 2 ? 8 : 0)))
  const costPressure = primary.costPressure

  const margin = primary.decisionScore - (alternatives[0]?.decisionScore ?? 0)
  let confidence = 68 + Math.min(17, margin * 1.45)
  confidence += Math.min(9, discovery.knownApps * 1.2)
  confidence -= Math.min(18, discovery.unknownSystems * 3)
  if (input.selectedApps.length === 0) confidence -= 22
  if (input.processStability === 'changing') confidence -= 10
  if (primary.score < 68) confidence -= 6
  if (margin <= 3) confidence -= 9
  if (input.productLogic && input.failureImpact === 'critical') confidence -= 4
  confidence = Math.round(clamp(confidence, 38, 96))

  const keepNative: string[] = []
  if (discovery.primarySystem?.category === 'crm') keepNative.push(`${discovery.primarySystem.name}: records, ownership, pipeline state, lifecycle actions, and simple follow-up it already handles well.`)
  else if (input.crmCentered) keepNative.push('CRM records, ownership, pipeline state, and lifecycle actions that the CRM already handles well.')
  if (input.microsoftFirst || discovery.microsoftFirstSignal) keepNative.push('Microsoft-native approvals, identity, collaboration, and data actions that are easier to govern inside the Microsoft environment.')
  if (!keepNative.length) keepNative.push('Keep every system of record responsible for its own business state; do not duplicate state in the automation layer without a reason.')

  const orchestrationResponsibilities: string[] = []
  if (input.customApi || discovery.apiPressure >= 42) orchestrationResponsibilities.push('API calls, authentication, transformations, and cross-system error handling.')
  if (input.branching !== 'none') orchestrationResponsibilities.push('Cross-system branching, routing rules, and reusable decision logic.')
  if (input.aiSteps) orchestrationResponsibilities.push('AI enrichment or classification with validation, confidence thresholds, and a fallback path.')
  if (input.loopsOrBatching || input.databaseWork) orchestrationResponsibilities.push('Batching, iteration, data shaping, synchronization, and replay between systems.')
  if (input.durableJobs) orchestrationResponsibilities.push('Durable jobs, queues, concurrency control, schedules, retries, long-running work, and replayable background execution.')
  if (!orchestrationResponsibilities.length) orchestrationResponsibilities.push('Only the handoffs that genuinely cross system boundaries.')

  const humanCheckpoints: string[] = []
  if (input.humanApprovals) humanCheckpoints.push('Keep explicit approval human and make the system prepare the context needed for a fast decision.')
  if (input.aiSteps && (input.failureImpact === 'high' || input.failureImpact === 'critical')) humanCheckpoints.push('Route low-confidence AI decisions to a person instead of forcing a binary automated outcome.')
  if (input.failureImpact === 'critical') humanCheckpoints.push('Require human review for irreversible recovery actions after a critical failure.')

  const nextQuestions: string[] = []
  if (discovery.crmApps.length > 1 && !input.primarySystemId) nextQuestions.push('Which CRM is the real source of truth when records disagree?')
  if (discovery.unknownSystems > 0 && !input.unknownSystemsRequireApi) nextQuestions.push('Do the unlisted/internal systems have supported connectors, webhooks, or stable APIs?')
  if (input.futureWorkflows >= 25 && !input.governance) nextQuestions.push('Will multiple people or departments publish workflows, and who reviews high-impact changes?')
  if (input.monthlyRuns >= 20_000) nextQuestions.push('What does peak-hour traffic look like, not just the monthly average?')
  if (input.customApi) nextQuestions.push('Do the important APIs support rate limits, webhooks, idempotency, and reliable authentication?')
  if (input.durableJobs) nextQuestions.push('How long can the longest jobs run, what concurrency/backpressure is required, and which jobs must survive deploys or dependency outages?')
  if (input.sensitiveData) nextQuestions.push('Which fields are sensitive, where may they be stored, and how long may logs retain them?')
  if (input.processStability === 'changing') nextQuestions.push('Which parts of the process are still changing? Standardizing them may create more value than automating them immediately.')

  return {
    kind,
    kindLabel: kindLabel(kind),
    primary,
    alternatives,
    platformMix,
    portfolioPlan,
    usage: {
      estimatedExecutionsPerMonth: input.monthlyRuns,
      estimatedActionsPerMonth: discovery.estimatedActionsPerMonth,
      workloadBand: discovery.workloadBand,
      billingInsight: primaryProfile.billingLabel,
    },
    environment: {
      knownApps: discovery.knownApps,
      unknownSystems: discovery.unknownSystems,
      categories: discovery.categoryCount,
      primarySystemName: discovery.primarySystem?.name ?? null,
      microsoftShare: discovery.microsoftShare,
      crmCount: discovery.crmApps.length,
      existingAutomationPlatforms: discovery.automationApps.map((app) => app.name),
    },
    metrics: {
      automationPotential,
      complexity,
      scale,
      reliabilityRisk: risk,
      maintenanceBurden,
      integrationDifficulty: discovery.integrationDifficulty,
      ownershipRisk,
      costPressure,
      confidence,
    },
    summary: architectureSummary(kind, primary, discovery),
    keepNative,
    orchestrationResponsibilities,
    safeguards: buildSafeguards(input),
    humanCheckpoints,
    nextQuestions,
    ranking,
  }
}
