import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { analyzeAutomationRoi, DEFAULT_AUTOMATION_ROI_INPUT, type AutomationRoiInput } from '../engine/automation-roi'

function input(overrides: Partial<AutomationRoiInput> = {}): AutomationRoiInput {
  return { ...DEFAULT_AUTOMATION_ROI_INPUT, ...overrides }
}

test('stable high-volume repetitive work can become a strong automation candidate', () => {
  const result = analyzeAutomationRoi(input({
    baselineSource: 'measured',
    monthlyCases: 3000,
    manualMinutesPerCase: 10,
    loadedHourlyCost: 40,
    automatablePct: 85,
    humanReviewPct: 10,
    reviewMinutes: 1,
    exceptionPct: 5,
    valueCapturePct: 75,
    currentErrorPct: 5,
    avoidableErrorPct: 80,
    costPerError: 30,
    buildCost: 5000,
    monthlySoftwareCost: 200,
    maintenanceHoursPerMonth: 4,
    maintenanceHourlyCost: 60,
    processStability: 'stable',
    changeFrequency: 'rare',
    failureImpact: 'medium',
  }))

  assert.equal(result.disposition, 'automate-now')
  assert.ok(result.expected.firstYearNetValue > 0)
  assert.ok((result.expected.paybackMonths ?? 99) < 12)
  assert.ok(result.expected.netHoursReturned > 0)
  assert.ok(result.confidence >= 70)
})

test('fast-changing process is standardized before positive spreadsheet economics', () => {
  const result = analyzeAutomationRoi(input({
    baselineSource: 'measured',
    monthlyCases: 10000,
    manualMinutesPerCase: 12,
    automatablePct: 90,
    valueCapturePct: 90,
    processStability: 'changing',
    changeFrequency: 'daily',
    buildCost: 1000,
  }))

  assert.equal(result.disposition, 'standardize-first')
  assert.match(result.summary, /changing too quickly|stabilize/i)
})

test('guessed baseline is measured before committing build budget', () => {
  const result = analyzeAutomationRoi(input({
    baselineSource: 'guess',
    processStability: 'stable',
    changeFrequency: 'rare',
    monthlyCases: 2500,
    manualMinutesPerCase: 15,
    buildCost: 2000,
  }))

  assert.equal(result.disposition, 'measure-first')
  assert.ok(result.confidence < 65)
  assert.ok(result.risks.some((risk) => /guess/i.test(risk)))
})

test('critical-impact automation is piloted even when expected ROI is attractive', () => {
  const result = analyzeAutomationRoi(input({
    baselineSource: 'measured',
    monthlyCases: 4000,
    manualMinutesPerCase: 8,
    loadedHourlyCost: 50,
    automatablePct: 85,
    humanReviewPct: 10,
    exceptionPct: 5,
    valueCapturePct: 80,
    buildCost: 3000,
    monthlySoftwareCost: 150,
    processStability: 'stable',
    changeFrequency: 'rare',
    failureImpact: 'critical',
  }))

  assert.ok(result.expected.firstYearNetValue > 0)
  assert.equal(result.disposition, 'pilot-first')
  assert.ok(result.risks.some((risk) => /failure impact/i.test(risk)))
})

test('weak economics are not forced into a positive automation recommendation', () => {
  const result = analyzeAutomationRoi(input({
    baselineSource: 'measured',
    monthlyCases: 50,
    manualMinutesPerCase: 2,
    loadedHourlyCost: 20,
    automatablePct: 50,
    humanReviewPct: 30,
    reviewMinutes: 2,
    exceptionPct: 20,
    valueCapturePct: 30,
    currentErrorPct: 0,
    avoidableErrorPct: 0,
    costPerError: 0,
    buildCost: 10000,
    monthlySoftwareCost: 500,
    maintenanceHoursPerMonth: 8,
    maintenanceHourlyCost: 60,
    processStability: 'stable',
    changeFrequency: 'rare',
    failureImpact: 'low',
  }))

  assert.equal(result.disposition, 'deprioritize')
  assert.ok(result.expected.monthlyNetValue < 0 || (result.expected.paybackMonths ?? 99) > 24)
})

test('conservative stress case never improves the modeled economics', () => {
  const scenarios = [
    DEFAULT_AUTOMATION_ROI_INPUT,
    input({ baselineSource: 'measured', monthlyCases: 5000, automatablePct: 90, valueCapturePct: 90 }),
    input({ monthlyCases: 200, humanReviewPct: 50, exceptionPct: 25, buildCost: 15000 }),
  ]

  for (const scenario of scenarios) {
    const result = analyzeAutomationRoi(scenario)
    assert.ok(result.conservative.firstYearNetValue <= result.expected.firstYearNetValue)
    assert.ok(result.conservative.monthlyNetValue <= result.expected.monthlyNetValue)
    assert.ok(result.score >= 0 && result.score <= 100)
    assert.ok(result.confidence >= 25 && result.confidence <= 95)
  }
})

test('ROI route is a dedicated portfolio-framed product with crawlable guidance', () => {
  const page = readFileSync('app/[slug]/page.tsx', 'utf8')
  const frame = readFileSync('components/route-frame.tsx', 'utf8')
  const css = readFileSync('app/globals.css', 'utf8')
  const polish = readFileSync('app/roi-polish.css', 'utf8')
  const guide = readFileSync('components/automation-roi-seo-content.tsx', 'utf8')

  assert.match(page, /automation-roi-calculator/)
  assert.match(page, /<AutomationRoiCalculator \/>/)
  assert.match(page, /<AutomationRoiSeoContent \/>/)
  assert.match(page, /AUTOMATION_ROI_FAQS/)
  assert.match(frame, /max-w-none/)
  assert.doesNotMatch(frame, /max-w-screen-sm/)
  assert.match(css, /\.roi-viewport/)
  assert.match(css, /\.roi-workspace > \.roi-calculator/)
  assert.match(polish, /container-type:\s*inline-size/)
  assert.match(polish, /input:focus,[\s\S]*box-shadow:\s*0 0 0 3px/)
  assert.match(polish, /min-height:\s*64px/)
  assert.match(guide, /Time saved is not automatically cash saved/i)
  assert.match(guide, /conservative stress case/i)
})
