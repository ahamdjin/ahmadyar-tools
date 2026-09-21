import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = process.cwd()
const evidence = fs.readFileSync(path.join(root, 'components/tool-evidence.tsx'), 'utf8')
const editorial = fs.readFileSync(path.join(root, 'components/tool-editorial-links.tsx'), 'utf8')

const slugs = [
  'automation-architecture-advisor',
  'crm-automation-health-check',
  'client-onboarding-automation-planner',
  'lead-routing-rules-builder',
  'automation-roi-calculator',
  'lead-follow-up-automation-planner',
]

test('every public tool has a research evidence entry', () => {
  for (const slug of slugs) assert.match(evidence, new RegExp(`'${slug}'`))
})

test('evidence explains methodology boundaries instead of turning vendor claims into scoring rules', () => {
  assert.match(evidence, /vendor claims and survey statistics are not silently converted into scoring rules/i)
  assert.match(evidence, /Reviewed 21 September 2026/)
})

test('evidence is rendered through the shared editorial surface', () => {
  assert.match(editorial, /import \{ ToolEvidence \}/)
  assert.match(editorial, /<ToolEvidence slug=\{slug\} \/>/)
})
