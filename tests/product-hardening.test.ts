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


test('step navigation returns every tool to the decision header without nested scrolling', () => {
  const hook = read('components/use-tool-step-navigation.ts')
  assert.match(hook, /scrollIntoView\(\{/)
  assert.match(hook, /prefers-reduced-motion: reduce/)
  assert.match(hook, /requestAnimationFrame/)

  for (const path of productComponents) {
    const source = read(path)
    assert.match(source, /useToolStepNavigation/, `${path} should use shared step navigation`)
    assert.match(source, /ref=\{rootRef\}/, `${path} should anchor step navigation to the tool root`)
    assert.match(source, /scroll-mt-24/, `${path} should leave room for the site header after navigation`)
    assert.match(source, /const goTo = \(nextStep: StepId\)/, `${path} should route next, back, edit and reset through one navigation path`)
  }
})


test('tool progress and result actions remain accessible in both themes', () => {
  for (const path of productComponents) {
    const source = read(path)
    assert.match(source, /role="progressbar"/, `${path} should expose progress semantics`)
    assert.match(source, /aria-valuenow=\{progress\}/, `${path} should report current progress`)
    assert.match(source, /aria-live="polite"/, `${path} should announce step changes`)
  }

  const actions = read('components/tool-result-actions.tsx')
  assert.match(actions, /border-white\/30/)
  assert.match(actions, /text-white/)
  assert.match(actions, /dark:text-zinc-800/)
})


test('print export keeps the decision and removes surrounding site chrome', () => {
  const css = read('app/experience-pass.css')
  assert.match(css, /@media print/)
  assert.match(css, /\.site-header,[\s\S]*\.followup-guide,[\s\S]*display:\s*none !important/)
  assert.match(css, /print-color-adjust:\s*exact/)
  assert.match(css, /\.roi-calculator,[\s\S]*max-width:\s*none !important/)
})
