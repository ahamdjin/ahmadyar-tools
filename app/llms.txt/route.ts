import { SITE } from '@/lib/site'

const root = `${SITE.origin}${SITE.toolsPath}`

const body = `# Ahmad Yar Automation Tools

Canonical site: ${SITE.origin}
Tools hub: ${root}

These are free, interactive business-automation decision tools. The visible guidance below each interactive tool is the canonical explanatory content; this file is only a compact machine-readable index.

## Automation Architecture Advisor
URL: ${root}/automation-architecture-advisor
Purpose: First decide whether the process is ready to automate now, should be piloted, should be standardized first, needs a human checkpoint, or has crossed into software/application architecture. Then decide whether work should stay native, use a no-code integration layer, require deeper orchestration, durable developer jobs, enterprise integration infrastructure, or custom software. It evaluates the actual app stack, workflow portfolio, ownership, volume, process stability, change frequency, reliability, governance, hosting, economics, and future growth. It can recommend multiple platforms for different workflow lanes instead of forcing one tool across the business.
Platforms modeled include HubSpot native automation, GoHighLevel native automation, Salesforce Flow, Shopify Flow, CRM-native automation, Zapier, Make, n8n Cloud, n8n self-hosted, Power Automate, Activepieces, Pipedream, Trigger.dev, Workato, Tray.ai, MuleSoft, and custom software.
Supporting guide: ${SITE.origin}/blog/how-to-choose-an-automation-stack-without-overengineering

## CRM Automation Health Check
URL: ${root}/crm-automation-health-check
Purpose: Diagnose lead capture, CRM data quality, source attribution, duplicate control, routing, response, follow-up, pipeline hygiene, stale deals, sales-to-delivery handoff, reporting, adoption, ownership, automation monitoring, and shadow systems. It produces ranked leaks, health dimensions, native-first fixes, ownership, confidence, and a practical repair plan.
Supporting guide: ${SITE.origin}/blog/crm-automation-health-check-what-to-fix-first

## Client Onboarding Automation Planner
URL: ${root}/client-onboarding-automation-planner
Purpose: Design a reliable sales-to-delivery onboarding flow across CRM, contracts, payments, intake, project management, files, communication, access, kickoff, and exceptions. It models authoritative start/readiness gates, structured handoff, missing information, duplicate safety, ownership, templates, monitoring, exception recovery, and time-to-first-value.
Supporting guide: ${SITE.origin}/blog/client-onboarding-automation-what-to-automate-keep-human

## Lead Routing Rules Builder
URL: ${root}/lead-routing-rules-builder
Purpose: Design and test lead assignment logic. The recommended sequence is normalize and deduplicate, protect existing relationships, apply protected priority rules, build the eligible pool, remove unavailable owners, then enforce fallback and response SLA. It models territory, product/service, segment, named accounts, round robin, capacity, availability, after-hours coverage, reassignment, auditability, monitoring, and concrete pre-launch test cases.
Supporting guide: ${SITE.origin}/blog/lead-routing-rules-how-to-design-a-system-that-does-not-break

## Automation ROI Calculator
URL: ${root}/automation-roi-calculator
Purpose: Decide whether an automation is worth building before choosing a platform. It models real monthly volume, handling time, loaded labor cost, automation coverage, human review, exception fallback, realizable value capture, error reduction, one-time build cost, software/hosting, maintenance, process stability, change frequency, and failure impact. Results include returned capacity, captured value, recurring ownership cost, first-year net value, ROI, payback, a 12-month build-cost ceiling, break-even volume, confidence, and a conservative stress case. It can recommend automate now, pilot first, measure first, standardize first, or deprioritize.
Supporting guide: ${SITE.origin}/blog/automation-roi-how-to-calculate-payback-without-fooling-yourself

## Lead Follow-Up Automation Planner
URL: ${root}/lead-follow-up-automation-planner
Purpose: Design a state-aware inbound lead follow-up system rather than a fixed message sequence. It models first-response SLA, owner assignment, email/SMS/call/WhatsApp channels, cadence length and intensity, reply and booking detection, lifecycle stop rules, consent/channel eligibility, opt-out suppression, timezone windows, duplicate enrollment, human handoff, re-entry, stale-lead outcomes and monitoring. It produces an ordered follow-up state model, hard stop rules, CRM-native architecture guidance, safeguards, operating metrics and pre-launch test cases.
Supporting guide: ${SITE.origin}/blog/how-to-automate-lead-follow-up-without-losing-human-touch

## Methodology
The tools use deterministic, testable decision engines. Vendor popularity does not decide the answer. Process readiness and hard architecture constraints are evaluated before weighted platform trade-offs. Close platform scores lower confidence instead of manufacturing certainty. High-impact unanswered questions are surfaced explicitly. ROI treats returned staff time as capacity until a separate value-capture assumption makes the economic benefit explicit. Follow-up planning treats replies, bookings, suppression and lifecycle changes as state transitions rather than copywriting suggestions. Vendor capabilities change, so exact edition/pricing facts should be verified before implementation.

Author: Ahmad Yar
Primary topics: CRM automation, revenue operations, workflow automation, automation architecture, automation ROI, automation payback, lead routing, lead follow-up automation, sales cadence, client onboarding, business process automation.
`

export function GET() {
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
