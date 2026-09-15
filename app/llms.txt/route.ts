import { SITE } from '@/lib/site'

const body = `# Ahmad Yar Automation Tools

Canonical site: ${SITE.origin}
Tools hub: ${SITE.origin}/tools

These are free, interactive business-automation decision tools. The visible guidance below each interactive tool is the canonical explanatory content; this file is only a compact machine-readable index.

## Automation Architecture Advisor
URL: ${SITE.origin}/tools/automation-architecture-advisor
Purpose: Decide whether a process should stay native, use a no-code integration layer, require deeper orchestration, durable developer jobs, enterprise integration infrastructure, or custom software. It evaluates the actual app stack, workflow portfolio, ownership, volume, reliability, governance, hosting, economics, and future growth. It can recommend multiple platforms for different workflow lanes instead of forcing one tool across the business.
Platforms modeled include HubSpot native automation, GoHighLevel native automation, Salesforce Flow, Shopify Flow, CRM-native automation, Zapier, Make, n8n Cloud, n8n self-hosted, Power Automate, Activepieces, Pipedream, Trigger.dev, Workato, Tray.ai, MuleSoft, and custom software.

## CRM Automation Health Check
URL: ${SITE.origin}/tools/crm-automation-health-check
Purpose: Diagnose lead capture, CRM data quality, source attribution, duplicate control, routing, response, follow-up, pipeline hygiene, stale deals, sales-to-delivery handoff, reporting, adoption, ownership, automation monitoring, and shadow systems. It produces ranked leaks, health dimensions, native-first fixes, ownership, confidence, and a practical repair plan.

## Client Onboarding Automation Planner
URL: ${SITE.origin}/tools/client-onboarding-automation-planner
Purpose: Design a reliable sales-to-delivery onboarding flow across CRM, contracts, payments, intake, project management, files, communication, access, kickoff, and exceptions. It models start/readiness gates, structured handoff, missing information, duplicate safety, ownership, templates, monitoring, and time-to-first-value.

## Lead Routing Rules Builder
URL: ${SITE.origin}/tools/lead-routing-rules-builder
Purpose: Design and test lead assignment logic. The recommended sequence is normalize and deduplicate, protect existing relationships, apply priority and eligibility, distribute inside the qualified pool, then enforce fallback and response SLA. It models territory, product/service, segment, named accounts, round robin, capacity, availability, after-hours coverage, reassignment, auditability, and monitoring.

## Methodology
The tools use deterministic, testable decision engines. Vendor popularity does not decide the answer. Hard constraints and architecture boundaries are evaluated before weighted trade-offs. Close platform scores lower confidence instead of manufacturing certainty. Vendor capabilities change, so exact edition/pricing facts should be verified before implementation.

Author: Ahmad Yar
Primary topics: CRM automation, revenue operations, workflow automation, automation architecture, lead routing, client onboarding, business process automation.
`

export function GET() {
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
