export type RoiCurrency = 'USD' | 'EUR' | 'GBP' | 'PKR' | 'AED'
export type RoiBaselineSource = 'measured' | 'estimated' | 'guess'
export type RoiProcessStability = 'stable' | 'mostly-stable' | 'changing'
export type RoiChangeFrequency = 'rare' | 'monthly' | 'weekly' | 'daily'
export type RoiFailureImpact = 'low' | 'medium' | 'high' | 'critical'
export type RoiDisposition = 'automate-now' | 'pilot-first' | 'measure-first' | 'standardize-first' | 'deprioritize'

export type AutomationRoiInput = {
  currency: RoiCurrency
  monthlyCases: number
  manualMinutesPerCase: number
  loadedHourlyCost: number
  automatablePct: number
  humanReviewPct: number
  reviewMinutes: number
  exceptionPct: number
  valueCapturePct: number
  currentErrorPct: number
  avoidableErrorPct: number
  costPerError: number
  buildCost: number
  monthlySoftwareCost: number
  maintenanceHoursPerMonth: number
  maintenanceHourlyCost: number
  processStability: RoiProcessStability
  changeFrequency: RoiChangeFrequency
  failureImpact: RoiFailureImpact
  baselineSource: RoiBaselineSource
}

export type RoiScenario = {
  successfulAutomatedCases: number
  exceptionCases: number
  reviewHours: number
  netHoursReturned: number
  grossCapacityValueMonthly: number
  capturedTimeValueMonthly: number
  avoidedErrorsMonthly: number
  avoidedErrorValueMonthly: number
  grossMonthlyValue: number
  recurringMonthlyCost: number
  monthlyNetValue: number
  firstYearCost: number
  firstYearBenefit: number
  firstYearNetValue: number
  firstYearRoiPct: number | null
  paybackMonths: number | null
  maxBuildCostFor12MonthPayback: number
  breakEvenCasesPerMonth: number | null
}

export type AutomationRoiResult = {
  disposition: RoiDisposition
  dispositionLabel: string
  score: number
  confidence: number
  summary: string
  baselineManualHours: number
  baselineLaborValueMonthly: number
  expected: RoiScenario
  conservative: RoiScenario
  reasons: string[]
  risks: string[]
  nextActions: string[]
}

export const DEFAULT_AUTOMATION_ROI_INPUT: AutomationRoiInput = {
  currency: 'USD',
  monthlyCases: 1000,
  manualMinutesPerCase: 8,
  loadedHourlyCost: 35,
  automatablePct: 70,
  humanReviewPct: 15,
  reviewMinutes: 2,
  exceptionPct: 8,
  valueCapturePct: 60,
  currentErrorPct: 5,
  avoidableErrorPct: 60,
  costPerError: 25,
  buildCost: 4000,
  monthlySoftwareCost: 150,
  maintenanceHoursPerMonth: 4,
  maintenanceHourlyCost: 50,
  processStability: 'stable',
  changeFrequency: 'monthly',
  failureImpact: 'medium',
  baselineSource: 'estimated',
}

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const pct = (value: number) => clamp(value) / 100
const safe = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0)
const round = (value: number, digits = 1) => Number(value.toFixed(digits))

