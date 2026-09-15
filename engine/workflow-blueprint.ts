import { APP_BY_ID } from './apps'
import { PLATFORMS } from './platforms'
import type {
  BranchingNeed,
  FailureImpact,
  PlatformId,
  ProcessStability,
  SelfHostingNeed,
  TeamProfile,
  TechnicalOwner,
} from './types'

export type WorkflowTriggerMode = 'webhook' | 'event' | 'polling' | 'schedule' | 'manual' | 'batch'
export type TransformationNeed = 'light' | 'moderate' | 'heavy'
export type WorkflowLane = 'native' | 'no-code' | 'orchestration' | 'durable-code' | 'software'

export type WorkflowBlueprintInput = {
  sourceAppId: string | null
  targetAppIds: string[]
  sourceOfTruthAppId: string | null
  customSystems: string[]
  triggerMode: WorkflowTriggerMode
  monthlyRuns: number
  peakRunsPerMinute: number
  steps: number
  team: TeamProfile
  technicalOwner: TechnicalOwner
  processStability: ProcessStability
  branching: BranchingNeed
  transformation: TransformationNeed
  loopsOrBatching: boolean
  customApi: boolean
  filesOrDocuments: boolean
  databaseWork: boolean
  aiSteps: boolean
  humanApprovals: boolean
  durableJobs: boolean
  realtime: boolean
  failureImpact: FailureImpact
  duplicateUnsafe: boolean
  retriesRequired: boolean
  sensitiveData: boolean
  governance: boolean
  selfHosting: SelfHostingNeed
  transactional: boolean
  writebackRequired: boolean
}

export type BlueprintStep = {
  order: number
  id: string
  label: string
  purpose: string
  implementation: string
  failureRule: string
}

export type WorkflowPlatformFit = {
  id: PlatformId
  name: string
  score: number
  eligible: boolean
  verdict: 'strong-fit' | 'viable' | 'conditional' | 'poor-fit' | 'eliminated'
  reasons: string[]
  tradeoffs: string[]
}

export type WorkflowBlueprintResult = {
  lane: WorkflowLane
  laneLabel: string
  confidence: number
  complexity: number
  reliabilityRisk: number
  summary: string
  blueprint: BlueprintStep[]
  dataContract: string[]
  idempotencyStrategy: string
  recoveryStrategy: string
  observability: string[]
  platformFits: WorkflowPlatformFit[]
  safeguards: string[]
  testCases: Array<{ name: string; scenario: string; expected: string }>
  nextQuestions: string[]
}

export const DEFAULT_WORKFLOW_BLUEPRINT_INPUT: WorkflowBlueprintInput = {
  sourceAppId: null,
  targetAppIds: [],
  sourceOfTruthAppId: null,
  customSystems: [],
  triggerMode: 'webhook',
  monthlyRuns: 1000,
  peakRunsPerMinute: 10,
  steps: 5,
  team: 'business',
  technicalOwner: 'power-user',
  processStability: 'stable',
  branching: 'simple',
  transformation: 'light',
  loopsOrBatching: false,
  customApi: false,
  filesOrDocuments: false,
  databaseWork: false,
  aiSteps: false,
  humanApprovals: false,
  durableJobs: false,
  realtime: false,
  failureImpact: 'medium',
  duplicateUnsafe: true,
  retriesRequired: true,
  sensitiveData: false,
  governance: false,
  selfHosting: 'none',
  transactional: false,
  writebackRequired: true,
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)))

function volumeBand(monthlyRuns: number) {
  if (monthlyRuns < 1000) return 'light' as const
  if (monthlyRuns < 15000) return 'moderate' as const
  if (monthlyRuns < 100000) return 'heavy' as const
  return 'very-heavy' as const
}

function selectedAppIds(input: WorkflowBlueprintInput) {
  return [...new Set([input.sourceAppId, input.sourceOfTruthAppId, ...input.targetAppIds].filter((id): id is string => Boolean(id)))]
}

function connectivityPressure(input: WorkflowBlueprintInput) {
  const apps = selectedAppIds(input).map((id) => APP_BY_ID[id]).filter(Boolean)
  const values = apps.map((app) => {
    if (app.connectivity === 'limited') return 90
    if (app.connectivity === 'enterprise') return 70
    if (app.connectivity === 'api-first') return 62
    if (app.connectivity === 'microsoft') return 45
    if (app.connectivity === 'native-heavy') return 35
    return 25
  })
  const base = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 55
  return clamp(base + input.customSystems.length * 14 + (input.customApi ? 20 : 0))
}

