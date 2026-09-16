import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
const hub = readFileSync('app/page.tsx', 'utf8')
const layout = readFileSync('app/layout.tsx', 'utf8')
const reading = readFileSync('components/tool-editorial-links.tsx', 'utf8')
const llms = readFileSync('app/llms.txt/route.ts', 'utf8')

const slugs = [
  'automation-architecture-advisor',
  'crm-automation-health-check',
  'client-onboarding-automation-planner',
  'lead-routing-rules-builder',
  'automation-roi-calculator',
  'lead-follow-up-automation-planner',
]

const questionGuides = [
  '/blog/when-should-you-stop-using-zapier-or-n8n',
  '/blog/how-to-clean-up-a-messy-crm',
  '/blog/what-should-happen-after-a-client-signs',
  '/blog/should-you-use-round-robin-lead-routing',
  '/blog/does-time-saved-count-as-automation-roi',
  '/blog/how-fast-should-you-follow-up-with-a-new-lead',
]

test('all tool pages retain canonical SEO metadata and structured data', () => {
  assert.match(page, /alternates: \{ canonical \}/)
  assert.match(page, /authors: \[\{ name: SITE\.name, url: SITE\.origin \}\]/)
  assert.match(page, /dateModified: '2026-09-16'/)
  assert.match(page, /FAQPage/)
  assert.match(page, /BreadcrumbList/)
  assert.match(page, /SoftwareApplication/)
})

test('tool titles and descriptions stay concise and intent-specific', () => {
  for (const title of [
    'Automation Architecture Advisor',
    'CRM Automation Health Check',
    'Client Onboarding Automation Planner',
    'Lead Routing Rules Builder',
    'Automation ROI Calculator',
    'Lead Follow-Up Automation Planner',
  ]) assert.ok(page.includes(`'${title}'`), title)

  assert.ok(!page.includes('Choose the Right Stack'))
  assert.ok(!page.includes('Payback, Savings & Build Decision'))
})

test('tools hub has useful metadata, favicon and collection schema', () => {
  assert.match(layout, /Free Automation Planning Tools \| Ahmad Yar/)
  assert.match(layout, /icons:/)
  assert.match(hub, /CollectionPage/)
  assert.match(hub, /ItemList/)
})

test('all six tool routes render supporting editorial links', () => {
  assert.match(page, /ToolEditorialLinks/)
  for (const slug of slugs) assert.ok(reading.includes(`'${slug}'`), slug)
})

test('each tool points to its researched question guide and deeper guide', () => {
  assert.match(reading, /SITE\.origin/)
  for (const guide of questionGuides) assert.ok(reading.includes(guide), guide)
  assert.ok(reading.includes('/blog/how-to-choose-an-automation-stack-without-overengineering'))
  assert.ok(reading.includes('/blog/crm-automation-health-check-what-to-fix-first'))
  assert.ok(reading.includes('/blog/client-onboarding-automation-what-to-automate-keep-human'))
  assert.ok(reading.includes('/blog/lead-routing-rules-how-to-design-a-system-that-does-not-break'))
  assert.ok(reading.includes('/blog/automation-roi-how-to-calculate-payback-without-fooling-yourself'))
  assert.ok(reading.includes('/blog/how-to-automate-lead-follow-up-without-losing-human-touch'))
})

test('tool llms index pairs each tool with the new supporting question guide', () => {
  assert.match(llms, /const root = `\$\{SITE\.origin\}\$\{SITE\.toolsPath\}`/)
  for (const slug of slugs) assert.ok(llms.includes(`/${slug}`), slug)
  for (const guide of questionGuides) assert.ok(llms.includes(guide), guide)
})
