import { APP_BY_ID } from './apps'

export type CrmHealthLevel = 0 | 1 | 2 | 3
export type CrmHealthSeverity = 'critical' | 'high' | 'medium' | 'low'
export type CrmHealthDimensionId =
  | 'capture'
  | 'data'
  | 'routing'
  | 'response'
  | 'pipeline'
  | 'handoff'
  | 'reporting'
  | 'resilience'
  | 'adoption'

export type CrmHealthInput = {
  crmId: string | null
  connectedApps: string[]
  customSystems: string[]
  otherSystemsCount: number
  monthlyLeads: number
  salesReps: number
  captureCoverage: CrmHealthLevel
  duplicateControl: CrmHealthLevel
  requiredData: CrmHealthLevel
  sourceTracking: CrmHealthLevel
  routingQuality: CrmHealthLevel
  unassignedProtection: CrmHealthLevel
  responseDiscipline: CrmHealthLevel
  followupQuality: CrmHealthLevel
  pipelineDefinition: CrmHealthLevel
  stalePipelineControl: CrmHealthLevel
  handoffQuality: CrmHealthLevel
  reportingTrust: CrmHealthLevel
  workflowMonitoring: CrmHealthLevel
  operatingOwnership: CrmHealthLevel
  crmAdoption: CrmHealthLevel
  shadowSystems: CrmHealthLevel
}

export type CrmHealthDimension = {
  id: CrmHealthDimensionId
  label: string
  score: number
  weight: number
  summary: string
}

export type CrmHealthIssue = {
  id: string
  severity: CrmHealthSeverity
  impact: number
  title: string
  why: string
  fix: string
  owner: string
  nativeFirst: boolean
}

export type CrmHealthPlanItem = {
  phase: 'Now' | 'Next' | 'Then'
  title: string
  action: string
  reason: string
}

export type CrmHealthResult = {
  score: number
  label: string
  summary: string
  confidence: number
  crmName: string
  architecture: string
  dimensions: CrmHealthDimension[]
  issues: CrmHealthIssue[]
  strengths: string[]
  plan: CrmHealthPlanItem[]
  nativeMoves: string[]
  warning: string | null
}

export const DEFAULT_CRM_HEALTH_INPUT: CrmHealthInput = {
  crmId: null,
  connectedApps: [],
  customSystems: [],
  otherSystemsCount: 0,
  monthlyLeads: 250,
  salesReps: 3,
  captureCoverage: 1,
  duplicateControl: 1,
  requiredData: 1,
  sourceTracking: 1,
  routingQuality: 1,
  unassignedProtection: 1,
  responseDiscipline: 1,
  followupQuality: 1,
  pipelineDefinition: 1,
  stalePipelineControl: 1,
  handoffQuality: 1,
  reportingTrust: 1,
  workflowMonitoring: 1,
  operatingOwnership: 1,
  crmAdoption: 1,
  shadowSystems: 1,
}

const WEIGHTS: Record<CrmHealthDimensionId, number> = {
  capture: 12,
  data: 12,
  routing: 14,
  response: 14,
  pipeline: 12,
  handoff: 10,
  reporting: 10,
  resilience: 9,
  adoption: 7,
}

const LEVEL_SCORE = [18, 48, 76, 96] as const
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)))
const level = (value: CrmHealthLevel) => LEVEL_SCORE[value]

const AUTOMATION_IDS = new Set(['zapier', 'make', 'n8n', 'power-automate', 'activepieces', 'pipedream', 'trigger-dev', 'workato', 'tray-ai', 'mulesoft'])
const SPREADSHEET_IDS = new Set(['google-sheets', 'excel', 'airtable'])

