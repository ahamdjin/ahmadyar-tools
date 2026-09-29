import type { ToolSlug } from '@/lib/tools'

type Methodology = {
  reviewedAt: string
  principle: string
  evaluates: readonly string[]
  doesNot: string
  relatedWork: readonly {
    href: string
    label: string
    note: string
  }[]
}

export const TOOL_METHODOLOGY: Record<ToolSlug, Methodology> = {
  'automation-architecture-advisor': {
    reviewedAt: '2026-09-29',
    principle:
      'Put each responsibility in the lightest layer that can own it safely, then add orchestration or software only when the process earns the complexity.',
    evaluates: [
      'source of truth and process readiness',
      'workflow shape and cross-system complexity',
      'failure impact, recovery and observability',
      'technical ownership, governance and hosting',
      'volume, change frequency and future growth',
    ],
    doesNot:
      'It does not rank platforms by popularity, affiliate value or a single generic score, and it does not assume one platform should own every workflow.',
    relatedWork: [
      {
        href: '/work/case-studies/c4i-operating-architecture',
        label: 'C4I Operating Architecture',
        note: 'A real multi-pipeline operating system built from repeated sales, onboarding, support and follow-up work.',
      },
      {
        href: '/work/platforms/n8n',
        label: 'n8n workflow systems',
        note: 'Real orchestration examples where APIs, routing, CRM state and operational handoffs need more control.',
      },
    ],
  },
  'crm-automation-health-check': {
    reviewedAt: '2026-09-29',
    principle:
      'A CRM is healthy when capture, identity, ownership, response, pipeline state and handoffs are trustworthy enough for the team to operate from them.',
    evaluates: [
      'lead capture and source context',
      'duplicates and record identity',
      'ownership, routing and response',
      'follow-up and pipeline truth',
      'handoffs, reporting, monitoring and shadow systems',
    ],
    doesNot:
      'It does not reward a CRM for having more workflows. Extra automation is treated as a liability when ownership, recovery or source-of-truth controls are weak.',
    relatedWork: [
      {
        href: '/work/case-studies/lead-generation-website-and-ai-intake-system',
        label: 'Lead Intake and CRM System',
        note: 'A connected intake path covering website, call handling, lead capture and CRM follow-through.',
      },
      {
        href: '/ai-automation/crm',
        label: 'CRM automation work',
        note: 'How lead intake, ownership, follow-up, pipeline movement and reporting fit together in practice.',
      },
    ],
  },
  'client-onboarding-automation-planner': {
    reviewedAt: '2026-09-29',
    principle:
      'Separate “sold” from “ready for delivery,” then automate the stable handoffs around one canonical readiness state.',
    evaluates: [
      'commercial and payment readiness',
      'intake, access and missing information',
      'sales-to-delivery context',
      'project, file and communication setup',
      'ownership, exceptions and recovery',
    ],
    doesNot:
      'It does not reduce onboarding to a welcome email or assume closed-won means delivery can safely start.',
    relatedWork: [
      {
        href: '/work/case-studies/c4i-operating-architecture',
        label: 'C4I Operating Architecture',
        note: 'Includes a structured onboarding pipeline, workflows, calendars, templates and support handoffs.',
      },
      {
        href: '/ai-automation/operations',
        label: 'Operations automation work',
        note: 'Examples of onboarding, handoffs, task routing, approvals and repeatable delivery operations.',
      },
    ],
  },
  'lead-routing-rules-builder': {
    reviewedAt: '2026-09-29',
    principle:
      'Protect identity and existing relationships first, build the eligible pool second, distribute third, and always define fallback and response ownership.',
    evaluates: [
      'duplicates and existing ownership',
      'territory, segment, product and protected accounts',
      'availability, capacity and eligible pools',
      'round robin or weighted distribution',
      'fallback, SLA, reassignment and auditability',
    ],
    doesNot:
      'It does not treat round robin as the default answer or allow distribution logic to override an existing customer or account relationship without an explicit rule.',
    relatedWork: [
      {
        href: '/work/platforms/n8n',
        label: 'n8n routing workflows',
        note: 'Real lead-routing and qualification workflows using CRM context, business rules, APIs and ownership logic.',
      },
      {
        href: '/ai-automation/revenue',
        label: 'Revenue operations automation',
        note: 'How qualification, routing, follow-up and reporting fit into the wider revenue path.',
      },
    ],
  },
  'automation-roi-calculator': {
    reviewedAt: '2026-09-29',
    principle:
      'Separate theoretical time savings from captured business value, then include review, exceptions, maintenance and downside before calling an automation worthwhile.',
    evaluates: [
      'real monthly volume and handling time',
      'automation coverage and human review',
      'exception fallback and value capture',
      'build, software and maintenance cost',
      'process stability and failure impact',
    ],
    doesNot:
      'It does not treat every saved hour as cash, assume perfect automation coverage or present the optimistic case as an accounting forecast.',
    relatedWork: [
      {
        href: '/work/case-studies',
        label: 'Automation case studies',
        note: 'Real systems and workflows that show the implementation work behind the business case.',
      },
      {
        href: '/ai-automation',
        label: 'AI automation systems',
        note: 'The implementation areas where ROI depends on process shape, ownership and operating constraints.',
      },
    ],
  },
  'lead-follow-up-automation-planner': {
    reviewedAt: '2026-09-29',
    principle:
      'Automate state transitions and routine timing while making replies, bookings, suppression and human takeover hard exits from generic prospecting.',
    evaluates: [
      'response ownership and first-response SLA',
      'channel eligibility and cadence shape',
      'reply, booking and lifecycle stop rules',
      'consent, suppression and duplicate enrollment',
      'handoff, monitoring and measurable outcomes',
    ],
    doesNot:
      'It does not prescribe a universal number of touches or keep sending prospecting messages after the lead has clearly changed state.',
    relatedWork: [
      {
        href: '/work/case-studies/lead-generation-website-and-ai-intake-system',
        label: 'Lead Intake and CRM System',
        note: 'A real lead path connecting intake, CRM context and follow-through instead of treating follow-up as an isolated sequence.',
      },
      {
        href: '/ai-automation/sales',
        label: 'Sales automation work',
        note: 'Qualification, follow-up, meetings, pipeline movement and human handoffs in the wider sales system.',
      },
    ],
  },
}
