import type { PlatformId, TeamProfile } from './types'

export type PlatformProfile = {
  id: PlatformId
  name: string
  description: string
  technicalDepth: number
  simpleWorkflowFit: number
  complexWorkflowFit: number
  standardIntegrationBreadth: number
  customApiFit: number
  scaleFit: number
  reliabilityFit: number
  governanceFit: number
  selfHostFit: number
  crmNativeFit: number
  microsoftFit: number
  costAtScaleFit: number
  teamFit: Record<TeamProfile, number>
}

export const PLATFORMS: PlatformProfile[] = [
  {
    id: 'crm-native',
    name: 'CRM-native automation',
    description: 'Best when the process mostly lives inside one CRM and adding another automation layer would create more moving parts than value.',
    technicalDepth: 18,
    simpleWorkflowFit: 100,
    complexWorkflowFit: 38,
    standardIntegrationBreadth: 48,
    customApiFit: 42,
    scaleFit: 68,
    reliabilityFit: 78,
    governanceFit: 78,
    selfHostFit: 0,
    crmNativeFit: 100,
    microsoftFit: 42,
    costAtScaleFit: 82,
    teamFit: { business: 100, automation: 80, developer: 52, mixed: 84 },
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Best for straightforward business automations where broad SaaS coverage, speed, and non-technical ownership matter most.',
    technicalDepth: 34,
    simpleWorkflowFit: 96,
    complexWorkflowFit: 61,
    standardIntegrationBreadth: 100,
    customApiFit: 70,
    scaleFit: 62,
    reliabilityFit: 74,
    governanceFit: 82,
    selfHostFit: 0,
    crmNativeFit: 68,
    microsoftFit: 72,
    costAtScaleFit: 48,
    teamFit: { business: 100, automation: 90, developer: 64, mixed: 90 },
  },
  {
    id: 'make',
    name: 'Make',
    description: 'Best for visual multi-step workflows with branching, transformations, and broad SaaS integrations without requiring a developer-first environment.',
    technicalDepth: 56,
    simpleWorkflowFit: 84,
    complexWorkflowFit: 90,
    standardIntegrationBreadth: 94,
    customApiFit: 86,
    scaleFit: 82,
    reliabilityFit: 78,
    governanceFit: 76,
    selfHostFit: 0,
    crmNativeFit: 64,
    microsoftFit: 70,
    costAtScaleFit: 80,
    teamFit: { business: 78, automation: 98, developer: 80, mixed: 91 },
  },
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Best when APIs, reusable logic, data transformation, AI steps, complex orchestration, or infrastructure control justify a more technical automation layer.',
    technicalDepth: 82,
    simpleWorkflowFit: 58,
    complexWorkflowFit: 98,
    standardIntegrationBreadth: 86,
    customApiFit: 100,
    scaleFit: 94,
    reliabilityFit: 88,
    governanceFit: 82,
    selfHostFit: 100,
    crmNativeFit: 58,
    microsoftFit: 68,
    costAtScaleFit: 94,
    teamFit: { business: 48, automation: 100, developer: 96, mixed: 88 },
  },
  {
    id: 'power-automate',
    name: 'Power Automate',
    description: 'Best when Microsoft 365, Dynamics, Azure, desktop automation, and enterprise governance are core constraints rather than incidental integrations.',
    technicalDepth: 60,
    simpleWorkflowFit: 80,
    complexWorkflowFit: 88,
    standardIntegrationBreadth: 82,
    customApiFit: 84,
    scaleFit: 88,
    reliabilityFit: 90,
    governanceFit: 100,
    selfHostFit: 18,
    crmNativeFit: 62,
    microsoftFit: 100,
    costAtScaleFit: 76,
    teamFit: { business: 80, automation: 94, developer: 86, mixed: 94 },
  },
  {
    id: 'activepieces',
    name: 'Activepieces',
    description: 'Best as an open-source automation option when self-hosting matters and the required connectors are available.',
    technicalDepth: 72,
    simpleWorkflowFit: 64,
    complexWorkflowFit: 86,
    standardIntegrationBreadth: 72,
    customApiFit: 92,
    scaleFit: 88,
    reliabilityFit: 82,
    governanceFit: 72,
    selfHostFit: 100,
    crmNativeFit: 52,
    microsoftFit: 54,
    costAtScaleFit: 92,
    teamFit: { business: 52, automation: 92, developer: 92, mixed: 82 },
  },
  {
    id: 'custom-code',
    name: 'Custom application / code',
    description: 'Best when the automation has become product logic, transactional infrastructure, a stateful internal application, or a system that needs a custom interface and full ownership.',
    technicalDepth: 100,
    simpleWorkflowFit: 18,
    complexWorkflowFit: 100,
    standardIntegrationBreadth: 100,
    customApiFit: 100,
    scaleFit: 100,
    reliabilityFit: 100,
    governanceFit: 94,
    selfHostFit: 100,
    crmNativeFit: 40,
    microsoftFit: 88,
    costAtScaleFit: 72,
    teamFit: { business: 12, automation: 54, developer: 100, mixed: 78 },
  },
]