const CRM_NATIVE_MOVES: Record<string, string[]> = {
  hubspot: [
    'Keep lifecycle, lead/deal stage changes, ownership and standard follow-up inside HubSpot where the native workflow model is sufficient.',
    'Use owner rotation / assignment automation for repeatable routing, and add a visible fallback for anything that remains unowned.',
    'Treat lifecycle stages and pipeline stages as operating definitions, not labels people update differently.',
  ],
  gohighlevel: [
    'Keep lead capture, opportunity creation, stage movement, reminders and normal follow-up in HighLevel workflows where possible.',
    'Make opportunity stage changes drive the next action so the pipeline reflects the real sales process.',
    'Use a fallback path for opportunities that are created without a valid owner or stay in an early stage too long.',
  ],
  salesforce: [
    'Use Salesforce assignment rules / queues for deterministic ownership before adding an external router.',
    'Use duplicate and matching rules to stop identity problems from becoming automation problems.',
    'Keep core lead/account/contact/opportunity state in Salesforce; external automation should orchestrate around it rather than duplicate it.',
  ],
  'dynamics-365': [
    'Keep core customer ownership, stages and business state in Dynamics 365, and use the Microsoft automation stack where it reduces handoff friction.',
    'Define one owner/fallback model before layering additional automation across Teams, Outlook and other Microsoft tools.',
  ],
  pipedrive: [
    'Use Pipedrive as the visible source of truth for ownership, activities and stage movement; automate around those records instead of shadowing them elsewhere.',
  ],
  'zoho-crm': [
    'Keep core record state and normal lifecycle automation in Zoho CRM where practical; only externalize logic that genuinely crosses system boundaries.',
  ],
  close: [
    'Keep sales communication, ownership and core opportunity state in Close; use external automation mainly for cross-system handoffs and enrichment.',
  ],
  attio: [
    'Keep relationship records and team-facing source-of-truth data in Attio; reserve external orchestration for logic that needs APIs, transformations or durable jobs.',
  ],
  activecampaign: [
    'Keep contact lifecycle, segmentation and normal nurture automation native when possible, and avoid duplicating the same state across a second automation platform.',
  ],
}

function scoreDimensions(input: CrmHealthInput): CrmHealthDimension[] {
  const appCount = input.connectedApps.length + input.customSystems.length + input.otherSystemsCount + (input.crmId ? 1 : 0)
  const sourceCountPressure = appCount >= 8 ? 12 : appCount >= 5 ? 7 : 0
  const volumePressure = input.monthlyLeads >= 5000 ? 12 : input.monthlyLeads >= 1000 ? 7 : 0
  const teamPressure = input.salesReps >= 15 ? 12 : input.salesReps >= 6 ? 7 : 0
  const customPressure = input.customSystems.length + input.otherSystemsCount > 0 ? 6 : 0

  const capture = clamp(
    level(input.captureCoverage) -
      (input.captureCoverage < 2 ? sourceCountPressure : 0) -
      (input.captureCoverage < 2 ? customPressure : 0),
  )

  const data = clamp(
    (level(input.duplicateControl) * 0.38 + level(input.requiredData) * 0.32 + level(input.sourceTracking) * 0.3) -
      (input.duplicateControl < 2 && appCount >= 5 ? 8 : 0) -
      (input.shadowSystems >= 2 ? 8 : input.shadowSystems === 1 ? 4 : 0),
  )

  const routing = clamp(
    level(input.routingQuality) * 0.68 + level(input.unassignedProtection) * 0.32 -
      (input.salesReps >= 6 && input.routingQuality < 2 ? teamPressure : 0) -
      (input.unassignedProtection === 0 ? 12 : 0),
  )

  const response = clamp(
    level(input.responseDiscipline) * 0.52 + level(input.followupQuality) * 0.48 -
      (input.monthlyLeads >= 1000 && input.responseDiscipline < 2 ? volumePressure : 0) -
      (input.followupQuality === 0 ? 8 : 0),
  )

  const pipeline = clamp(
    level(input.pipelineDefinition) * 0.58 + level(input.stalePipelineControl) * 0.42 -
      (input.crmAdoption <= 1 ? 6 : 0),
  )

  const handoff = clamp(level(input.handoffQuality) - (input.connectedApps.length >= 5 && input.handoffQuality < 2 ? 7 : 0))
  const reporting = clamp(
    level(input.reportingTrust) * 0.66 + level(input.sourceTracking) * 0.34 -
      (input.shadowSystems >= 2 ? 12 : input.shadowSystems === 1 ? 5 : 0),
  )
  const resilience = clamp(
    level(input.workflowMonitoring) * 0.58 + level(input.operatingOwnership) * 0.42 -
      (input.connectedApps.filter((id) => AUTOMATION_IDS.has(id)).length >= 2 && input.workflowMonitoring < 2 ? 9 : 0) -
      (appCount >= 8 && input.operatingOwnership < 2 ? 6 : 0),
  )
  const adoption = clamp(
    level(input.crmAdoption) * 0.72 + (100 - level(input.shadowSystems)) * 0.28,
  )

  const rows: Array<[CrmHealthDimensionId, string, number, string]> = [
    ['capture', 'Lead capture', capture, capture >= 80 ? 'Important lead sources reliably enter the CRM.' : 'Some lead sources or context can still fall outside the CRM.'],
    ['data', 'Data quality', data, data >= 80 ? 'Identity, required fields and source data are controlled.' : 'Duplicates, missing fields or attribution can undermine automation.'],
    ['routing', 'Ownership & routing', routing, routing >= 80 ? 'Ownership is deterministic and protected by fallbacks.' : 'Leads can still wait, route inconsistently or become unowned.'],
    ['response', 'Response & follow-up', response, response >= 80 ? 'Speed-to-lead and follow-up are managed as a system.' : 'Response and follow-up still depend too much on memory or manual checking.'],
    ['pipeline', 'Pipeline discipline', pipeline, pipeline >= 80 ? 'Stages and stale-deal controls reflect the real sales process.' : 'Pipeline state is not yet trustworthy enough to drive automation confidently.'],
    ['handoff', 'Won-deal handoff', handoff, handoff >= 80 ? 'Closed-won context continues into delivery/onboarding.' : 'Sales-to-delivery handoff still leaks context or creates manual setup.'],
    ['reporting', 'Reporting & attribution', reporting, reporting >= 80 ? 'The CRM can support useful source-to-outcome reporting.' : 'Reporting confidence is limited by source, stage or shadow-system gaps.'],
    ['resilience', 'Automation operations', resilience, resilience >= 80 ? 'Failures, ownership and changes have an operating model.' : 'Automation failures or ownership gaps can stay invisible too long.'],
    ['adoption', 'CRM adoption', adoption, adoption >= 80 ? 'The CRM is being used as the operating source of truth.' : 'Side systems or inconsistent usage reduce trust in the CRM.'],
  ]

  return rows.map(([id, label, score, summary]) => ({ id, label, score, weight: WEIGHTS[id], summary }))
}

