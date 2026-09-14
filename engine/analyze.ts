import { PLATFORMS, type PlatformProfile } from './platforms'
import type {
  ArchitectureAdvice,
  ArchitectureKind,
  AssessmentInput,
  DimensionScores,
  PlatformResult,
  Priority,
} from './types'

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const impactValue = { low: 20, medium: 45, high: 72, critical: 100 } as const
const maintenanceValue = { low: 22, medium: 58, high: 92 } as const
const stabilityValue = { changing: 35, 'mostly-stable': 72, stable: 100 } as const
const branchingValue = { none: 0, simple: 35, advanced: 82 } as const

function workflowComplexity(input: AssessmentInput) {
  let score = Math.min(34, input.typicalSteps * 2.2)
  score += branchingValue[input.branching] * 0.22
  score += Math.min(16, Math.max(0, input.appsPerWorkflow - 2) * 2.4)
  if (input.loopsOrBatching) score += 10
  if (input.customApi) score += 12
  if (input.aiSteps) score += 7
  if (input.humanApprovals) score += 5
  if (input.databaseWork) score += 8
  if (input.realtime) score += 6
  if (input.productLogic) score += 24
  return Math.round(clamp(score))
}

function scaleScore(input: AssessmentInput) {
  const runScore = Math.min(52, Math.log10(Math.max(10, input.monthlyRuns)) * 13)
  const portfolioScore = Math.min(32, input.futureWorkflows * 0.72)
  const appScore = Math.min(16, input.appsPerWorkflow * 2)
  return Math.round(clamp(runScore + portfolioScore + appScore))
}

function reliabilityRisk(input: AssessmentInput) {
  let score = impactValue[input.failureImpact] * 0.58
  if (input.duplicateUnsafe) score += 14
  if (input.retriesRequired) score += 8
  if (input.realtime) score += 6
  if (input.sensitiveData) score += 8
  return Math.round(clamp(score))
}

function classifyArchitecture(input: AssessmentInput, complexity: number, scale: number): ArchitectureKind {
  if (input.productLogic || (input.failureImpact === 'critical' && input.databaseWork && input.realtime && complexity >= 75)) return 'application'
  if (input.humanApprovals && (input.aiSteps || input.filesOrDocuments || input.failureImpact === 'high' || input.failureImpact === 'critical')) return 'human-in-the-loop'
  if ((input.databaseWork || input.loopsOrBatching) && input.monthlyRuns >= 25000 && scale >= 72) return 'data-pipeline'
  if (input.crmCentered && input.appsPerWorkflow <= 3 && complexity < 46 && input.integrationNeed !== 'custom') return 'native-automation'
  if (complexity >= 64 || input.customApi || input.branching === 'advanced') return 'orchestration'
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
  return priorities.includes(priority) ? 1.35 : 1
}

