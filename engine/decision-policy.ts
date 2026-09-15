import type { DiscoveryProfile } from './discovery'
import type { AssessmentInput, PlatformId } from './types'

export type DecisionPolicy = {
  adjustment: number
  reason?: string
  caution?: string
}

export function decisionPolicy(
  platform: PlatformId,
  input: AssessmentInput,
  discovery: DiscoveryProfile,
  complexity: number,
): DecisionPolicy {
  const primary = discovery.primarySystem?.id
  const broadCrossSystem = input.integrationNeed === 'broad' || input.appsPerWorkflow >= 4
  const enterpriseEstate = discovery.enterpriseApps.length >= 3 && input.appsPerWorkflow >= 5
  const developerEventWork =
    input.technicalOwner === 'developer' &&
    input.customApi &&
    input.realtime &&
    input.branching === 'none' &&
    input.appsPerWorkflow <= 4 &&
    !input.loopsOrBatching &&
    !input.databaseWork &&
    !input.durableJobs
  const legacyApiEstate = discovery.unknownSystems >= 2 || input.selectedApps.includes('sap')

  if (platform === 'hubspot-native' && primary === 'hubspot' && broadCrossSystem) {
    return {
      adjustment: -20,
      caution: 'The work spans enough independent SaaS systems that connector breadth matters more than keeping every handoff inside HubSpot.',
    }
  }

  if (platform === 'gohighlevel-native' && primary === 'gohighlevel' && input.integrationNeed === 'broad' && input.appsPerWorkflow >= 5) {
    return {
      adjustment: -16,
      caution: 'The workflow estate is broad enough that HighLevel should remain the CRM while a separate integration layer handles unrelated systems.',
    }
  }

  if (platform === 'salesforce-flow' && primary === 'salesforce' && enterpriseEstate) {
    return {
      adjustment: input.customApi || discovery.unknownSystems > 0 ? -30 : -22,
      caution: 'Salesforce should own CRM state, but this is now a cross-enterprise integration program rather than a Salesforce-only process.',
    }
  }

  if (platform === 'pipedream' && developerEventWork) {
    return {
      adjustment: 14,
      reason: 'This is a compact developer-owned event/API workload where code-friendly integration is a better fit than a heavier visual orchestrator.',
    }
  }

  if (platform === 'n8n-cloud' && developerEventWork) {
    return {
      adjustment: -9,
      caution: 'The workload is developer-owned and event/API focused without the branching, batching, or data orchestration that would justify the heavier n8n canvas.',
    }
  }

  if (input.durableJobs && input.technicalOwner === 'developer') {
    if (platform === 'trigger-dev') {
      return {
        adjustment: 24,
        reason: 'Durable TypeScript jobs, queues, retries, concurrency, or long-running application work are first-class requirements here.',
      }
    }
    if (platform === 'n8n-cloud' || platform === 'pipedream') {
      return {
        adjustment: -14,
        caution: 'This can run the work, but durable application-owned background jobs are important enough to favor a purpose-built job runtime.',
      }
    }
  }

  if (platform === 'workato' && enterpriseEstate && input.team === 'mixed' && input.governance && !input.customApi) {
    return {
      adjustment: 12,
      reason: 'The problem is a governed multi-department business integration program with mixed technical and business ownership.',
    }
  }

  if (platform === 'tray' && enterpriseEstate && input.technicalOwner === 'developer' && input.customApi) {
    return {
      adjustment: 14,
      reason: 'A developer-led integration team needs reusable API-led capabilities across a broad enterprise estate.',
    }
  }

  if (platform === 'mulesoft') {
    if (legacyApiEstate && enterpriseEstate && input.technicalOwner === 'developer' && input.governance) {
      return {
        adjustment: 18,
        reason: 'Legacy systems, governed APIs, and enterprise integration architecture are core requirements rather than incidental workflow details.',
      }
    }
    if (!legacyApiEstate) {
      return {
        adjustment: -18,
        caution: 'The environment does not yet show the legacy/API-estate pressure that justifies a MuleSoft-class architecture.',
      }
    }
  }

  if (platform === 'zapier' && broadCrossSystem && (input.technicalOwner === 'none' || input.technicalOwner === 'power-user') && complexity < 58) {
    return {
      adjustment: 8,
      reason: 'Broad mainstream SaaS connectivity plus business-team ownership favors the simplest connector-first option.',
    }
  }

  return { adjustment: 0 }
}