function severity(impact: number): CrmHealthSeverity {
  if (impact >= 82) return 'critical'
  if (impact >= 65) return 'high'
  if (impact >= 45) return 'medium'
  return 'low'
}

function issue(id: string, impact: number, title: string, why: string, fix: string, owner: string, nativeFirst = true): CrmHealthIssue {
  return { id, impact: clamp(impact), severity: severity(impact), title, why, fix, owner, nativeFirst }
}

function buildIssues(input: CrmHealthInput, crmName: string): CrmHealthIssue[] {
  const appCount = input.connectedApps.length + input.customSystems.length + input.otherSystemsCount + 1
  const automationCount = input.connectedApps.filter((id) => AUTOMATION_IDS.has(id)).length
  const spreadsheetCount = input.connectedApps.filter((id) => SPREADSHEET_IDS.has(id)).length
  const issues: CrmHealthIssue[] = []

  if (input.captureCoverage < 3) {
    issues.push(issue(
      'capture-gaps',
      46 + (3 - input.captureCoverage) * 14 + (appCount >= 6 ? 8 : 0),
      'Lead capture is not fully controlled',
      `When important lead sources do not create a consistent ${crmName} record with context, routing and reporting inherit the gap.`,
      `List every real lead source, define the required ${crmName} fields, and make each source create/update the same record model automatically.`,
      'RevOps / CRM owner',
    ))
  }

  if (input.duplicateControl < 2) {
    issues.push(issue(
      'duplicates',
      50 + (2 - input.duplicateControl) * 16 + (appCount >= 5 ? 8 : 0),
      'Duplicate identity can break ownership and reporting',
      'Duplicate contacts or leads can split history, create double follow-up, and make source/owner reporting unreliable.',
      `Use ${crmName}'s native duplicate/matching controls first, then add normalization before external systems create records.`,
      'CRM admin',
    ))
  }

  if (input.sourceTracking < 2) {
    issues.push(issue(
      'attribution',
      44 + (2 - input.sourceTracking) * 17 + (appCount >= 5 ? 8 : 0),
      'Source-to-outcome attribution is fragile',
      'If source context is missing or overwritten, you cannot confidently compare channels, response, pipeline movement and revenue.',
      'Define source fields that are written once where appropriate, preserve campaign/context separately, and carry them through conversion/handoff.',
      'RevOps / marketing ops',
    ))
  }

  if (input.requiredData < 2) {
    issues.push(issue(
      'required-data',
      42 + (2 - input.requiredData) * 15,
      'Automation is running on incomplete records',
      'Routing, segmentation and reporting become brittle when critical fields are optional or inconsistently formatted.',
      'Define the minimum fields required at each lifecycle point, normalize values, and validate only what downstream decisions actually need.',
      'CRM owner',
    ))
  }

  if (input.routingQuality < 3 || input.unassignedProtection < 3) {
    const impact = 50 + (3 - input.routingQuality) * 13 + (3 - input.unassignedProtection) * 8 + (input.salesReps >= 6 ? 8 : 0)
    issues.push(issue(
      'routing',
      impact,
      'Lead ownership has avoidable failure paths',
      'A routing rule is only reliable if every eligible lead gets an owner and exceptions are visible quickly.',
      `Move normal assignment into ${crmName} where practical, define one fallback owner/queue, and alert on records that remain unassigned past the target.`,
      'Sales ops',
    ))
  }

  if (input.responseDiscipline < 3 || input.followupQuality < 3) {
    const impact = 48 + (3 - input.responseDiscipline) * 12 + (3 - input.followupQuality) * 9 + (input.monthlyLeads >= 1000 ? 8 : 0)
    issues.push(issue(
      'response',
      impact,
      'Speed-to-lead and follow-up are not fully systemized',
      'The first response and the next few attempts are where manual memory creates the most obvious revenue leakage.',
      'Set a measurable response target, create reminders/sequences for the normal path, and stop or change automation when the lead replies, books, disqualifies or converts.',
      'Sales leadership',
    ))
  }

  if (input.pipelineDefinition < 3 || input.stalePipelineControl < 3) {
    const impact = 44 + (3 - input.pipelineDefinition) * 11 + (3 - input.stalePipelineControl) * 9
    issues.push(issue(
      'pipeline',
      impact,
      'Pipeline state is not yet trustworthy enough',
      'If stages mean different things to different people or old deals stay open forever, stage-triggered automation and forecasting become misleading.',
      'Give every stage a clear entry/exit definition, remove vanity stages, and flag opportunities that exceed the expected age for that stage.',
      'Sales ops',
    ))
  }

  if (input.handoffQuality < 3) {
    issues.push(issue(
      'handoff',
      42 + (3 - input.handoffQuality) * 13,
      'Closed-won handoff still creates manual reconstruction',
      'Delivery teams should not have to rediscover what sales already learned or manually recreate standard setup.',
      `Use the won event in ${crmName} as the canonical handoff trigger, pass the required context, create the delivery objects/tasks, and expose missing prerequisites.`,
      'RevOps / delivery ops',
    ))
  }

  if (input.reportingTrust < 3) {
    issues.push(issue(
      'reporting',
      43 + (3 - input.reportingTrust) * 13 + (input.shadowSystems >= 2 ? 8 : 0),
      'CRM reporting is not trusted enough for decisions',
      'A dashboard is not useful if users expect to clean it in a spreadsheet before believing it.',
      'Pick a small set of operating metrics—source, owner, response, stage age, conversion and outcome—and fix the data path behind those before adding more dashboards.',
      'RevOps / leadership',
    ))
  }

  if (input.workflowMonitoring < 2 || input.operatingOwnership < 2) {
    issues.push(issue(
      'operations',
      48 + (2 - Math.min(input.workflowMonitoring, 2)) * 15 + (2 - Math.min(input.operatingOwnership, 2)) * 14 + (automationCount >= 2 ? 8 : 0),
      'Automation failures can remain invisible',
      'Once revenue processes depend on automation, failure detection and ownership matter as much as building the workflow.',
      'Name one operational owner, define where failures are surfaced, review failed runs regularly, and document the manual recovery path for critical automations.',
      'Automation owner',
      false,
    ))
  }

  if (input.crmAdoption < 2 || input.shadowSystems >= 2 || spreadsheetCount >= 2) {
    issues.push(issue(
      'adoption',
      47 + (2 - Math.min(input.crmAdoption, 2)) * 14 + (input.shadowSystems >= 2 ? 14 : 0) + (spreadsheetCount >= 2 ? 7 : 0),
      'The CRM is competing with shadow systems',
      'When the team keeps parallel spreadsheets or private trackers, the CRM stops being a dependable source of truth and automations act on stale state.',
      'Identify why people leave the CRM, fix the missing view/process/field, and retire duplicate trackers instead of syncing every shadow system forever.',
      'CRM owner + sales leadership',
    ))
  }

  if (automationCount >= 3) {
    issues.push(issue(
      'automation-sprawl',
      48 + automationCount * 5,
      'Multiple automation layers may be creating unnecessary sprawl',
      `You selected ${automationCount} automation platforms around one CRM. That can be valid, but ownership, duplicate logic and debugging cost rise quickly.`,
      `Define which automation class belongs in ${crmName}, which belongs in one primary integration/orchestration layer, and which genuinely needs a specialist tool.`,
      'Automation architect / RevOps',
      false,
    ))
  }

  return issues.sort((a, b) => b.impact - a.impact)
}

