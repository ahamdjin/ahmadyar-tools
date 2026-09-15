import assert from 'node:assert/strict'
import test from 'node:test'

import { analyzeAutomationRoi, DEFAULT_AUTOMATION_ROI_INPUT, type RoiBaselineSource, type RoiProcessStability } from '../engine/automation-roi'
import { analyzeCrmHealth, DEFAULT_CRM_HEALTH_INPUT, type CrmHealthLevel } from '../engine/crm-health'
import {
  analyzeLeadRouting,
  DEFAULT_LEAD_ROUTING_INPUT,
  type ExistingOwnershipRule,
  type PrimaryRoutingRule,
} from '../engine/lead-routing'
import {
  analyzeOnboarding,
  DEFAULT_ONBOARDING_INPUT,
  type AccessComplexity,
  type OnboardingLevel,
  type TriggerMode,
} from '../engine/onboarding'

const bounded = (value: number, label: string) => {
  assert.ok(Number.isFinite(value), `${label} must be finite`)
  assert.ok(value >= 0 && value <= 100, `${label} must stay between 0 and 100; received ${value}`)
}

const unique = (items: string[], label: string) => {
  assert.equal(new Set(items).size, items.length, `${label} should not contain duplicates`)
}

test('CRM health remains bounded and internally consistent across volume, team size, and maturity', () => {
  const levels: CrmHealthLevel[] = [0, 1, 2, 3]
  const volumes = [50, 500, 5000]
  const reps = [1, 6, 20]

  for (const health of levels) {
    for (const monthlyLeads of volumes) {
      for (const salesReps of reps) {
        const result = analyzeCrmHealth({
          ...DEFAULT_CRM_HEALTH_INPUT,
          crmId: 'hubspot',
          connectedApps: ['slack', 'google-sheets', 'zapier'],
          monthlyLeads,
          salesReps,
          captureCoverage: health,
          duplicateControl: health,
          requiredData: health,
          sourceTracking: health,
          routingQuality: health,
          unassignedProtection: health,
          responseDiscipline: health,
          followupQuality: health,
          pipelineDefinition: health,
          stalePipelineControl: health,
          handoffQuality: health,
          reportingTrust: health,
          workflowMonitoring: health,
          operatingOwnership: health,
          crmAdoption: health,
          shadowSystems: health === 0 ? 3 : health === 1 ? 2 : 0,
        })

        bounded(result.score, 'CRM score')
        bounded(result.confidence, 'CRM confidence')
        assert.equal(result.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0), 100)
        for (const dimension of result.dimensions) bounded(dimension.score, `CRM ${dimension.id}`)
        unique(result.dimensions.map((dimension) => dimension.id), 'CRM dimensions')
        unique(result.issues.map((issue) => issue.id), 'CRM issues')
        assert.ok(result.plan.length >= 1)
        assert.ok(result.architecture.length > 0)
      }
    }
  }
})

test('onboarding analysis stays deterministic across trigger, repeatability, and access complexity', () => {
  const triggers: TriggerMode[] = ['deal-won', 'contract-signed', 'payment-received', 'compound', 'manual']
  const levels: OnboardingLevel[] = [0, 1, 2, 3]
  const accessLevels: AccessComplexity[] = ['none', 'light', 'multi', 'sensitive']

  for (const triggerMode of triggers) {
    for (const processRepeatability of levels) {
      for (const accessComplexity of accessLevels) {
        const requireSigned = triggerMode === 'contract-signed' || triggerMode === 'compound'
        const requirePaid = triggerMode === 'payment-received' || triggerMode === 'compound'
        const result = analyzeOnboarding({
          ...DEFAULT_ONBOARDING_INPUT,
          crmId: 'hubspot',
          contractAppId: requireSigned ? 'docusign' : null,
          billingAppId: requirePaid ? 'stripe' : null,
          projectAppId: 'clickup',
          intakeAppId: 'typeform',
          triggerMode,
          requireWon: triggerMode === 'deal-won' || triggerMode === 'compound',
          requireSigned,
          requirePaid,
          processRepeatability,
          accessComplexity,
          accessTracking: processRepeatability,
          readinessGate: processRepeatability,
          duplicateProtection: processRepeatability,
          exceptionHandling: processRepeatability,
          monitoring: processRepeatability,
        })

        bounded(result.score, 'Onboarding score')
        bounded(result.confidence, 'Onboarding confidence')
        for (const [metric, value] of Object.entries(result.metrics)) bounded(value, `Onboarding ${metric}`)
        unique(result.issues.map((issue) => issue.id), 'Onboarding issues')
        unique(result.stages.map((stage) => stage.id), 'Onboarding stages')
        assert.equal(result.thirtyDayPlan.length, 4)
        assert.ok(result.architecture.length >= 3)
        assert.ok(result.stages.at(-1)?.id === 'ready')
      }
    }
  }
})

