import assert from 'node:assert/strict'
import test from 'node:test'

import { assessProcessReadiness } from '../engine/process-readiness'
import { analyzeArchitecture } from '../engine/recommend'
import { DEFAULT_ASSESSMENT } from '../engine/scenarios'

test('stable repeatable work is ready to automate without inventing a maturity blocker', () => {
  const input = {
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['hubspot', 'slack'],
    primarySystemId: 'hubspot',
    processStability: 'stable' as const,
    changeFrequency: 'rare' as const,
    portfolioShape: 'mostly-simple' as const,
    appsPerWorkflow: 2,
    typicalSteps: 4,
    monthlyRuns: 5000,
    humanApprovals: false,
    aiSteps: false,
    productLogic: false,
  }
  const advice = analyzeArchitecture(input)
  const readiness = assessProcessReadiness(input, advice.kind)
  assert.equal(readiness.disposition, 'automate-now')
  assert.match(advice.summary, /^Ready to automate\./)
})

test('a fast-changing unstable process is standardized before end-to-end automation', () => {
  const input = {
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['hubspot', 'slack', 'airtable'],
    processStability: 'changing' as const,
    changeFrequency: 'weekly' as const,
    currentWorkflows: 12,
    futureWorkflows: 40,
    monthlyRuns: 12_000,
  }
  const advice = analyzeArchitecture(input)
  const readiness = assessProcessReadiness(input, advice.kind)
  assert.equal(readiness.disposition, 'standardize-first')
  assert.ok(readiness.readiness <= 49)
  assert.match(advice.summary, /^Standardize first\./)
  assert.ok(advice.safeguards.some((item) => /map the current trigger/i.test(item)))
})

test('a changing but slower-moving process is piloted before portfolio rollout', () => {
  const input = {
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['hubspot', 'slack'],
    processStability: 'changing' as const,
    changeFrequency: 'monthly' as const,
    monthlyRuns: 3000,
  }
  const advice = analyzeArchitecture(input)
  const readiness = assessProcessReadiness(input, advice.kind)
  assert.equal(readiness.disposition, 'pilot-first')
  assert.match(advice.summary, /^Pilot first\./)
})

test('high-impact AI decisions keep a human checkpoint even when the process is stable', () => {
  const input = {
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['hubspot', 'openai', 'slack'],
    processStability: 'stable' as const,
    changeFrequency: 'rare' as const,
    aiSteps: true,
    failureImpact: 'critical' as const,
    humanApprovals: false,
  }
  const advice = analyzeArchitecture(input)
  const readiness = assessProcessReadiness(input, advice.kind)
  assert.equal(readiness.disposition, 'human-checkpoint')
  assert.match(advice.summary, /^Automate with a human checkpoint\./)
  assert.ok(advice.safeguards.some((item) => /human approval/i.test(item)))
  assert.ok(advice.safeguards.some((item) => /AI output/i.test(item)))
})

test('product-like stateful logic is treated as software before workflow tooling', () => {
  const input = {
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['stripe', 'postgresql', 'vercel'],
    processStability: 'stable' as const,
    portfolioShape: 'product-like' as const,
    productLogic: true,
    databaseWork: true,
    failureImpact: 'critical' as const,
    technicalOwner: 'developer' as const,
    team: 'developer' as const,
    maintenance: 'high' as const,
  }
  const advice = analyzeArchitecture(input)
  const readiness = assessProcessReadiness(input, advice.kind)
  assert.equal(readiness.disposition, 'software-first')
  assert.equal(advice.kind, 'application')
  assert.equal(advice.primary.id, 'custom-code')
  assert.match(advice.summary, /^Software first\./)
})
