import assert from 'node:assert/strict'
import test from 'node:test'

import { analyzeArchitecture, BENCHMARK_SCENARIOS, DEFAULT_ASSESSMENT } from '../engine'

test('benchmark scenarios choose the intended architecture family', () => {
  for (const scenario of BENCHMARK_SCENARIOS) {
    const result = analyzeArchitecture(scenario.input)
    assert.equal(result.primary.id, scenario.expectedPrimary, `${scenario.name}: expected ${scenario.expectedPrimary}, got ${result.primary.id}`)
  }
})

test('self-hosting requirement eliminates managed-only platforms', () => {
  const result = analyzeArchitecture({
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['postgresql', 'openai', 'hubspot'],
    selfHosting: 'required',
    technicalOwner: 'developer',
    team: 'developer',
    maintenance: 'high',
    customApi: true,
    portfolioShape: 'advanced',
  })
  for (const id of ['zapier', 'make', 'crm-native', 'power-automate', 'n8n-cloud', 'pipedream', 'workato', 'tray']) {
    const platform = result.ranking.find((item) => item.id === id)
    assert.equal(platform?.eligible, false, `${id} should be ineligible when self-hosting is required`)
  }
  assert.ok(['n8n-self-hosted', 'activepieces', 'custom-code'].includes(result.primary.id))
})

test('simple CRM work does not default to technical orchestration', () => {
  const result = analyzeArchitecture({
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['hubspot', 'slack'],
    primarySystemId: 'hubspot',
    currentWorkflows: 2,
    futureWorkflows: 4,
    appsPerWorkflow: 2,
    typicalSteps: 3,
    portfolioShape: 'mostly-simple',
    crmCentered: true,
    branching: 'none',
    technicalOwner: 'none',
    team: 'business',
    maintenance: 'low',
  })
  assert.equal(result.primary.id, 'crm-native')
  assert.ok((result.ranking.find((item) => item.id === 'n8n-cloud')?.score ?? 100) < result.primary.score)
  assert.match(result.primary.name, /HubSpot native automation/)
})

test('critical duplicate-unsafe flows produce safeguards', () => {
  const result = analyzeArchitecture({ ...DEFAULT_ASSESSMENT, failureImpact: 'critical', duplicateUnsafe: true, retriesRequired: true })
  assert.ok(result.safeguards.some((item) => item.toLowerCase().includes('idempotency')))
  assert.ok(result.metrics.reliabilityRisk >= 70)
})

test('portfolio plan can recommend different tools for different workflow lanes', () => {
  const result = analyzeArchitecture({
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['hubspot', 'slack', 'typeform', 'openai', 'postgresql'],
    primarySystemId: 'hubspot',
    currentWorkflows: 20,
    futureWorkflows: 50,
    monthlyRuns: 30000,
    appsPerWorkflow: 5,
    typicalSteps: 12,
    portfolioShape: 'advanced',
    technicalOwner: 'automation-specialist',
    team: 'automation',
    maintenance: 'high',
    crmCentered: true,
    branching: 'advanced',
    customApi: true,
  })
  assert.ok(result.portfolioPlan.length >= 2)
  assert.ok(result.portfolioPlan.some((lane) => lane.id === 'native'))
  assert.ok(result.portfolioPlan.some((lane) => lane.id === 'orchestration'))
})
