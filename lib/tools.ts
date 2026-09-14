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
    status: 'live',
    description: 'Check lead capture, routing, follow-up, pipeline hygiene, onboarding, and reporting, then see the weak points worth fixing first.',
  },
  {
    slug: 'client-onboarding-automation-planner',
    title: 'Client Onboarding Automation Planner',
    shortTitle: 'Onboarding Planner',
    status: 'live',
    description: 'Turn your sales-to-delivery handoff into a clear onboarding flow with the right automation and human checkpoints.',
  },
  {
    slug: 'lead-routing-rules-builder',
    title: 'Lead Routing Rules Builder',
    shortTitle: 'Lead Routing Builder',
    status: 'live',
    description: 'Create a routing blueprint for qualification, ownership, priority, duplicates, after-hours handling, and fallback.',
  },
] as const

export type ToolSlug = (typeof TOOLS)[number]['slug']

export function getTool(slug: string) {
  return TOOLS.find((tool) => tool.slug === slug)
}
