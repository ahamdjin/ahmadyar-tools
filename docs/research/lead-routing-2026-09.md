# Lead Routing Rules Builder — research notes

Reviewed 2026-09-15.

## Decision principles

- Routing is an ordered decision system, not a global round robin. Normalize data and resolve identity first, protect existing relationships, determine eligibility, then distribute within the eligible pool.
- Existing account/contact ownership needs an explicit precedence rule so new inbound activity does not silently steal active relationships.
- Duplicate control should happen before ownership changes. Retry-safe/idempotent behavior matters when forms, webhooks, or upstream systems can deliver an event more than once.
- Territory, product, segment, named-account and priority rules need a documented hierarchy. Overlapping rules without precedence are a correctness problem.
- Fairness is not only turn-taking. Availability, capacity, skill and protected ownership may change who is eligible before round robin is applied.
- Every router needs a catch-all path. Missing/invalid routing data, disabled owners, empty pools and new edge cases should become visible operations work instead of ownerless leads.
- A response SLA should be measured from routing and connected to escalation/reassignment. Assignment speed alone does not guarantee follow-up.
- The router should stamp its decision on the record: rule version, reason, pool, prior owner, new owner, routed timestamp, SLA due time, fallback/override reason.
- Larger routing systems should have scenario/regression tests for duplicates, existing accounts, missing fields, unavailable reps, SLA breaches and after-hours behavior.

## Sources consulted

- HubSpot lead-routing guidance: specialized/product and territory routing, account ownership, hierarchy of rules, centralized logic, lead scoring, and avoiding double outreach.
- HubSpot scheduling guidance: round-robin and ownership-based routing can balance workload while respecting account/territory context.
- Salesforce assignment-rule guidance: assignment rules and queues should be planned around the routing hierarchy and object ownership model.
- Salesforce territory best practices (Apr 2026): clarify rule behavior/hierarchy and avoid using territory rules as a data-cleansing mechanism.
- Zapier duplicate-data documentation (May 2026): trigger deduplication relies on unique identifiers; downstream actions still need safe duplicate behavior.

Vendor documentation informs capability and failure-mode modeling, not vendor preference.