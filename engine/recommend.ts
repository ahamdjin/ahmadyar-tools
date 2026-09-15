import { analyzeArchitecture as analyzeScoredArchitecture } from './analyze'
import type { ArchitectureAdvice, AssessmentInput } from './types'

/**
 * Apply architecture-boundary policy after the scoring model runs.
 *
 * Platform scoring is useful for comparing tools inside the same architecture
 * family, but it must not be allowed to erase a harder architectural boundary.
 * If the workload has been classified as application/product infrastructure,
 * the stateful or transactional core belongs in software. Workflow platforms
 * can still appear as orchestration lanes around that core.
 */
export function analyzeArchitecture(input: AssessmentInput): ArchitectureAdvice {
  const result = analyzeScoredArchitecture(input)

  if (result.kind !== 'application') return result

  const custom = result.ranking.find((platform) => platform.id === 'custom-code' && platform.eligible)
  if (!custom) return result

  const ranking = [custom, ...result.ranking.filter((platform) => platform.id !== 'custom-code')]
  const alternatives = ranking.filter((platform) => platform.eligible && platform.id !== custom.id).slice(0, 3)
  const portfolioPlan = result.portfolioPlan.map((lane) =>
    lane.id === 'application'
      ? {
          ...lane,
          platform: custom.id,
          platformName: custom.name,
          purpose:
            'Keep persistent state, transactions, customer-facing behavior, and domain rules in software built, tested, observed, and deployed like an application.',
        }
      : lane,
  )
  const platformMix = [...new Set([custom.id, ...portfolioPlan.map((lane) => lane.platform)])]

  return {
    ...result,
    primary: custom,
    alternatives,
    ranking,
    portfolioPlan,
    platformMix,
    metrics: {
      ...result.metrics,
      costPressure: custom.costPressure,
    },
    summary:
      'Treat the core as software architecture, not one giant workflow. Custom application code should own stateful or transactional logic; automation platforms can still handle replaceable integrations, notifications, and peripheral orchestration around the edges.',
  }
}
