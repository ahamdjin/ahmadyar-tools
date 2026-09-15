import { analyzeArchitecture as analyzeScoredArchitecture } from './analyze'
import { assessDecisionStability } from './decision-stability'
import type { ArchitectureAdvice, AssessmentInput } from './types'

function finalizeRecommendation(input: AssessmentInput, result: ArchitectureAdvice): ArchitectureAdvice {
  const stability = assessDecisionStability(input, result)

  return {
    ...result,
    metrics: {
      ...result.metrics,
      confidence: stability.confidence,
    },
    nextQuestions: stability.highValueQuestions.map((item) => item.question),
  }
}

/**
 * Apply architecture-boundary policy after the scoring model runs, then turn
 * score separation and unresolved architecture questions into user-facing
 * confidence. Platform scoring can compare tools, but it must not manufacture
 * certainty when a high-impact answer is still missing.
 */
export function analyzeArchitecture(input: AssessmentInput): ArchitectureAdvice {
  let result = analyzeScoredArchitecture(input)

  if (result.kind === 'application') {
    const custom = result.ranking.find((platform) => platform.id === 'custom-code' && platform.eligible)

    if (custom) {
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

      result = {
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
  }

  return finalizeRecommendation(input, result)
}
