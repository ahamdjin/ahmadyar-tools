import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { assessmentExportFilename, createAssessmentExport, serializeAssessmentExport } from '../lib/assessment-export'
import { TOOLS } from '../lib/tools'

const components: Record<string, string> = {
  'automation-architecture-advisor': 'components/architecture-advisor.tsx',
  'crm-automation-health-check': 'components/crm-health-check.tsx',
  'client-onboarding-automation-planner': 'components/onboarding-planner.tsx',
  'lead-routing-rules-builder': 'components/lead-routing-builder.tsx',
  'automation-roi-calculator': 'components/automation-roi-calculator.tsx',
  'lead-follow-up-automation-planner': 'components/lead-follow-up-planner.tsx',
}

test('all six result views expose a client-only assessment download', () => {
  assert.equal(TOOLS.length, 6)
  for (const tool of TOOLS) {
    const source = readFileSync(components[tool.slug], 'utf8')
    assert.ok(source.includes("import { AssessmentDownload }"), tool.slug)
    assert.ok(source.includes(`<AssessmentDownload slug="${tool.slug}" input={input} analysis=`), tool.slug)
    assert.ok(source.indexOf('<AssessmentDownload') > source.indexOf('function Result'), tool.slug)
  }
  const ui = readFileSync('components/assessment-download.tsx', 'utf8')
  assert.match(ui, /URL\.createObjectURL/)
  assert.match(ui, /URL\.revokeObjectURL/)
  assert.match(ui, /document\.createElement\('a'\)/)
  assert.doesNotMatch(ui, /fetch\(|sendBeacon\(|localStorage|sessionStorage/)
})

test('export preserves every tool identity and exact input/output without recalculating', () => {
  const generatedAt = new Date('2026-10-12T03:00:00.000Z')
  const input = { monthlyLeads: 230, customSystems: ['Internal CRM'], options: [true, false] }
  const analysis = { score: 62, issues: [{ severity: 'high', title: 'No fallback' }], unanswered: [] }
  for (const tool of TOOLS) {
    const payload = createAssessmentExport(tool.slug, input, analysis, generatedAt)
    assert.equal(payload.format, 'ahmadyar-assessment')
    assert.equal(payload.version, 1)
    assert.equal(payload.tool, tool.slug)
    assert.equal(payload.generatedAt, '2026-10-12T03:00:00.000Z')
    assert.deepEqual(payload.input, input)
    assert.deepEqual(payload.analysis, analysis)
    assert.deepEqual(JSON.parse(serializeAssessmentExport(payload)), payload)
    assert.equal(assessmentExportFilename(tool.slug, generatedAt), `${tool.slug}-assessment-2026-10-12.json`)
  }
})

test('export does not mutate inputs and rejects invalid timestamps', () => {
  const input = Object.freeze({ cases: 10 })
  const analysis = Object.freeze({ outcome: 'pilot' })
  const tool = TOOLS[0].slug
  createAssessmentExport(tool, input, analysis, new Date('2026-10-12T00:00:00.000Z'))
  assert.deepEqual(input, { cases: 10 })
  assert.deepEqual(analysis, { outcome: 'pilot' })
  assert.throws(() => createAssessmentExport(tool, input, analysis, new Date('invalid')), RangeError)
  assert.throws(() => assessmentExportFilename(tool, new Date('invalid')), RangeError)
})