function calculateScenario(input: AutomationRoiInput): RoiScenario {
  const monthlyCases = safe(input.monthlyCases)
  const manualMinutes = safe(input.manualMinutesPerCase)
  const loadedHourlyCost = safe(input.loadedHourlyCost)
  const eligibleCases = monthlyCases * pct(input.automatablePct)
  const exceptionCases = eligibleCases * pct(input.exceptionPct)
  const successfulAutomatedCases = Math.max(0, eligibleCases - exceptionCases)
  const reviewedCases = successfulAutomatedCases * pct(input.humanReviewPct)
  const reviewMinutes = reviewedCases * safe(input.reviewMinutes)
  const grossMinutesRemoved = successfulAutomatedCases * manualMinutes
  const netHoursReturned = Math.max(0, (grossMinutesRemoved - reviewMinutes) / 60)
  const reviewHours = reviewMinutes / 60

  const grossCapacityValueMonthly = netHoursReturned * loadedHourlyCost
  const capturedTimeValueMonthly = grossCapacityValueMonthly * pct(input.valueCapturePct)
  const avoidedErrorsMonthly = successfulAutomatedCases * pct(input.currentErrorPct) * pct(input.avoidableErrorPct)
  const avoidedErrorValueMonthly = avoidedErrorsMonthly * safe(input.costPerError)
  const grossMonthlyValue = capturedTimeValueMonthly + avoidedErrorValueMonthly
  const recurringMonthlyCost = safe(input.monthlySoftwareCost) + safe(input.maintenanceHoursPerMonth) * safe(input.maintenanceHourlyCost)
  const monthlyNetValue = grossMonthlyValue - recurringMonthlyCost
  const buildCost = safe(input.buildCost)
  const firstYearCost = buildCost + recurringMonthlyCost * 12
  const firstYearBenefit = grossMonthlyValue * 12
  const firstYearNetValue = firstYearBenefit - firstYearCost
  const firstYearRoiPct = firstYearCost > 0 ? (firstYearNetValue / firstYearCost) * 100 : null
  const paybackMonths = monthlyNetValue > 0 ? buildCost / monthlyNetValue : null
  const maxBuildCostFor12MonthPayback = Math.max(0, monthlyNetValue * 12)
  const grossValuePerCase = monthlyCases > 0 ? grossMonthlyValue / monthlyCases : 0
  const breakEvenCasesPerMonth = grossValuePerCase > 0
    ? (recurringMonthlyCost + buildCost / 12) / grossValuePerCase
    : null

  return {
    successfulAutomatedCases: round(successfulAutomatedCases, 0),
    exceptionCases: round(exceptionCases, 0),
    reviewHours: round(reviewHours),
    netHoursReturned: round(netHoursReturned),
    grossCapacityValueMonthly: round(grossCapacityValueMonthly),
    capturedTimeValueMonthly: round(capturedTimeValueMonthly),
    avoidedErrorsMonthly: round(avoidedErrorsMonthly),
    avoidedErrorValueMonthly: round(avoidedErrorValueMonthly),
    grossMonthlyValue: round(grossMonthlyValue),
    recurringMonthlyCost: round(recurringMonthlyCost),
    monthlyNetValue: round(monthlyNetValue),
    firstYearCost: round(firstYearCost),
    firstYearBenefit: round(firstYearBenefit),
    firstYearNetValue: round(firstYearNetValue),
    firstYearRoiPct: firstYearRoiPct === null ? null : round(firstYearRoiPct),
    paybackMonths: paybackMonths === null ? null : round(paybackMonths),
    maxBuildCostFor12MonthPayback: round(maxBuildCostFor12MonthPayback),
    breakEvenCasesPerMonth: breakEvenCasesPerMonth === null ? null : round(breakEvenCasesPerMonth, 0),
  }
}

function conservativeInput(input: AutomationRoiInput): AutomationRoiInput {
  return {
    ...input,
    automatablePct: Math.max(0, input.automatablePct - 15),
    humanReviewPct: Math.min(100, input.humanReviewPct + 10),
    exceptionPct: Math.min(100, input.exceptionPct + 10),
    valueCapturePct: Math.max(0, input.valueCapturePct - 20),
    avoidableErrorPct: Math.max(0, input.avoidableErrorPct - 15),
    buildCost: input.buildCost * 1.2,
    monthlySoftwareCost: input.monthlySoftwareCost * 1.15,
    maintenanceHoursPerMonth: input.maintenanceHoursPerMonth * 1.15,
  }
}

function confidenceFor(input: AutomationRoiInput) {
  const source = { measured: 95, estimated: 76, guess: 44 }[input.baselineSource]
  const stability = { stable: 95, 'mostly-stable': 74, changing: 38 }[input.processStability]
  const change = { rare: 96, monthly: 82, weekly: 60, daily: 34 }[input.changeFrequency]
  const exceptionConfidence = clamp(100 - input.exceptionPct * 0.75, 35, 100)
  const reviewConfidence = clamp(100 - input.humanReviewPct * 0.35, 55, 100)
  let confidence = source * 0.34 + stability * 0.25 + change * 0.17 + exceptionConfidence * 0.14 + reviewConfidence * 0.1
  if ((input.failureImpact === 'high' || input.failureImpact === 'critical') && input.baselineSource === 'guess') confidence -= 8
  return Math.round(clamp(confidence, 25, 95))
}

