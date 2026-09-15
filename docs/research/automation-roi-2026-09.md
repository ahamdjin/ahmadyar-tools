# Automation ROI and investment decision model — September 2026

The Automation ROI Calculator is intentionally more conservative than a simple `hours saved × hourly rate` worksheet. It separates process suitability, returned staff capacity, realizable economic value, recurring ownership cost, and downside sensitivity.

## Research signals

UiPath's current Automation Hub detailed assessment treats automation feasibility and potential as separate questions. Feasibility considers process and application stability. Automation potential considers structured/digital inputs and process variability. Its detailed assessment also collects transaction volume, employee full cost, error rate, review/audit information, number of process variations, and applications used.

Sources:
- https://docs.uipath.com/automation-hub/automation-suite/2.2510/user-guide/information-about-the-detailed-assessment-algorithm
- https://docs.uipath.com/automation-hub/automation-cloud/latest/user-guide/completing-the-detailed-assessment
- https://docs.uipath.com/process-mining/automation-suite/2.2510/user-guide/simulating-automation-potential

These sources support a key product rule: a positive time-savings estimate does not make an unstable process a good automation candidate.

## Product rules

1. **Capacity is not automatically cash savings.** Returned labor time is calculated first. A separate value-capture percentage represents the share that can realistically become avoided hiring, higher throughput, redeployed capacity, reduced overtime/contractor spend, or another defensible economic benefit.
2. **Review and exceptions reduce straight-through value.** Human review time and cases that fall back to manual work are explicit inputs.
3. **Errors only count when their value is defensible.** Error-rate improvement is separated from labor savings and can be set to zero.
4. **Ownership cost is recurring.** Software/hosting plus maintenance labor are included rather than treating the build as a one-time event.
5. **Payback is stress-tested.** The calculator shows both the entered case and a conservative case with lower automation/value capture, higher exception/review rates, and higher implementation/operating costs.
6. **Readiness can override ROI.** A process that changes weekly/daily can return `standardize-first`; a guessed baseline can return `measure-first`; high-impact or high-exception work can return `pilot-first`; weak economics can return `deprioritize`.
7. **ROI does not choose the platform.** Once the investment case is credible, architecture is evaluated separately by the Automation Architecture Advisor.

## Core calculations

Expected automated cases are the automatable share of monthly cases minus exception fallback. Net hours returned subtract human review minutes from the manual handling time removed by successful automation.

Captured time value = net hours returned × loaded hourly cost × value-capture percentage.

Avoided error value = successful automated cases × current error rate × avoidable error percentage × cost per error.

Recurring monthly cost = software/hosting + maintenance hours × maintenance labor cost.

First-year net value = 12 × monthly gross value − (one-time build cost + 12 × recurring monthly cost).

Payback months use one-time build cost divided by steady-state monthly net value when that value is positive. The calculator also exposes a 12-month build-cost ceiling and approximate break-even monthly volume.

## Conservative stress case

The current stress case intentionally worsens the assumptions rather than pretending to forecast a probability distribution:
- automation coverage −15 percentage points
- human review +10 points
- exception rate +10 points
- value capture −20 points
- avoidable error share −15 points
- build cost +20%
- software and maintenance load +15%

The conservative case must never produce better modeled economics than the entered case; regression tests enforce this.

## Maintenance rule

This is a deterministic planning model, not an accounting or financial forecast. Exact software prices are deliberately not hard-coded because vendor plans change. The inputs should be replaced with measured operating data whenever possible, and important investments should be reviewed against the user's actual labor economics, risk, tax/accounting treatment, and implementation constraints.
