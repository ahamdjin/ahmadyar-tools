import type { AssessmentInput } from './types'

export type OperatingModelLevel = 'lightweight' | 'managed' | 'governed' | 'platform'

export type OperatingModelAdvice = {
  level: OperatingModelLevel
  label: string
  summary: string
  practices: string[]
}

export function recommendOperatingModel(input: AssessmentInput): OperatingModelAdvice {
  const future = Math.max(input.currentWorkflows, input.futureWorkflows)
  const highRisk = input.failureImpact === 'high' || input.failureImpact === 'critical'
  const governancePressure = input.governance || input.sensitiveData || highRisk

  if (future >= 75 || (future >= 45 && governancePressure)) {
    return {
      level: 'platform',
      label: 'Automation platform operating model',
      summary: 'You are no longer managing a handful of automations. Treat automation as shared infrastructure with explicit ownership and standards.',
      practices: [
        'Separate development, testing, and production for important workflows.',
        'Use shared credential management and remove personal accounts from production automations.',
        'Create reusable subflows/components for common logic instead of cloning workflows.',
        'Assign an owner, recovery path, and business criticality level to every production workflow.',
        'Centralize monitoring so failures across dozens of workflows are visible in one place.',
        'Use change review for revenue-critical, financial, or customer-facing automations.',
      ],
    }
  }

  if (future >= 30 || (future >= 18 && governancePressure)) {
    return {
      level: 'governed',
      label: 'Governed automation program',
      summary: 'The workflow portfolio is large enough that consistency matters almost as much as individual workflow design.',
      practices: [
        'Standardize naming, folders/projects, credentials, and error ownership.',
        'Document the trigger, system of record, owner, and recovery path for each important workflow.',
        'Reuse common routing, notification, and data-cleaning logic where the platform supports it.',
        'Review usage and failure rates monthly before they become a cost or reliability problem.',
        'Keep a small approval process for high-impact workflow changes.',
      ],
    }
  }

  if (future >= 10) {
    return {
      level: 'managed',
      label: 'Managed workflow portfolio',
      summary: 'You can still move quickly, but a little structure now will prevent a messy portfolio later.',
      practices: [
        'Use consistent workflow names and one obvious owner for every automation.',
        'Keep credentials centralized instead of tied to whoever originally built the workflow.',
        'Add simple failure alerts and a short runbook for important workflows.',
        'Prefer reusable patterns over copying the same automation five different ways.',
      ],
    }
  }

  return {
    level: 'lightweight',
    label: 'Lightweight automation setup',
    summary: 'Keep the operating model simple. The biggest risk right now is overengineering a small workflow portfolio.',
    practices: [
      'Keep ownership obvious.',
      'Use native automation where it is sufficient.',
      'Add failure alerts only where a missed run matters.',
      'Do not introduce infrastructure or governance processes you will not actually use.',
    ],
  }
}
