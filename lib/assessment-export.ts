import type { ToolSlug } from './tools'

/**
 * Portable snapshot of the user's answers and the exact deterministic analysis
 * shown by the tool. This is not a vendor workflow blueprint or an implementation.
 */
export function createAssessmentExport<TInput, TAnalysis>(
  tool: ToolSlug,
  input: TInput,
  analysis: TAnalysis,
  generatedAt: Date = new Date(),
) {
  if (!Number.isFinite(generatedAt.getTime())) {
    throw new RangeError('Assessment export requires a valid date')
  }

  return {
    format: 'ahmadyar-assessment',
    version: 1,
    tool,
    generatedAt: generatedAt.toISOString(),
    caveat:
      'Planning assessment only. Verify assumptions, platform capabilities, permissions, legal requirements, and test cases before implementing.',
    input,
    analysis,
  } as const
}

export function serializeAssessmentExport(payload: ReturnType<typeof createAssessmentExport>): string {
  return JSON.stringify(payload, null, 2) + '\n'
}

export function assessmentExportFilename(tool: ToolSlug, generatedAt: Date): string {
  if (!Number.isFinite(generatedAt.getTime())) {
    throw new RangeError('Assessment export requires a valid date')
  }
  return `${tool}-assessment-${generatedAt.toISOString().slice(0, 10)}.json`
}
