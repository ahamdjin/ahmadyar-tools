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
  const result = analyzeArchitecture({ ...DEFAULT_ASSESSMENT, selfHosting: 'required', team: 'developer', maintenance: 'high', customApi: true })
  for (const id of ['zapier', 'make', 'crm-native', 'power-automate']) {
    const platform = result.ranking.find((item) => item.id === id)
    assert.equal(platform?.eligible, false, `${id} should be ineligible when self-hosting is required`)
  }
})

test('simple CRM work does not default to n8n', () => {
  const result = analyzeArchitecture({
    ...DEFAULT_ASSESSMENT,
    currentWorkflows: 2,
    futureWorkflows: 4,
    appsPerWorkflow: 2,
    typicalSteps: 3,
    crmCentered: true,
    branching: 'none',
    team: 'business',
    maintenance: 'low',
  })
  assert.equal(result.primary.id, 'crm-native')
  assert.ok((result.ranking.find((item) => item.id === 'n8n')?.score ?? 100) < result.primary.score)
})

test('critical duplicate-unsafe flows produce safeguards', () => {
  const result = analyzeArchitecture({ ...DEFAULT_ASSESSMENT, failureImpact: 'critical', duplicateUnsafe: true, retriesRequired: true })
  assert.ok(result.safeguards.some((item) => item.toLowerCase().includes('idempotency')))
  assert.ok(result.metrics.reliabilityRisk >= 70)
})
