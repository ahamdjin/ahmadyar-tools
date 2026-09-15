import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const llms = readFileSync('app/llms.txt/route.ts', 'utf8')
const sitemap = readFileSync('app/sitemap.ts', 'utf8')
const page = readFileSync('app/[slug]/page.tsx', 'utf8')

test('machine-readable index describes every public tool without replacing visible content', () => {
  for (const slug of [
    'automation-architecture-advisor',
    'crm-automation-health-check',
    'client-onboarding-automation-planner',
    'lead-routing-rules-builder',
    'automation-roi-calculator',
    'lead-follow-up-automation-planner',
  ]) {
    assert.match(llms, new RegExp(slug))
  }
  assert.match(llms, /deterministic, testable decision engines/i)
  assert.match(llms, /visible guidance below each interactive tool/i)
  assert.match(llms, /value-capture assumption/i)
  assert.match(llms, /replies, bookings, suppression and lifecycle changes/i)
})

test('tool sitemap uses canonical ahmadyar URLs from the shared registry', () => {
  assert.match(sitemap, /SITE\.origin/)
  assert.match(sitemap, /SITE\.toolsPath/)
  assert.match(sitemap, /TOOLS\.map/)
  assert.match(sitemap, /SITE\.toolsPath\}\/\$\{tool\.slug\}/)
})

test('all six advanced tools have dedicated metadata and crawlable guidance', () => {
  for (const token of [
    'ADVISOR_TITLE',
    'CRM_HEALTH_TITLE',
    'ONBOARDING_TITLE',
    'LEAD_ROUTING_TITLE',
    'AUTOMATION_ROI_TITLE',
    'LEAD_FOLLOW_UP_TITLE',
    '<AdvisorSeoContent />',
    '<CrmHealthSeoContent />',
    '<OnboardingSeoContent />',
    '<LeadRoutingSeoContent />',
    '<AutomationRoiSeoContent />',
    '<LeadFollowUpSeoContent />',
  ]) {
    assert.match(page, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})
