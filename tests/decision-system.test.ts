import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DEFAULT_ASSESSMENT,
  recommendOperatingModel,
  stressTestArchitecture,
} from '../engine'

test('operating model grows with the workflow portfolio', () => {
  assert.equal(recommendOperatingModel({ ...DEFAULT_ASSESSMENT, futureWorkflows: 6 }).level, 'lightweight')
  assert.equal(recommendOperatingModel({ ...DEFAULT_ASSESSMENT, futureWorkflows: 16 }).level, 'managed')
  assert.equal(recommendOperatingModel({ ...DEFAULT_ASSESSMENT, futureWorkflows: 40 }).level, 'governed')
  assert.equal(recommendOperatingModel({ ...DEFAULT_ASSESSMENT, futureWorkflows: 90 }).level, 'platform')
})

test('stress tests expose conditions that can change the recommendation', () => {
  const scenarios = stressTestArchitecture({
    ...DEFAULT_ASSESSMENT,
    currentWorkflows: 5,
    futureWorkflows: 12,
    team: 'business',
    maintenance: 'low',
    integrationNeed: 'broad',
  })

  assert.equal(scenarios.length, 6)
  assert.ok(scenarios.some((scenario) => scenario.changedRecommendation))
  assert.ok(scenarios.some((scenario) => scenario.id === 'self-host-required'))
  assert.ok(scenarios.some((scenario) => scenario.id === 'crm-consolidation'))
})
