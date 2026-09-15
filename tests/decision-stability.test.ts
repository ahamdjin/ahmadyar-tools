import assert from 'node:assert/strict'
import test from 'node:test'

import { assessDecisionStability } from '../engine/decision-stability'
import { analyzeArchitecture } from '../engine/recommend'
import { BENCHMARK_SCENARIOS, DEFAULT_ASSESSMENT } from '../engine/scenarios'

function scenario(name: string) {
  const match = BENCHMARK_SCENARIOS.find((item) => item.name === name)
  assert.ok(match, `missing benchmark scenario: ${name}`)
  return match.input
}

test('simple CRM-native setup does not invent technical platform questions', () => {
  const input = scenario('simple HubSpot follow-up')
  const advice = analyzeArchitecture(input)
  const stability = assessDecisionStability(input, advice)
  assert.equal(advice.primary.id, 'hubspot-native')
  assert.equal(stability.highValueQuestions.some((item) => item.id === 'hosting-ownership'), false)
  assert.equal(stability.highValueQuestions.some((item) => item.id === 'durable-jobs'), false)
})

test('Zapier versus Make competition asks about workflow shape', () => {
  const input = {
    ...scenario('non-technical SaaS handoffs'),
    technicalOwner: 'power-user' as const,
    maintenance: 'medium' as const,
    branching: 'simple' as const,
    typicalSteps: 8,
    loopsOrBatching: false,
  }
  const advice = analyzeArchitecture(input)
  const stability = assessDecisionStability(input, advice)
  const topIds = advice.ranking.filter((item) => item.eligible).slice(0, 4).map((item) => item.id)
  if (topIds.includes('zapier') && topIds.includes('make')) {
    assert.ok(stability.highValueQuestions.some((item) => item.id === 'visual-complexity'))
  }
})

test('unknown internal systems trigger a connectivity question before certainty', () => {
  const input = {
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['hubspot', 'slack'],
    primarySystemId: 'hubspot',
    customSystems: ['Legacy quoting system'],
    otherSystemsCount: 2,
    unknownSystemsRequireApi: false,
  }
  const advice = analyzeArchitecture(input)
  const stability = assessDecisionStability(input, advice)
  assert.ok(stability.highValueQuestions.some((item) => item.id === 'unknown-connectivity'))
  assert.ok(advice.nextQuestions.some((question) => /unlisted\/internal systems/i.test(question)))
  assert.notEqual(stability.level, 'stable')
})

test('self-hosted candidates force an operating-ownership question when competing with managed tools', () => {
  const input = {
    ...scenario('API-heavy managed orchestration'),
    selfHosting: 'preferred' as const,
  }
  const advice = analyzeArchitecture(input)
  const stability = assessDecisionStability(input, advice)
  const topIds = advice.ranking.filter((item) => item.eligible).slice(0, 4).map((item) => item.id)
  if (topIds.some((id) => id === 'n8n-self-hosted' || id === 'activepieces') && topIds.some((id) => id !== 'n8n-self-hosted' && id !== 'activepieces')) {
    assert.ok(stability.highValueQuestions.some((item) => item.id === 'hosting-ownership'))
  }
})

test('product-like architecture asks the software-boundary question', () => {
  const input = {
    ...DEFAULT_ASSESSMENT,
    selectedApps: ['stripe', 'postgresql', 'vercel', 'openai'],
    portfolioShape: 'product-like' as const,
    productLogic: true,
    durableJobs: true,
    databaseWork: true,
    technicalOwner: 'developer' as const,
    team: 'developer' as const,
    maintenance: 'high' as const,
    failureImpact: 'critical' as const,
    duplicateUnsafe: true,
  }
  const advice = analyzeArchitecture(input)
  const stability = assessDecisionStability(input, advice)
  assert.equal(advice.kind, 'application')
  assert.equal(advice.primary.id, 'custom-code')
  assert.ok(stability.highValueQuestions.some((item) => item.id === 'software-boundary'))
  assert.ok(stability.highValueQuestions.some((item) => item.id === 'failure-semantics'))
  assert.ok(advice.nextQuestions.some((question) => /persistent state|money\/transactions/i.test(question)))
  assert.ok(advice.nextQuestions.some((question) => /retries or runs twice/i.test(question)))
})

test('public recommendation confidence stays bounded and only exposes high-value follow-ups', () => {
  for (const benchmark of BENCHMARK_SCENARIOS) {
    const advice = analyzeArchitecture(benchmark.input)
    assert.ok(advice.metrics.confidence >= 25 && advice.metrics.confidence <= 98, benchmark.name)
    assert.ok(advice.nextQuestions.length <= 4, benchmark.name)
  }
})

test('stability confidence is bounded and derived from uncertainty, not fake precision', () => {
  for (const benchmark of BENCHMARK_SCENARIOS) {
    const advice = analyzeArchitecture(benchmark.input)
    const stability = assessDecisionStability(benchmark.input, advice)
    assert.ok(stability.confidence >= 25 && stability.confidence <= 98, benchmark.name)
    assert.ok(stability.margin >= 0, benchmark.name)
    assert.ok(stability.highValueQuestions.length <= 4, benchmark.name)
  }
})
