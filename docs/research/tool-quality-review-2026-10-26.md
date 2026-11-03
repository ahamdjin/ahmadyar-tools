# Tool quality review — 26 October 2026

## Scope and decision rule

Reviewed the six tools on `main` for operator questions, competing-platform capabilities, input and result logic, UX, evidence, metadata, and internal links. The focused product pass addressed two demonstrable gaps: (1) Zapier implementation constraints that the Architecture Advisor did not expose conditionally, and (2) a mathematically understated whole-case break-even volume in the ROI Calculator. CI then exposed a third, independent issue: the pinned Next.js release had a critical production dependency advisory. No vendor benchmark was converted into a score, ranking, or threshold.

## Operator questions and findings by tool

| Tool | Operator/business-owner question | Finding and disposition |
| --- | --- | --- |
| Automation Architecture Advisor | "Can I use Zapier Paths for one-owner-only routing, and can my team approve a step?" | **Improved.** Paths can match multiple branches; sequential execution changes order, not matching. Human in the Loop has plan and reviewer-access requirements. Add conditional cautions to the Zapier result; do not change platform scoring. |
| CRM Automation Health Check | "Will an external integration create duplicates even if my CRM normally deduplicates?" | Existing duplicate-control, source-of-truth, and data-quality questions are relevant. HubSpot explicitly notes API-created companies are not automatically deduplicated by domain. This is platform-specific and does not justify changing the vendor-neutral scoring without knowing the actual integration path. |
| Client Onboarding Automation Planner | "What if payment/signature events are retried, arrive out of order, or require approval?" | Existing readiness gates, idempotent creation, exception queue, owner, and secure access checklist address the failure modes. No change justified. |
| Lead Routing Rules Builder | "How do we prevent duplicate assignment and enforce an after-hours SLA?" | Existing ordered rules, ownership protection, fallback, audit fields and scenario tests cover most cases. An earlier unmerged branch (`quality/2026-10-19-routing-sla-clock`) already addresses SLA-clock wording; do not duplicate it in this PR. |
| Automation ROI Calculator | "What is the minimum whole number of cases needed to break even?" | **Fixed.** The result used nearest-integer rounding, which can report a case count still below break-even. The required discrete count must round up. No change to financial assumptions, first-year values, payback, or disposition. |
| Lead Follow-Up Automation Planner | "How do we stop follow-up on reply, booking, opt-out, or re-enrollment?" | Existing stop rules, consent, quiet-hour, owner handoff and duplicate enrollment checks cover the core cases. HubSpot re-enrollment/unenrollment configuration varies by workflow type and plan, so no generic engine change justified. |

## Evidence checked

- Zapier, **Paths conditional logic** (updated July 1, 2026): https://help.zapier.com/hc/en-us/articles/8496288555917-Add-branching-logic-to-Zap-workflows-with-Paths — one, some, all, or no branches may run.
- Zapier, **Sequential path runs** (updated May 29, 2026): https://help.zapier.com/hc/en-us/articles/37562074726029-Now-available-sequential-path-runs — execution order is distinct from matching logic.
- Zapier, **Human in the Loop approvals** (updated October 5, 2026): https://help.zapier.com/hc/en-us/articles/38731463206029-Request-approval-to-keep-your-workflow-running-with-Human-in-the-Loop — paid account, reviewer access, and decline/timeout behavior need verification.
- Make, **Automatic retry of incomplete executions**: https://help.make.com/automatic-retry-of-incomplete-executions — error class, retry scheduling, and unresolved executions matter.
- HubSpot, **Deduplicate records** (updated October 2, 2026): https://knowledge.hubspot.com/records/deduplication-of-records — API-created companies are not automatically deduplicated by domain.
- HubSpot, **Manage workflow enrollment settings** (updated June 23, 2026): https://knowledge.hubspot.com/workflows/manage-workflow-enrollment-settings — enrollment and suppression behavior is configurable and conditional.
- OpenStax, **Calculate a break-even point in units**: https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars — fixed costs divided by per-unit contribution gives the break-even quantity; a required whole-case threshold must not be rounded down.
- Google, **General structured data guidelines**: https://developers.google.com/search/docs/appearance/structured-data/sd-policies — markup must match visible content; structured data does not guarantee rich results.

## CI-discovered security issue

The first pull-request run passed typecheck, tests and lint, but its production security audit failed on pinned `next@15.5.27`. The official Next.js advisories published October 14, 2026 identify 15.5.28 as the patched release for an SVG image-optimization RCE and an App Router Server Actions denial of service. Exposure depends on runtime features and hosting, so the audit failure is evidence of a vulnerable package version, not proof of exploitation. Pinned `next` and matching `eslint-config-next` were both upgraded to `15.5.28` without changing framework major/minor versions. The repository already overrides `sharp` to `0.35.5`.

- https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw
- https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r

## Product surfaces reviewed and left unchanged

- **Questions and results:** existing forms collect business context and results expose decisions, safeguards, and next steps. The two new Zapier cautions appear only when the corresponding branching or approval requirement is selected.
- **UX:** all six tools have a local JSON assessment download and visible copy/print actions. No unsupported redesign or extra question was justified.
- **Metadata:** dedicated titles, descriptions, canonical URLs, SoftwareApplication, FAQ and breadcrumb JSON-LD already exist for all six. No promise of FAQ rich results was added.
- **Internal linking:** each route already renders the shared editorial links and links to related guides/tools. No new link added without a clear navigation gap.
- **Evidence:** public evidence cards now link the specific Zapier constraints and break-even explanation. Vendor documentation is context, not a scoring constant.

## Verification and non-goals

- Regression tests cover the discrete ROI boundary (including sub-one-case and zero-cost cases), conditional Zapier cautions, and evidence text.
- Existing benchmark and invariant tests remain the guardrail for decision stability.
- No platform ranking weights, disposition thresholds, costs, recommendation family, questionnaire structure, or vendor capabilities were modified.
- The ROI correction changes only the displayed `breakEvenCasesPerMonth` to the first sufficient whole case; it does not modify economic decisions.