function scoreFor(input: AutomationRoiInput, expected: RoiScenario, conservative: RoiScenario, confidence: number) {
  const payback = expected.paybackMonths === null ? 0 : clamp(100 - expected.paybackMonths * 4, 0, 100)
  const conservativePayback = conservative.paybackMonths === null ? 0 : clamp(100 - conservative.paybackMonths * 3, 0, 100)
  const stability = { stable: 95, 'mostly-stable': 72, changing: 32 }[input.processStability]
  const economics = expected.firstYearNetValue > 0 ? clamp(55 + Math.log10(expected.firstYearNetValue + 1) * 12, 0, 100) : clamp(50 + expected.firstYearNetValue / 100, 0, 50)
  return Math.round(clamp(payback * 0.28 + conservativePayback * 0.17 + stability * 0.2 + economics * 0.2 + confidence * 0.15))
}

function dispositionFor(input: AutomationRoiInput, expected: RoiScenario, confidence: number): RoiDisposition {
  if (input.processStability === 'changing' && (input.changeFrequency === 'weekly' || input.changeFrequency === 'daily')) return 'standardize-first'
  if (input.baselineSource === 'guess' || confidence < 55) return 'measure-first'
  if (expected.monthlyNetValue <= 0 || (expected.paybackMonths !== null && expected.paybackMonths > 24)) return 'deprioritize'
  if (input.failureImpact === 'high' || input.failureImpact === 'critical' || input.exceptionPct >= 25 || input.humanReviewPct >= 40) return 'pilot-first'
  if (expected.paybackMonths !== null && expected.paybackMonths <= 12 && confidence >= 65 && input.processStability !== 'changing') return 'automate-now'
  return 'pilot-first'
}

function labelFor(disposition: RoiDisposition) {
  return {
    'automate-now': 'Strong automation candidate',
    'pilot-first': 'Pilot before full rollout',
    'measure-first': 'Measure the baseline first',
    'standardize-first': 'Standardize the process first',
    deprioritize: 'Weak economics right now',
  }[disposition]
}

function summaryFor(disposition: RoiDisposition, expected: RoiScenario, conservative: RoiScenario) {
  if (disposition === 'standardize-first') return 'The apparent savings are not the main problem yet. The process is changing too quickly, so deeper automation would encode moving rules and create rework. Stabilize the operating process, then rerun the economics.'
  if (disposition === 'measure-first') return 'The calculation is too assumption-heavy to justify a build decision. Measure real case volume, handling time, exception rate, and review effort before treating the ROI estimate as investment-grade.'
  if (disposition === 'deprioritize') return 'The current recurring value does not comfortably repay the build and ownership cost. Reduce scope, increase volume/value capture, or choose a cheaper implementation before prioritizing this automation.'
  if (disposition === 'pilot-first') return `The expected case can work, but the operating risk or uncertainty is still meaningful. A limited pilot should verify exceptions, review effort, failure behavior, and whether the conservative case stays acceptable${conservative.paybackMonths ? ` around ${conservative.paybackMonths} months payback` : ''}.`
  return `The process is stable enough and the expected economics support building it. The key is to preserve the assumptions that create the value: automation coverage, low exception work, controlled review, and an ownership model that keeps recurring cost predictable${expected.paybackMonths ? `, with expected payback around ${expected.paybackMonths} months` : ''}.`
}

