import assert from 'node:assert/strict'
import test from 'node:test'

import { APP_CATALOG, DEFAULT_ASSESSMENT, getQuestionPlan, inferEnvironment } from '../engine'

test('app catalog is large enough for real system discovery', () => {
  assert.ok(APP_CATALOG.length >= 120, `expected at least 120 apps, got ${APP_CATALOG.length}`)
  for (const id of ['hubspot', 'salesforce', 'gohighlevel', 'slack', 'stripe', 'shopify', 'openai', 'postgresql', 'zapier', 'make', 'n8n', 'power-automate']) {
    assert.ok(APP_CATALOG.some((app) => app.id === id), `missing ${id}`)
  }
})

test('selected systems create useful environment signals before the long form', () => {
  const input = {
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['hubspot', 'typeform', 'slack', 'stripe', 'openai'],
    primarySystemId: 'hubspot',
    customSystems: ['Internal scoring service'],
    otherSystemsCount: 2,
    unknownSystemsRequireApi: true,
  }
  const profile = inferEnvironment(input)
  assert.equal(profile.primarySystem?.id, 'hubspot')
  assert.ok(profile.integrationDifficulty >= 40)
  assert.ok(profile.apiPressure >= 28)
  assert.ok(profile.estimatedActionsPerMonth > input.monthlyRuns)
})

test('question plan expands only when the discovered environment needs it', () => {
  const simple = getQuestionPlan({
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['hubspot', 'slack'],
    primarySystemId: 'hubspot',
    portfolioShape: 'mostly-simple',
    currentWorkflows: 2,
    futureWorkflows: 4,
    monthlyRuns: 800,
  })
  assert.equal(simple.needsWorkflowDepth, false)

  const complex = getQuestionPlan({
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['salesforce', 'stripe', 'postgresql', 'openai', 'github', 'slack'],
    customSystems: ['Legacy ERP'],
    otherSystemsCount: 3,
    unknownSystemsRequireApi: true,
    futureWorkflows: 45,
    departments: 4,
    monthlyRuns: 50000,
    portfolioShape: 'advanced',
  })
  assert.equal(complex.needsWorkflowDepth, true)
  assert.equal(complex.needsReliability, true)
  assert.equal(complex.needsGovernance, true)
  assert.equal(complex.needsApiQuestion, true)
})
