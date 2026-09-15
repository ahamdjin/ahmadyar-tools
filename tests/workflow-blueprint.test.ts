import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { analyzeWorkflowBlueprint, DEFAULT_WORKFLOW_BLUEPRINT_INPUT, type WorkflowBlueprintInput } from '../engine/workflow-blueprint'

function input(overrides: Partial<WorkflowBlueprintInput> = {}): WorkflowBlueprintInput {
  return { ...DEFAULT_WORKFLOW_BLUEPRINT_INPUT, ...overrides }
}

function rank(result: ReturnType<typeof analyzeWorkflowBlueprint>, id: string) {
  return result.platformFits.find((platform) => platform.id === id)?.score ?? -1
}

test('simple HubSpot-contained workflow keeps native automation competitive', () => {
  const result = analyzeWorkflowBlueprint(input({
    sourceAppId: 'hubspot',
    sourceOfTruthAppId: 'hubspot',
    targetAppIds: ['hubspot'],
    triggerMode: 'event',
    steps: 3,
    team: 'business',
    technicalOwner: 'power-user',
    branching: 'simple',
    retriesRequired: false,
    duplicateUnsafe: false,
  }))

  assert.equal(result.platformFits[0]?.id, 'hubspot-native')
  assert.equal(result.lane, 'native')
})

test('common SaaS handoff favors Zapier over deeper orchestration when complexity is low', () => {
  const result = analyzeWorkflowBlueprint(input({
    sourceAppId: 'typeform',
    sourceOfTruthAppId: 'hubspot',
    targetAppIds: ['hubspot', 'slack'],
    triggerMode: 'webhook',
    team: 'business',
    technicalOwner: 'power-user',
    steps: 4,
    branching: 'simple',
    transformation: 'light',
    loopsOrBatching: false,
    customApi: false,
    durableJobs: false,
  }))

  assert.ok(rank(result, 'zapier') > rank(result, 'n8n-cloud'))
  assert.ok(rank(result, 'zapier') >= rank(result, 'make'))
})

test('branching loops and transformation make Make stronger than Zapier', () => {
  const result = analyzeWorkflowBlueprint(input({
    sourceAppId: 'shopify',
    sourceOfTruthAppId: 'shopify',
    targetAppIds: ['airtable', 'slack', 'google-sheets'],
    team: 'automation',
    technicalOwner: 'automation-specialist',
    steps: 11,
    branching: 'advanced',
    transformation: 'heavy',
    loopsOrBatching: true,
    monthlyRuns: 12000,
  }))

  assert.ok(rank(result, 'make') > rank(result, 'zapier'))
  assert.equal(result.lane, 'orchestration')
})

test('API-heavy developer workflow makes n8n or Pipedream stronger than Zapier', () => {
  const result = analyzeWorkflowBlueprint(input({
    sourceAppId: 'stripe',
    sourceOfTruthAppId: 'postgresql',
    targetAppIds: ['slack'],
    customSystems: ['Internal billing service'],
    team: 'developer',
    technicalOwner: 'developer',
    steps: 9,
    customApi: true,
    databaseWork: true,
    branching: 'advanced',
    transformation: 'moderate',
    failureImpact: 'high',
  }))

  assert.ok(Math.max(rank(result, 'n8n-cloud'), rank(result, 'pipedream')) > rank(result, 'zapier'))
})

test('durable developer job gives Trigger.dev a real winning path', () => {
  const result = analyzeWorkflowBlueprint(input({
    sourceAppId: 'stripe',
    sourceOfTruthAppId: 'postgresql',
    targetAppIds: ['sendgrid', 's3'],
    team: 'developer',
    technicalOwner: 'developer',
    triggerMode: 'event',
    steps: 8,
    customApi: true,
    durableJobs: true,
    retriesRequired: true,
    humanApprovals: true,
    failureImpact: 'high',
    peakRunsPerMinute: 80,
  }))

  assert.ok(result.platformFits.slice(0, 3).some((platform) => platform.id === 'trigger-dev'))
  assert.ok(rank(result, 'trigger-dev') > rank(result, 'zapier'))
})

test('transactional critical state pushes the core into software', () => {
  const result = analyzeWorkflowBlueprint(input({
    sourceAppId: 'stripe',
    sourceOfTruthAppId: 'postgresql',
    targetAppIds: ['stripe', 'postgresql'],
    team: 'developer',
    technicalOwner: 'developer',
    databaseWork: true,
    transactional: true,
    failureImpact: 'critical',
    duplicateUnsafe: true,
    retriesRequired: true,
    customApi: true,
  }))

  assert.equal(result.lane, 'software')
  assert.equal(result.platformFits[0]?.id, 'custom-code')
  assert.match(result.idempotencyStrategy, /persistent|idempotency/i)
})

test('self-hosting requirement eliminates managed-only candidates', () => {
  const result = analyzeWorkflowBlueprint(input({
    sourceAppId: 'typeform',
    sourceOfTruthAppId: 'postgresql',
    targetAppIds: ['slack'],
    team: 'developer',
    technicalOwner: 'developer',
    selfHosting: 'required',
    customApi: true,
  }))

  for (const id of ['zapier', 'make', 'n8n-cloud', 'pipedream', 'trigger-dev']) {
    assert.equal(result.platformFits.find((platform) => platform.id === id)?.eligible, false, `${id} should be filtered by hard self-hosting requirement`)
  }
  assert.ok(result.platformFits.some((platform) => platform.eligible && ['n8n-self-hosted', 'activepieces', 'custom-code'].includes(platform.id)))
})

test('duplicate-unsafe workflows gate idempotency before external effects', () => {
  const result = analyzeWorkflowBlueprint(input({ duplicateUnsafe: true, retriesRequired: true }))
  const ids = result.blueprint.map((step) => step.id)
  assert.ok(ids.indexOf('idempotency') > ids.indexOf('validate'))
  assert.ok(ids.indexOf('idempotency') < ids.indexOf('effects'))
  assert.ok(result.testCases.some((item) => item.name === 'Duplicate trigger'))
})

test('workflow blueprint route is portfolio framed and crawlable', () => {
  const page = readFileSync('app/[slug]/page.tsx', 'utf8')
  const css = readFileSync('app/globals.css', 'utf8')
  const component = readFileSync('components/workflow-blueprint-builder.tsx', 'utf8')
  const guide = readFileSync('components/workflow-blueprint-seo-content.tsx', 'utf8')

  assert.match(page, /workflow-automation-blueprint-builder/)
  assert.match(page, /<WorkflowBlueprintBuilder \/>/)
  assert.match(page, /<WorkflowBlueprintSeoContent \/>/)
  assert.match(css, /\.blueprint-viewport/)
  assert.match(css, /\.blueprint-workspace > \.blueprint-builder/)
  assert.match(component, /sourceOfTruthAppId/)
  assert.match(component, /duplicateUnsafe/)
  assert.match(guide, /idempotency/i)
  assert.match(guide, /platform is not the architecture/i)
})