export function analyzeAutomationRoi(input: AutomationRoiInput): AutomationRoiResult {
  const normalized: AutomationRoiInput = {
    ...input,
    monthlyCases: safe(input.monthlyCases),
    manualMinutesPerCase: safe(input.manualMinutesPerCase),
    loadedHourlyCost: safe(input.loadedHourlyCost),
    automatablePct: clamp(input.automatablePct),
    humanReviewPct: clamp(input.humanReviewPct),
    reviewMinutes: safe(input.reviewMinutes),
    exceptionPct: clamp(input.exceptionPct),
    valueCapturePct: clamp(input.valueCapturePct),
    currentErrorPct: clamp(input.currentErrorPct),
    avoidableErrorPct: clamp(input.avoidableErrorPct),
    costPerError: safe(input.costPerError),
    buildCost: safe(input.buildCost),
    monthlySoftwareCost: safe(input.monthlySoftwareCost),
    maintenanceHoursPerMonth: safe(input.maintenanceHoursPerMonth),
    maintenanceHourlyCost: safe(input.maintenanceHourlyCost),
  }

  const expected = calculateScenario(normalized)
  const conservative = calculateScenario(conservativeInput(normalized))
  const confidence = confidenceFor(normalized)
  const disposition = dispositionFor(normalized, expected, confidence)
  const score = scoreFor(normalized, expected, conservative, confidence)
  const baselineManualHours = normalized.monthlyCases * normalized.manualMinutesPerCase / 60
  const baselineLaborValueMonthly = baselineManualHours * normalized.loadedHourlyCost

  const reasons: string[] = []
  if (expected.netHoursReturned > 0) reasons.push(`About ${expected.netHoursReturned} staff hours per month are returned after review effort and exception fallbacks.`)
  if (normalized.valueCapturePct < 100) reasons.push(`Only ${normalized.valueCapturePct}% of returned labor capacity is counted as realizable value; the rest is treated as capacity, not automatic cash savings.`)
  if (expected.avoidedErrorValueMonthly > 0) reasons.push(`Avoided errors contribute about ${round(expected.avoidedErrorValueMonthly, 0)} per month in the selected currency under the stated assumptions.`)
  if (expected.paybackMonths !== null && expected.paybackMonths <= 12) reasons.push(`Expected payback is inside 12 months, before applying the conservative stress case.`)
  if (conservative.firstYearNetValue > 0) reasons.push('The conservative stress case still produces positive first-year net value.')

  const risks: string[] = []
  if (normalized.baselineSource === 'guess') risks.push('The baseline is a guess, so ROI precision is currently low.')
  if (normalized.processStability === 'changing') risks.push('A changing process can erase modeled savings through rebuild and exception work.')
  if (normalized.changeFrequency === 'weekly' || normalized.changeFrequency === 'daily') risks.push('Frequent rule changes increase maintenance cost and make current assumptions decay quickly.')
  if (normalized.exceptionPct >= 20) risks.push(`${normalized.exceptionPct}% exception fallback is high enough to materially reduce straight-through automation value.`)
  if (normalized.humanReviewPct >= 30) risks.push('Human review remains a meaningful operating cost; the automation is assistive rather than fully straight-through.')
  if (normalized.failureImpact === 'high' || normalized.failureImpact === 'critical') risks.push('Failure impact is high enough that rollback, idempotency, monitoring, and a human-safe fallback belong in the design.')
  if (conservative.firstYearNetValue <= 0) risks.push('The conservative stress case loses money in year one, so the expected case is sensitive to assumptions.')

  const nextActions = {
    'automate-now': [
      'Confirm the baseline with a representative sample before approving build scope.',
      'Cap the build budget near the 12-month payback ceiling rather than spending against optimistic upside.',
      'Design exception handling, monitoring, and ownership before implementation starts.',
      'Use the Automation Architecture Advisor next to choose the implementation lane and platform mix.',
    ],
    'pilot-first': [
      'Pilot one stable slice with real users and production-like volume.',
      'Measure actual exception rate, review minutes, failure recovery, and value capture during the pilot.',
      'Re-run the model with pilot data before broad rollout.',
      'Use the Automation Architecture Advisor after the pilot confirms the operating model.',
    ],
    'measure-first': [
      'Measure real monthly case volume and median handling time for at least one representative period.',
      'Track exceptions and rework separately from normal handling time.',
      'Estimate loaded labor cost and decide what percentage of saved capacity can actually be redeployed or removed.',
      'Return to the calculator with measured inputs before selecting a platform.',
    ],
    'standardize-first': [
      'Document the current process and separate the stable majority path from exceptions.',
      'Reduce weekly/daily rule churn before encoding it in automation.',
      'Define one owner and one source of truth for the process state.',
      'Rerun ROI once the process has stayed materially stable for a useful operating period.',
    ],
    deprioritize: [
      'Reduce the automation scope to the highest-volume or highest-error slice.',
      'Compare a native/no-code implementation against the current build estimate.',
      'Revisit the opportunity when volume, error cost, or realizable capacity value changes.',
      'Do not use optimistic time-saved estimates to force a positive business case.',
    ],
  }[disposition]

  return {
    disposition,
    dispositionLabel: labelFor(disposition),
    score,
    confidence,
    summary: summaryFor(disposition, expected, conservative),
    baselineManualHours: round(baselineManualHours),
    baselineLaborValueMonthly: round(baselineLaborValueMonthly),
    expected,
    conservative,
    reasons,
    risks,
    nextActions,
  }
}