function architectureFor(input: CrmHealthInput, score: number, crmName: string) {
  const automationCount = input.connectedApps.filter((id) => AUTOMATION_IDS.has(id)).length
  const externalPressure = input.connectedApps.length + input.customSystems.length + input.otherSystemsCount

  if (input.crmAdoption <= 1 || input.pipelineDefinition <= 1 || input.captureCoverage === 0) {
    return `Stabilize ${crmName} before adding more automation`
  }
  if (automationCount >= 3) return `${crmName} + consolidate the automation layer`
  if (externalPressure >= 7) return `${crmName} as source of truth + one primary orchestration layer`
  if (score >= 80) return `${crmName}-native first, external automation only for real cross-system gaps`
  return `${crmName}-native core + targeted integration automation`
}

function resultLabel(score: number) {
  if (score >= 88) return 'Operationally strong'
  if (score >= 76) return 'Healthy, with specific leaks'
  if (score >= 62) return 'Working, but fragile'
  if (score >= 46) return 'Leaky and difficult to trust'
  return 'Needs operating cleanup before more automation'
}

function summaryFor(score: number, issues: CrmHealthIssue[], crmName: string) {
  const top = issues[0]
  if (!top) return `${crmName} is operating as a strong source of truth with good automation discipline.`
  if (score >= 76) return `${crmName} has a solid foundation. The main opportunity is ${top.title.toLowerCase()}.`
  if (score >= 62) return `${crmName} is useful, but a few weak controls are making the system less reliable than it looks. Start with ${top.title.toLowerCase()}.`
  return `${crmName} is carrying too much operational risk. Fix the core data, ownership and process controls before layering on more automation.`
}

