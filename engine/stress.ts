import { analyzeArchitecture } from './analyze'
import type { ArchitectureKind, AssessmentInput, PlatformId } from './types'

export type StressScenario = {
  id: string
  label: string
  note: string
  primary: PlatformId
  primaryName: string
  kind: ArchitectureKind
  score: number
  changedRecommendation: boolean
}

export function stressTestArchitecture(input: AssessmentInput): StressScenario[] {
  const baseline = analyzeArchitecture(input)
  const cases: Array<{ id: string; label: string; note: string; input: AssessmentInput }> = [
    {
      id: 'volume-10x',
      label: 'Volume grows 10×',
      note: 'Tests whether usage and scale pressure change the architecture.',
      input: { ...input, monthlyRuns: Math.min(10_000_000, Math.max(input.monthlyRuns * 10, input.monthlyRuns + 10_000)) },
    },
    {
      id: 'portfolio-double',
      label: 'Workflow portfolio doubles',
      note: 'Tests future maintainability and governance pressure.',
      input: { ...input, futureWorkflows: Math.min(1000, Math.max(input.futureWorkflows * 2, input.futureWorkflows + 10)) },
    },
    {
      id: 'nontechnical-owner',
      label: 'Technical owner leaves',
      note: 'Tests whether the recommendation still works when a business team must maintain it.',
      input: { ...input, team: 'business', maintenance: 'low', selfHosting: input.selfHosting === 'required' ? 'preferred' : input.selfHosting },
    },
    {
      id: 'self-host-required',
      label: 'Self-hosting becomes mandatory',
      note: 'Eliminates managed-only platforms before rescoring.',
      input: { ...input, selfHosting: 'required' },
    },
    {
      id: 'complexity-jump',
      label: 'Logic becomes much more complex',
      note: 'Adds advanced branching, APIs, and more steps.',
      input: { ...input, branching: 'advanced', customApi: true, typicalSteps: Math.min(100, input.typicalSteps + 12) },
    },
    {
      id: 'crm-consolidation',
      label: 'Most logic moves into one CRM',
      note: 'Tests whether an external automation layer can be removed.',
      input: {
        ...input,
        crmCentered: true,
        appsPerWorkflow: Math.min(input.appsPerWorkflow, 3),
        typicalSteps: Math.min(input.typicalSteps, 6),
        branching: 'simple',
        customApi: false,
        loopsOrBatching: false,
        productLogic: false,
      },
    },
  ]

  return cases.map((scenario) => {
    const result = analyzeArchitecture(scenario.input)
    return {
      id: scenario.id,
      label: scenario.label,
      note: scenario.note,
      primary: result.primary.id,
      primaryName: result.primary.name,
      kind: result.kind,
      score: result.primary.score,
      changedRecommendation: result.primary.id !== baseline.primary.id || result.kind !== baseline.kind,
    }
  })
}
