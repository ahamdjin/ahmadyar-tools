import assert from 'node:assert/strict'
import test from 'node:test'

import { analyzeArchitecture, BENCHMARK_SCENARIOS, DEFAULT_ASSESSMENT, PLATFORMS } from '../engine'

test('benchmark scenarios choose the intended architecture family', () => {
  const mismatches: string[] = []

  for (const scenario of BENCHMARK_SCENARIOS) {
    const result = analyzeArchitecture(scenario.input)
    if (result.primary.id !== scenario.expectedPrimary) {
      mismatches.push(`${scenario.name}: expected ${scenario.expectedPrimary}, got ${result.primary.id} (${result.ranking.slice(0, 3).map((item) => `${item.id}:${item.score}`).join(', ')})`)
    }
  }

  assert.deepEqual(mismatches, [])
})

test('every modeled platform has a benchmark where it can win', () => {
  const expectedWinners = new Set(BENCHMARK_SCENARIOS.map((scenario) => scenario.expectedPrimary))
  const missing = PLATFORMS.map((platform) => platform.id).filter((id) => !expectedWinners.has(id))
  assert.deepEqual(missing, [])
})

test('self-hosting requirement eliminates managed-only platforms', () => {
  const result = analyzeArchitecture({
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['postgresql', 'openai', 'hubspot'],
    primarySystemId: 'hubspot',
    selfHosting: 'required',
    technicalOwner: 'developer',
    team: 'developer',
    maintenance: 'high',
    customApi: true,
    portfolioShape: 'advanced',
  })
  for (const id of ['hubspot-native', 'zapier', 'make', 'power-automate', 'n8n-cloud', 'pipedream', 'workato', 'tray']) {
    const platform = result.ranking.find((item) => item.id === id)
    assert.equal(platform?.eligible, false, `${id} should be ineligible when self-hosting is required`)
  }
  assert.ok(['n8n-self-hosted', 'activepieces', 'trigger-dev', 'custom-code'].includes(result.primary.id))
})

test('simple HubSpot work stays in HubSpot instead of defaulting to orchestration', () => {
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
  assert.equal(result.primary.id, 'hubspot-native')
  assert.ok((result.ranking.find((item) => item.id === 'n8n-cloud')?.score ?? 100) < result.primary.score)
  assert.match(result.primary.name, /HubSpot native automation/)
})

test('GoHighLevel can win when the workflow belongs inside GoHighLevel', () => {
  const result = analyzeArchitecture({
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['gohighlevel', 'facebook-leads', 'google-calendar'],
    primarySystemId: 'gohighlevel',
    currentWorkflows: 6,
    futureWorkflows: 14,
    appsPerWorkflow: 3,
    typicalSteps: 6,
    portfolioShape: 'mostly-simple',
    crmCentered: true,
    technicalOwner: 'power-user',
    team: 'business',
    branching: 'simple',
  })
  assert.equal(result.primary.id, 'gohighlevel-native')
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