function workflowComplexity(input: WorkflowBlueprintInput) {
  let value = 15 + Math.min(25, Math.max(0, input.steps - 2) * 3.5)
  value += input.branching === 'advanced' ? 22 : input.branching === 'simple' ? 8 : 0
  value += input.transformation === 'heavy' ? 18 : input.transformation === 'moderate' ? 9 : 0
  if (input.loopsOrBatching) value += 12
  if (input.customApi) value += 14
  if (input.databaseWork) value += 14
  if (input.aiSteps) value += 8
  if (input.humanApprovals) value += 8
  if (input.durableJobs) value += 17
  if (input.filesOrDocuments) value += 6
  if (input.transactional) value += 18
  return clamp(value)
}

function workflowReliabilityRisk(input: WorkflowBlueprintInput) {
  const impact = { low: 20, medium: 48, high: 72, critical: 94 }[input.failureImpact]
  let value = impact * 0.42
  if (input.duplicateUnsafe) value += 18
  if (input.retriesRequired) value += 10
  if (input.transactional) value += 14
  if (input.realtime) value += 8
  if (input.peakRunsPerMinute >= 100) value += 8
  if (input.customSystems.length) value += 6
  return clamp(value)
}

function appCategoryFit(input: WorkflowBlueprintInput, profile: (typeof PLATFORMS)[number]) {
  const apps = selectedAppIds(input).map((id) => APP_BY_ID[id]).filter(Boolean)
  if (!apps.length) return 65
  return clamp(apps.reduce((sum, app) => sum + (profile.categoryFit[app.category] ?? 55), 0) / apps.length)
}

function nativeCenterScore(input: WorkflowBlueprintInput, platformId: PlatformId) {
  const appId = input.sourceOfTruthAppId ?? input.sourceAppId
  if (!appId) return 0
  const explicit: Partial<Record<string, PlatformId>> = {
    hubspot: 'hubspot-native',
    gohighlevel: 'gohighlevel-native',
    salesforce: 'salesforce-flow',
    shopify: 'shopify-flow',
  }
  if (explicit[appId] === platformId) return 100
  if (platformId === 'crm-native' && APP_BY_ID[appId]?.category === 'crm') return 88
  return 0
}

