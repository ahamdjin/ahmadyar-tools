import type { ArchitectureAdvice, AssessmentInput, PlatformId } from './types'

export type DecisionStability = {
  level: 'provisional' | 'competitive' | 'stable'
  margin: number
  confidence: number
  canShortenAssessment: boolean
  explanation: string
  highValueQuestions: Array<{
    id: string
    question: string
    why: string
    couldFavor: string[]
  }>
}

const TECHNICAL = new Set<PlatformId>(['n8n-cloud', 'n8n-self-hosted', 'pipedream', 'trigger-dev', 'tray', 'mulesoft', 'custom-code'])
const SELF_HOSTED = new Set<PlatformId>(['n8n-self-hosted', 'activepieces'])
const ENTERPRISE = new Set<PlatformId>(['workato', 'tray', 'mulesoft', 'power-automate', 'salesforce-flow'])
const NATIVE = new Set<PlatformId>(['crm-native', 'hubspot-native', 'gohighlevel-native', 'salesforce-flow', 'shopify-flow'])

const QUESTION_PRIORITY: Record<string, number> = {
  'failure-semantics': 100,
  'software-boundary': 98,
  'unknown-connectivity': 96,
  'hosting-ownership': 94,
  'native-boundary': 92,
  'durable-jobs': 90,
  'technical-ownership': 88,
  'visual-complexity': 84,
  governance: 80,
  'growth-economics': 76,
}

function topEligible(advice: ArchitectureAdvice) {
  return advice.ranking.filter((item) => item.eligible).slice(0, 4)
}

function includesAny(ids: PlatformId[], candidates: Set<PlatformId>) {
  return ids.some((id) => candidates.has(id))
}

function candidateNames(advice: ArchitectureAdvice, ids: PlatformId[]) {
  const wanted = new Set(ids)
  return advice.ranking.filter((item) => wanted.has(item.id)).map((item) => item.name)
}

/**
 * Measures whether the current recommendation is robust enough to explain as a
 * stable answer and identifies the smallest set of questions most likely to
 * change it. This is deliberately not another platform scoring layer: it
 * reasons over score margin, architecture boundaries, and unresolved tradeoffs.
 */
