import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
const css = readFileSync('app/globals.css', 'utf8')
const guide = readFileSync('components/advisor-seo-content.tsx', 'utf8')
const layout = readFileSync('app/layout.tsx', 'utf8')
const routeFrame = readFileSync('components/route-frame.tsx', 'utf8')

test('advisor owns the first viewport with one explicit centered workspace', () => {
  assert.match(page, /className="advisor-workspace"[\s\S]*<ArchitectureAdvisor \/>/)
  assert.match(layout, /<RouteFrame>\{children\}<\/RouteFrame>/)
  assert.match(routeFrame, /IMMERSIVE_TOOL_PATHS/)
  assert.match(routeFrame, /automation-architecture-advisor/)
  assert.match(routeFrame, /crm-automation-health-check/)
  assert.match(routeFrame, /<main className="site-main w-full">\{children\}<\/main>/)
  assert.match(css, /\.advisor-viewport,[\s\S]*\.onboarding-viewport\s*\{[^}]*width:\s*100%/)
  assert.match(css, /\.advisor-viewport,[\s\S]*\.onboarding-viewport\s*\{[^}]*height:\s*100dvh/)
  assert.match(css, /\.advisor-workspace,[\s\S]*\.onboarding-workspace\s*\{[^}]*place-items:\s*stretch center/)
  assert.match(css, /\.advisor-workspace > section\s*\{[^}]*width:\s*min\(100%,\s*1120px\) !important/)
  assert.match(css, /\.advisor-workspace > section\s*\{[^}]*margin:\s*0 auto !important/)
  assert.match(css, /\.advisor-workspace > section\s*\{[^}]*transform:\s*none !important/)
  assert.doesNotMatch(css, /body:has\(\.advisor-viewport\)/)
  assert.doesNotMatch(css, /\.advisor-viewport[\s\S]{0,260}margin-left:\s*calc\(50% - 50vw\)/)
  assert.doesNotMatch(css, /\.advisor-viewport[\s\S]{0,160}position:\s*fixed/)
})

test('advisor page exposes crawlable guidance below the interactive tool', () => {
  assert.match(page, /<AdvisorSeoContent \/>/)
  assert.ok(page.indexOf('<AdvisorSeoContent />') > page.indexOf('<ArchitectureAdvisor />'))
  assert.match(page, /SoftwareApplication/)
  assert.match(page, /FAQPage/)
  assert.match(page, /BreadcrumbList/)
  assert.match(page, /price:\s*'0'/)
})

test('search and AI guidance covers native, no-code, orchestration, durable jobs, and software', () => {
  for (const term of ['HubSpot', 'GoHighLevel', 'Zapier', 'Make', 'n8n', 'Trigger.dev', 'Power Automate', 'Pipedream', 'Activepieces', 'Workato', 'Tray.ai', 'MuleSoft', 'Custom software']) {
    assert.match(guide, new RegExp(term.replace('.', '\\.'), 'i'), `expected guide to cover ${term}`)
  }
  assert.match(guide, /Five layers that keep automation maintainable/)
  assert.match(guide, /The right answer changes with the shape of the business/)
  assert.match(guide, /Hard constraints first\. Trade-offs second\./)
})