test('lead routing always preserves safety ordering across routing strategies and ownership policies', () => {
  const strategies: PrimaryRoutingRule[] = ['round-robin', 'territory', 'service', 'segment', 'named-account', 'score', 'capacity', 'hybrid']
  const ownership: ExistingOwnershipRule[] = ['preserve', 'account-first', 're-evaluate', 'manual']

  for (const primaryRule of strategies) {
    for (const existingOwnership of ownership) {
      const result = analyzeLeadRouting({
        ...DEFAULT_LEAD_ROUTING_INPUT,
        crmId: 'salesforce',
        monthlyLeads: 2500,
        reps: 14,
        teams: 3,
        territories: primaryRule === 'territory' || primaryRule === 'hybrid' ? 6 : 1,
        serviceLines: primaryRule === 'service' || primaryRule === 'hybrid' ? 5 : 2,
        primaryRule,
        existingOwnership,
      })

      bounded(result.score, 'Routing score')
      bounded(result.confidence, 'Routing confidence')
      for (const [metric, value] of Object.entries(result.metrics)) bounded(value, `Routing ${metric}`)
      unique(result.issues.map((issue) => issue.id), 'Routing issues')
      unique(result.rules.map((rule) => rule.label), 'Routing rules')
      unique(result.observabilityFields, 'Routing observability fields')
      assert.deepEqual(result.rules.map((rule) => rule.order), [1, 2, 3, 4, 5, 6])
      assert.equal(result.rules[0]?.label, 'Normalize + deduplicate')
      assert.equal(result.rules[1]?.label, 'Protect existing relationships')
      assert.equal(result.rules.at(-1)?.label, 'Fallback + SLA')
      assert.ok(result.testCases.length >= 6)
    }
  }
})

test('automation ROI remains bounded and conservative across baseline quality and process stability', () => {
  const sources: RoiBaselineSource[] = ['measured', 'estimated', 'guess']
  const stability: RoiProcessStability[] = ['stable', 'mostly-stable', 'changing']

  for (const baselineSource of sources) {
    for (const processStability of stability) {
      for (const monthlyCases of [0, 100, 10000]) {
        const result = analyzeAutomationRoi({
          ...DEFAULT_AUTOMATION_ROI_INPUT,
          baselineSource,
          processStability,
          monthlyCases,
          automatablePct: 82,
          humanReviewPct: 20,
          exceptionPct: 12,
        })

        bounded(result.score, 'ROI score')
        bounded(result.confidence, 'ROI confidence')
        assert.ok(Number.isFinite(result.expected.firstYearNetValue))
        assert.ok(Number.isFinite(result.conservative.firstYearNetValue))
        assert.ok(result.conservative.firstYearNetValue <= result.expected.firstYearNetValue)
        assert.ok(result.conservative.monthlyNetValue <= result.expected.monthlyNetValue)
        assert.ok(result.expected.netHoursReturned >= 0)
        assert.ok(result.expected.exceptionCases >= 0)
        unique(result.reasons, 'ROI reasons')
        unique(result.risks, 'ROI risks')
      }
    }
  }
})