export function assessDecisionStability(input: AssessmentInput, advice: ArchitectureAdvice): DecisionStability {
  const eligible = topEligible(advice)
  const first = eligible[0]
  const second = eligible[1]
  const margin = first && second ? Math.max(0, first.score - second.score) : first ? 25 : 0
  const ids = eligible.map((item) => item.id)
  const questions: DecisionStability['highValueQuestions'] = []
  const add = (id: string, question: string, why: string, couldFavor: string[]) => {
    if (!questions.some((item) => item.id === id)) questions.push({ id, question, why, couldFavor })
  }

  const nativeVsExternal = includesAny(ids, NATIVE) && ids.some((id) => !NATIVE.has(id))
  const zapierMake = ids.includes('zapier') && ids.includes('make')
  const technicalVsNoCode = includesAny(ids, TECHNICAL) && ids.some((id) => !TECHNICAL.has(id) && !NATIVE.has(id))
  const hostingChoice = ids.some((id) => SELF_HOSTED.has(id)) && ids.some((id) => !SELF_HOSTED.has(id))
  const durableChoice = ids.includes('trigger-dev') || ids.includes('pipedream')
  const enterpriseChoice = includesAny(ids, ENTERPRISE)
  const applicationBoundary = advice.kind === 'application' || ids.includes('custom-code')

  if (input.customSystems.length + input.otherSystemsCount > 0 && !input.unknownSystemsRequireApi) {
    add(
      'unknown-connectivity',
      'Do any of the unlisted/internal systems require direct API, webhook, database, or file-level integration?',
      'Unknown connectivity can move the architecture from a simple connector layer into technical orchestration.',
      candidateNames(advice, ['n8n-cloud', 'n8n-self-hosted', 'pipedream', 'workato', 'tray', 'mulesoft', 'custom-code']),
    )
  }

  if (nativeVsExternal) {
    add(
      'native-boundary',
      'Do most important workflows stay inside the CRM/core app, or do they regularly move data and decisions across several systems?',
      'This is the main boundary between keeping logic native and paying the cost of another automation layer.',
      candidateNames(advice, ['hubspot-native', 'gohighlevel-native', 'salesforce-flow', 'shopify-flow', 'crm-native', 'zapier', 'make', 'n8n-cloud']),
    )
  }

  if (zapierMake) {
    add(
      'visual-complexity',
      'How often do workflows need routers, several branches, loops/batching, or meaningful data transformation?',
      'Simple mainstream SaaS handoffs favor simplicity; repeated branching/transformation gives a visual orchestration tool more reason to exist.',
      candidateNames(advice, ['zapier', 'make']),
    )
  }

  if (technicalVsNoCode) {
    add(
      'technical-ownership',
      'Who will debug failed API calls, credentials, payloads, and workflow logic six months after launch?',
      'A technically stronger platform is a worse recommendation when the operating team cannot safely own it.',
      candidateNames(advice, ['zapier', 'make', 'n8n-cloud', 'pipedream', 'trigger-dev', 'custom-code']),
    )
  }

  if (hostingChoice) {
    add(
      'hosting-ownership',
      'Is self-hosting actually required, and is somebody responsible for upgrades, monitoring, backups, scaling, and incident recovery?',
      'Self-hosting changes the operating model, not just the deployment location.',
      candidateNames(advice, ['n8n-cloud', 'n8n-self-hosted', 'activepieces']),
    )
  }

  if (durableChoice) {
    add(
      'durable-jobs',
      'Does the work behave like application background jobs: long-running tasks, queues, concurrency limits, retries, schedules, or jobs that must survive deploys?',
      'Durable job infrastructure solves a different problem from ordinary SaaS-to-SaaS automation.',
      candidateNames(advice, ['trigger-dev', 'pipedream', 'n8n-cloud', 'custom-code']),
    )
  }

  if (applicationBoundary) {
    add(
      'software-boundary',
      'Does the core workflow own persistent state, money/transactions, customer-visible behavior, or domain rules that must be versioned and tested like software?',
      'A yes can move the core out of an automation canvas entirely, while keeping integrations around the edges.',
      candidateNames(advice, ['custom-code', 'trigger-dev', 'n8n-cloud']),
    )
  }

  if (enterpriseChoice && (input.departments >= 3 || input.governance)) {
    add(
      'governance',
      'Do you need centrally governed environments, roles, auditability, reusable integrations, SSO, or formal change control across teams?',
      'Enterprise integration products earn their overhead through governance and reuse, not raw workflow power.',
      candidateNames(advice, ['workato', 'tray', 'mulesoft', 'power-automate', 'salesforce-flow']),
    )
  }

  if (input.monthlyRuns >= 25_000 || input.futureWorkflows >= 40) {
    add(
      'growth-economics',
      'At your expected scale, which matters more: lowest maintenance, predictable execution economics, or maximum technical control?',
      'Large portfolios often change the winner because run/action billing and maintenance burden compound differently.',
      eligible.slice(0, 3).map((item) => item.name),
    )
  }

  if (input.failureImpact === 'high' || input.failureImpact === 'critical' || input.duplicateUnsafe) {
    add(
      'failure-semantics',
      'If this workflow retries or runs twice, can it safely repeat every side effect?',
      'Retries without idempotency can turn reliability features into duplicate charges, messages, records, or state changes.',
      eligible.slice(0, 3).map((item) => item.name),
    )
  }

  // A large margin alone is not enough if the architecture boundary is still
  // unresolved. Conversely, a hard application boundary can be stable with a
  // smaller platform-score margin because the core architecture is constrained.
  const boundaryResolved = advice.kind === 'application'
    ? input.productLogic
    : advice.kind === 'native-automation'
      ? Boolean(input.primarySystemId || input.crmCentered)
      : true
  const unresolvedHighImpact = questions.filter((item) => ['unknown-connectivity', 'native-boundary', 'hosting-ownership', 'software-boundary'].includes(item.id)).length

  let level: DecisionStability['level'] = 'provisional'
  if (margin >= 13 && boundaryResolved && unresolvedHighImpact === 0) level = 'stable'
  else if (margin >= 6 || advice.metrics.confidence >= 72) level = 'competitive'

  const confidence = Math.max(25, Math.min(98, Math.round(
    advice.metrics.confidence * 0.68 +
    Math.min(24, margin * 1.4) +
    (boundaryResolved ? 6 : -8) -
    Math.min(18, unresolvedHighImpact * 6),
  )))

  const canShortenAssessment = level === 'stable' && questions.length <= 2 && advice.metrics.reliabilityRisk < 58
  const explanation = level === 'stable'
    ? `${first?.name ?? 'The leading option'} has a meaningful lead and the main architecture boundary is resolved.`
    : level === 'competitive'
      ? `The leading options are close enough that one or two operating answers can still change the recommendation.`
      : `The current systems signal is useful, but unresolved architecture or ownership questions can still materially change the answer.`

  const prioritizedQuestions = [...questions].sort((a, b) => (QUESTION_PRIORITY[b.id] ?? 0) - (QUESTION_PRIORITY[a.id] ?? 0))

  return {
    level,
    margin,
    confidence,
    canShortenAssessment,
    explanation,
    highValueQuestions: prioritizedQuestions.slice(0, 4),
  }
}
