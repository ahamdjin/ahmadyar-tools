export type FollowUpLevel = 0 | 1 | 2 | 3
export type FollowUpChannel = 'email' | 'sms' | 'call' | 'whatsapp'
export type FirstResponseMode = 'human' | 'automated' | 'hybrid'
export type AfterHoursMode = 'wait' | 'acknowledge' | 'on-call-priority' | 'always-on'
export type CadenceStyle = 'light' | 'balanced' | 'fast'
export type ReentryPolicy = 'never' | 'new-opportunity' | 'cooldown' | 'manual'

export type LeadFollowUpInput = {
  crmId: string | null
  monthlyLeads: number
  reps: number
  targetResponseMinutes: number
  firstResponseMode: FirstResponseMode
  afterHours: AfterHoursMode
  channels: FollowUpChannel[]
  cadenceStyle: CadenceStyle
  cadenceDays: number
  plannedTouches: number
  replyDetection: FollowUpLevel
  bookingDetection: FollowUpLevel
  lifecycleStopRules: FollowUpLevel
  consentControl: FollowUpLevel
  optOutControl: FollowUpLevel
  timezoneControl: FollowUpLevel
  duplicateControl: FollowUpLevel
  ownerAssignment: FollowUpLevel
  humanHandoff: FollowUpLevel
  staleLeadHandling: FollowUpLevel
  monitoring: FollowUpLevel
  personalization: FollowUpLevel
  reentryPolicy: ReentryPolicy
}

export type FollowUpIssue = {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  impact: string
  fix: string
}

export type FollowUpStage = {
  order: number
  label: string
  timing: string
  owner: string
  action: string
  exit: string
}

export type LeadFollowUpResult = {
  score: number
  confidence: number
  status: string
  summary: string
  recommendedPattern: string
  metrics: {
    speed: number
    stopSafety: number
    channelSafety: number
    ownership: number
    relevance: number
    operability: number
  }
  issues: FollowUpIssue[]
  stages: FollowUpStage[]
  stopRules: string[]
  safeguards: string[]
  measurement: string[]
  architecture: string[]
  testCases: Array<{ name: string; scenario: string; expected: string }>
  nextQuestions: string[]
}

export const DEFAULT_LEAD_FOLLOW_UP_INPUT: LeadFollowUpInput = {
  crmId: null,
  monthlyLeads: 500,
  reps: 5,
  targetResponseMinutes: 15,
  firstResponseMode: 'hybrid',
  afterHours: 'acknowledge',
  channels: ['email', 'sms', 'call'],
  cadenceStyle: 'balanced',
  cadenceDays: 10,
  plannedTouches: 7,
  replyDetection: 1,
  bookingDetection: 1,
  lifecycleStopRules: 1,
  consentControl: 1,
  optOutControl: 1,
  timezoneControl: 1,
  duplicateControl: 1,
  ownerAssignment: 2,
  humanHandoff: 1,
  staleLeadHandling: 1,
  monitoring: 1,
  personalization: 1,
  reentryPolicy: 'new-opportunity',
}

const level = (value: FollowUpLevel) => value * (100 / 3)
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

function severity(risk: number): FollowUpIssue['severity'] {
  if (risk >= 85) return 'critical'
  if (risk >= 65) return 'high'
  if (risk >= 40) return 'medium'
  return 'low'
}

function crmLabel(crmId: string | null) {
  const labels: Record<string, string> = {
    hubspot: 'HubSpot',
    gohighlevel: 'GoHighLevel',
    salesforce: 'Salesforce',
    'dynamics-365': 'Microsoft Dynamics 365',
    pipedrive: 'Pipedrive',
    'zoho-crm': 'Zoho CRM',
    close: 'Close',
    attio: 'Attio',
  }
  return crmId ? labels[crmId] ?? 'your CRM' : 'your CRM'
}

function channelLabel(channels: FollowUpChannel[]) {
  const labels: Record<FollowUpChannel, string> = { email: 'email', sms: 'SMS', call: 'calls', whatsapp: 'WhatsApp' }
  return channels.map((channel) => labels[channel]).join(', ')
}

