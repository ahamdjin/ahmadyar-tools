# Client Onboarding Automation Planner — research notes

Reviewed 2026-09-15.

The planner is intentionally built around operational gates rather than a generic checklist. The useful outcome is dependable time-to-first-value, not simply moving a client through a prettier sequence of automated emails.

## Decision principles

- A new-client workflow needs one authoritative readiness model. Deal won, contract signed, payment received, and manual approval are different business states; the tool should let a company decide which are required before provisioning or delivery begins.
- Sales-to-delivery handoff quality matters as much as automation. Scope, stakeholders, dates, commercial context, goals, and promises need structured transfer into the system that owns delivery.
- Client intake should be structured around the service being delivered, avoid re-asking known data, and expose missing information explicitly.
- Access and assets are dependencies, not just email reminders. Sensitive access should be tracked without putting credentials into general-purpose CRM notes or task comments.
- Workspace/project creation should use controlled templates where possible. High variation or unstable processes should lower the recommendation to automate deeply.
- Kickoff should respect readiness. Scheduling kickoff before required context, access, or internal preparation exists creates the appearance of speed while moving blockers into meetings.
- Every onboarding needs a clear owner, exception path, duplicate protection, and monitoring when automation is responsible for client-facing actions.
- The planner should distinguish **starting onboarding** from **being ready for delivery**. A signed agreement can legitimately start intake while payment, access, or required assets still block downstream provisioning.
- Automation should preserve a source of truth for onboarding state instead of letting CRM, project management, email, and spreadsheets each hold conflicting versions of readiness.

## Current research signals

### HubSpot onboarding guidance

HubSpot's current onboarding guidance emphasizes using the sales handoff as a head start, carrying forward what sales learned, aligning around customer goals and success metrics, and resetting expectations early when needed. Its onboarding checklist also calls out pre-onboarding preparation, sales-to-CS handoff documentation, internal ownership, contract confirmation, kickoff preparation, and success criteria.

Sources:
- https://blog.hubspot.com/service/customer-onboarding
- https://blog.hubspot.com/service/customer-onboarding-checklist

Product implication: the planner should not treat `closed-won` as enough context by itself. Structured handoff quality and explicit readiness gates deserve separate inputs.

### Automation examples

Current Zapier onboarding examples commonly connect signed documents or intake submissions to CRM records, project/workspace creation, document/folder setup, scheduling, internal alerts, and welcome communication. Those examples are useful for identifying repeatable handoffs, but they do not remove the need for readiness, duplicate protection, ownership, or exception recovery.

Sources:
- https://zapier.com/automations/business-owners/professional-services-consulting/client-project-management/create-new-client-intake-and-schedule-prep-demo
- https://zapier.com/automations/customer-service-success/customer-onboarding/onboarding-workflow-management/create-client-onboarding-workspace-and-notify-account-team
- https://zapier.com/blog/client-onboarding-for-financial-advisors/

Product implication: project creation, folders, alerts, welcome messages, calendar events, and intake capture are good automation candidates **after** the trigger and readiness rules are trustworthy.

## Guardrails used by the engine

1. **Do not provision from an ambiguous trigger.** If the business really requires contract + payment, a deal-stage change alone should not create the project, grant access, or send irreversible client-facing steps.
2. **Do not confuse missing intake with a reminder problem.** If the intake design is unclear or asks for unstructured information, more reminders only automate the friction.
3. **Do not put secrets in general workflow state.** Track whether access is received and who owns the blocker; keep credentials in an appropriate secrets/password system.
4. **Do not create duplicate client workspaces.** Replayed events, stage reversals, retries, and manual re-entry should not create a second project/folder/client record.
5. **Do not schedule kickoff just because the calendar is available.** Kickoff readiness should consider the information and access needed for the meeting to be useful.
6. **Do not automate an unstable service model too deeply.** If each client is materially different or the delivery process is still changing, standardize the operating model before adding brittle orchestration.
7. **Always leave an exception path.** Missing payment, unsigned contract, incomplete access, failed provisioning, or unusual scope needs an owner and recoverable state rather than a silent workflow failure.

## Maintenance rule

Vendor examples are used to understand native capabilities and common patterns, not as ranking authority. The engine remains deterministic and vendor-neutral. Exact vendor plans and features change, so implementation should verify current product documentation and the user's actual stack before wiring the final workflow.