function scorePlatform(
  platform: PlatformProfile,
  input: AssessmentInput,
  complexity: number,
  scale: number,
  risk: number,
): PlatformResult {
  let eligible = true
  const reasons: string[] = []
  const cautions: string[] = []

  if (input.selfHosting === 'required' && platform.selfHostFit < 90) {
    eligible = false
    cautions.push('Eliminated because self-hosting is a hard requirement.')
  }

  if (input.productLogic && platform.id !== 'custom-code' && platform.id !== 'n8n') {
    cautions.push('This is behaving like application logic, so a workflow-only platform may become the wrong boundary.')
  }

  const simplicityNeed = 100 - complexity
  const integrationFit = input.integrationNeed === 'custom'
    ? platform.customApiFit
    : Math.round(platform.standardIntegrationBreadth * 0.82 + platform.customApiFit * (input.customApi ? 0.18 : 0))
  const ownershipFit = platform.teamFit[input.team]
  const complexityFit = complexity < 46
    ? Math.round(platform.simpleWorkflowFit * 0.76 + (100 - Math.abs(platform.technicalDepth - Math.max(18, 100 - simplicityNeed))) * 0.24)
    : Math.round(platform.complexWorkflowFit * 0.82 + (100 - Math.abs(platform.technicalDepth - Math.max(35, complexity))) * 0.18)
  const scaleFit = Math.round(platform.scaleFit * 0.78 + (100 - Math.abs(platform.scaleFit - scale)) * 0.22)
  const reliabilityFit = Math.round(platform.reliabilityFit * 0.76 + (100 - Math.abs(platform.reliabilityFit - risk)) * 0.24)
  const controlFit = input.selfHosting === 'required'
    ? platform.selfHostFit
    : input.selfHosting === 'preferred'
      ? Math.round(platform.selfHostFit * 0.75 + platform.customApiFit * 0.25)
      : platform.customApiFit

  let ecosystemFit = 70
  if (input.crmCentered) ecosystemFit = platform.crmNativeFit
  if (input.microsoftFirst) ecosystemFit = Math.max(ecosystemFit, platform.microsoftFit)

  const dimensions: DimensionScores = {
    ownership: ownershipFit,
    simplicity: platform.simpleWorkflowFit,
    integration: integrationFit,
    complexity: complexityFit,
    scale: scaleFit,
    reliability: reliabilityFit,
    control: controlFit,
    ecosystem: ecosystemFit,
  }

  const weights: Record<keyof DimensionScores, number> = {
    ownership: 16 * priorityWeight(input.priorities, 'ease'),
    simplicity: (complexity < 46 ? 13 : 5) * priorityWeight(input.priorities, 'speed'),
    integration: 16,
    complexity: 18,
    scale: 11 * priorityWeight(input.priorities, 'scale'),
    reliability: 12 * priorityWeight(input.priorities, 'reliability'),
    control: 8 * priorityWeight(input.priorities, 'control'),
    ecosystem: 11,
  }

  let numerator = 0
  let denominator = 0
  for (const [key, fit] of Object.entries(dimensions) as Array<[keyof DimensionScores, number]>) {
    numerator += fit * weights[key]
    denominator += weights[key]
  }
  let score = numerator / denominator

  if (input.priorities.includes('cost')) score = score * 0.88 + platform.costAtScaleFit * 0.12
  if (input.governance) score = score * 0.88 + platform.governanceFit * 0.12

  if (platform.id === 'crm-native' && input.crmCentered && complexity < 50 && input.appsPerWorkflow <= 3) {
    score += 13
    reasons.push('Most of the workflow can stay inside the CRM, which removes an unnecessary automation layer.')
  }
  if (platform.id === 'zapier' && input.team === 'business' && input.integrationNeed !== 'custom' && complexity < 58) {
    score += 10
    reasons.push('The workflow is straightforward and broad connector coverage plus low-maintenance ownership matter here.')
  }
  if (platform.id === 'make' && input.branching !== 'none' && complexity >= 42 && complexity < 78 && input.team !== 'developer') {
    score += 8
    reasons.push('Visual branching and transformations fit this level of complexity without forcing a developer-first stack.')
  }
  if (platform.id === 'n8n' && (input.customApi || input.selfHosting !== 'none') && complexity >= 58 && (input.team === 'automation' || input.team === 'developer' || input.team === 'mixed')) {
    score += 10
    reasons.push('API depth and technical ownership justify a deeper orchestration layer.')
  }
  if (platform.id === 'n8n' && complexity < 45 && !input.customApi && input.selfHosting === 'none') {
    score -= 14
    cautions.push('This would add technical overhead to a workflow that does not currently need it.')
  }
  if (platform.id === 'power-automate' && input.microsoftFirst) {
    score += 16
    reasons.push('Microsoft is a core environment constraint, not just another integration.')
  }
  if (platform.id === 'activepieces' && input.selfHosting === 'required') {
    score += 9
    reasons.push('Self-hosting is mandatory, so an open-source automation layer deserves serious consideration.')
  }
  if (platform.id === 'custom-code' && input.productLogic) {
    score += 22
    reasons.push('The workflow has crossed into stateful product or application logic where full ownership can be the cleaner boundary.')
  }
  if (platform.id === 'custom-code' && !input.productLogic && complexity < 80) {
    score -= 20
    cautions.push('Custom software would create engineering ownership before the workflow justifies it.')
  }

  if (input.team === 'business' && platform.technicalDepth >= 75) cautions.push('Day-to-day ownership is more technical than the team profile you selected.')
  if (input.futureWorkflows >= 40 && platform.id === 'zapier') cautions.push('At a larger workflow portfolio, standards, governance, and usage economics need closer review.')
  if (input.integrationNeed === 'broad' && platform.standardIntegrationBreadth >= 92) reasons.push('Its connector breadth is a strong match for the number and variety of SaaS systems involved.')
  if (input.failureImpact === 'critical' && platform.reliabilityFit >= 90) reasons.push('Its architecture can support the stronger reliability controls this workflow needs.')
  if (input.microsoftFirst && platform.microsoftFit < 65) cautions.push('It is not a natural first choice for a Microsoft-first environment.')
  if (input.crmCentered && platform.crmNativeFit < 60) cautions.push('It may pull logic away from the system of record without enough benefit.')

  return {
    id: platform.id,
    name: platform.name,
    score: Math.round(clamp(eligible ? score : Math.min(score, 35))),
    eligible,
    dimensions,
    reasons: reasons.slice(0, 3),
    cautions: cautions.slice(0, 3),
  }
}

