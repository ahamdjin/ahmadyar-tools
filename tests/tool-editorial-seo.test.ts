import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
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

test('all tool pages retain canonical SEO metadata and current modified date', () => {
  assert.match(page, /alternates: \{ canonical \}/)
  assert.match(page, /authors: \[\{ name: SITE\.name, url: SITE\.origin \}\]/)
  assert.match(page, /dateModified: '2026-09-16'/)
  assert.match(page, /FAQPage/)
  assert.match(page, /BreadcrumbList/)
  assert.match(page, /SoftwareApplication/)
})

test('all six tool routes render supporting editorial links', () => {
  assert.match(page, /ToolEditorialLinks/)
  for (const slug of slugs) assert.ok(reading.includes(`'${slug}'`), slug)
})

test('editorial links point to the public portfolio domain and dedicated guides', () => {
  assert.match(reading, /SITE\.origin/)
  assert.ok(reading.includes('/blog/how-to-choose-an-automation-stack-without-overengineering'))
  assert.ok(reading.includes('/blog/crm-automation-health-check-what-to-fix-first'))
  assert.ok(reading.includes('/blog/client-onboarding-automation-what-to-automate-keep-human'))
  assert.ok(reading.includes('/blog/lead-routing-rules-how-to-design-a-system-that-does-not-break'))
  assert.ok(reading.includes('/blog/automation-roi-how-to-calculate-payback-without-fooling-yourself'))
  assert.ok(reading.includes('/blog/how-to-automate-lead-follow-up-without-losing-human-touch'))
})

test('tool llms index pairs each tool with supporting reading', () => {
  for (const slug of slugs) assert.ok(llms.includes(`/tool/${slug}`), slug)
  assert.ok(llms.includes('Supporting guide:'))
})
