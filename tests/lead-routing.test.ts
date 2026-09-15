import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { analyzeLeadRouting, DEFAULT_LEAD_ROUTING_INPUT, type LeadRoutingInput } from '../engine/lead-routing'

const strong: LeadRoutingInput = {
  ...DEFAULT_LEAD_ROUTING_INPUT,
  crmId: 'salesforce',
  monthlyLeads: 5000,
  reps: 20,
  teams: 4,
  territories: 8,
  serviceLines: 5,
  primaryRule: 'hybrid',
  existingOwnership: 'account-first',
  dataReadiness: 3,
  duplicateControl: 3,
  accountMatching: 3,
  precedenceClarity: 3,
  availabilityAwareness: 3,
  capacityAwareness: 3,
  prioritySignals: 3,
  fallbackCoverage: 3,
  responseSla: 3,
  escalation: 3,
  reassignment: 3,
  auditTrail: 3,
  overrideControl: 3,
  routingMonitoring: 3,
  targetResponseMinutes: 15,
}

test('mature high-volume router can score strongly without inventing critical risk', () => {
  const result = analyzeLeadRouting(strong)
  assert.ok(result.score >= 85)
  assert.equal(result.issues.some((issue) => issue.severity === 'critical'), false)
  assert.match(result.recommendedPattern, /Centralized rules engine/i)
  assert.ok(result.testCases.length >= 6)
})

test('round robin does not excuse missing existing-account and duplicate protection', () => {
  const result = analyzeLeadRouting({
    ...DEFAULT_LEAD_ROUTING_INPUT,
    crmId: 'hubspot',
    monthlyLeads: 1500,
    reps: 10,
    primaryRule: 'round-robin',
    duplicateControl: 0,
    accountMatching: 0,
    existingOwnership: 'manual',
  })
  assert.ok(result.score < 65)
  assert.ok(result.issues.some((issue) => issue.id === 'duplicates'))
  assert.ok(result.issues.some((issue) => issue.id === 'matching'))
  assert.equal(result.rules[0]?.label, 'Normalize + deduplicate')
  assert.equal(result.rules[1]?.label, 'Protect existing relationships')
})

test('complex territory and product routing punishes ambiguous precedence', () => {
  const result = analyzeLeadRouting({
    ...strong,
    territories: 14,
    serviceLines: 9,
    precedenceClarity: 0,
    dataReadiness: 1,
  })
  assert.ok(result.issues.some((issue) => issue.id === 'precedence'))
  assert.ok(result.nextQuestions.some((question) => /disagree|territory/i.test(question)))
})

test('router always produces a fallback and SLA rule', () => {
  const result = analyzeLeadRouting({ ...DEFAULT_LEAD_ROUTING_INPUT, crmId: 'gohighlevel' })
  const fallback = result.rules.find((rule) => rule.label === 'Fallback + SLA')
  assert.ok(fallback)
  assert.match(fallback.action, /fallback/i)
  assert.match(fallback.action, /minute response target/i)
})

test('high-volume weak observability is treated as an operating risk', () => {
  const result = analyzeLeadRouting({
    ...strong,
    auditTrail: 0,
    routingMonitoring: 0,
    escalation: 0,
  })
  assert.ok(result.issues.some((issue) => issue.id === 'observability'))
  for (const field of ['routing_rule_version', 'routing_reason', 'routed_at', 'fallback_reason']) {
    assert.ok(result.observabilityFields.includes(field))
  }
})

test('lead routing route is a dedicated viewport-sized product', () => {
  const page = readFileSync('app/[slug]/page.tsx', 'utf8')
  const css = readFileSync('app/globals.css', 'utf8')
  assert.match(page, /<LeadRoutingBuilder \/>/)
  assert.match(page, /<LeadRoutingSeoContent \/>/)
  assert.match(page, /LEAD_ROUTING_FAQS/)
  assert.match(css, /\.routing-viewport[\s\S]*100dvw/)
  assert.match(css, /\.routing-workspace > \.routing-check\s*\{[^}]*max-width:\s*1240px/)
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*clip/)
})

test('lead routing has a dated research basis for precedence, duplicates, fallback and SLA', () => {
  const research = readFileSync('docs/research/lead-routing-2026-09.md', 'utf8')
  assert.match(research, /HubSpot/)
  assert.match(research, /Salesforce/)
  assert.match(research, /Zapier/)
  assert.match(research, /Normalize \+ deduplicate/)
  assert.match(research, /Protect existing relationships/)
  assert.match(research, /Fallback \+ SLA/)
  assert.match(research, /Version routing logic/)
})
