export const TOOLS = [
  {
    slug: 'automation-architecture-advisor',
    title: 'Automation Architecture Advisor',
    shortTitle: 'Architecture Advisor',
    status: 'advanced',
    description: 'Model your current and future automation environment, then get a practical architecture, platform mix, risks, and the questions that still matter.',
  },
  {
    slug: 'crm-automation-health-check',
    title: 'CRM Automation Health Check',
    shortTitle: 'CRM Health Check',
    status: 'advanced',
    description: 'Audit the real CRM operating system: capture, data quality, routing, response, follow-up, pipeline hygiene, handoffs, reporting, adoption, ownership, and automation reliability.',
  },
  {
    slug: 'client-onboarding-automation-planner',
    title: 'Client Onboarding Automation Planner',
    shortTitle: 'Onboarding Planner',
    status: 'advanced',
    description: 'Model the sales-to-delivery handoff, readiness gates, systems, client inputs, access, setup, exceptions, and reliability, then get a practical onboarding architecture and repair plan.',
  },
  {
    slug: 'lead-routing-rules-builder',
    title: 'Lead Routing Rules Builder',
    shortTitle: 'Lead Routing Builder',
    status: 'advanced',
    description: 'Design and test routing precedence, existing-account protection, duplicates, eligibility, round robin or capacity, fallback, response SLAs, reassignment, and auditability.',
  },
] as const

export type ToolSlug = (typeof TOOLS)[number]['slug']

export function getTool(slug: string) {
  return TOOLS.find((tool) => tool.slug === slug)
}
