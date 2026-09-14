# Decision model

The advisor evaluates the environment in stages rather than adding arbitrary points to platform names.

## 1. Process and portfolio shape

Current workflow count, expected future workflow count, volume, apps per workflow, steps per workflow, and process stability determine whether the user is choosing a tool for one automation or an automation operating model.

## 2. Ownership

Builder profile and maintenance capacity matter independently from workflow capability. A platform that can technically execute a workflow can still be the wrong recommendation when the team cannot safely own it.

## 3. Workflow architecture

Branching, loops, APIs, AI, approvals, documents, databases, real-time requirements, and product logic are combined into architecture complexity. They are optional inputs; the engine does not assume advanced logic exists.

## 4. Reliability

Failure impact, duplicate safety, retry requirements, and sensitive data influence architecture and safeguards. Critical or irreversible actions receive stronger architecture requirements.

## 5. Hard constraints

Requirements such as mandatory self-hosting eliminate incompatible managed-only options before weighted scoring.

## 6. Context

CRM-centered workflows receive a native-system bias when the process is simple enough. Microsoft-first environments receive a Power Automate ecosystem bias. These are context adjustments, not universal preferences.

## 7. Platform fit

The remaining platforms are compared across ownership, simplicity, integration coverage, complexity, scale, reliability, control, and ecosystem fit. User priorities may change weights but cannot override hard constraints.

## 8. Output

The product returns an architecture type, recommended platform or platform mix, confidence, architecture metrics, responsibilities, safeguards, human checkpoints, alternatives, and questions that still need discovery.
