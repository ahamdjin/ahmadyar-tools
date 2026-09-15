# Lead Routing Rules Builder — research notes

Reviewed 2026-09-15.

The builder treats routing as an ordered decision system, not a global round robin. A fair distribution mechanism is only useful after identity, protected ownership, eligibility, precedence, availability, and fallback have been resolved.

## Decision principles

- Normalize and resolve identity first, protect existing relationships second, determine priority/eligibility third, then distribute within the eligible pool.
- Existing account/contact ownership needs an explicit precedence rule so new inbound activity does not silently steal active relationships.
- Duplicate control should happen before ownership changes. Retry-safe/idempotent behavior matters when forms, webhooks, or upstream systems can deliver an event more than once.
- Territory, product, segment, named-account and priority rules need a documented hierarchy. Overlapping rules without precedence are a correctness problem.
- Fairness is not only turn-taking. Availability, capacity, skill, territory, account protection, and priority may change who is eligible before round robin is applied.
- Every router needs a catch-all path. Missing/invalid routing data, disabled owners, empty pools and new edge cases should become visible operations work instead of ownerless leads.
- A response SLA should be measured from routing and connected to escalation/reassignment. Assignment speed alone does not guarantee follow-up.
- The router should stamp its decision on the record: rule version, reason, pool, prior owner, new owner, routed timestamp, SLA due time, fallback/override reason.
- Larger routing systems should have scenario/regression tests for duplicates, existing accounts, missing fields, unavailable reps, SLA breaches, territory conflicts and after-hours behavior.

## Current vendor signals

### HubSpot

HubSpot's current workflow documentation supports record-owner assignment and rotation, including equal distribution across selected users/teams and other assignment modes for supported objects. That makes native assignment suitable for many normal CRM-routing cases, but it does not remove the need for eligibility, fallback, account protection, or SLA monitoring.

Sources:
- https://knowledge.hubspot.com/workflows/assign-and-rotate-record-owners-using-workflows
- https://knowledge.hubspot.com/records/how-to-set-a-record-owner

Product implication: use native assignment when the rule set is explainable inside HubSpot, but protect existing relationships and make ownerless/fallback cases observable rather than treating rotation as the whole router.

### Salesforce

Salesforce assignment rules route leads based on ordered criteria, while Enterprise Territory Management adds territory hierarchy/rule behavior and named-account considerations. Salesforce's current best-practice guidance explicitly warns against treating territory assignment rules as a data-cleansing mechanism.

Sources:
- https://help.salesforce.com/s/articleView?id=sf.customize_leadrules.htm&language=en_US&type=5
- https://help.salesforce.com/s/articleView?id=sf.territories_best_practices.htm&language=en_US&type=5

Product implication: data readiness and rule precedence are architecture inputs. A complicated territory tree should not be asked to compensate for missing or inconsistent routing fields.

### Duplicate/replay behavior

Zapier's current trigger-deduplication documentation explains that polling triggers normally use a unique identifier to avoid processing the same item twice. That protection is useful, but downstream systems and webhook/event sources can have different semantics, so important actions still need duplicate-safe behavior.

Sources:
- https://help.zapier.com/hc/en-us/articles/8496276332557-How-does-Zapier-handle-duplicate-data
- https://help.zapier.com/hc/en-us/articles/8496288690317-How-Zapier-handles-duplicate-records-in-Zaps

Product implication: the builder should never assume the integration platform makes assignment idempotent automatically. Record identity and reprocessing behavior belong in pre-launch tests.

## Routing order used by the product

The intended order is:

1. **Normalize + deduplicate.** Establish the correct lead/contact/account identity and normalize fields used by later rules.
2. **Protect existing relationships.** Existing customer, open opportunity, named account, or explicitly protected owner can override normal inbound distribution.
3. **Apply priority and eligibility.** Resolve territory, service/product, segment, language/skill, priority and other hard eligibility criteria using documented precedence.
4. **Remove unavailable owners.** Availability/capacity can reduce the eligible pool before distribution.
5. **Distribute inside the qualified pool.** Round robin, weighted distribution, capacity, or a deterministic owner rule operates only on valid candidates.
6. **Fallback + SLA.** Empty pools, missing data, disabled users, after-hours cases, and response breaches go to explicit fallback/escalation behavior.
7. **Record the decision.** Store enough fields to explain and audit why the assignment happened.

## Guardrails

- Do not overwrite an existing customer/account owner merely because a new form was submitted.
- Do not apply round robin before protected/eligibility rules.
- Do not let an empty eligible pool become an unowned lead; use a queue/fallback owner and alert.
- Do not silently reroute on retries unless the routing policy explicitly allows reassignment.
- Do not use territory or product routing to mask poor source data; fix/normalize the input first.
- Do not equate assignment with response. Track an SLA due time and escalation path.
- Do not allow manual overrides to become invisible. Record who/what overrode the route and why.
- Version routing logic so historical assignments remain explainable after rules change.

## Maintenance rule

Vendor documentation informs capability and failure-mode modeling, not vendor preference. Routing features, editions and terminology change; verify the current CRM/integration behavior before implementation. The engine should preserve durable ordering and safety principles even when individual vendor features change.
