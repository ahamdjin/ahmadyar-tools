# Automation platform capability model — September 2026

The Architecture Advisor should not rank tools by brand popularity. Each platform is modeled as a set of operating strengths, limits, ownership requirements, architecture boundaries, and app affinities.

## Principles

- Native platforms can win outright. HubSpot, GoHighLevel, Salesforce Flow, Shopify Flow, and other CRM-native automation should remain in charge when the system of record can own the workflow safely.
- Connector breadth is only one factor. Ease of ownership, branching/data transformation, API depth, durable execution, self-hosting, governance, reliability, and execution economics can outweigh app count.
- Hard constraints eliminate options before weighted scoring: mandatory self-hosting, application/product state, governance requirements, and ownership capability are examples.
- Close scores should lower confidence rather than manufacture a precise winner.
- Platform affinity should come from the exact systems in the environment, but selecting an app must never force its native platform to win.
- Managed n8n and self-hosted n8n are different operating decisions because infrastructure ownership changes the real cost and risk.
- Trigger.dev belongs in developer-owned durable background work rather than generic business-user SaaS handoffs.
- Custom software wins when the core becomes stateful, transactional, latency-sensitive, customer-facing, or product-critical. Automation can remain around the edges.

## Reliability research

Current n8n guidance reinforces that automatic retries are only safe when side effects are idempotent or deduplicated. Incoming webhook/event retries should use stable identifiers where available, and operational failure paths need explicit monitoring/error handling.

Current Trigger.dev positioning reinforces its fit for TypeScript/developer-owned durable background jobs: queues, retries, concurrency, schedules, long-running work, AI/application jobs, and production observability.

These facts should affect architecture classification and safeguards, not become simple brand-score bonuses.

## Maintenance rule

Vendor capabilities change. Exact prices and edition-specific limits should be versioned separately and refreshed from first-party documentation before making claims. The deterministic engine should prefer stable capability/ownership patterns over temporary marketing numbers.