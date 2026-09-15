import type { ArchitectureKind, AssessmentInput } from './types'

export type ProcessDisposition =
  | 'automate-now'
  | 'pilot-first'
  | 'standardize-first'
  | 'human-checkpoint'
  | 'software-first'

export type ProcessReadiness = {
  disposition: ProcessDisposition
  label: string
  readiness: number
  summary: string
  reasons: string[]
  controls: string[]
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

const STABILITY = {
  changing: 34,
  'mostly-stable': 72,
  stable: 96,
} as const

const CHANGE = {
  daily: 24,
  weekly: 46,
  monthly: 76,
  rare: 96,
} as const

const VOLUME_SIGNAL = (runs: number) => {
  if (runs >= 25_000) return 92
  if (runs >= 5_000) return 82
  if (runs >= 1_000) return 68
  return 52
}

/**
 * Decide whether the process is ready for automation before choosing how to
 * implement it. This layer deliberately separates process maturity from
 * platform capability: a powerful tool should not turn a moving process into a
 * good automation candidate.
 */
export function assessProcessReadiness(input: AssessmentInput, kind: ArchitectureKind): ProcessReadiness {
  const reasons: string[] = []
  const controls: string[] = []

  const maturity = STABILITY[input.processStability]
  const change = CHANGE[input.changeFrequency]
  const volume = VOLUME_SIGNAL(input.monthlyRuns)
  const repeatability = input.portfolioShape === 'mostly-simple'
    ? 92
    : input.portfolioShape === 'mixed'
      ? 78
      : input.portfolioShape === 'advanced'
        ? 66
        : 54

  let readiness = Math.round(clamp(maturity * 0.4 + change * 0.25 + repeatability * 0.2 + volume * 0.15))

  if (input.processStability === 'stable') reasons.push('The underlying process is described as stable and understood.')
  if (input.processStability === 'mostly-stable') reasons.push('The process is mostly stable but still has meaningful exceptions.')
  if (input.processStability === 'changing') reasons.push('The business process itself is still changing, so automating the full path can lock in rework.')
  if (input.changeFrequency === 'daily' || input.changeFrequency === 'weekly') reasons.push('Rules or operating steps change frequently enough to raise maintenance risk.')
  if (input.monthlyRuns >= 5_000) reasons.push('The run volume is high enough that a well-designed automation can compound meaningful operational value.')
  if (input.futureWorkflows >= 30) reasons.push('The future workflow portfolio is large enough that standards and reusable controls matter before scale.')

  if (kind === 'application' || input.productLogic || input.portfolioShape === 'product-like') {
    readiness = Math.max(readiness, 70)
    controls.push('Keep persistent state, transactions, and domain rules in versioned application code.')
    controls.push('Use workflow automation only for replaceable integrations, notifications, and peripheral orchestration.')
    return {
      disposition: 'software-first',
      label: 'Software first',
      readiness,
      summary: 'The core has crossed from workflow automation into application architecture. Build and test the stateful or transactional core like software, then automate around its edges.',
      reasons,
      controls,
    }
  }

  const unstable = input.processStability === 'changing'
  const fastChanging = input.changeFrequency === 'daily' || input.changeFrequency === 'weekly'

  if (unstable && fastChanging) {
    readiness = Math.min(readiness, 49)
    controls.push('Map the current trigger, owner, handoffs, exceptions, and source of truth before adding more automation.')
    controls.push('Automate only stable substeps until the end-to-end process stops changing materially.')
    return {
      disposition: 'standardize-first',
      label: 'Standardize first',
      readiness,
      summary: 'Do not scale end-to-end automation yet. Stabilize the process and its ownership first; otherwise the automation will faithfully reproduce a moving target.',
      reasons,
      controls,
    }
  }

  const highImpactAi = input.aiSteps && (input.failureImpact === 'high' || input.failureImpact === 'critical')
  const explicitHumanDecision = input.humanApprovals

  if (highImpactAi || explicitHumanDecision) {
    controls.push('Keep a named human approval step around uncertain or high-impact decisions.')
    controls.push('Define what the automation may decide automatically and what must escalate for review.')
    if (input.aiSteps) controls.push('Validate AI output deterministically before it can trigger irreversible actions.')
    return {
      disposition: 'human-checkpoint',
      label: 'Automate with a human checkpoint',
      readiness,
      summary: 'Automate the preparation, routing, and repetitive work, but keep explicit human judgment where the cost of a wrong decision is material.',
      reasons,
      controls,
    }
  }

  if (input.processStability === 'changing' || (input.processStability === 'mostly-stable' && fastChanging)) {
    readiness = Math.min(readiness, 68)
    controls.push('Start with one bounded workflow and measure exceptions, recovery work, and ownership before expanding.')
    controls.push('Keep the first implementation easy to change while the process is still settling.')
    return {
      disposition: 'pilot-first',
      label: 'Pilot first',
      readiness,
      summary: 'The process is automatable, but not mature enough to standardize across the whole portfolio yet. Prove one bounded path, learn from the exceptions, then expand.',
      reasons,
      controls,
    }
  }

  controls.push('Start with the smallest architecture that can meet the reliability and ownership requirements.')
  if (input.duplicateUnsafe) controls.push('Make irreversible side effects idempotent or deduplicated before enabling retries.')
  if (input.retriesRequired) controls.push('Define retry limits, exhausted-failure handling, and a visible recovery queue.')

  return {
    disposition: 'automate-now',
    label: 'Ready to automate',
    readiness,
    summary: 'The process is stable enough to automate. Focus on the smallest maintainable architecture rather than adding platform complexity for its own sake.',
    reasons,
    controls,
  }
}
