import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
const css = readFileSync('app/globals.css', 'utf8')
const guide = readFileSync('components/advisor-seo-content.tsx', 'utf8')
const layout = readFileSync('app/layout.tsx', 'utf8')
const routeFrame = readFileSync('components/route-frame.tsx', 'utf8')
const roiCalculator = readFileSync('components/automation-roi-calculator.tsx', 'utf8')

test('tool routes stay inside the same portfolio frame as ahmadyar', () => {
  assert.match(page, /className="advisor-workspace"[\s\S]*<ArchitectureAdvisor \/>/)
  assert.match(layout, /<RouteFrame>\{children\}<\/RouteFrame>/)
  assert.match(routeFrame, /max-w-screen-sm/)
  assert.match(routeFrame, /<SiteHeader \/>/)
  assert.match(routeFrame, /<SiteFooter \/>/)
  assert.doesNotMatch(routeFrame, /IMMERSIVE_TOOL_PATHS/)
  assert.match(css, /\.advisor-viewport,[\s\S]*\.roi-viewport\s*\{[^}]*width:\s*100%/)
  assert.match(css, /\.advisor-viewport,[\s\S]*\.roi-viewport\s*\{[^}]*max-width:\s*100%/)
  assert.match(css, /\.advisor-viewport,[\s\S]*\.roi-viewport\s*\{[^}]*min-width:\s*0/)
  assert.match(css, /\.advisor-workspace > section\s*\{[^}]*width:\s*100% !important/)
  assert.match(css, /\.advisor-workspace > section\s*\{[^}]*max-width:\s*100% !important/)
  assert.match(css, /\.advisor-guide,[\s\S]*\.roi-guide\s*\{[^}]*width:\s*100%/)
  assert.doesNotMatch(css, /100vw/)
  assert.doesNotMatch(css, /margin-left:\s*calc\(50% - 50vw\)/)
})

test('ROI calculator cannot force horizontal overflow on narrow screens', () => {
  assert.match(roiCalculator, /roi-calculator grid h-full min-h-0 min-w-0/)
  assert.match(roiCalculator, /overflow-x-hidden overflow-y-auto/)
  assert.match(roiCalculator, /sm:grid-cols-\[210px_minmax\(0,1fr\)\]/)
  assert.match(roiCalculator, /mt-4 grid min-w-0 gap-3 sm:grid-cols-2/)
  assert.match(roiCalculator, /break-words[^"\n]*\[overflow-wrap:anywhere\]/)
  assert.doesNotMatch(roiCalculator, /mt-4 grid grid-cols-2 gap-3/)
})

test('tool typography cannot exceed the portfolio display ceiling', () => {
  assert.match(css, /ahmadyar's current largest live display heading is sm:text-5xl/)
  assert.match(css, /\[class\*='text-6xl'\][\s\S]*font-size:\s*3rem !important/)
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
