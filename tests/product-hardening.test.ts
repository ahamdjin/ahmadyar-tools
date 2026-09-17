import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string) => readFileSync(path, 'utf8')

const productComponents = [
  'components/architecture-advisor.tsx',
  'components/crm-health-check.tsx',
  'components/onboarding-planner.tsx',
  'components/lead-routing-builder.tsx',
  'components/automation-roi-calculator.tsx',
  'components/lead-follow-up-planner.tsx',
]

test('Architecture Advisor owns its normal-flow layout without relying on a nested scroller', () => {
  const css = read('app/advisor-rebuild.css')
  assert.match(css, /\.advisor-viewport\s*\{[\s\S]*height:\s*auto !important;[\s\S]*overflow:\s*visible !important;/)
  assert.match(css, /\.advisor-workspace\s*\{[\s\S]*overflow:\s*visible !important;/)
  assert.match(css, /\.advisor-workspace > section\s*\{[\s\S]*height:\s*auto !important;[\s\S]*overflow:\s*visible !important;/)
  assert.match(css, /\.advisor-workspace > section > div:nth-child\(2\)\s*\{[\s\S]*max-height:\s*none !important;[\s\S]*overflow:\s*visible !important;/)
  assert.doesNotMatch(css, /overflow-y:\s*auto !important/)
})

test('all six decision tools expose practical result actions', () => {
  for (const path of productComponents) {
    const source = read(path)
    assert.match(source, /ToolResultActions/, `${path} should expose copy / print result actions`)
  }
})

test('rebuilt tool components do not reintroduce nested vertical scrolling', () => {
  for (const path of productComponents) {
    const source = read(path)
    assert.doesNotMatch(source, /overflow-y-auto/, `${path} should leave vertical scrolling to the document`)
  }
})
