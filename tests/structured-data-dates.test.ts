import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { TOOL_METHODOLOGY } from '../lib/tool-methodology'
import { TOOLS } from '../lib/tools'

const route = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8')

test('all six tools keep methodology review dates available as editorial evidence', () => {
  for (const tool of TOOLS) {
    assert.ok(TOOL_METHODOLOGY[tool.slug].reviewedAt, tool.slug)
  }
  assert.match(route, /<ToolMethodology slug=\{tool\.slug\}/)
})

test('methodology review dates are not misrepresented as webpage modification dates', () => {
  assert.doesNotMatch(route, /dateModified\s*:\s*TOOL_METHODOLOGY/)
  assert.doesNotMatch(route, /datePublished\s*:\s*TOOL_METHODOLOGY/)
})
