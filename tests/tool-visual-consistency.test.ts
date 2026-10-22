import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (file: string) => readFileSync(file, 'utf8')

test('all six tools use a consistent, accessible methodology card system', () => {
  const page = read('app/[slug]/page.tsx')
  const methodology = read('components/tool-methodology.tsx')
  const data = read('lib/tool-methodology.ts')

  assert.equal((page.match(/<ToolMethodology slug=\{tool\.slug\} \/>/g) ?? []).length, 6)
  assert.equal((data.match(/reviewedAt: '2026-09-29'/g) ?? []).length, 6)
  assert.ok(methodology.includes('grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-4'))
  assert.ok(methodology.includes('grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'))
  assert.ok(methodology.includes('method.evaluates.map'))
  assert.ok(methodology.includes('method.doesNot'))
  assert.ok(methodology.includes('method.relatedWork.map'))
  assert.ok(methodology.includes('What it evaluates'))
  assert.ok(methodology.includes('What it does not assume'))
  assert.ok(methodology.includes('Same inputs produce the same result.'))
})

test('tool hub, related reading and research use symmetrical clickable cards', () => {
  const hub = read('app/page.tsx')
  const articles = read('components/tool-editorial-links.tsx')
  const evidence = read('components/tool-evidence.tsx')

  for (const item of [hub, articles, evidence]) {
    assert.ok(item.includes('grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2'))
  }
  assert.ok(hub.includes('href={`/${tool.slug}`}'))
  assert.ok(articles.includes('href={`${SITE.origin}${item.href}`}'))
  assert.ok(evidence.includes('href={item.href}'))
  assert.ok(!hub.includes('Open tool'))
  assert.ok(!articles.includes('underline decoration-zinc'))
  assert.ok(!evidence.includes('underline decoration-zinc'))
})

test('tool interaction, original URLs and SEO evidence remain available', () => {
  const page = read('app/[slug]/page.tsx')
  const methodology = read('components/tool-methodology.tsx')
  assert.ok(page.includes('<ArchitectureAdvisor />'))
  assert.ok(page.includes('<CrmHealthCheck />'))
  assert.ok(page.includes('<OnboardingPlanner />'))
  assert.ok(page.includes('<LeadRoutingBuilder />'))
  assert.ok(page.includes('<AutomationRoiCalculator />'))
  assert.ok(page.includes('<LeadFollowUpPlanner />'))
  assert.ok(page.includes('alternates: { canonical }'))
  assert.ok(page.includes("applicationCategory: 'BusinessApplication'"))
  assert.ok(methodology.includes('SITE.origin'))
})
