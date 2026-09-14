import type { AssessmentInput } from './types'

export const DEFAULT_ASSESSMENT: AssessmentInput = {
  currentWorkflows: 5,
  futureWorkflows: 12,
  monthlyRuns: 2500,
  appsPerWorkflow: 4,
  typicalSteps: 7,
  team: 'business',
  maintenance: 'low',
  processStability: 'stable',
  integrationNeed: 'standard',
  branching: 'simple',
  loopsOrBatching: false,
  humanApprovals: false,
  customApi: false,
  aiSteps: false,
  filesOrDocuments: false,
  databaseWork: false,
  realtime: false,
  crmCentered: false,
  microsoftFirst: false,
  failureImpact: 'medium',
  duplicateUnsafe: false,
  retriesRequired: false,
  sensitiveData: false,
  selfHosting: 'none',
  governance: false,
  productLogic: false,
  priorities: ['ease', 'speed'],
}

export const BENCHMARK_SCENARIOS: Array<{ name: string; input: AssessmentInput; expectedPrimary: AssessmentInput extends never ? never : string }> = [
  {
    name: 'simple CRM follow-up',
    expectedPrimary: 'crm-native',
    input: { ...DEFAULT_ASSESSMENT, currentWorkflows: 3, futureWorkflows: 6, appsPerWorkflow: 2, typicalSteps: 4, crmCentered: true, branching: 'none', monthlyRuns: 1200 },
  },
  {
    name: 'non-technical SaaS handoffs',
    expectedPrimary: 'zapier',
    input: { ...DEFAULT_ASSESSMENT, currentWorkflows: 8, futureWorkflows: 16, appsPerWorkflow: 5, typicalSteps: 6, integrationNeed: 'broad', team: 'business', branching: 'simple' },
  },
  {
    name: 'visual multi-step operations',
    expectedPrimary: 'make',
    input: { ...DEFAULT_ASSESSMENT, currentWorkflows: 12, futureWorkflows: 25, appsPerWorkflow: 7, typicalSteps: 12, team: 'automation', maintenance: 'medium', branching: 'advanced', loopsOrBatching: true, integrationNeed: 'broad' },
  },
  {
    name: 'API-heavy orchestration',
    expectedPrimary: 'n8n',
    input: { ...DEFAULT_ASSESSMENT, currentWorkflows: 20, futureWorkflows: 55, appsPerWorkflow: 8, typicalSteps: 18, team: 'automation', maintenance: 'high', branching: 'advanced', customApi: true, aiSteps: true, monthlyRuns: 35000, priorities: ['scale', 'control', 'cost'] },
  },
  {
    name: 'Microsoft governed environment',
    expectedPrimary: 'power-automate',
    input: { ...DEFAULT_ASSESSMENT, currentWorkflows: 20, futureWorkflows: 70, appsPerWorkflow: 6, typicalSteps: 10, team: 'mixed', maintenance: 'medium', microsoftFirst: true, governance: true, humanApprovals: true, priorities: ['reliability', 'ease'] },
  },
  {
    name: 'self-hosted automation',
    expectedPrimary: 'n8n',
    input: { ...DEFAULT_ASSESSMENT, currentWorkflows: 12, futureWorkflows: 35, appsPerWorkflow: 6, typicalSteps: 14, team: 'developer', maintenance: 'high', customApi: true, selfHosting: 'required', branching: 'advanced', priorities: ['control', 'scale'] },
  },
  {
    name: 'stateful product logic',
    expectedPrimary: 'custom-code',
    input: { ...DEFAULT_ASSESSMENT, currentWorkflows: 4, futureWorkflows: 10, appsPerWorkflow: 8, typicalSteps: 24, team: 'developer', maintenance: 'high', customApi: true, databaseWork: true, realtime: true, productLogic: true, failureImpact: 'critical', duplicateUnsafe: true, retriesRequired: true, priorities: ['reliability', 'control', 'scale'] },
  },
]