function scorePlatforms(input: WorkflowBlueprintInput, complexity: number, reliabilityRisk: number): WorkflowPlatformFit[] {
  const appIds = selectedAppIds(input)
  const band = volumeBand(input.monthlyRuns)
  const crossSystemCount = new Set([...appIds, ...input.customSystems.map((name) => `custom:${name}`)]).size
  const connectionPressure = connectivityPressure(input)
  const microsoftFirst = appIds.length > 0 && appIds.filter((id) => APP_BY_ID[id]?.connectivity === 'microsoft').length / appIds.length >= 0.55
  const technical = input.technicalOwner === 'developer' ? 95 : input.technicalOwner === 'automation-specialist' ? 78 : input.technicalOwner === 'power-user' ? 50 : 20
  const complexNeed = clamp(complexity)
  const simpleNeed = 100 - Math.min(80, complexNeed)
  const apiNeed = clamp((input.customApi ? 85 : 30) + connectionPressure * 0.35 + input.customSystems.length * 8)
  const reliabilityNeed = clamp(reliabilityRisk + (input.retriesRequired ? 15 : 0))
  const nativeOpportunity = crossSystemCount <= 2 && complexity < 48 && !input.customApi && !input.durableJobs && !input.transactional

  const fits = PLATFORMS.map((profile): WorkflowPlatformFit => {
    const reasons: string[] = []
    const tradeoffs: string[] = []
    let eligible = true

    if (profile.requiresSelectedApp && !appIds.includes(profile.requiresSelectedApp)) eligible = false
    if (input.selfHosting === 'required' && profile.selfHostFit < 80 && profile.id !== 'custom-code') eligible = false
    if (profile.procurement === 'enterprise' && input.monthlyRuns < 15000 && !input.governance && input.failureImpact !== 'critical') eligible = false

    const category = appCategoryFit(input, profile)
    const team = profile.teamFit[input.team]
    const volume = profile.volumeEconomics[band]
    const native = nativeCenterScore(input, profile.id)
    let score =
      category * 0.15 +
      team * 0.14 +
      volume * 0.11 +
      profile.standardIntegrationBreadth * 0.11 +
      profile.reliabilityFit * (reliabilityNeed / 100) * 0.13 +
      profile.customApiFit * (apiNeed / 100) * 0.1 +
      profile.complexWorkflowFit * (complexNeed / 100) * 0.1 +
      profile.simpleWorkflowFit * (simpleNeed / 100) * 0.08 +
      profile.costAtScaleFit * 0.08

    const technicalGap = Math.max(0, profile.technicalRequirement - technical)
    score -= technicalGap * 0.22

    if (native > 0) {
      score += nativeOpportunity ? native * 0.22 : native * 0.06
      reasons.push(`${profile.name} is close to the source of truth for this workflow.`)
      if (!nativeOpportunity) tradeoffs.push('The workflow crosses enough boundaries or reliability requirements that keeping everything native may become awkward.')
    }

    if (profile.id === 'zapier') {
      const mainstream = appIds.filter((id) => APP_BY_ID[id]?.connectivity === 'mainstream' || APP_BY_ID[id]?.connectivity === 'native-heavy').length
      if (complexity < 52 && !input.loopsOrBatching && input.branching !== 'advanced' && mainstream >= Math.max(1, appIds.length - 1)) {
        score += 18
        reasons.push('Common SaaS handoffs, modest logic, and low infrastructure ownership are a strong Zapier shape.')
      }
      if (input.loopsOrBatching || input.branching === 'advanced' || input.transformation === 'heavy') {
        score -= 12
        tradeoffs.push('Branching, batching, or heavy transformation reduces the advantage of a simple SaaS handoff tool.')
      }
      if (input.monthlyRuns >= 100000 || input.peakRunsPerMinute >= 100) tradeoffs.push('High run volume or bursts deserve explicit task/rate-limit economics and queue design.')
    }

    if (profile.id === 'make') {
      if (input.branching === 'advanced' || input.loopsOrBatching || input.transformation === 'heavy') {
        score += 20
        reasons.push('Routers, iteration, and transformations are central to this workflow shape.')
      }
      if (complexity < 35 && input.team === 'business') score -= 6
    }

    if (profile.id === 'n8n-cloud' || profile.id === 'n8n-self-hosted') {
      if (input.customApi || input.databaseWork || input.loopsOrBatching || connectionPressure >= 60) {
        score += 18
        reasons.push('API/data work and technical orchestration justify a deeper workflow runtime.')
      }
      if (technical < 65) {
        score -= 10
        tradeoffs.push('The workflow benefits from stronger technical ownership than a typical business-user automation.')
      }
    }

    if (profile.id === 'n8n-self-hosted') {
      if (input.selfHosting === 'required') {
        score += 28
        reasons.push('Self-hosting is a hard requirement.')
      } else if (input.selfHosting === 'none') {
        score -= 14
        tradeoffs.push('Owning infrastructure adds work when self-hosting is not actually required.')
      }
    }

    if (profile.id === 'activepieces') {
      if (input.selfHosting !== 'none') {
        score += 18
        reasons.push('Self-hosting/control matters without automatically requiring a developer-only stack.')
      }
    }

    if (profile.id === 'pipedream') {
      if ((input.customApi || input.realtime) && technical >= 70) {
        score += 20
        reasons.push('Developer-owned event/API integration is a strong fit for this shape.')
      }
      if (input.team === 'business') score -= 12
    }

    if (profile.id === 'trigger-dev') {
      if (input.durableJobs || input.humanApprovals || input.retriesRequired && input.failureImpact !== 'low') {
        score += technical >= 75 ? 28 : 10
        reasons.push('Durable execution, retries, waits, or concurrency are first-class requirements.')
      }
      if (technical < 75) {
        score -= 18
        tradeoffs.push('Trigger.dev is code-first; without developer ownership its strengths become operating burden.')
      }
      if (!input.durableJobs && complexity < 50) score -= 12
    }

    if (profile.id === 'power-automate') {
      if (microsoftFirst) {
        score += 25
        reasons.push('The selected environment is strongly Microsoft-centered.')
      } else score -= 5
    }

    if (profile.id === 'workato' || profile.id === 'tray' || profile.id === 'mulesoft') {
      if (input.governance && (input.monthlyRuns >= 15000 || input.failureImpact === 'critical' || input.sensitiveData)) {
        score += 18
        reasons.push('Governance and cross-system operating requirements are substantial enough to justify enterprise integration tooling.')
      }
      if (!input.governance) score -= 10
    }

    if (profile.id === 'custom-code') {
      if (input.transactional || input.databaseWork && input.failureImpact === 'critical') {
        score += 34
        reasons.push('Persistent/transactional business state should be owned by software rather than a fragile automation chain.')
      }
      if (input.durableJobs && technical >= 80) score += 10
      if (!input.transactional && complexity < 50) score -= 18
    }

    if (input.governance) score += profile.governanceFit * 0.08
    if (input.selfHosting === 'preferred') score += profile.selfHostFit * 0.06
    if (input.selfHosting === 'required') score += profile.selfHostFit * 0.12

    score = clamp(score)
    if (!eligible) score = 0

    if (profile.standardIntegrationBreadth >= 90) reasons.push('Broad integration coverage reduces connector risk for common SaaS systems.')
    if (profile.technicalRequirement >= 70) tradeoffs.push('This choice expects a genuinely technical maintainer.')
    if (profile.costAtScaleFit < 60 && band !== 'light') tradeoffs.push('Usage economics should be stress-tested as run volume and step count grow.')

    const verdict: WorkflowPlatformFit['verdict'] = !eligible
      ? 'eliminated'
      : score >= 80
        ? 'strong-fit'
        : score >= 68
          ? 'viable'
          : score >= 55
            ? 'conditional'
            : 'poor-fit'

    return { id: profile.id, name: profile.name, score, eligible, verdict, reasons: [...new Set(reasons)].slice(0, 4), tradeoffs: [...new Set(tradeoffs)].slice(0, 3) }
  })

  return fits.sort((a, b) => b.score - a.score)
}