export function analyzeLeadFollowUp(input: LeadFollowUpInput): LeadFollowUpResult {
  const speed = clamp(
    level(input.ownerAssignment) * 0.36 +
      (input.targetResponseMinutes <= 5 ? 100 : input.targetResponseMinutes <= 15 ? 90 : input.targetResponseMinutes <= 60 ? 70 : input.targetResponseMinutes <= 240 ? 45 : 25) * 0.38 +
      (input.afterHours === 'always-on' || input.afterHours === 'on-call-priority' ? 88 : input.afterHours === 'acknowledge' ? 72 : 45) * 0.26,
  )
  const stopSafety = clamp(level(input.replyDetection) * 0.36 + level(input.bookingDetection) * 0.27 + level(input.lifecycleStopRules) * 0.27 + level(input.duplicateControl) * 0.1)
  const channelSafety = clamp(level(input.consentControl) * 0.35 + level(input.optOutControl) * 0.35 + level(input.timezoneControl) * 0.2 + level(input.duplicateControl) * 0.1)
  const ownership = clamp(level(input.ownerAssignment) * 0.42 + level(input.humanHandoff) * 0.36 + level(input.staleLeadHandling) * 0.22)
  const relevance = clamp(level(input.personalization) * 0.38 + level(input.lifecycleStopRules) * 0.27 + level(input.replyDetection) * 0.2 + (input.plannedTouches <= 12 ? 82 : 48) * 0.15)
  const operability = clamp(level(input.monitoring) * 0.45 + level(input.staleLeadHandling) * 0.25 + level(input.duplicateControl) * 0.15 + level(input.humanHandoff) * 0.15)

  let score = clamp(speed * 0.18 + stopSafety * 0.22 + channelSafety * 0.18 + ownership * 0.16 + relevance * 0.12 + operability * 0.14)
  if (input.channels.includes('sms') || input.channels.includes('whatsapp')) {
    if (input.consentControl <= 1 || input.optOutControl <= 1) score = clamp(score - 8)
  }
  if (input.monthlyLeads >= 2000 && input.monitoring <= 1) score = clamp(score - 6)
  if (input.plannedTouches >= 12 && input.lifecycleStopRules <= 1) score = clamp(score - 7)
  if (input.replyDetection === 0) score = clamp(score - 8)

  const issues: FollowUpIssue[] = []
  const add = (id: string, risk: number, title: string, impact: string, fix: string) => {
    if (risk < 28) return
    issues.push({ id, severity: severity(risk), title, impact, fix })
  }

  add(
    'reply-stop',
    (100 - level(input.replyDetection)) * 1.05,
    'Reply detection is not authoritative',
    'A lead can respond and still receive automated follow-up, which creates a visibly broken customer experience and can collide with a rep conversation.',
    'Make reply detection a hard exit from the active cadence. Hand the lead to the owner with the conversation context instead of continuing scheduled outreach.',
  )
  add(
    'booking-stop',
    (100 - level(input.bookingDetection)) * 0.8,
    'Booked leads can remain in prospecting follow-up',
    'Appointment confirmation and prospecting messages can overlap unless booking state is treated as a stop condition.',
    'Remove or branch the lead as soon as a qualifying appointment is booked; move them to appointment confirmation/reminder logic instead.',
  )
  add(
    'lifecycle-stop',
    (100 - level(input.lifecycleStopRules)) * (input.plannedTouches >= 8 ? 0.95 : 0.72),
    'The cadence does not respect lifecycle changes',
    'Disqualified, active-opportunity, customer, or manually paused records can keep receiving messages when state changes outside the cadence.',
    'Define CRM states that immediately stop or switch the cadence, and evaluate them again before each high-impact message.',
  )
  const conversationalChannels = input.channels.some((channel) => channel === 'sms' || channel === 'whatsapp')
  add(
    'consent',
    (100 - level(input.consentControl)) * (conversationalChannels ? 1.05 : 0.65),
    'Consent and channel eligibility are not explicit enough',
    'A technically deliverable message is not automatically appropriate for every contact, channel, or jurisdiction.',
    'Store channel eligibility/consent as explicit data and check it before enrollment and before channel-specific sends. Verify current legal and provider requirements for the markets you operate in.',
  )
  add(
    'opt-out',
    (100 - level(input.optOutControl)) * (conversationalChannels ? 1.05 : 0.72),
    'Opt-out is not a global stop condition',
    'A contact who opts out through one path can continue receiving scheduled outreach elsewhere if suppression is local to a single workflow.',
    'Centralize suppression/opt-out state and make every outreach workflow consume it before sending.',
  )
  add(
    'timezone',
    (100 - level(input.timezoneControl)) * (input.channels.includes('sms') || input.channels.includes('call') ? 0.85 : 0.55),
    'Send windows can ignore the lead’s local time',
    'Calls or conversational messages at the wrong local time reduce trust and can violate channel or regional requirements.',
    'Resolve a reliable timezone, define allowed contact windows, and queue uncertain records for a safer default window.',
  )
  add(
    'ownership',
    (100 - level(input.ownerAssignment)) * (input.reps >= 5 ? 0.9 : 0.65) + (100 - level(input.humanHandoff)) * 0.35,
    'Automation can outrun the human owner',
    'Fast automated acknowledgement is useful only if a real owner receives the lead, sees replies, and knows when the automation has handed control over.',
    'Assign one owner before or with the first touch, create an explicit handoff event, and stop automated prospecting once a human conversation starts.',
  )
  add(
    'monitoring',
    (100 - level(input.monitoring)) * (input.monthlyLeads >= 1000 ? 0.95 : 0.68),
    'Follow-up failures can stay invisible',
    'Enrollment failures, blocked messages, missing owners, invalid contact data, and stalled leads silently reduce coverage at scale.',
    'Track enrollment, first-touch latency, delivery/failure state, replies, bookings, opt-outs, owner handoff, and leads that exhaust the cadence without an outcome.',
  )
  add(
    'duplicates',
    (100 - level(input.duplicateControl)) * 0.78,
    'Duplicate enrollment can create duplicate outreach',
    'The same person can enter from multiple forms, imports, or opportunities and receive overlapping cadences.',
    'Deduplicate identity before enrollment and define re-entry around a real new opportunity or a deliberate cooldown, not repeated trigger events.',
  )

  issues.sort((a, b) => ({ critical: 4, high: 3, medium: 2, low: 1 }[b.severity] - { critical: 4, high: 3, medium: 2, low: 1 }[a.severity]))

  const crm = crmLabel(input.crmId)
  const firstTouch = input.firstResponseMode === 'human'
    ? 'Create an immediate owner task/notification; the first meaningful response stays human.'
    : input.firstResponseMode === 'automated'
      ? 'Send an immediate acknowledgement only when channel eligibility is known, then move into the planned cadence.'
      : 'Send a brief acknowledgement where appropriate and alert the owner to make the first meaningful human response.'

  const stages: FollowUpStage[] = [
    { order: 1, label: 'Qualify enrollment', timing: 'At lead creation', owner: 'System', action: 'Normalize identity, check duplicate/re-entry rules, consent/channel eligibility, current lifecycle state, and owner.', exit: 'Do not enroll if suppressed, duplicate, already active, disqualified, or otherwise ineligible.' },
    { order: 2, label: 'First response', timing: `Target ≤ ${input.targetResponseMinutes} min`, owner: input.firstResponseMode === 'automated' ? 'Automation' : 'Lead owner + automation', action: firstTouch, exit: 'Reply, booking, disqualification, active opportunity, opt-out, or manual takeover.' },
    { order: 3, label: 'Early follow-up', timing: input.cadenceStyle === 'fast' ? 'First 1–2 days' : 'First 2–3 days', owner: 'Lead owner + cadence', action: `Use the highest-value mix of ${channelLabel(input.channels)} without repeating the same generic message. Change the reason to respond, not just the wording.`, exit: 'Evaluate stop conditions before every scheduled touch.' },
    { order: 4, label: 'Value follow-up', timing: `Through day ${Math.max(3, Math.round(input.cadenceDays * 0.65))}`, owner: 'Lead owner + cadence', action: 'Use context, proof, a useful resource, or a clear next step. Keep manual tasks visible when judgment is more useful than another automated send.', exit: 'Any engagement or lifecycle transition moves the lead out of prospecting cadence.' },
    { order: 5, label: 'Close the active cadence', timing: `By day ${input.cadenceDays}`, owner: 'System + owner', action: 'Finish with a clear outcome: engaged, booked, disqualified, nurture, recycle/cooldown, or no-response. Never leave the record in an ambiguous active-follow-up state.', exit: 'Write the outcome and next eligible date/state back to the CRM.' },
  ]

  const stopRules = [
    'A real reply starts a human conversation and stops the prospecting cadence.',
    'A qualifying booking exits prospecting and enters appointment confirmation/reminder logic.',
    'Opt-out or suppression stops all applicable automated outreach immediately.',
    'Disqualified, customer, active-opportunity, or manually paused states must not continue the generic lead cadence.',
    'Owner takeover can pause/stop automation without deleting CRM history.',
  ]

  const safeguards = [
    'Evaluate stop/suppression state again immediately before every automated message, not only at enrollment.',
    'Use one authoritative active cadence per lead/opportunity so two workflows cannot compete for the same person.',
    'Store cadence/enrollment version, started_at, last_touch_at, next_touch_at, outcome, and exit_reason for auditability.',
    'Treat provider delivery status separately from a human reply; delivered does not mean engaged.',
    'Keep consent, opt-out, quiet-hour and sender requirements configurable because channel/provider/regional rules change.',
  ]
  if (input.reentryPolicy === 'cooldown') safeguards.push('Persist the cooldown-until timestamp and reject new enrollment attempts until it expires unless an explicit new opportunity overrides it.')
  if (input.reentryPolicy === 'new-opportunity') safeguards.push('Use a stable opportunity/deal identifier so a genuine new opportunity can re-enter without replaying the old cadence by accident.')

  const measurement = [
    'time_to_first_meaningful_response',
    'eligible_leads_enrolled_pct',
    'reply_rate_by_touch_and_channel',
    'meeting_booked_rate',
    'qualified_opportunity_rate',
    'opt_out_rate_by_channel',
    'cadence_exhausted_without_outcome',
    'owner_handoff_latency',
    'message_failure_rate',
    'duplicate_or_blocked_enrollment_rate',
  ]

  const architecture = [
    `${crm}: keep identity, lifecycle state, ownership, suppression state, cadence outcome, and next action visible in the CRM source of truth.`,
    input.crmId === 'gohighlevel'
      ? 'GoHighLevel: native workflows are a strong first choice when messaging, conversations, opportunities, calendars and follow-up already live there; configure stop-on-response behavior carefully and test voicemail/call edge cases.'
      : input.crmId === 'hubspot'
        ? 'HubSpot: keep lifecycle/ownership and standard CRM follow-up native where your edition supports the needed workflow/sequence behavior; verify enrollment and unenrollment criteria against the current product before launch.'
        : input.crmId === 'salesforce'
          ? 'Salesforce: Sales Engagement cadences are a natural native option when licensed; keep cadence membership, task progression and CRM state aligned rather than creating a second shadow prospect state.'
          : `Native-first: use ${crm}'s own task/workflow/cadence capability when it can enforce the stop rules and reporting model; add external orchestration only for real cross-system gaps.`,
    'External orchestration, when required: coordinate cross-system signals such as form sources, enrichment, messaging providers or calendars, but do not let it become a second source of truth for lead state.',
  ]

  const testCases = [
    { name: 'Reply after first touch', scenario: 'Lead replies before the next scheduled message.', expected: 'Active prospecting stops and the owner receives the conversation context.' },
    { name: 'Meeting booked externally', scenario: 'Lead books through the calendar between two cadence steps.', expected: 'Prospecting stops before the next touch and the record moves to booked/appointment logic.' },
    { name: 'Opt-out', scenario: 'Lead opts out through an allowed channel.', expected: 'Suppression is written centrally and later sends are blocked.' },
    { name: 'Duplicate form submission', scenario: 'The same person submits twice within minutes.', expected: 'The existing active enrollment is preserved; no second cadence is started.' },
    { name: 'Existing opportunity', scenario: 'A known contact with an active opportunity triggers a new inbound event.', expected: 'Generic prospecting is blocked or routed to the existing owner under the documented lifecycle policy.' },
    { name: 'After-hours lead', scenario: 'An eligible lead arrives outside the configured contact window.', expected: input.afterHours === 'wait' ? 'Queue the first touch for the next allowed window.' : 'Use only the configured after-hours acknowledgement/on-call path and preserve the normal SLA clock policy.' },
    { name: 'Message failure', scenario: 'Primary outbound message is rejected or provider delivery fails.', expected: 'Failure is visible, retry/fallback policy is bounded, and the lead does not silently disappear.' },
  ]

  const nextQuestions: string[] = []
  if (!input.crmId) nextQuestions.push('Which CRM is the authoritative lead/owner system?')
  if (input.replyDetection < 2) nextQuestions.push('What event proves a real lead reply across every channel you plan to use?')
  if (input.bookingDetection < 2) nextQuestions.push('Which calendar/appointment state should immediately stop prospecting follow-up?')
  if (input.consentControl < 2 && conversationalChannels) nextQuestions.push('Where is channel consent/eligibility stored before SMS or WhatsApp enrollment?')
  if (input.ownerAssignment < 2 || input.humanHandoff < 2) nextQuestions.push('Who owns a lead the moment it replies, and how is that owner notified?')
  if (input.monitoring < 2) nextQuestions.push('Who reviews failed sends, unowned leads and exhausted cadences each week?')

  const confidenceSignals = [input.crmId ? 1 : 0, input.replyDetection >= 2 ? 1 : 0, input.bookingDetection >= 2 ? 1 : 0, input.lifecycleStopRules >= 2 ? 1 : 0, input.consentControl >= 2 ? 1 : 0, input.ownerAssignment >= 2 ? 1 : 0, input.monitoring >= 2 ? 1 : 0]
  const confidence = clamp(42 + (confidenceSignals.reduce((sum, item) => sum + item, 0) / confidenceSignals.length) * 48 - Math.min(10, issues.filter((issue) => issue.severity === 'critical').length * 5))

  const status = score >= 84 ? 'Ready for controlled automation' : score >= 68 ? 'Good foundation with a few important gaps' : score >= 50 ? 'Fix the stop and ownership model before scaling' : 'Do not scale this cadence yet'
  const recommendedPattern = input.firstResponseMode === 'human'
    ? 'SLA-driven human first response with automated tasking, reminders and bounded nurture'
    : input.firstResponseMode === 'automated'
      ? 'Eligibility-gated acknowledgement followed by a state-aware multi-touch cadence'
      : 'Immediate acknowledgement + owner handoff + state-aware multi-touch cadence'

  return {
    score,
    confidence,
    status,
    summary: `Design the system around state changes, not a fixed sequence of messages. For ${input.monthlyLeads.toLocaleString()} leads/month, the biggest risks are usually continuing after engagement, unclear ownership, weak channel eligibility, and follow-up failures that nobody sees.`,
    recommendedPattern,
    metrics: { speed, stopSafety, channelSafety, ownership, relevance, operability },
    issues,
    stages,
    stopRules,
    safeguards,
    measurement,
    architecture,
    testCases,
    nextQuestions: nextQuestions.slice(0, 4),
  }
}