function buildSafeguards(input: AssessmentInput) {
  const items: string[] = []
  if (input.duplicateUnsafe) items.push('Use idempotency or a deduplication key before any action that must never happen twice.')
  if (input.retriesRequired) items.push('Separate retryable failures from permanent failures and send exhausted retries to a visible fallback queue.')
  if (input.failureImpact === 'high' || input.failureImpact === 'critical') items.push('Add failure alerts, an owner, and a recovery path instead of silently retrying forever.')
  if (input.aiSteps) items.push('Put confidence thresholds and deterministic validation around AI output before it can trigger high-impact actions.')
  if (input.sensitiveData) items.push('Minimize sensitive fields crossing systems and review retention, permissions, logs, and data residency before launch.')
  if (input.realtime) items.push('Design for burst handling, timeouts, and degraded dependencies instead of assuming every upstream service responds immediately.')
  return items.length ? items : ['Keep a visible execution history and a simple manual recovery path for failed runs.']
}

function architectureSummary(kind: ArchitectureKind, primary: PlatformResult) {
  if (kind === 'native-automation') return `Keep the center of gravity in the CRM. ${primary.name} is the cleanest first choice because another automation layer would add more maintenance than capability right now.`
  if (kind === 'application') return `Treat this as software architecture, not a giant workflow. ${primary.name} should own the stateful or transactional core, with automation tools used around the edges where they stay replaceable.`
  if (kind === 'human-in-the-loop') return 'Automate preparation, routing, and repetitive work, but keep explicit human approval around the decisions where mistakes are expensive or AI confidence is uncertain.'
  if (kind === 'data-pipeline') return `Design this as a repeatable data-processing system with batching, checkpoints, replay, and monitoring. ${primary.name} is the strongest current fit for the orchestration layer.`
  if (kind === 'orchestration') return `${primary.name} is the strongest orchestration fit for the workflow shape you described. Keep systems of record native and use the orchestration layer only for cross-system logic.`
  return `${primary.name} is the best starting point for this integration workload. Keep the architecture simple until branching, scale, or custom APIs genuinely require a deeper layer.`
}