function chooseLane(input: WorkflowBlueprintInput, platforms: WorkflowPlatformFit[], complexity: number): WorkflowLane {
  const primary = platforms.find((platform) => platform.eligible)
  if (input.transactional || primary?.id === 'custom-code') return 'software'
  if (input.durableJobs && ['trigger-dev', 'custom-code'].includes(primary?.id ?? '')) return 'durable-code'
  if (primary && ['hubspot-native', 'gohighlevel-native', 'salesforce-flow', 'shopify-flow', 'crm-native', 'power-automate'].includes(primary.id) && complexity < 58) return 'native'
  if (complexity >= 58 || input.customApi || input.loopsOrBatching || input.databaseWork || input.branching === 'advanced') return 'orchestration'
  return 'no-code'
}

function laneLabel(lane: WorkflowLane) {
  return {
    native: 'Keep the workflow close to the system of record',
    'no-code': 'Use a lightweight integration workflow',
    orchestration: 'Use an orchestration layer with explicit reliability controls',
    'durable-code': 'Use a durable code-first job runtime',
    software: 'Treat the core as software, not a workflow',
  }[lane]
}

function buildBlueprint(input: WorkflowBlueprintInput, lane: WorkflowLane): BlueprintStep[] {
  const steps: BlueprintStep[] = []
  const add = (id: string, label: string, purpose: string, implementation: string, failureRule: string) => {
    steps.push({ order: steps.length + 1, id, label, purpose, implementation, failureRule })
  }

  add(
    'trigger',
    'Receive the trigger',
    'Start from one authoritative business event rather than multiple overlapping entry points.',
    input.triggerMode === 'webhook' || input.triggerMode === 'event'
      ? 'Prefer the source event/webhook and acknowledge receipt quickly; do not perform slow downstream work before the event has been safely accepted.'
      : input.triggerMode === 'polling'
        ? 'Poll using a stable cursor/updated timestamp and record what was already processed.'
        : input.triggerMode === 'batch'
          ? 'Create a bounded batch with a stable batch ID and per-record processing state.'
          : input.triggerMode === 'schedule'
            ? 'Use an explicit schedule and query only records that are due for this run.'
            : 'Create an explicit manual start action that captures who initiated it and which record/version was approved.',
    'A repeated or delayed trigger must not create duplicate irreversible effects.',
  )

  add(
    'validate',
    'Normalize and validate the payload',
    'Convert external data into one internal contract before business rules run.',
    'Validate required identifiers, enums, dates, contact fields and ownership keys; reject or quarantine malformed records with a visible reason.',
    'Bad input goes to an exception path; it does not silently continue with guessed values.',
  )

  if (input.duplicateUnsafe || input.transactional || input.retriesRequired) {
    add(
      'idempotency',
      'Gate duplicate side effects',
      'Make retries and duplicate trigger delivery safe.',
      input.transactional
        ? 'Use a persistent idempotency key tied to the business operation and enforce uniqueness before any transaction or external side effect.'
        : 'Build a stable idempotency key from the source record/event plus operation type, then check/store completion before side effects.',
      'If the same key arrives again, return the prior outcome or safely resume instead of repeating the effect.',
    )
  }

  add(
    'context',
    'Load authoritative context',
    'Make decisions from current source-of-truth state rather than trusting a stale trigger payload.',
    input.sourceOfTruthAppId
      ? `Re-read the current record/state from ${APP_BY_ID[input.sourceOfTruthAppId]?.name ?? 'the source of truth'} when a stale or duplicate event could change the correct action.`
      : 'Declare one source of truth for the state this workflow is allowed to change; fetch current state before consequential actions.',
    'If authoritative state cannot be read, pause/retry or route to review instead of inventing state.',
  )

  if (input.branching !== 'none' || input.transformation !== 'light') {
    add(
      'rules',
      'Apply business rules and transformations',
      'Keep routing and transformation logic explicit and testable.',
      input.branching === 'advanced'
        ? 'Use ordered rules with named outcomes; separate eligibility/validation from downstream actions so overlapping branches cannot both fire accidentally.'
        : 'Transform only the fields required downstream and make branch conditions mutually understandable.',
      'Unknown or contradictory rule outcomes go to a visible exception path.',
    )
  }

  if (input.aiSteps) {
    add(
      'ai',
      'Run AI as a bounded enrichment/decision aid',
      'Keep probabilistic output away from unchecked irreversible side effects.',
      input.failureImpact === 'high' || input.failureImpact === 'critical'
        ? 'Validate structured AI output against a schema and require deterministic rules or human approval before high-impact actions.'
        : 'Require structured output, schema validation and a deterministic fallback when the model fails or returns low-quality data.',
      'Model/provider failure or invalid output follows a deterministic fallback; it never becomes an empty success.',
    )
  }

  if (input.humanApprovals) {
    add(
      'approval',
      'Pause for human approval',
      'Make approval a durable state transition rather than a fragile notification.',
      'Persist pending/approved/rejected/expired state with actor and timestamp; resume from the stored state after approval.',
      'Expired or missing approval remains pending/exceptional; never interpret silence as approval.',
    )
  }

  if (input.loopsOrBatching) {
    add(
      'iterate',
      'Process records in bounded batches',
      'Control fan-out, API pressure and per-record recovery.',
      'Use bounded concurrency, per-record status and checkpointing; do not fan out an unbounded array into irreversible actions at once.',
      'One failed item should be identifiable and retryable without replaying successful items unless the business operation requires atomicity.',
    )
  }

  add(
    'effects',
    'Perform external actions',
    'Keep irreversible side effects after validation, identity and decision gates.',
    lane === 'software'
      ? 'Execute state-changing operations through application/service boundaries with explicit transaction and API contracts.'
      : 'Order actions so the most authoritative write happens first where possible; capture every created/updated resource ID needed for recovery.',
    'Classify failures as retryable vs permanent; never blindly retry validation, permission or business-rule failures.',
  )

  if (input.writebackRequired) {
    add(
      'writeback',
      'Write outcome back to the source of truth',
      'Make the result visible to humans and future automation.',
      'Persist status, external resource IDs, completed_at, outcome/reason and the workflow/version that produced the result.',
      'If writeback fails after an external side effect succeeded, retry writeback using the captured external ID rather than repeating the side effect.',
    )
  }

  if (input.retriesRequired || input.failureImpact !== 'low') {
    add(
      'recovery',
      'Recover deliberately',
      'Separate transient infrastructure failures from permanent business exceptions.',
      input.durableJobs
        ? 'Use durable retries with exponential backoff, bounded attempts, persisted state and a dead-letter/exception path after exhaustion.'
        : 'Use bounded retries/backoff for transient failures, then surface an exception with enough context to safely resume or repair.',
      'Retries must preserve idempotency and must not multiply external side effects.',
    )
  }

  add(
    'observe',
    'Measure and operate the workflow',
    'Give an owner enough evidence to answer what happened without reconstructing random logs.',
    'Record run ID, business key, trigger/event ID, rule outcome, attempt count, latency, external IDs, final status and exception reason; alert on critical failures and backlog growth.',
    'A run is not considered healthy merely because the workflow engine returned success; verify the intended business outcome.',
  )

  return steps
}

