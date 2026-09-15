import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
const css = readFileSync('app/globals.css', 'utf8')
const guide = readFileSync('components/advisor-seo-content.tsx', 'utf8')
const layout = readFileSync('app/layout.tsx', 'utf8')

test('advisor owns the first viewport with one explicit centered workspace', () => {
  assert.match(page, /className="advisor-workspace"[\s\S]*<ArchitectureAdvisor \/>/)
  assert.match(css, /\.advisor-viewport\s*\{[^}]*display:\s*grid/)
  assert.match(css, /\.advisor-viewport\s*\{[^}]*width:\s*100vw/)
  assert.match(css, /\.advisor-viewport\s*\{[^}]*height:\s*100dvh/)
  assert.match(css, /\.advisor-workspace\s*\{[^}]*place-items:\s*stretch center/)
  assert.match(css, /\.advisor-workspace > section\s*\{[^}]*width:\s*min\(100%,\s*1120px\) !important/)
  assert.match(css, /\.advisor-workspace > section\s*\{[^}]*margin:\s*0 auto !important/)
  assert.match(css, /\.advisor-workspace > section\s*\{[^}]*transform:\s*none !important/)
  assert.match(css, /body:has\(\.advisor-viewport\) \.site-frame\s*\{[^}]*max-width:\s*none !important/)
  assert.match(layout, /site-frame/)
  assert.doesNotMatch(css, /\.advisor-workspace > section[\s\S]*margin-left:\s*-/)
  assert.doesNotMatch(css, /body:has\(\.advisor-viewport\)\s*\{[^}]*overflow:\s*hidden/)
  assert.doesNotMatch(css, /\.advisor-viewport\s*\{[^}]*position:\s*fixed/)
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