export function analyzeArchitecture(input: AssessmentInput): ArchitectureAdvice {
  const complexity = workflowComplexity(input)
  const scale = scaleScore(input)
  const risk = reliabilityRisk(input)
  const kind = classifyArchitecture(input, complexity, scale)

  const ranking = PLATFORMS
    .map((platform) => scorePlatform(platform, input, complexity, scale, risk))
    .sort((a, b) => (Number(b.eligible) - Number(a.eligible)) || b.score - a.score)

  const primary = ranking.find((item) => item.eligible) ?? ranking[0]
  const alternatives = ranking.filter((item) => item.eligible && item.id !== primary.id).slice(0, 2)
  const platformMix = [primary.id]
  if (input.crmCentered && primary.id !== 'crm-native') platformMix.unshift('crm-native')
  if (kind === 'application' && primary.id !== 'custom-code') platformMix.push('custom-code')

  const technicalDepth = PLATFORMS.find((item) => item.id === primary.id)?.technicalDepth ?? 50
  const technicalMismatch = Math.max(0, technicalDepth - maintenanceValue[input.maintenance])
  const maintenanceBurden = Math.round(clamp(technicalMismatch * 0.55 + input.futureWorkflows * 0.55 + complexity * 0.22))
  const automationPotential = Math.round(clamp(
    stabilityValue[input.processStability] * 0.42 +
    (100 - Math.min(100, risk * 0.45)) * 0.18 +
    Math.min(100, input.monthlyRuns / 160) * 0.2 +
    Math.min(100, input.currentWorkflows * 7) * 0.2,
  ))

  const margin = primary.score - (alternatives[0]?.score ?? 0)
  let confidence = 72 + Math.min(16, margin * 1.5)
  if (input.processStability === 'changing') confidence -= 12
  if (primary.score < 70) confidence -= 7
  if (input.productLogic && input.failureImpact === 'critical') confidence -= 5
  confidence = Math.round(clamp(confidence, 45, 96))

  const keepNative: string[] = []
  if (input.crmCentered) keepNative.push('CRM records, ownership, pipeline state, and lifecycle actions that the CRM already handles well.')
  if (input.microsoftFirst) keepNative.push('Microsoft-native approvals, identity, and collaboration steps that are easier to govern inside the Microsoft environment.')
  if (!keepNative.length) keepNative.push('Keep each system of record responsible for its own state; do not duplicate business state in the automation layer.')

  const orchestrationResponsibilities: string[] = []
  if (input.customApi) orchestrationResponsibilities.push('Custom API calls, authentication, transformations, and cross-system error handling.')
  if (input.branching !== 'none') orchestrationResponsibilities.push('Cross-system branching, routing rules, and reusable decision logic.')
  if (input.aiSteps) orchestrationResponsibilities.push('AI enrichment or classification with validation and confidence thresholds.')
  if (input.loopsOrBatching || input.databaseWork) orchestrationResponsibilities.push('Batching, iteration, data shaping, and synchronization between systems.')
  if (!orchestrationResponsibilities.length) orchestrationResponsibilities.push('Only the handoffs that genuinely cross system boundaries.')

  const humanCheckpoints: string[] = []
  if (input.humanApprovals) humanCheckpoints.push('Keep the explicit approval step human and make the system prepare the context needed for a fast decision.')
  if (input.aiSteps && (input.failureImpact === 'high' || input.failureImpact === 'critical')) humanCheckpoints.push('Route low-confidence AI decisions to a person instead of forcing a binary automated outcome.')
  if (input.failureImpact === 'critical') humanCheckpoints.push('Require human review for irreversible recovery actions after a critical failure.')

  const nextQuestions: string[] = []
  if (input.futureWorkflows >= 25) nextQuestions.push('Will multiple teams build workflows, and do you need shared standards, environments, or approval before publishing?')
  if (input.monthlyRuns >= 20000) nextQuestions.push('What does peak-hour traffic look like, not just monthly average volume?')
  if (input.customApi) nextQuestions.push('Do the important APIs have stable documentation, rate limits, webhooks, and idempotency support?')
  if (input.sensitiveData) nextQuestions.push('Which exact fields are sensitive, where may they be stored, and how long may logs retain them?')
  if (input.processStability === 'changing') nextQuestions.push('Which parts of the process are still changing? Standardizing them may create more value than automating them immediately.')

  return {
    kind,
    kindLabel: kindLabel(kind),
    primary,
    alternatives,
    platformMix: [...new Set(platformMix)],
    metrics: { automationPotential, complexity, scale, reliabilityRisk: risk, maintenanceBurden, confidence },
    summary: architectureSummary(kind, primary),
    keepNative,
    orchestrationResponsibilities,
    safeguards: buildSafeguards(input),
    humanCheckpoints,
    nextQuestions,
    ranking,
  }
}
