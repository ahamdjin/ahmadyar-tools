# Tool quality review — 19 October 2026

Scope: all six AhmadYar tools, their deterministic engines, question flows, result views, research/evidence blocks, metadata, FAQ content, and internal links. This review compares current operator concerns with the implementation; it does not treat vendor marketing or survey figures as scoring constants.

## Verified operator questions and sources

- **What happens after an automation fails, retries, or replays?** Zapier's replay documentation (updated 29 May 2026) distinguishes failed-step replay from full-run replay and warns that filters and Paths are not re-evaluated on failed-step replay. A separate troubleshooting article warns that replay after a timeout can create duplicates. Sources: https://help.zapier.com/hc/en-us/articles/19220226086797-What-is-replay and https://help.zapier.com/hc/en-us/articles/8496218141453-Zap-is-creating-duplicate-data
- **Who notices a failed run?** Zapier's run-status documentation (updated 15 October 2026) distinguishes errored, delayed, handled, skipped, and other states. A success-looking run is not necessarily evidence that the desired business outcome occurred. Source: https://help.zapier.com/hc/en-us/articles/20505304170637-Review-run-statuses-in-Zap-workflows
- **How do competing orchestrators handle failed executions?** n8n supports retrying failed executions with either the original or currently saved workflow. Make documents failure modes that do not create an incomplete execution, including some first-module errors and storage exhaustion. Those details justify asking about recovery visibility, but not changing vendor rankings without workload-specific evidence. Sources: https://docs.n8n.io/workflows/executions/all-executions/ and https://help.make.com/errors-that-dont-create-incomplete-executions
- **When should an operator approve an automated decision?** Zapier's Human in the Loop approval action (updated 5 October 2026) pauses a run for review, but its availability and reviewer restrictions depend on plan. The Architecture Advisor and onboarding/follow-up tools already treat human ownership as a first-class consideration. Source: https://help.zapier.com/hc/en-us/articles/38731463206029-Request-approval-to-keep-your-workflow-running-with-Human-in-the-Loop
- **When does an SLA clock actually run?** Salesforce documents that a staffed-business-hours milestone clock pauses outside coverage, unlike an elapsed-time clock. This makes “24 hours” and “one business day” materially different commitments. Source: https://help.salesforce.com/s/articleView?id=service.sla_milestones_timer_behavior.htm&language=en_US&type=5
- **Should an automated step wait or queue?** Zapier documents distinct delay-until and delay-after-queue behaviors; pausing an action does not itself define the customer's response-time commitment. Source: https://help.zapier.com/hc/en-us/articles/8496288754829-Add-delays-to-Zap-workflows
- **Can metadata alone create search credibility?** Google requires truthful structured data reflecting visible content and does not guarantee rich results. The SoftwareApplication rich-result rules require a review/rating in addition to app and offer information; no review was invented. Sources: https://developers.google.com/search/docs/appearance/structured-data/sd-policies and https://developers.google.com/search/docs/appearance/structured-data/software-app

## Findings across six tools

| Tool | Current quality | Decision this pass |
| --- | --- | --- |
| Automation Architecture Advisor | Already distinguishes native ownership, durable orchestration, AI judgment, idempotency and recovery. | No change to vendor ranking or scoring without stronger comparative evidence. |
| CRM Automation Health Check | Already covers duplicate prevention, source attribution, lifecycle ownership, monitoring and CRM adoption. | No unsupported scoring or question changes. |
| Client Onboarding Automation Planner | Already models contract/payment gates, partial completion, stable resource IDs and exception queues. | No change: retries and duplicate creation are already explicit. |
| Lead Routing Rules Builder | **Confirmed inconsistency:** “1 business day” was encoded as 1,440 elapsed minutes. “Queue” test promised an acknowledgement, although the UI offers a separate “Acknowledge + queue” mode. Manual review was not reflected precisely in the existing-account test. | Correct the displayed time unit, distinguish after-hours policies, surface the unresolved SLA clock/calendar decision, and add regression tests. No score/threshold changes. |
| Automation ROI Calculator | Already separates returned capacity from captured value, includes maintenance/review/exception costs and a conservative stress case. | No new default percentages or ROI assumptions. |
| Lead Follow-Up Automation Planner | Already covers reply/booking stop rules, consent, opt-outs, quiet hours, re-entry, owner handoff and failed sends. | No new cadence or legal claims without region/provider context. |

## Focused change and boundary

The routing builder's 1,440-minute option now says **24 hours (elapsed)**, not “one business day.” The result uses the same elapsed-time wording. When coverage is not always live, it asks operators to define the SLA clock (24/7 versus staffed hours), timezone and holiday calendar; the audit fields include receipt time and clock policy. Its test cases distinguish queue-only from acknowledgement-plus-queue, and manual ownership conflicts from automatic reassignment.

The tool **does not calculate staffed-business-hours deadlines**: doing that safely requires a coverage calendar, holiday rules, timezone and start/pause policy not present in the current input model. No numerical score, vendor capability ranking, or ROI formula changed.

## Validation

Regression tests cover the 24-hour label, emitted rule/test language, SLA policy questions and audit fields, queue-only versus acknowledged queue, and manual account review. Existing tests and CI should run typecheck, lint, unit tests and build on the PR.
