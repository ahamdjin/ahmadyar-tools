import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync('app/[slug]/page.tsx', 'utf8')
const hub = readFileSync('app/page.tsx', 'utf8')
const methodology = readFileSync('lib/tool-methodology.ts', 'utf8')
const component = readFileSync('components/tool-methodology.tsx', 'utf8')
const llms = readFileSync('app/llms.txt/route.ts', 'utf8')

const slugs = [
  'automation-architecture-advisor',
  'crm-automation-health-check',
  'client-onboarding-automation-planner',
  'lead-routing-rules-builder',
  'automation-roi-calculator',
  'lead-follow-up-automation-planner',
]

test('every tool exposes a reviewed transparent decision model', () => {
  for (const slug of slugs) assert.ok(methodology.includes(`'${slug}'`), slug)
  assert.equal((methodology.match(/reviewedAt: '2026-09-29'/g) ?? []).length, 6)
  assert.equal((methodology.match(/^    doesNot:/gm) ?? []).length, 6)
  assert.equal((methodology.match(/^    relatedWork:/gm) ?? []).length, 6)

  assert.match(page, /<ToolMethodology slug=\{tool\.slug\} \/>/)
  assert.match(page, /featureList: TOOL_METHODOLOGY\[tool\.slug\]\.evaluates/)
  assert.match(page, /dateModified: TOOL_METHODOLOGY\[tool\.slug\]\.reviewedAt/)
})

test('methodology block explains limits and links to real portfolio work', () => {
  assert.match(component, /What this tool uses — and what it refuses to guess\./)
  assert.match(component, /What it evaluates/)
  assert.match(component, /What it does not assume/)
  assert.match(component, /Related real work/)
  assert.match(component, /Same inputs produce the same result\./)
  assert.match(component, /SITE\.origin/)
})

test('methodology links are real internal proof routes, not invented claims', () => {
  for (const href of [
    '/work/case-studies/c4i-operating-architecture',
    '/work/case-studies/lead-generation-website-and-ai-intake-system',
    '/work/platforms/n8n',
    '/ai-automation/crm',
    '/ai-automation/operations',
    '/ai-automation/revenue',
    '/ai-automation/sales',
    '/work/case-studies',
    '/ai-automation',
  ]) assert.ok(methodology.includes(href), href)

  assert.doesNotMatch(methodology, /%|percent|saved \d|increased \d|reduced \d/i)
})

test('hub and llms index explain the methodology layer', () => {
  assert.match(hub, /what its model evaluates/)
  assert.match(hub, /related real work/)
  assert.match(llms, /what its model evaluates/)
  assert.match(llms, /methodology review date/)
  assert.match(llms, /related real work/)
})
