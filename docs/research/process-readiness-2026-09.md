# Process readiness before automation — September 2026

The Advisor should answer **whether a process is ready to automate before it recommends an architecture or platform**. A stronger automation platform does not make an unstable business process a better automation candidate.

## Current research basis

Microsoft Power Automate Process Mining describes process mining as a way to understand the real steps in an operation, identify mistakes and bottlenecks, standardize and optimize the process, and then discover automation opportunities. This supports a sequence of **understand → standardize/optimize → automate**, rather than starting with tool selection.

Source: https://learn.microsoft.com/en-us/power-automate/process-advisor-overview (reviewed September 2026; Microsoft page last updated August 31, 2026).

UiPath Automation Hub separates automation suitability from implementation effort. Its detailed assessment explicitly considers process stability and application stability for feasibility, and structured inputs, process variability, and digitization for automation potential. Implementation effort also considers process length and number of applications.

Sources:
- https://docs.uipath.com/automation-hub/automation-suite/2023.4/user-guide/information-about-the-detailed-assessment-algorithm
- https://docs.uipath.com/automation-hub/automation-cloud/latest/user-guide/completing-the-detailed-assessment

## Product rules derived from this research

The Advisor now separates process readiness from platform ranking:

- **Ready to automate** — the process is stable enough to automate; choose the smallest maintainable architecture that satisfies ownership and reliability requirements.
- **Pilot first** — the process is changing, but a bounded workflow can be tested safely before standardizing the wider portfolio.
- **Standardize first** — the process itself changes quickly enough that end-to-end automation would encode a moving target. Stabilize trigger, ownership, handoffs, exceptions, and source of truth first.
- **Automate with a human checkpoint** — repetitive preparation and routing can be automated, but high-impact AI or explicit judgment remains human-controlled.
- **Software first** — persistent state, transactions, customer-visible behavior, or product/domain rules belong in application architecture; workflow tools remain at the edges.

## Deliberate limitations

The current assessment does not yet ask directly about every classic suitability factor such as percentage of structured inputs, exception rate, manual effort per transaction, or application-change roadmap. The readiness model therefore uses only inputs the user has actually supplied and avoids pretending those missing facts are known.

Future question-model work should add those fields only when they can materially change the disposition. The form should stay adaptive instead of becoming a giant fixed checklist.
