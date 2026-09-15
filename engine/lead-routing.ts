export type RoutingLevel = 0 | 1 | 2 | 3
export type PrimaryRoutingRule = 'round-robin' | 'territory' | 'service' | 'segment' | 'named-account' | 'score' | 'capacity' | 'hybrid'
export type ExistingOwnershipRule = 'preserve' | 'account-first' | 're-evaluate' | 'manual'
export type AfterHoursRule = 'queue' | 'acknowledge-queue' | 'on-call-priority' | 'always-live'
export type ChangeFrequency = 'rarely' | 'monthly' | 'weekly'

export type LeadRoutingInput = {
  crmId: string | null
  monthlyLeads: number
  reps: number
  teams: number
  territories: number
  serviceLines: number
  primaryRule: PrimaryRoutingRule
  existingOwnership: ExistingOwnershipRule
  afterHours: AfterHoursRule
  changeFrequency: ChangeFrequency
  dataReadiness: RoutingLevel
  duplicateControl: RoutingLevel
  accountMatching: RoutingLevel
  precedenceClarity: RoutingLevel
  availabilityAwareness: RoutingLevel
  capacityAwareness: RoutingLevel
  prioritySignals: RoutingLevel
  fallbackCoverage: RoutingLevel
  responseSla: RoutingLevel
  escalation: RoutingLevel
  reassignment: RoutingLevel
  auditTrail: RoutingLevel
  overrideControl: RoutingLevel
  routingMonitoring: RoutingLevel
  targetResponseMinutes: number
}

export type RoutingIssue = {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  impact: string
  fix: string
}

export type RoutingRule = {
  order: number
  label: string
  condition: string
  action: string
  reason: string
}

export type RoutingTestCase = {
  name: string
  input: string
  expected: string
}

export type LeadRoutingResult = {
  score: number
  confidence: number
  status: string
  summary: string
  recommendedPattern: string
  metrics: {
    dataQuality: number
    ownershipSafety: number
    ruleClarity: number
    speed: number
    fairness: number
    operability: number
  }
  issues: RoutingIssue[]
  rules: RoutingRule[]
  safeguards: string[]
  observabilityFields: string[]
  testCases: RoutingTestCase[]
  architecture: string[]
  nextQuestions: string[]
}

export const DEFAULT_LEAD_ROUTING_INPUT: LeadRoutingInput = {
  crmId: null,
  monthlyLeads: 500,
  reps: 6,
  teams: 1,
  territories: 1,
  serviceLines: 2,
  primaryRule: 'round-robin',
  existingOwnership: 'preserve',
  afterHours: 'acknowledge-queue',
  changeFrequency: 'monthly',
  dataReadiness: 2,
  duplicateControl: 1,
  accountMatching: 1,
  precedenceClarity: 1,
  availabilityAwareness: 1,
  capacityAwareness: 0,
  prioritySignals: 1,
  fallbackCoverage: 1,
  responseSla: 1,
  escalation: 0,
  reassignment: 0,
  auditTrail: 0,
  overrideControl: 1,
  routingMonitoring: 0,
  targetResponseMinutes: 15,
}

const level = (value: RoutingLevel) => value * (100 / 3)
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

