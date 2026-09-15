# Lead follow-up automation research — 2026-09

This note records product-model decisions behind the Lead Follow-Up Automation Planner. It is implementation context, not legal advice and not a permanent statement of vendor capabilities.

## Search demand signal

Google Search Console for `sc-domain:ahmadyar.co` (settled through 2026-09-12) showed early impressions around `automate lead follow up`, `automated lead follow up`, and `how to automate lead follow-up`, alongside broader CRM automation demand. This tool fills that gap between Lead Routing and the Architecture Advisor.

## Product principles

1. Follow-up is a state machine, not a fixed list of messages.
2. A real reply should normally exit or branch generic prospecting and hand control to the owner.
3. A qualifying booking should exit prospecting and move into appointment-specific logic.
4. Opt-out/suppression and channel eligibility must be authoritative across workflows.
5. Lead lifecycle changes can invalidate scheduled messages, so stop state should be checked again before important sends.
6. Duplicate/re-entry behavior needs explicit policy; repeated triggers should not create simultaneous cadences.
7. Native CRM automation can be preferable when identity, ownership, messaging, booking and lifecycle state already live in one system.
8. Monitoring must cover enrollment, first-touch latency, delivery/failures, replies, bookings, handoff and exhausted cadences.

## Current vendor references checked

### HighLevel
- Workflow Settings — Overview: https://help.gohighlevel.com/support/solutions/articles/48001239875
- Stop On Response / call interaction: https://help.gohighlevel.com/support/solutions/articles/155000006910-workflow-setting-stop-on-response-call-action-disable-voicemail-detect

HighLevel documents a workflow-level Stop on Response setting. It also documents call/voicemail-detection interactions that can affect whether a contact is considered to have responded. This supports treating response detection as a first-class safety question rather than assuming every channel behaves identically.

### Salesforce
- Sales Engagement cadence overview: https://developer.salesforce.com/docs/sales/sales-engagement/guide/sales-cadence-overview.html
- Cadence Builder 2.0: https://help.salesforce.com/s/articleView?id=sf.se_cadences_builder_2.htm&language=en_US&type=5

Salesforce documents cadences as ordered outreach steps and Cadence Builder 2.0 as responsive to engagement through main/positive/negative tracks. This supports modeling follow-up as state/engagement transitions rather than one static sequence.

### HubSpot
- Workflow operations/current behavior should be re-verified against HubSpot's current knowledge base before implementation because available actions, unenrollment behavior and edition requirements change over time.

## Compliance boundary

Email, SMS, WhatsApp and calls have different provider, consent, opt-out, quiet-hour and regional requirements. The planner therefore asks whether eligibility and suppression are controlled, but it does not tell a user that a specific campaign is legally compliant. Implementers should verify current rules for the relevant jurisdiction and provider.

## Engine boundary

The planner does not select Zapier vs Make vs n8n. It decides what a safe follow-up operating model needs. If the resulting process crosses multiple systems, the Automation Architecture Advisor remains the platform/architecture decision layer.