export function analyzeWorkflowBlueprint(input: WorkflowBlueprintInput): WorkflowBlueprintResult {
  const normalized: WorkflowBlueprintInput = {
    ...input,
    targetAppIds: [...new Set(input.targetAppIds)],
    customSystems: [...new Set(input.customSystems.map((item) => item.trim()).filter(Boolean))],
    monthlyRuns: Math.max(0, input.monthlyRuns),
    peakRunsPerMinute: Math.max(0, input.peakRunsPerMinute),
    steps: Math.max(1, input.steps),
  }
  const complexity = workflowComplexity(normalized)
  const reliabilityRisk = workflowReliabilityRisk(normalized)
  const platformFits = scorePlatforms(normalized, complexity, reliabilityRisk)
  const lane = chooseLane(normalized, platformFits, complexity)
  const blueprint = buildBlueprint(normalized, lane)
  const primary = platformFits.find((platform) => platform.eligible)
  const second = platformFits.find((platform) => platform.eligible && platform.id !== primary?.id)
  const margin = primary && second ? primary.score - second.score : 0

  const dataContract = [
    'business_key — stable identifier for the record/entity the workflow is changing',
    'trigger_event_id — provider event ID or deterministic equivalent used for traceability',
    'triggered_at — source event timestamp, separate from processing time',
    'source_version — updated_at/version/cursor when stale events are possible',
    'owner_or_actor — person/team/system responsible for the business outcome when applicable',
    'workflow_version — version of rules/implementation that made the decision',
    'outcome_status — explicit final/pending/exception state',
    'external_resource_ids — IDs created in downstream systems so retries can resume safely',
  ]
  if (normalized.humanApprovals) dataContract.push('approval_state / approved_by / approved_at — durable approval evidence')
  if (normalized.aiSteps) dataContract.push('ai_schema_version / model_result_status — structured AI output lineage without treating prose as authoritative state')

  const idempotencyStrategy = normalized.duplicateUnsafe || normalized.transactional || normalized.retriesRequired
    ? normalized.sourceAppId
      ? `Use the stable ${APP_BY_ID[normalized.sourceAppId]?.name ?? 'source'} record/event identifier plus the intended operation (for example event_id + operation_type). Persist that key before or atomically with irreversible effects and return/resume the prior result on replay.`
      : 'Define an idempotency key from a stable business key + operation + source version/event. Persist it before irreversible effects; a replay must return/resume the prior result instead of performing the effect twice.'
    : 'Duplicate side effects are low risk, but still keep a trigger/event identifier for traceability and future retry safety.'

  const recoveryStrategy = normalized.durableJobs
    ? 'Persist progress between steps, retry transient failures with bounded exponential backoff, constrain concurrency, and move exhausted runs to an exception/dead-letter path that can resume without replaying successful side effects.'
    : normalized.retriesRequired || normalized.failureImpact !== 'low'
      ? 'Classify failures as transient vs permanent, retry only transient errors with bounded backoff, preserve idempotency, and create a visible exception path with a safe resume/replay procedure.'
      : 'Keep failure states visible and rerunnable, but do not add a heavy retry subsystem unless production evidence justifies it.'

  const observability = [
    'run_id',
    'business_key',
    'trigger_event_id',
    'workflow_version',
    'started_at',
    'completed_at',
    'attempt_count',
    'rule_outcome',
    'final_status',
    'exception_reason',
    'external_resource_ids',
  ]
  if (normalized.peakRunsPerMinute >= 50) observability.push('queue_depth', 'oldest_queued_age', 'rate_limit_events')
  if (normalized.humanApprovals) observability.push('approval_state', 'approval_age')

  const safeguards = [
    'One workflow/service should be authoritative for each irreversible business action; parallel automations should consume the result, not compete to perform it.',
    'Validate current source-of-truth state before consequential actions when events can arrive late, twice, or out of order.',
    'Treat retryability as an error classification. Validation and permission failures should not loop forever.',
    'Store downstream resource IDs immediately so a partial success can be reconciled without recreating the resource.',
  ]
  if (normalized.peakRunsPerMinute >= 50) safeguards.push('Design for bursts separately from monthly volume: use queues/concurrency controls and respect provider/API rate limits instead of assuming average throughput.')
  if (normalized.sensitiveData) safeguards.push('Minimize sensitive fields crossing the automation layer, scope credentials tightly, and verify retention/logging behavior for every selected platform.')
  if (normalized.transactional) safeguards.push('Keep transactional/persistent business state inside application/database boundaries with explicit consistency rules; automation can orchestrate around that core.')

  const testCases = [
    { name: 'Duplicate trigger', scenario: 'The exact same source event is delivered twice.', expected: 'The business effect happens once; the replay returns/resumes the prior result.' },
    { name: 'Late/out-of-order event', scenario: 'An older event arrives after the source record has already moved forward.', expected: 'Current source-of-truth state is checked and the stale event cannot reverse or repeat the newer outcome.' },
    { name: 'Partial downstream success', scenario: 'A downstream resource is created but the following step/writeback fails.', expected: 'Retry resumes using the stored resource ID instead of creating a second resource.' },
    { name: 'Permanent validation failure', scenario: 'Required routing/data fields are missing or invalid.', expected: 'Run becomes a visible business exception; blind retries do not consume capacity forever.' },
    { name: 'Transient provider failure', scenario: 'A downstream API returns a retryable timeout/429/5xx.', expected: 'Bounded retry/backoff runs without multiplying side effects; exhaustion creates an operable exception.' },
    { name: 'Burst load', scenario: `Traffic spikes to ${Math.max(1, normalized.peakRunsPerMinute)} runs/minute.`, expected: 'Concurrency/rate-limit behavior is predictable and backlog is observable rather than dropping or duplicating work.' },
  ]
  if (normalized.humanApprovals) testCases.push({ name: 'Approval expires or arrives twice', scenario: 'Approval is delayed, rejected, or the approval callback is retried.', expected: 'Approval state remains durable and idempotent; silence never becomes approval and duplicate callbacks do not repeat downstream actions.' })
  if (normalized.aiSteps) testCases.push({ name: 'Invalid AI output', scenario: 'The model times out or returns output that fails the expected schema/policy.', expected: 'Deterministic fallback or human review handles it; invalid output never becomes a successful irreversible action.' })

  const nextQuestions: string[] = []
  if (!normalized.sourceAppId) nextQuestions.push('Which system emits the event that should start this workflow?')
  if (!normalized.sourceOfTruthAppId) nextQuestions.push('Which system is authoritative when the trigger payload and current record disagree?')
  if (normalized.targetAppIds.length === 0 && normalized.customSystems.length === 0) nextQuestions.push('Which system(s) receive the final action or write?')
  if (primary && second && margin < 7) nextQuestions.push(`The top implementation choices are close: ${primary.name} vs ${second.name}. Which matters more here—simpler ownership or deeper control/reliability?`)
  if (normalized.customApi && normalized.technicalOwner !== 'developer' && normalized.technicalOwner !== 'automation-specialist') nextQuestions.push('Who will own API changes, authentication failures, and schema changes after launch?')
  if (normalized.failureImpact === 'critical' && !normalized.transactional) nextQuestions.push('Does a failure create money, permissions, customer access, or another persistent state that should actually be application-owned?')

  let confidence = 54
  if (normalized.sourceAppId) confidence += 8
  if (normalized.sourceOfTruthAppId) confidence += 8
  if (normalized.targetAppIds.length || normalized.customSystems.length) confidence += 8
  if (normalized.technicalOwner !== 'none') confidence += 5
  if (normalized.processStability === 'stable') confidence += 5
  if (margin >= 12) confidence += 5
  if (normalized.customSystems.length) confidence -= Math.min(12, normalized.customSystems.length * 4)
  if (normalized.processStability === 'changing') confidence -= 12
  confidence = clamp(confidence, 35, 94)

  return {
    lane,
    laneLabel: laneLabel(lane),
    confidence,
    complexity,
    reliabilityRisk,
    summary: primary
      ? `${laneLabel(lane)}. ${primary.name} is the current strongest implementation fit, but the blueprint is intentionally platform-independent so the trigger, idempotency, state, recovery, and observability rules survive a platform change.`
      : `${laneLabel(lane)}. Resolve the remaining hard constraints before choosing a platform.`,
    blueprint,
    dataContract,
    idempotencyStrategy,
    recoveryStrategy,
    observability,
    platformFits: platformFits.slice(0, 8),
    safeguards,
    testCases,
    nextQuestions: nextQuestions.slice(0, 4),
  }
}
