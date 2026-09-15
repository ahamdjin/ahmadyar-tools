export type OnboardingLevel = 0 | 1 | 2 | 3
export type TriggerMode = 'deal-won' | 'contract-signed' | 'payment-received' | 'compound' | 'manual'
export type AccessComplexity = 'none' | 'light' | 'multi' | 'sensitive'
export type OnboardingOwner = 'sales' | 'operations' | 'account-management' | 'delivery' | 'shared'

export type OnboardingInput = {
  crmId: string | null
  contractAppId: string | null
  billingAppId: string | null
  projectAppId: string | null
  intakeAppId: string | null
  communicationAppId: string | null
  fileAppId: string | null
  customSystems: string[]
  monthlyClients: number
  serviceVariants: number
  owner: OnboardingOwner
  triggerMode: TriggerMode
  requireWon: boolean
  requireSigned: boolean
  requirePaid: boolean
  processRepeatability: OnboardingLevel
  handoffData: OnboardingLevel
  intakeQuality: OnboardingLevel
  accessComplexity: AccessComplexity
  accessTracking: OnboardingLevel
  workspaceTemplate: OnboardingLevel
  clientWelcome: OnboardingLevel
  kickoffScheduling: OnboardingLevel
  ownerAssignment: OnboardingLevel
  reminders: OnboardingLevel
  readinessGate: OnboardingLevel
  duplicateProtection: OnboardingLevel
  exceptionHandling: OnboardingLevel
  monitoring: OnboardingLevel
  targetDays: number
}

export type OnboardingIssue = {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  impact: string
  fix: string
  owner: string
}

export type OnboardingStage = {
  id: string
  label: string
  system: string
  owner: string
  purpose: string
  gate?: string
}

export type OnboardingResult = {
  score: number
  confidence: number
  status: string
  summary: string
  metrics: {
    triggerClarity: number
    handoffQuality: number
    clientReadiness: number
    deliverySetup: number
    reliability: number
    ownership: number
  }
  issues: OnboardingIssue[]
  stages: OnboardingStage[]
  architecture: string[]
  safeguards: string[]
  thirtyDayPlan: Array<{ week: string; focus: string; actions: string[] }>
  strengths: string[]
  nextQuestions: string[]
}

export const DEFAULT_ONBOARDING_INPUT: OnboardingInput = {
  crmId: null,
  contractAppId: null,
  billingAppId: null,
  projectAppId: null,
  intakeAppId: null,
  communicationAppId: null,
  fileAppId: null,
  customSystems: [],
  monthlyClients: 15,
  serviceVariants: 3,
  owner: 'operations',
  triggerMode: 'deal-won',
  requireWon: true,
  requireSigned: false,
  requirePaid: false,
  processRepeatability: 2,
  handoffData: 1,
  intakeQuality: 1,
  accessComplexity: 'light',
  accessTracking: 1,
  workspaceTemplate: 1,
  clientWelcome: 1,
  kickoffScheduling: 1,
  ownerAssignment: 1,
  reminders: 1,
  readinessGate: 0,
  duplicateProtection: 0,
  exceptionHandling: 0,
  monitoring: 0,
  targetDays: 5,
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)))
const levelScore = (level: OnboardingLevel) => level * (100 / 3)

function severityFor(weight: number): OnboardingIssue['severity'] {
  if (weight >= 85) return 'critical'
  if (weight >= 65) return 'high'
  if (weight >= 40) return 'medium'
  return 'low'
}

function triggerLabel(input: OnboardingInput) {
  if (input.triggerMode === 'compound') {
    const gates = [input.requireWon ? 'deal won' : null, input.requireSigned ? 'contract signed' : null, input.requirePaid ? 'payment received' : null].filter(Boolean)
    return gates.length ? gates.join(' + ') : 'explicit readiness gate'
  }
  if (input.triggerMode === 'contract-signed') return 'contract signed'
  if (input.triggerMode === 'payment-received') return 'payment received'
  if (input.triggerMode === 'manual') return 'manual approval'
  return 'deal won'
}

