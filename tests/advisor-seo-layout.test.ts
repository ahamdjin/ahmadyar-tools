import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
const indexPage = readFileSync('app/page.tsx', 'utf8')
const css = readFileSync('app/globals.css', 'utf8')
const advisorCss = readFileSync('app/advisor-rebuild.css', 'utf8')
const layout = readFileSync('app/layout.tsx', 'utf8')
const guide = readFileSync('components/advisor-seo-content.tsx', 'utf8')
const routeFrame = readFileSync('components/route-frame.tsx', 'utf8')
const shell = readFileSync('components/site-shell.tsx', 'utf8')
const roiCalculator = readFileSync('components/automation-roi-calculator.tsx', 'utf8')
const followUp = readFileSync('components/lead-follow-up-planner.tsx', 'utf8')

test('tool suite uses normal-flow application stages inside a wide route frame', () => {
  assert.match(page, /className="advisor-workspace"[\s\S]*<ArchitectureAdvisor \/>/)
  assert.match(layout, /<RouteFrame>\{children\}<\/RouteFrame>/)
  assert.match(routeFrame, /max-w-none/)
  assert.doesNotMatch(routeFrame, /max-w-screen-sm/)
  assert.match(routeFrame, /site-main min-w-0 w-full flex-1/)
  assert.match(routeFrame, /<SiteHeader \/>/)
  assert.match(routeFrame, /<SiteFooter \/>/)

  assert.match(css, /\.advisor-viewport,[\s\S]*\.followup-viewport\s*\{[^}]*width:\s*100%/)
  assert.match(css, /\.advisor-viewport,[\s\S]*\.followup-viewport\s*\{[^}]*overflow:\s*hidden/)
  assert.doesNotMatch(css, /left:\s*50%/)
  assert.doesNotMatch(css, /translate:\s*-50% 0/)
  assert.match(css, /\.crm-health-viewport\s*\{\s*max-width:\s*1220px/)
  assert.match(css, /\.onboarding-viewport\s*\{\s*max-width:\s*1240px/)
  assert.match(css, /\.routing-viewport\s*\{\s*max-width:\s*1180px/)
  assert.match(css, /\.roi-viewport\s*\{\s*max-width:\s*1180px/)
  assert.match(css, /\.followup-viewport\s*\{\s*max-width:\s*1220px/)
  assert.match(css, /\.crm-health-workspace > \.crm-health-check\s*\{[^}]*max-width:\s*1060px/)
  assert.match(css, /\.onboarding-workspace > \.onboarding-planner\s*\{[^}]*max-width:\s*1080px/)
  assert.match(css, /\.routing-workspace > \.routing-check\s*\{[^}]*max-width:\s*1020px/)
  assert.match(css, /\.roi-workspace > \.roi-calculator\s*\{[^}]*max-width:\s*1040px/)
  assert.match(css, /\.followup-workspace > \.followup-check\s*\{[^}]*max-width:\s*1060px/)
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*clip/)
})

test('Architecture Advisor keeps its proven centered rebuild without viewport breakout', () => {
  assert.match(advisorCss, /\.advisor-viewport\s*\{[^}]*width:\s*100% !important/)
  assert.match(advisorCss, /\.advisor-viewport\s*\{[^}]*max-width:\s*1600px !important/)
  assert.match(advisorCss, /\.advisor-toolbar\s*\{[^}]*width:\s*min\(100%, 1180px\) !important/)
  assert.match(advisorCss, /\.advisor-workspace\s*\{[^}]*width:\s*min\(100%, 1180px\) !important/)
  assert.match(advisorCss, /\.advisor-workspace > section\s*\{[^}]*max-width:\s*960px !important/)
  assert.match(advisorCss, /overflow-x:\s*hidden !important/)
  assert.doesNotMatch(advisorCss, /left:\s*50%/)
  assert.doesNotMatch(advisorCss, /translate:\s*-50% 0/)
})

test('public tools shell stays centered and the index uses cards instead of ruled rows', () => {
  assert.match(shell, /site-header[^"\n]*max-w-screen-sm/)
  assert.match(shell, /site-footer[^"\n]*max-w-screen-sm/)
  assert.match(indexPage, /tools-index tool-reveal mx-auto w-full max-w-screen-sm/)
  assert.match(indexPage, /tool-index-card/)
  assert.match(indexPage, /rounded-2xl bg-zinc-300\/30 p-\[1px\]/)
  assert.doesNotMatch(indexPage, /border-y/)
  assert.doesNotMatch(indexPage, /divide-y/)
})

test('tool workspaces contain horizontal overflow and reflow at phone width', () => {
  assert.match(css, /grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.match(css, /min-width:\s*0/)
  assert.match(css, /@media \(max-width: 639px\)[\s\S]*min-height:\s*520px/)
  assert.match(css, /overflow-x:\s*hidden/)
})

test('ROI calculator cannot force horizontal overflow inside the integrated branch', () => {
  assert.match(roiCalculator, /roi-calculator grid h-full min-h-0 min-w-0/)
  assert.match(roiCalculator, /overflow-x-hidden overflow-y-auto/)
  assert.match(roiCalculator, /sm:grid-cols-\[210px_minmax\(0,1fr\)\]/)
  assert.match(roiCalculator, /mt-4 grid min-w-0 gap-3 sm:grid-cols-2/)
  assert.match(roiCalculator, /break-words[^"\n]*\[overflow-wrap:anywhere\]/)
  assert.doesNotMatch(roiCalculator, /mt-4 grid grid-cols-2 gap-3/)
})

test('follow-up planner reflows fields, channels and navigation instead of clipping', () => {
  assert.match(followUp, /followup-check grid h-full min-h-0 min-w-0/)
  assert.match(followUp, /overflow-x-hidden overflow-y-auto/)
  assert.match(followUp, /sm:grid-cols-\[210px_minmax\(0,1fr\)\]/)
  assert.match(followUp, /Channels[\s\S]*grid min-w-0 gap-2 sm:grid-cols-2/)
  assert.match(followUp, /flex min-w-0 flex-wrap items-center justify-between/)
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

test('tool canonicals use the shared singular /tool path', () => {
  assert.match(page, /const canonical = `\$\{SITE\.origin\}\$\{SITE\.toolsPath\}\/\$\{tool\.slug\}`/)
  assert.match(page, /name: 'Tools', item: `\$\{SITE\.origin\}\$\{SITE\.toolsPath\}`/)
  assert.doesNotMatch(page, /SITE\.origin\}\/tools/)
})

test('search and AI guidance covers native, no-code, orchestration, durable jobs, and software', () => {
  for (const term of ['HubSpot', 'GoHighLevel', 'Zapier', 'Make', 'n8n', 'Trigger.dev', 'Power Automate', 'Pipedream', 'Activepieces', 'Workato', 'Tray.ai', 'MuleSoft', 'Custom software']) {
    assert.match(guide, new RegExp(term.replace('.', '\\.'), 'i'), `expected guide to cover ${term}`)
  }
  assert.match(guide, /Five layers that keep automation maintainable/)
  assert.match(guide, /The right answer changes with the shape of the business/)
  assert.match(guide, /Hard constraints first\. Trade-offs second\./)
})
