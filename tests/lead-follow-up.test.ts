import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { analyzeLeadFollowUp, DEFAULT_LEAD_FOLLOW_UP_INPUT, type LeadFollowUpInput } from '../engine/lead-follow-up'

function input(overrides: Partial<LeadFollowUpInput> = {}): LeadFollowUpInput {
  return { ...DEFAULT_LEAD_FOLLOW_UP_INPUT, ...overrides }
}

test('mature CRM-native follow-up can score strongly without invented critical risk', () => {
  const result = analyzeLeadFollowUp(input({
    crmId: 'gohighlevel',
    monthlyLeads: 1500,
    reps: 10,
    targetResponseMinutes: 5,
    channels: ['email', 'sms', 'call'],
    replyDetection: 3,
    bookingDetection: 3,
    lifecycleStopRules: 3,
    consentControl: 3,
    optOutControl: 3,
    timezoneControl: 3,
    duplicateControl: 3,
    ownerAssignment: 3,
    humanHandoff: 3,
    staleLeadHandling: 3,
    monitoring: 3,
    personalization: 3,
  }))

  assert.ok(result.score >= 85, `expected mature score, got ${result.score}`)
  assert.equal(result.issues.some((issue) => issue.severity === 'critical'), false)
  assert.match(result.architecture.join(' '), /GoHighLevel/i)
  assert.ok(result.stopRules.some((rule) => /reply/i.test(rule)))
})

test('reply and booking are hard stop conditions rather than copy suggestions', () => {
  const result = analyzeLeadFollowUp(input({ replyDetection: 0, bookingDetection: 0, lifecycleStopRules: 0 }))
  assert.ok(result.score < 70)
  assert.ok(result.issues.some((issue) => issue.id === 'reply-stop'))
  assert.ok(result.issues.some((issue) => issue.id === 'booking-stop'))
  assert.ok(result.issues.some((issue) => issue.id === 'lifecycle-stop'))
  assert.equal(result.testCases.find((item) => item.name === 'Reply after first touch')?.expected.includes('stops'), true)
})

test('conversational channels punish weak consent and opt-out controls', () => {
  const safe = analyzeLeadFollowUp(input({ channels: ['email'], consentControl: 3, optOutControl: 3 }))
  const unsafe = analyzeLeadFollowUp(input({ channels: ['sms', 'whatsapp'], consentControl: 0, optOutControl: 0 }))
  assert.ok(unsafe.score < safe.score)
  assert.ok(unsafe.issues.some((issue) => issue.id === 'consent'))
  assert.ok(unsafe.issues.some((issue) => issue.id === 'opt-out'))
})

test('high volume follow-up requires observable operations', () => {
  const result = analyzeLeadFollowUp(input({ monthlyLeads: 5000, monitoring: 0, ownerAssignment: 1, humanHandoff: 0 }))
  assert.ok(result.issues.some((issue) => issue.id === 'monitoring'))
  assert.ok(result.issues.some((issue) => issue.id === 'ownership'))
  for (const metric of ['time_to_first_meaningful_response', 'message_failure_rate', 'owner_handoff_latency']) {
    assert.ok(result.measurement.includes(metric))
  }
})

test('lead follow-up route is a dedicated viewport-sized planner with crawlable guidance', () => {
  const page = readFileSync('app/[slug]/page.tsx', 'utf8')
  const component = readFileSync('components/lead-follow-up-planner.tsx', 'utf8')
  const css = readFileSync('app/globals.css', 'utf8')
  const guide = readFileSync('components/lead-follow-up-seo-content.tsx', 'utf8')

  assert.match(page, /lead-follow-up-automation-planner/)
  assert.match(page, /<LeadFollowUpPlanner \/>/)
  assert.match(page, /<LeadFollowUpSeoContent \/>/)
  assert.match(page, /LEAD_FOLLOW_UP_FAQS/)
  assert.match(component, /replyDetection/)
  assert.match(component, /bookingDetection/)
  assert.match(component, /consentControl/)
  assert.match(css, /\.followup-viewport[\s\S]*100dvw/)
  assert.match(css, /\.followup-workspace > \.followup-check\s*\{[^}]*max-width:\s*1240px/)
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*clip/)
  assert.match(guide, /Think in states/i)
  assert.match(guide, /Stop conditions matter more than clever copy/i)
})

test('lead follow-up has current research for response stops, engagement transitions and re-entry', () => {
  const research = readFileSync('docs/research/lead-follow-up-2026-09.md', 'utf8')
  assert.match(research, /Stop on Response/i)
  assert.match(research, /Cadence Builder 2\.0/)
  assert.match(research, /suppression lists and unenrollment triggers/i)
  assert.match(research, /stop.*re-entry.*different decisions/i)
  assert.match(research, /Human handoff should have an owner/i)
  assert.match(research, /not legal advice/i)
})