export function analyzeOnboarding(input: OnboardingInput): OnboardingResult {
  const systemCount = [input.crmId, input.contractAppId, input.billingAppId, input.projectAppId, input.intakeAppId, input.communicationAppId, input.fileAppId].filter(Boolean).length + input.customSystems.length
  const volumePressure = clamp((input.monthlyClients / 100) * 100)
  const variationPressure = clamp((input.serviceVariants / 12) * 100)
  const triggerClarity = clamp(
    (input.triggerMode === 'manual' ? 35 : input.triggerMode === 'compound' ? 92 : 78) +
      (input.requireSigned && !input.contractAppId ? -14 : 0) +
      (input.requirePaid && !input.billingAppId ? -14 : 0) +
      (input.triggerMode === 'compound' && [input.requireWon, input.requireSigned, input.requirePaid].filter(Boolean).length < 2 ? -20 : 0),
  )
  const handoffQuality = clamp(levelScore(input.handoffData) * 0.72 + levelScore(input.ownerAssignment) * 0.28)
  const accessPenalty = input.accessComplexity === 'sensitive' ? 18 : input.accessComplexity === 'multi' ? 10 : 0
  const clientReadiness = clamp(levelScore(input.intakeQuality) * 0.34 + levelScore(input.accessTracking) * 0.28 + levelScore(input.reminders) * 0.18 + levelScore(input.readinessGate) * 0.2 - accessPenalty)
  const deliverySetup = clamp(levelScore(input.workspaceTemplate) * 0.44 + levelScore(input.kickoffScheduling) * 0.18 + levelScore(input.clientWelcome) * 0.18 + levelScore(input.processRepeatability) * 0.2)
  const reliability = clamp(levelScore(input.duplicateProtection) * 0.32 + levelScore(input.exceptionHandling) * 0.38 + levelScore(input.monitoring) * 0.3)
  const ownership = clamp(levelScore(input.ownerAssignment) * 0.55 + (input.owner === 'shared' ? 35 : 85) * 0.45)

  const weighted = triggerClarity * 0.17 + handoffQuality * 0.18 + clientReadiness * 0.2 + deliverySetup * 0.2 + reliability * 0.15 + ownership * 0.1
  const scalePenalty = volumePressure > 60 && reliability < 55 ? 8 : 0
  const variationPenalty = variationPressure > 55 && input.processRepeatability < 2 ? 9 : 0
  const score = clamp(weighted - scalePenalty - variationPenalty)

  const issues: OnboardingIssue[] = []
  const add = (id: string, weight: number, title: string, impact: string, fix: string, owner: string) => issues.push({ id, severity: severityFor(weight), title, impact, fix, owner })

  if (triggerClarity < 70) add('trigger', 100 - triggerClarity, 'The start condition is not authoritative', 'Clients can enter delivery too early, too late, or twice when commercial events are ambiguous.', `Use ${triggerLabel(input)} as the canonical readiness event and make every downstream action depend on that state.`, 'RevOps / Operations')
  if (input.requireSigned && !input.contractAppId) add('contract-source', 72, 'Contract completion has no system source', 'A required prerequisite is being checked manually or inferred from another system.', 'Choose the contract system that owns signature state and consume its signed/completed event instead of a manual checkbox.', 'Operations')
  if (input.requirePaid && !input.billingAppId) add('payment-source', 78, 'Payment is required but has no authoritative event source', 'Delivery can start before payment or stall while someone verifies finance manually.', 'Use the billing/payment system event as a prerequisite and reconcile failures before creating delivery work.', 'Finance / Operations')
  if (input.handoffData < 2) add('handoff-data', 86 - input.handoffData * 18, 'Sales context does not reliably survive the handoff', 'Delivery starts with missing scope, promises, contacts, dates, or commercial context.', 'Define a minimum handoff payload and block readiness until required fields are present.', 'Sales + Delivery')
  if (input.intakeQuality < 2) add('intake', 76 - input.intakeQuality * 16, 'Client intake is incomplete or inconsistent', 'Teams chase information after work has already started.', 'Use one structured intake matched to the service variant, prefill known CRM data, and only ask for information delivery actually needs.', 'Operations')
  if (input.accessComplexity !== 'none' && input.accessTracking < 2) add('access', input.accessComplexity === 'sensitive' ? 92 : 74, 'Access and asset collection can become the blocker', 'Kickoff dates slip because credentials, files, permissions, or approvals are invisible across email and chat.', 'Track required access/items as explicit checklist states with an owner, due date, reminder, and safe collection method.', 'Onboarding owner')
  if (input.workspaceTemplate < 2 && input.monthlyClients >= 15) add('workspace', 68, 'Delivery setup is being recreated too manually', 'Project structure, tasks, dates, roles, and quality controls vary from client to client.', 'Create service-specific templates with relative dates, roles, required tasks, and standard fields; instantiate only after readiness.', 'Delivery Operations')
  if (input.ownerAssignment < 2 || input.owner === 'shared') add('ownership', 82, 'Onboarding ownership is ambiguous', 'Tasks can exist without anyone being accountable for moving the client to ready.', 'Assign one accountable onboarding owner at trigger time, even when several teams contribute.', 'Operations')
  if (input.readinessGate < 2) add('ready-gate', 88, 'There is no explicit “ready for delivery” gate', 'Teams confuse “client bought” with “delivery can actually start.”', 'Define a readiness state that requires commercial prerequisites, minimum intake, required access, owner assignment, and workspace creation.', 'Operations + Delivery')
  if (input.duplicateProtection < 2 && (input.requirePaid || input.contractAppId || input.billingAppId)) add('duplicates', 82, 'External events can create duplicate onboarding work', 'Webhook retries or repeated status events can create two projects, two welcomes, or duplicate tasks.', 'Make project/workspace creation idempotent using a stable client/deal key and record the created resource back on the source record.', 'Automation owner')
  if (input.exceptionHandling < 2) add('exceptions', 78, 'The happy path exists but exceptions do not', 'Partial payment, missing signature, reschedule, wrong owner, failed project creation, and unusual service variants fall back to ad-hoc work.', 'Create an exception queue with reason, owner, SLA, and a resumable path back into onboarding.', 'Operations')
  if (input.monitoring < 2 && systemCount >= 3) add('monitoring', 72, 'Cross-system onboarding is not observable enough', 'A failed integration can silently leave a paying client without a project, welcome, or owner.', 'Alert on failed critical steps and reconcile source records against created delivery records.', 'Automation owner')
  if (input.processRepeatability < 2 && input.serviceVariants >= 6) add('standardize-first', 90, 'The process is too variable to automate deeply yet', 'Automation will encode exceptions instead of removing them and become expensive to maintain.', 'Standardize service families and readiness rules first. Automate the stable 70–80%, then keep exceptional work explicit.', 'Operations leadership')

  issues.sort((a, b) => ({ critical: 4, high: 3, medium: 2, low: 1 }[b.severity] - { critical: 4, high: 3, medium: 2, low: 1 }[a.severity]))

  const crmName = input.crmId ?? 'CRM'
  const projectName = input.projectAppId ?? 'delivery workspace'
  const intakeName = input.intakeAppId ?? 'intake form'
  const communicationName = input.communicationAppId ?? 'client communication'
  const stages: OnboardingStage[] = [
    { id: 'commercial', label: 'Commercial readiness', system: crmName, owner: 'Sales / RevOps', purpose: `Confirm ${triggerLabel(input)} and required commercial fields.`, gate: 'Only one canonical ready event may pass.' },
    { id: 'welcome', label: 'Welcome + ownership', system: communicationName, owner: input.owner.replace('-', ' '), purpose: 'Acknowledge the client, set expectations, and assign one accountable owner.' },
    { id: 'intake', label: 'Structured intake', system: intakeName, owner: 'Client + onboarding owner', purpose: 'Collect only missing delivery inputs, assets, stakeholders, dates, and service-specific requirements.', gate: 'Required intake fields complete.' },
    { id: 'access', label: 'Access + assets', system: input.fileAppId ?? 'secure checklist', owner: 'Client + onboarding owner', purpose: 'Track files, permissions, accounts, credentials, and approvals as explicit required items.', gate: input.accessComplexity === 'none' ? 'No access gate required.' : 'Required access verified.' },
    { id: 'workspace', label: 'Delivery setup', system: projectName, owner: 'Delivery operations', purpose: 'Create the correct template, roles, tasks, relative dates, folders, and internal context once.' },
    { id: 'kickoff', label: 'Kickoff', system: input.communicationAppId ?? input.crmId ?? 'calendar', owner: 'Account / delivery lead', purpose: 'Schedule kickoff only when prerequisites make the meeting useful.' },
    { id: 'ready', label: 'Ready for delivery', system: crmName, owner: 'Onboarding owner', purpose: 'Write completion status back to the source of truth and hand control to delivery.', gate: 'Commercial + intake + access + workspace + owner checks pass.' },
  ]

  const architecture = [
    `${crmName}: source of truth for client/deal state, commercial context, owner, and onboarding status.`,
    `${projectName}: delivery execution; create from a governed template rather than reconstructing tasks in automation.`,
    `${intakeName}: collect missing client inputs and write normalized answers back to the source record where useful.`,
    systemCount > 2 ? 'Orchestration layer: coordinate only the cross-system transitions, retries, exception states, and resource IDs.' : 'Keep the flow native where possible; an extra orchestration platform is not automatically required.',
  ]

  const safeguards = [
    'Use one stable deal/client key so retries cannot create duplicate projects or duplicate welcome sequences.',
    'Persist created project/folder/resource IDs back to the source record so the flow can resume safely.',
    'Do not assume webhook events arrive once or in order; verify current source state before irreversible actions.',
    'Put failed or incomplete onboardings into a visible exception queue instead of hiding them in automation logs.',
    'Separate “sold”, “onboarding”, and “ready for delivery” states so reporting reflects operational reality.',
  ]

  const thirtyDayPlan = [
    { week: 'Week 1', focus: 'Define readiness', actions: ['Choose the canonical onboarding trigger.', 'Define the minimum handoff payload.', 'Define the ready-for-delivery gate and exception reasons.'] },
    { week: 'Week 2', focus: 'Standardize setup', actions: ['Create service-family intake and project templates.', 'Define owner assignment and required access checklist.', 'Remove duplicate or conflicting onboarding trackers.'] },
    { week: 'Week 3', focus: 'Automate the stable path', actions: ['Connect trigger → welcome → intake → workspace.', 'Write resource IDs/status back to the CRM.', 'Add reminders and due-date logic.'] },
    { week: 'Week 4', focus: 'Make it reliable', actions: ['Add idempotency, failure alerts, and exception queue.', 'Test duplicate/retry/partial-completion scenarios.', 'Measure time-to-ready and missing-item rate.'] },
  ]

  const strengths: string[] = []
  if (triggerClarity >= 80) strengths.push('The onboarding start condition is clear enough to automate safely.')
  if (input.processRepeatability >= 2) strengths.push('The process is repeatable enough for templates and standard automation.')
  if (handoffQuality >= 75) strengths.push('Sales-to-delivery context transfer is in good shape.')
  if (clientReadiness >= 75) strengths.push('Client inputs and access are managed as real readiness work, not email chasing.')
  if (reliability >= 70) strengths.push('Retries, failures, and exceptions are treated as operational states.')

  const unknowns = [!input.crmId, input.requireSigned && !input.contractAppId, input.requirePaid && !input.billingAppId, !input.projectAppId && input.monthlyClients >= 15, input.customSystems.length > 0].filter(Boolean).length
  const confidence = clamp(94 - unknowns * 8 - (systemCount < 2 ? 8 : 0), 45, 96)
  const nextQuestions: string[] = []
  if (!input.crmId) nextQuestions.push('Which system is the source of truth for the client/deal?')
  if (input.requireSigned && !input.contractAppId) nextQuestions.push('Which system is authoritative for contract signature?')
  if (input.requirePaid && !input.billingAppId) nextQuestions.push('Which payment/billing event actually means the client may start?')
  if (!input.projectAppId && input.monthlyClients >= 15) nextQuestions.push('Where should the delivery workspace/project be created?')
  if (input.customSystems.length) nextQuestions.push('Do the internal/niche systems expose reliable APIs or webhooks?')

  const status = score >= 85 ? 'Ready to automate' : score >= 70 ? 'Good foundation, tighten the gates' : score >= 55 ? 'Useful process, but fragile' : 'Standardize before scaling automation'
  const summary = score >= 85
    ? 'The onboarding path is structured enough to automate deeply without hiding operational risk.'
    : score >= 70
      ? 'The flow is workable, but a few readiness and reliability controls should be fixed before adding more volume.'
      : score >= 55
        ? 'Automation will help, but only after the weakest handoffs and exception paths are made explicit.'
        : 'The main problem is process design, not missing automation. Standardize the operating model first.'

  return { score, confidence, status, summary, metrics: { triggerClarity, handoffQuality, clientReadiness, deliverySetup, reliability, ownership }, issues, stages, architecture, safeguards, thirtyDayPlan, strengths, nextQuestions }
}
