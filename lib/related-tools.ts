import { TOOLS, type ToolSlug } from './tools'
import { UTILITIES, type UtilitySlug } from './utilities/catalog'

// Contextual bridges between planning a workflow and preparing its data.
export const WORKFLOW_UTILITIES: Record<ToolSlug, readonly UtilitySlug[]> = {
  'automation-architecture-advisor': ['api-request-converter', 'automation-schedule-builder'],
  'crm-automation-health-check': ['csv-to-api-payload', 'json-compare'],
  'client-onboarding-automation-planner': ['csv-to-api-payload', 'json-repair-payload-inspector'],
  'lead-routing-rules-builder': ['regex-extraction-workbench', 'json-compare'],
  'automation-roi-calculator': ['csv-to-api-payload', 'automation-schedule-builder'],
  'lead-follow-up-automation-planner': ['automation-schedule-builder', 'timestamp-converter'],
}

export function relatedUtilities(slug: string) {
  const slugs = WORKFLOW_UTILITIES[slug as ToolSlug] ?? []
  return slugs.map((slug) => UTILITIES.find((tool) => tool.slug === slug)!)
}

export function relatedPlanners(slug: UtilitySlug) {
  return TOOLS.filter((tool) => WORKFLOW_UTILITIES[tool.slug].includes(slug))
}
