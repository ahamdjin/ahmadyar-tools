import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
const css = readFileSync('app/globals.css', 'utf8')
const guide = readFileSync('components/advisor-seo-content.tsx', 'utf8')
const layout = readFileSync('app/layout.tsx', 'utf8')
const routeFrame = readFileSync('components/route-frame.tsx', 'utf8')

test('all advanced tool applications break out of the narrow portfolio article frame', () => {
  assert.match(page, /className="advisor-workspace"[\s\S]*<ArchitectureAdvisor \/>/)
  assert.match(layout, /<RouteFrame>\{children\}<\/RouteFrame>/)
  assert.match(routeFrame, /<SiteHeader \/>/)
  assert.match(routeFrame, /<SiteFooter \/>/)
  assert.match(css, /\.advisor-viewport,[\s\S]*\.followup-viewport\s*\{[^}]*left:\s*50%/)
  assert.match(css, /\.advisor-viewport,[\s\S]*\.followup-viewport\s*\{[^}]*translate:\s*-50% 0/)
  assert.match(css, /\.advisor-viewport,[\s\S]*\.followup-viewport\s*\{[^}]*100dvw/)
  assert.match(css, /\.advisor-viewport,[\s\S]*height:\s*calc\(100dvh - 9rem\)/)
  assert.match(css, /\.advisor-workspace,[\s\S]*\.followup-workspace\s*\{[^}]*width:\s*min\(100%, 1400px\)/)
  assert.match(css, /\.followup-workspace > \.followup-check\s*\{[^}]*width:\s*min\(100%, 1240px\)/)
  assert.match(css, /\.roi-workspace > \.roi-calculator,[\s\S]*max-width:\s*1240px/)
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*clip/)
  assert.doesNotMatch(css, /\.site-frame:has\(/)
})

test('tool workspaces reflow down to phone width without two-dimensional scrolling', () => {
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*width:\s*calc\(100dvw - 1\.5rem\) !important/)
  assert.match(css, /@media \(max-width: 639px\)[\s\S]*width:\s*calc\(100dvw - 1rem\) !important/)
  assert.match(css, /overflow-x:\s*clip/)
})

test('tool typography cannot exceed the portfolio display ceiling', () => {
  assert.match(css, /font-size:\s*3rem !important/)
})

test('advisor page exposes crawlable guidance below the interactive tool', () => {
  assert.match(page, /<AdvisorSeoContent \/>/)
  assert.ok(page.indexOf('<AdvisorSeoContent />') > page.indexOf('<ArchitectureAdvisor />'))
  assert.match(page, /SoftwareApplication/)
  assert.match(page, /FAQPage/)
  assert.match(page, /BreadcrumbList/)
  assert.match(page, /price:\s*'0'/)
  assert.match(css, /\.advisor-guide,[\s\S]*\.followup-guide\s*\{[^}]*max-width:\s*900px/)
})

test('search and AI guidance covers native, no-code, orchestration, durable jobs, and software', () => {
  for (const term of ['HubSpot', 'GoHighLevel', 'Zapier', 'Make', 'n8n', 'Trigger.dev', 'Power Automate', 'Pipedream', 'Activepieces', 'Workato', 'Tray.ai', 'MuleSoft', 'Custom software']) {
    assert.match(guide, new RegExp(term.replace('.', '\\.'), 'i'), `expected guide to cover ${term}`)
  }
  assert.match(guide, /Five layers that keep automation maintainable/)
  assert.match(guide, /The right answer changes with the shape of the business/)
  assert.match(guide, /Hard constraints first\. Trade-offs second\./)
})
