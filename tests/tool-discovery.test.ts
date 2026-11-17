import assert from 'node:assert/strict'
import test from 'node:test'
import { TOOLS } from '../lib/tools'
import { UTILITIES } from '../lib/utilities/catalog'
import { WORKFLOW_UTILITIES, relatedUtilities, relatedPlanners } from '../lib/related-tools'
import sitemap from '../app/sitemap'

test('all planners link to existing relevant utilities, with reciprocal planning links', () => {
  for (const planner of TOOLS) {
    assert(relatedUtilities(planner.slug).length >= 2)
    for (const slug of WORKFLOW_UTILITIES[planner.slug]) {
      assert(UTILITIES.some((tool) => tool.slug === slug))
      assert(relatedPlanners(slug).some((tool) => tool.slug === planner.slug))
    }
  }
  for (const utility of UTILITIES) assert(relatedPlanners(utility.slug).length > 0)
  assert.deepEqual(relatedUtilities('unknown'), [])
})
test('tools sitemap contains every canonical route exactly once with reviewed modification dates', () => {
  const entries = sitemap()
  const urls = entries.map((entry) => entry.url)
  assert.equal(new Set(urls).size, 14)
  for (const tool of [...TOOLS, ...UTILITIES]) assert(urls.includes(`https://www.ahmadyar.co/tool/${tool.slug}`))
  for (const entry of entries) assert.equal(new Date(entry.lastModified!).toISOString(), '2026-11-17T00:00:00.000Z')
})