function buildStrengths(dimensions: CrmHealthDimension[]) {
  return dimensions
    .filter((dimension) => dimension.score >= 78)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((dimension) => `${dimension.label}: ${dimension.summary}`)
}

function buildPlan(issues: CrmHealthIssue[]): CrmHealthPlanItem[] {
  const top = issues.slice(0, 5)
  if (!top.length) {
    return [
      { phase: 'Now', title: 'Protect what already works', action: 'Document ownership, response targets and critical workflows.', reason: 'Strong systems still decay when nobody owns the operating rules.' },
      { phase: 'Next', title: 'Review exceptions monthly', action: 'Sample unassigned leads, duplicates, stale pipeline records and failed automations.', reason: 'Exception review catches drift before it becomes a large cleanup project.' },
      { phase: 'Then', title: 'Optimize only measured bottlenecks', action: 'Use conversion, stage age and failure data to choose the next automation.', reason: 'Avoid adding complexity where the process is already healthy.' },
    ]
  }

  return top.slice(0, 3).map((entry, index) => ({
    phase: index === 0 ? 'Now' : index === 1 ? 'Next' : 'Then',
    title: entry.title,
    action: entry.fix,
    reason: entry.why,
  }))
}

export function analyzeCrmHealth(input: CrmHealthInput): CrmHealthResult {
  const crm = input.crmId ? APP_BY_ID.get(input.crmId) : null
  const crmName = crm?.name ?? 'Your CRM'
  const dimensions = scoreDimensions(input)
  const weighted = dimensions.reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0) / 100
  const seriousPenalty = dimensions.filter((dimension) => dimension.score < 40).length * 3
  const score = clamp(weighted - seriousPenalty)
  const issues = buildIssues(input, crmName)
  const unknownSystems = input.customSystems.length + input.otherSystemsCount
  const confidence = clamp(94 - unknownSystems * 3 - (input.crmId ? 0 : 18), 58, 96)
  const nativeMoves = CRM_NATIVE_MOVES[input.crmId ?? ''] ?? [
    `Keep core customer state, ownership and normal lifecycle rules inside ${crmName} where the platform handles them cleanly.`,
    'Use external automation for genuine cross-system work, not to recreate the same business state in multiple tools.',
  ]

  const warning = input.crmAdoption <= 1 || input.shadowSystems >= 2
    ? 'Do not solve weak CRM adoption by adding more integrations. Fix the operating model first.'
    : input.connectedApps.filter((id) => AUTOMATION_IDS.has(id)).length >= 3
      ? 'Your stack already has several automation layers. Consolidation may create more value than another workflow.'
      : null

  return {
    score,
    label: resultLabel(score),
    summary: summaryFor(score, issues, crmName),
    confidence,
    crmName,
    architecture: architectureFor(input, score, crmName),
    dimensions,
    issues,
    strengths: buildStrengths(dimensions),
    plan: buildPlan(issues),
    nativeMoves,
    warning,
  }
}
