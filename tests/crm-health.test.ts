import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { analyzeCrmHealth, DEFAULT_CRM_HEALTH_INPUT, type CrmHealthInput } from '../engine/crm-health'

const strong: CrmHealthInput = {
  ...DEFAULT_CRM_HEALTH_INPUT,
  crmId: 'hubspot',
  connectedApps: ['typeform', 'calendly', 'slack'],
  monthlyLeads: 1000,
  salesReps: 8,
  captureCoverage: 3,
  duplicateControl: 3,
  requiredData: 3,
  sourceTracking: 3,
  routingQuality: 3,
  unassignedProtection: 3,
  responseDiscipline: 3,
  followupQuality: 3,
  pipelineDefinition: 3,
  stalePipelineControl: 3,
  handoffQuality: 3,
  reportingTrust: 3,
  workflowMonitoring: 3,
  operatingOwnership: 3,
  crmAdoption: 3,
  shadowSystems: 0,
}

test('strong CRM operation scores as healthy without invented critical issues', () => {
  const result = analyzeCrmHealth(strong)
  assert.ok(result.score >= 88, `expected strong score, got ${result.score}`)
  assert.equal(result.crmName, 'HubSpot')
  assert.equal(result.issues.some((issue) => issue.severity === 'critical'), false)
  assert.match(result.architecture, /HubSpot-native first/i)
  assert.ok(result.nativeMoves.length >= 2)
})

test('high-volume manual sales operation exposes routing and response risk', () => {
  const result = analyzeCrmHealth({
    ...DEFAULT_CRM_HEALTH_INPUT,
    crmId: 'gohighlevel',
    connectedApps: ['facebook-leads', 'calendly', 'slack', 'google-sheets'],
    monthlyLeads: 5000,
    salesReps: 20,
    captureCoverage: 1,
    duplicateControl: 0,
    requiredData: 1,
    sourceTracking: 1,
    routingQuality: 0,
    unassignedProtection: 0,
    responseDiscipline: 0,
    followupQuality: 0,
    pipelineDefinition: 1,
    stalePipelineControl: 0,
    handoffQuality: 1,
    reportingTrust: 1,
    workflowMonitoring: 0,
    operatingOwnership: 1,
    crmAdoption: 1,
    shadowSystems: 2,
  })

  assert.ok(result.score < 55, `expected fragile score, got ${result.score}`)
  const ids = result.issues.slice(0, 6).map((issue) => issue.id)
  assert.ok(ids.includes('routing'))
  assert.ok(ids.includes('response'))
  assert.ok(result.issues.some((issue) => issue.severity === 'critical'))
  assert.match(result.architecture, /Stabilize GoHighLevel/i)
})

test('automation sprawl is called out instead of rewarding more tools', () => {
  const result = analyzeCrmHealth({ ...strong, connectedApps: ['zapier', 'make', 'n8n', 'slack', 'typeform', 'stripe'] })
  assert.ok(result.issues.some((issue) => issue.id === 'automation-sprawl'))
  assert.match(result.architecture, /consolidate the automation layer/i)
  assert.match(result.warning ?? '', /several automation layers/i)
})

test('shadow systems reduce reporting and adoption health', () => {
  const clean = analyzeCrmHealth({ ...strong, shadowSystems: 0, connectedApps: ['slack'] })
  const shadowed = analyzeCrmHealth({ ...strong, shadowSystems: 3, connectedApps: ['slack', 'google-sheets', 'excel'] })
  const cleanReporting = clean.dimensions.find((dimension) => dimension.id === 'reporting')?.score ?? 0
  const shadowReporting = shadowed.dimensions.find((dimension) => dimension.id === 'reporting')?.score ?? 0
  const cleanAdoption = clean.dimensions.find((dimension) => dimension.id === 'adoption')?.score ?? 0
  const shadowAdoption = shadowed.dimensions.find((dimension) => dimension.id === 'adoption')?.score ?? 0
  assert.ok(shadowReporting < cleanReporting)
  assert.ok(shadowAdoption < cleanAdoption)
  assert.ok(shadowed.issues.some((issue) => issue.id === 'adoption'))
})

test('CRM health route uses a viewport-sized diagnostic workspace', () => {
  const page = readFileSync('app/[slug]/page.tsx', 'utf8')
  const component = readFileSync('components/crm-health-check.tsx', 'utf8')
  const css = readFileSync('app/globals.css', 'utf8')
  assert.match(page, /crm-health-viewport/)
  assert.match(page, /<CrmHealthCheck \/>/)
  assert.match(component, /Search 140\+ systems/)
  assert.match(component, /Fix the leaks in this order/)
  assert.match(css, /\.crm-health-viewport[\s\S]*100dvw/)
  assert.match(css, /\.crm-health-workspace > \.crm-health-check[\s\S]*max-width:\s*1240px/)
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*clip/)
})

test('CRM health model has a dated vendor research basis', () => {
  const research = readFileSync('docs/research/crm-health-2026-09.md', 'utf8')
  assert.match(research, /HubSpot/)
  assert.match(research, /Salesforce/)
  assert.match(research, /HighLevel/)
  assert.match(research, /Identity comes before routing/)
  assert.match(research, /weights are product heuristics|weights are product heuristics/i)
  assert.match(research, /Vendor capabilities, editions, beta features, and names change/)
})