function severity(score: number): RoutingIssue['severity'] {
  if (score >= 85) return 'critical'
  if (score >= 65) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

function crmLabel(crmId: string | null) {
  const labels: Record<string, string> = {
    hubspot: 'HubSpot',
    salesforce: 'Salesforce',
    gohighlevel: 'GoHighLevel',
    'dynamics-365': 'Microsoft Dynamics 365',
    pipedrive: 'Pipedrive',
    'zoho-crm': 'Zoho CRM',
    close: 'Close',
    attio: 'Attio',
  }
  return crmId ? labels[crmId] ?? 'your CRM' : 'your CRM'
}

function primaryRuleLabel(rule: PrimaryRoutingRule) {
  const labels: Record<PrimaryRoutingRule, string> = {
    'round-robin': 'round robin within the eligible pool',
    territory: 'territory first, then distribute within the territory',
    service: 'service / product fit first, then distribute within that specialist pool',
    segment: 'customer segment first, then distribute within that segment',
    'named-account': 'named-account ownership first, then use the general routing pool',
    score: 'qualification / priority score first, then route to the matching pool',
    capacity: 'availability and capacity first, then assign the best eligible owner',
    hybrid: 'ordered eligibility rules first, then capacity / round robin inside the resulting pool',
  }
  return labels[rule]
}

export function analyzeLeadRouting(input: LeadRoutingInput): LeadRoutingResult {
  const complexity = clamp(
    Math.min(30, input.reps * 1.4) +
      Math.min(18, Math.max(0, input.teams - 1) * 5) +
      Math.min(20, Math.max(0, input.territories - 1) * 3) +
      Math.min(18, Math.max(0, input.serviceLines - 1) * 2.5) +
      Math.min(20, input.monthlyLeads / 250),
  )

  const dataQuality = clamp(level(input.dataReadiness) * 0.42 + level(input.duplicateControl) * 0.33 + level(input.accountMatching) * 0.25)
  const ownershipSafety = clamp(level(input.accountMatching) * 0.25 + level(input.fallbackCoverage) * 0.25 + level(input.reassignment) * 0.2 + level(input.overrideControl) * 0.15 + (input.existingOwnership === 'preserve' || input.existingOwnership === 'account-first' ? 15 : 4))
  const ruleClarity = clamp(level(input.precedenceClarity) * 0.55 + level(input.prioritySignals) * 0.2 + level(input.overrideControl) * 0.25)
  const speed = clamp(level(input.responseSla) * 0.4 + level(input.escalation) * 0.25 + level(input.availabilityAwareness) * 0.2 + level(input.fallbackCoverage) * 0.15)
  const fairness = clamp(level(input.availabilityAwareness) * 0.35 + level(input.capacityAwareness) * 0.35 + level(input.reassignment) * 0.15 + (input.primaryRule === 'round-robin' || input.primaryRule === 'capacity' || input.primaryRule === 'hybrid' ? 15 : 8))
  const operability = clamp(level(input.auditTrail) * 0.35 + level(input.routingMonitoring) * 0.35 + level(input.overrideControl) * 0.15 + level(input.escalation) * 0.15)

  let score = clamp(dataQuality * 0.2 + ownershipSafety * 0.18 + ruleClarity * 0.18 + speed * 0.18 + fairness * 0.11 + operability * 0.15)
  if (input.monthlyLeads >= 2000 && input.fallbackCoverage <= 1) score = clamp(score - 8)
  if (input.reps >= 10 && input.precedenceClarity <= 1) score = clamp(score - 7)
  if (input.territories > 1 && input.dataReadiness <= 1) score = clamp(score - 7)
  if (input.duplicateControl === 0) score = clamp(score - 6)

  const issues: RoutingIssue[] = []
  const addIssue = (id: string, risk: number, title: string, impact: string, fix: string) => {
    if (risk < 28) return
    issues.push({ id, severity: severity(risk), title, impact, fix })
  }

  addIssue(
    'duplicates',
    (100 - level(input.duplicateControl)) * (input.monthlyLeads >= 1000 ? 1 : 0.78),
    'Duplicate control happens too late',
    'The same person or account can enter routing twice, creating conflicting ownership and duplicate outreach.',
    'Normalize and deduplicate before ownership changes. Preserve the authoritative contact/account identity and log why a record was merged or skipped.',
  )
  addIssue(
    'matching',
    (100 - level(input.accountMatching)) * (input.existingOwnership === 'manual' ? 1 : 0.82),
    'Existing-account ownership is not reliably protected',
    'New inbound activity can steal an existing customer or active opportunity from the owner who already has context.',
    'Match contact → company/account before general routing. Apply the existing-account policy before territory, score, or round robin.',
  )
  addIssue(
    'precedence',
    (100 - level(input.precedenceClarity)) * (complexity > 45 ? 1 : 0.75),
    'Rule precedence is ambiguous',
    'Two valid rules can match the same lead and produce different owners depending on implementation order.',
    'Write one explicit hierarchy. Named accounts / protected ownership should beat general territory or pool rules; fallback should always be last.',
  )
  addIssue(
    'fallback',
    (100 - level(input.fallbackCoverage)) * (input.monthlyLeads >= 500 ? 1 : 0.78),
    'Some leads can become ownerless',
    'Missing geography, malformed fields, unavailable reps, or unmatched products can leave a lead waiting silently.',
    'Create a visible catch-all queue/owner, stamp the routing failure reason, and alert operations when the fallback path is used.',
  )
  addIssue(
    'sla',
    (100 - level(input.responseSla)) * (input.targetResponseMinutes <= 30 ? 1 : 0.78) + (100 - level(input.escalation)) * 0.25,
    'Routing does not enforce the response promise',
    'Fast assignment is meaningless if nobody notices when the assigned rep misses the response target.',
    'Stamp routed_at and SLA_due_at, monitor first meaningful response, then escalate or reassign when the target is breached.',
  )
  addIssue(
    'availability',
    (100 - level(input.availabilityAwareness)) * (input.reps >= 5 ? 0.85 : 0.55) + (100 - level(input.capacityAwareness)) * (input.reps >= 10 ? 0.4 : 0.18),
    'Distribution ignores availability or load',
    'Round robin can be mathematically fair while still routing to people who are absent or already overloaded.',
    'Define who is eligible before distribution. At larger teams, account for availability/capacity inside each qualified pool.',
  )
  addIssue(
    'observability',
    (100 - level(input.auditTrail)) * 0.55 + (100 - level(input.routingMonitoring)) * 0.45,
    'You cannot explain or operate the router',
    'When somebody asks why a lead went to a rep, the answer depends on reconstructing workflow history instead of a durable audit trail.',
    'Stamp routing reason, rule version, original owner, assigned owner, routed_at, SLA due time, and override reason on each routed record.',
  )

  issues.sort((a, b) => ({ critical: 4, high: 3, medium: 2, low: 1 }[b.severity] - { critical: 4, high: 3, medium: 2, low: 1 }[a.severity]))

  const rules: RoutingRule[] = [
    {
      order: 1,
      label: 'Normalize + deduplicate',
      condition: 'Every new inbound lead before assignment',
      action: 'Normalize routing fields, identify duplicates, and stop unsafe duplicate assignment.',
      reason: 'Routing bad identity data faster only makes the CRM messier.',
    },
    {
      order: 2,
      label: 'Protect existing relationships',
      condition: input.existingOwnership === 're-evaluate' ? 'Existing contact/account found; re-evaluation is explicitly allowed' : 'Existing contact/account or active opportunity found',
      action: input.existingOwnership === 'account-first' ? 'Use the account / opportunity owner before the general pool.' : input.existingOwnership === 'preserve' ? 'Preserve the existing owner unless an explicit exception applies.' : input.existingOwnership === 're-evaluate' ? 'Run current eligibility rules and record the ownership change reason.' : 'Send the ownership conflict to a review queue.',
      reason: 'Existing customer context usually has higher precedence than generic inbound distribution.',
    },
    {
      order: 3,
      label: 'Apply protected / priority rules',
      condition: input.prioritySignals >= 2 ? 'Named account, strategic segment, urgent intent, or another documented priority signal matches' : 'Only the small set of explicitly protected exceptions matches',
      action: 'Send to the protected owner or specialist pool and stamp the priority reason.',
      reason: 'Priority needs an explainable rule, not rep cherry-picking.',
    },
    {
      order: 4,
      label: 'Build the eligible pool',
      condition: 'No protected ownership rule matched',
      action: `Use ${primaryRuleLabel(input.primaryRule)}.`,
      reason: 'Eligibility and specialization should be decided before distribution fairness.',
    },
    {
      order: 5,
      label: 'Remove unavailable owners',
      condition: 'Owner is out, disabled, over capacity, or not eligible for the lead',
      action: input.availabilityAwareness >= 2 ? 'Skip the owner and continue within the qualified pool.' : 'Add availability awareness before relying on automated distribution.',
      reason: 'A fair router should distribute to people who can actually respond.',
    },
    {
      order: 6,
      label: 'Fallback + SLA',
      condition: 'No normal rule can assign safely, or the assigned lead exceeds the response target',
      action: `Send to the fallback path, preserve the failure reason, and enforce the ${input.targetResponseMinutes}-minute response target with escalation.`,
      reason: 'No lead should disappear because one field or owner state was unexpected.',
    },
  ]

  const safeguards = [
    'Only one routing service/workflow should be authoritative for initial ownership; downstream workflows should consume the decision rather than assign again.',
    'Do not route directly from free-text geography/product values. Normalize to controlled routing fields first.',
    'Never overwrite an existing owner silently. Store original owner and the explicit reason whenever ownership changes.',
    'Keep fallback usage visible. A catch-all path is an operational alarm, not a permanent bucket.',
  ]
  if (input.monthlyLeads >= 1000) safeguards.push('Load-test the routing path with bursts, not only monthly averages, and make assignment idempotent so retries cannot double-route.')
  if (input.changeFrequency === 'weekly') safeguards.push('Version the rule set and require a lightweight change/review process; frequent routing edits without versioning make attribution and debugging unreliable.')
  if (input.afterHours === 'on-call-priority') safeguards.push('Define exactly which priority signals are allowed to wake the on-call path and what happens if nobody accepts the lead.')

  const observabilityFields = [
    'routing_rule_version',
    'routing_reason',
    'routed_at',
    'assigned_owner_id',
    'previous_owner_id',
    'eligible_pool',
    'sla_due_at',
    'first_response_at',
    'fallback_reason',
    'override_reason',
  ]

  const testCases: RoutingTestCase[] = [
    { name: 'Existing account', input: 'Known contact submits a new inbound form while an account owner already exists.', expected: input.existingOwnership === 're-evaluate' ? 'Re-evaluate under the documented rule and retain an audit reason.' : 'Protect the existing relationship before general routing.' },
    { name: 'Duplicate event', input: 'The same lead event is delivered twice.', expected: 'Second event is deduplicated or produces the same owner without duplicate side effects.' },
    { name: 'Missing routing field', input: 'Lead has no usable territory / service / segment value.', expected: 'Fallback path gets the lead and records why normal routing failed.' },
    { name: 'Unavailable rep', input: 'Next round-robin owner is unavailable.', expected: input.availabilityAwareness >= 2 ? 'Skip the unavailable owner and continue in the eligible pool.' : 'Flag this as a design gap before launch.' },
    { name: 'SLA breach', input: `Assigned lead has no meaningful response after ${input.targetResponseMinutes} minutes.`, expected: input.escalation >= 2 ? 'Escalate/reassign according to policy and retain the original assignment trail.' : 'Flag the breach visibly; add automated escalation before relying on the SLA.' },
    { name: 'After hours', input: 'Qualified lead arrives outside normal coverage.', expected: input.afterHours === 'on-call-priority' ? 'Acknowledge immediately; only documented priority leads enter on-call routing.' : input.afterHours === 'always-live' ? 'Route through the live eligible pool.' : 'Acknowledge and queue with a clear next-response target.' },
  ]

  const crm = crmLabel(input.crmId)
  const architecture = [
    `${crm} should remain the source of truth for lead/account identity, owner, routing reason, SLA state, and downstream reporting.`,
    input.crmId === 'salesforce' || input.crmId === 'hubspot' || input.crmId === 'gohighlevel' || input.crmId === 'dynamics-365'
      ? `Start with ${crm}'s native assignment/workflow capabilities when they can express the required hierarchy cleanly; add an external router only when capacity, matching, rule complexity, edition limits, or cross-system requirements justify it.`
      : 'Prefer one authoritative routing layer close to the CRM. Do not split initial ownership across several unrelated automation workflows.',
    complexity >= 60
      ? 'This is a routing system, not a single workflow. Separate normalization/matching, eligibility, distribution, SLA monitoring, and analytics so each concern can be tested independently.'
      : 'Keep the implementation compact: normalize → protect existing ownership → apply eligibility → distribute → fallback/SLA.',
  ]

  const answered = [input.crmId, input.monthlyLeads, input.reps, input.primaryRule, input.dataReadiness, input.precedenceClarity, input.fallbackCoverage, input.responseSla, input.auditTrail].filter((value) => value !== null && value !== undefined).length
  const confidence = clamp(55 + answered * 3.5 - (input.crmId ? 0 : 12) - (input.precedenceClarity === 0 ? 8 : 0))
  const nextQuestions: string[] = []
  if (!input.crmId) nextQuestions.push('Which CRM ultimately owns the lead and account record?')
  if (input.territories > 1 && input.dataReadiness < 2) nextQuestions.push('Which normalized field is authoritative for territory, and how often is it missing?')
  if (input.serviceLines > 2 && input.precedenceClarity < 2) nextQuestions.push('If territory and product/service rules disagree, which one wins?')
  if (input.reps >= 8 && input.capacityAwareness < 2) nextQuestions.push('Should routing optimize only for fairness, or also current workload / availability?')
  if (input.existingOwnership === 're-evaluate') nextQuestions.push('Which exact event is allowed to move an already-owned account to a new seller?')

  const status = score >= 82 ? 'Routing is operationally strong' : score >= 66 ? 'Solid foundation with a few failure paths' : score >= 48 ? 'Routing works, but important controls are fragile' : 'High risk of missed, duplicated, or misrouted leads'
  const recommendedPattern = complexity >= 68 ? 'Centralized rules engine with explicit eligibility, matching, distribution, SLA and audit layers' : complexity >= 42 ? 'Single authoritative hybrid router with ordered rules and a protected fallback path' : 'Native CRM routing with one explicit precedence hierarchy and SLA fallback'

  return {
    score,
    confidence,
    status,
    summary: `${input.monthlyLeads.toLocaleString()} leads/month across ${input.reps} reps creates enough operational cost that ownership safety and observability matter as much as assignment speed.`,
    recommendedPattern,
    metrics: { dataQuality, ownershipSafety, ruleClarity, speed, fairness, operability },
    issues,
    rules,
    safeguards,
    observabilityFields,
    testCases,
    architecture,
    nextQuestions,
  }
}
