# Client Onboarding Automation Planner — research notes

Reviewed 2026-09-15.

The planner is intentionally built around operational gates rather than a generic checklist.

## Decision principles

- A new-client workflow needs one authoritative readiness model. Deal won, contract signed, and payment received are different business states; the tool should let a company decide which are required before provisioning or delivery begins.
- Sales-to-delivery handoff quality matters as much as automation. Scope, stakeholders, dates, commercial context, and promises need structured transfer into the system that owns delivery.
- Client intake should be structured around the service being delivered, avoid re-asking known data, and expose missing information explicitly.
- Access and assets are dependencies, not just email reminders. Sensitive access should be tracked without putting credentials into general-purpose CRM notes or task comments.
- Workspace/project creation should use controlled templates where possible. High variation or unstable processes should lower the recommendation to automate deeply.
- Kickoff should respect readiness. Scheduling a kickoff before required context/access exists creates the appearance of speed while moving blockers into meetings.
- Every onboarding needs a clear owner, exception path, duplicate protection, and monitoring when automation is responsible for client-facing actions.
- The useful outcome is time-to-first-value, not simply 'onboarding complete'.

## Sources consulted

- HubSpot customer onboarding guidance (updated 2026-08-13): emphasizes understanding customer goals, smooth handoffs, and tracking customer context in CRM/data systems.
- HubSpot customer onboarding checklist: pre-onboarding preparation, sales-to-CS handoff documentation, internal ownership, contract confirmation, kickoff preparation, and success criteria.
- Zapier client-onboarding examples: calendar-to-CRM sync, onboarding task creation, CRM/email sync, intake capture, and document collection as common automatable handoffs.

Vendor examples are used to understand native capabilities and common patterns, not as ranking authority. The engine remains deterministic and vendor-neutral.