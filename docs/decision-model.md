# Decision model

The Architecture Advisor is a deterministic decision system, not a brand quiz. It evaluates the process, operating environment, architecture boundary, ownership model, reliability requirements, and platform trade-offs in stages so one strong vendor score cannot erase a more important constraint.

## 1. Process readiness comes first

Before platform selection, the engine asks whether the process is mature enough to automate. Process stability, change frequency, workflow shape, volume, human judgment, failure impact, AI involvement, and product/application boundaries can produce five dispositions:

- **Ready to automate** — automate the stable process with the smallest maintainable architecture.
- **Pilot first** — automate one bounded path while the wider process is still settling.
- **Standardize first** — stabilize trigger, ownership, handoffs, exceptions, and source of truth before scaling automation.
- **Automate with a human checkpoint** — automate preparation and repetition but preserve judgment around high-impact or uncertain decisions.
- **Software first** — persistent state, transactions, customer-visible behavior, or domain logic belong in application architecture; workflow automation stays around the edges.

A powerful platform does not turn an unstable process into a good automation candidate.

## 2. Discover the real environment

The engine starts with the systems the business actually uses, including internal or unknown systems. The selected stack is used to infer source-of-truth pressure, native-platform fit, Microsoft concentration, API pressure, integration difficulty, estimated action volume, and existing automation layers.

Unknown systems increase uncertainty instead of being silently treated as normal connectors.

## 3. Model current and future scale

Current workflow count, expected workflow count in 12–24 months, execution volume, apps per workflow, workflow size, team count, and change frequency determine whether the user is solving one automation or designing an automation operating model.

Growth matters because the correct architecture for four simple workflows can become expensive or ungovernable at eighty workflows, while a small number of stateful or transaction-critical workflows can justify software much earlier.

## 4. Ownership is an architecture constraint

Builder profile, strongest day-to-day owner, maintenance capacity, governance needs, and hosting preference matter independently from raw platform capability. A platform that can technically execute the workflow is still a bad recommendation if the team cannot safely debug, update, secure, and recover it.

Self-hosting is treated as an operating responsibility, not a free deployment checkbox.

## 5. Classify workflow architecture

Branching, loops, batching, APIs, AI, approvals, documents, databases, real-time requirements, durable jobs, and product logic are combined into architecture complexity. The engine classifies the workload before choosing a vendor:

- native automation
- integration automation
- orchestration
- human-in-the-loop
- data pipeline
- application/software

Platform scoring happens inside this architectural context rather than defining the architecture by itself.

## 6. Reliability changes the design

Failure impact, duplicate safety, retry requirements, durable execution, real-time behavior, sensitive data, and irreversible side effects influence both architecture and safeguards.

A duplicated Slack notification and a duplicated charge are not equivalent failures. When retries are required, the engine can recommend idempotency/deduplication, bounded retry policy, visible recovery queues, alert ownership, replay strategy, and deterministic validation around AI output.

## 7. Apply hard constraints before weighted trade-offs

Mandatory self-hosting, product/application logic, ownership capability, ecosystem constraints, and enterprise governance can eliminate or strongly constrain options before normal scoring.

Examples:

- a simple CRM-contained workflow can remain native;
- a Microsoft-first governed environment can favor Power Automate;
- product-like transactional state can force the core into custom software;
- a business-only owner can make developer-first infrastructure operationally inappropriate;
- required self-hosting removes managed-only choices.

## 8. Compare platforms by fit, not popularity

Eligible platforms are compared across ownership, simplicity, integration support, workflow complexity, scale, reliability, control, ecosystem fit, and economics. Exact vendor prices are intentionally not hard-coded as permanent truth; the engine models billing behavior and cost pressure instead.

App affinity can help a platform, but merely selecting an app must never force that platform to win.

## 9. Measure decision stability and confidence

Confidence is not a decorative percentage. The engine looks at the score margin between viable candidates and unresolved architecture boundaries, then identifies the few unanswered questions most likely to change the recommendation.

High-value uncertainty includes:

- unknown/internal system connectivity;
- native versus external automation boundary;
- Zapier-versus-Make workflow shape;
- technical ownership;
- self-hosting responsibility;
- durable background-job requirements;
- software/application boundary;
- governance requirements;
- growth economics;
- retry/idempotency failure semantics.

Close candidates reduce confidence instead of manufacturing certainty. The product exposes at most a small set of high-value follow-up questions.

## 10. Design the portfolio, not one universal tool

The output may assign different workflow classes to different layers:

- native system for simple lifecycle/state work;
- lightweight integration for predictable SaaS handoffs;
- orchestration for APIs, branching, transformations, data, AI, retries, or complex recovery;
- durable developer jobs for application-side asynchronous work;
- custom software for persistent transactional or product-critical logic.

The goal is a maintainable architecture, not a single platform winner.

## 11. Stress-test the recommendation

The Advisor recomputes the architecture under changed conditions such as higher volume, loss of technical ownership, self-hosting requirements, more integrations, or increased criticality. A useful recommendation should explain when it stops being the right recommendation.

## 12. Testing policy

Every meaningful platform/architecture change should have deterministic regression coverage. Benchmark scenarios ensure each modeled platform can win in the environment it is designed for, while matrix/invariant tests check bounded scores, safety ordering, hard constraints, stable outputs, and cross-tool assumptions.

The authoritative decision path must work without an AI API. AI may later help parse narrative input or explain results, but it should not own hard constraints, arithmetic, vendor facts, or the final recommendation authority.
