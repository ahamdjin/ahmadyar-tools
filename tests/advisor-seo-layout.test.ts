import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
const css = readFileSync('app/globals.css', 'utf8')
const advisorApp = readFileSync('components/architecture-advisor-app.tsx', 'utf8')
const guide = readFileSync('components/advisor-seo-content.tsx', 'utf8')
const layout = readFileSync('app/layout.tsx', 'utf8')
const routeFrame = readFileSync('components/route-frame.tsx', 'utf8')

test('advisor is recreated as a normal-flow application shell', () => {
  assert.match(page, /<ArchitectureAdvisorApp title=\{tool\.title\} \/>/)
  assert.doesNotMatch(page, /tool-app-viewport/)
  assert.doesNotMatch(page, /advisor-viewport/)

  assert.match(advisorApp, /className="advisor-app"/)
  assert.match(advisorApp, /className="advisor-app-toolbar"/)
  assert.match(advisorApp, /className="advisor-app-workspace"/)
  assert.match(advisorApp, /className="advisor-app-core"/)
  assert.match(advisorApp, /<ArchitectureAdvisor \/>/)
  assert.doesNotMatch(advisorApp, /left-1\/2/)
  assert.doesNotMatch(advisorApp, /translate-x/)

  assert.match(layout, /<RouteFrame>\{children\}<\/RouteFrame>/)
  assert.match(routeFrame, /max-w-none/)
  assert.doesNotMatch(routeFrame, /max-w-screen-sm/)
  assert.match(routeFrame, /site-main min-w-0 w-full flex-1/)
})

test('recreated advisor shell stays centered without breakout positioning', () => {
  assert.match(css, /\.advisor-app\s*\{[^}]*width:\s*100%/)
  assert.match(css, /\.advisor-app\s*\{[^}]*max-width:\s*1600px/)
  assert.match(css, /\.advisor-app\s*\{[^}]*margin:\s*0 auto/)
  assert.match(css, /\.advisor-app-toolbar\s*\{[^}]*max-width:\s*1440px/)
  assert.match(css, /\.advisor-app-workspace\s*\{[^}]*max-width:\s*1440px/)
  assert.match(css, /\.advisor-app-core > section\s*\{[^}]*transform:\s*none !important/)
  assert.match(css, /\.advisor-app-core > section\s*\{[^}]*translate:\s*none !important/)
  assert.match(css, /\.advisor-app-core > section\s*\{[^}]*width:\s*100% !important/)
  assert.doesNotMatch(css, /\.advisor-app\s*\{[^}]*left:\s*50%/)
  assert.doesNotMatch(css, /\.advisor-app\s*\{[^}]*translate:\s*-50%/)
  assert.doesNotMatch(css, /\.tool-app-viewport/)
})

test('advisor contains horizontal overflow and scrolls only the working body', () => {
  assert.match(css, /\.advisor-app-workspace\s*\{[^}]*overflow:\s*hidden/)
  assert.match(css, /\.advisor-app-core\s*\{[^}]*overflow:\s*hidden/)
  assert.match(css, /\.advisor-app-core > section > div:nth-child\(2\)\s*\{[^}]*overflow-x:\s*hidden/)
  assert.match(css, /\.advisor-app-core > section > div:nth-child\(2\)\s*\{[^}]*overflow-y:\s*auto/)
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*hidden/)
})

test('tool typography cannot exceed the portfolio display ceiling', () => {
  assert.match(css, /Keep the portfolio display type ceiling/)
  assert.match(css, /\[class\*='text-6xl'\][\s\S]*font-size:\s*3rem !important/)
})

test('advisor page exposes crawlable guidance below the interactive tool', () => {
  assert.match(page, /<AdvisorSeoContent \/>/)
  assert.ok(page.indexOf('<AdvisorSeoContent />') > page.indexOf('<ArchitectureAdvisorApp title={tool.title} />'))
  assert.match(page, /SoftwareApplication/)
  assert.match(page, /FAQPage/)
  assert.match(page, /BreadcrumbList/)
  assert.match(page, /price:\s*'0'/)
  assert.match(css, /\.advisor-guide,[\s\S]*\.routing-guide\s*\{[^}]*max-width:\s*900px/)
})

test('search and AI guidance covers native, no-code, orchestration, durable jobs, and software', () => {
  for (const term of ['HubSpot', 'GoHighLevel', 'Zapier', 'Make', 'n8n', 'Trigger.dev', 'Power Automate', 'Pipedream', 'Activepieces', 'Workato', 'Tray.ai', 'MuleSoft', 'Custom software']) {
    assert.match(guide, new RegExp(term.replace('.', '\\.'), 'i'), `expected guide to cover ${term}`)
  }
  assert.match(guide, /Five layers that keep automation maintainable/)
  assert.match(guide, /The right answer changes with the shape of the business/)
  assert.match(guide, /Hard constraints first\. Trade-offs second\./)
})
