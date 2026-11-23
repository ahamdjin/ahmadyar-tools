import assert from 'node:assert/strict'
import test from 'node:test'

import { relatedPlanners, relatedUtilities, WORKFLOW_UTILITIES } from '../lib/related-tools'
import { TOOLS } from '../lib/tools'
import { UTILITIES } from '../lib/utilities/catalog'

test('all six planning tools link only to registered, unique utilities', () => {
  for (const planner of TOOLS) {
    const slugs = WORKFLOW_UTILITIES[planner.slug]
    assert.ok(slugs.length > 0, planner.slug)
    assert.equal(new Set(slugs).size, slugs.length, planner.slug)
    assert.deepEqual(relatedUtilities(planner.slug).map((item) => item.slug), slugs)
    for (const slug of slugs) {
      assert.ok(UTILITIES.some((item) => item.slug === slug), `${planner.slug}: ${slug}`)
      assert.ok(relatedPlanners(slug).some((item) => item.slug === planner.slug))
    }
  }
})

test('onboarding links support intake data, comparisons and scheduling, not image provenance', () => {
  const slugs = WORKFLOW_UTILITIES['client-onboarding-automation-planner']
  for (const slug of ['csv-to-api-payload', 'json-repair-payload-inspector', 'json-compare', 'automation-schedule-builder'] as const) {
    assert.ok(slugs.includes(slug), slug)
  }
  for (const slug of ['remove-c2pa', 'content-credentials', 'image-compressor', 'image-converter'] as const) {
    assert.ok(!slugs.includes(slug), slug)
  }
})
