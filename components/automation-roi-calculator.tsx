'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, RotateCcwIcon } from 'lucide-react'

import { ToolResultActions } from '@/components/tool-result-actions'
import { useToolStepNavigation } from '@/components/use-tool-step-navigation'
import {
  analyzeAutomationRoi,
  DEFAULT_AUTOMATION_ROI_INPUT,
  type AutomationRoiInput,
  type RoiBaselineSource,
  type RoiChangeFrequency,
  type RoiCurrency,
  type RoiFailureImpact,
  type RoiProcessStability,
} from '@/engine/automation-roi'

type StepId = 'baseline' | 'capture' | 'ownership' | 'result'
const STEPS: StepId[] = ['baseline', 'capture', 'ownership', 'result']

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 min-w-0 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100">{children}</select>
}

function NumberInput({ value, onChange, min = 0, max, step = 1, suffix }: { value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  const commitValue = (raw: string) => {
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return
    const upper = max ?? Number.POSITIVE_INFINITY
    onChange(Math.min(upper, Math.max(min, parsed)))
  }

  return <label className="relative block min-w-0"><input type="number" value={value} min={min} max={max} step={step} onChange={(event) => commitValue(event.target.value)} className={`min-h-12 min-w-0 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100 ${suffix ? 'pr-14' : ''}`} />{suffix ? <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">{suffix}</span> : null}</label>
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return <div className="roi-field grid min-w-0 gap-3 border-b border-zinc-200 py-4 last:border-b-0 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-7 dark:border-zinc-800"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{label}</p>{helper ? <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p> : null}</div><div className="min-w-0 self-center">{children}</div></div>
}

function StepIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">{title}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{body}</p></header>
}

function BaselineStep({ input, update }: { input: AutomationRoiInput; update: <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => void }) {
  return <div className="space-y-8">
    <StepIntro eyebrow="1 · Baseline" title="Measure the work before pricing the automation." body="Start with one normal month. The calculator deliberately lowers confidence when the baseline is guessed, because a precise-looking ROI built on a guess is still a guess." />
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Currency"><Select value={input.currency} onChange={(value) => update('currency', value as RoiCurrency)}><option value="USD">USD — US dollar</option><option value="EUR">EUR — euro</option><option value="GBP">GBP — pound sterling</option><option value="PKR">PKR — Pakistani rupee</option><option value="AED">AED — UAE dirham</option></Select></Field>
      <Field label="Cases / runs per month" helper="Invoices, leads, orders, tickets, reports — one repeatable unit of work."><NumberInput value={input.monthlyCases} onChange={(value) => update('monthlyCases', value)} /></Field>
      <Field label="Manual minutes per case"><NumberInput value={input.manualMinutesPerCase} onChange={(value) => update('manualMinutesPerCase', value)} step={0.5} suffix="min" /></Field>
      <Field label="Loaded labor cost / hour" helper="Use the real blended internal cost, not just the headline salary."><NumberInput value={input.loadedHourlyCost} onChange={(value) => update('loadedHourlyCost', value)} /></Field>
      <Field label="Baseline quality"><Select value={input.baselineSource} onChange={(value) => update('baselineSource', value as RoiBaselineSource)}><option value="measured">Measured from real work</option><option value="estimated">Reasonable operational estimate</option><option value="guess">Mostly a guess</option></Select></Field>
      <Field label="Current error / rework rate" helper="Use zero if you cannot defend a rate."><div className="grid gap-2 sm:grid-cols-2"><NumberInput value={input.currentErrorPct} onChange={(value) => update('currentErrorPct', value)} max={100} suffix="%" /><NumberInput value={input.costPerError} onChange={(value) => update('costPerError', value)} suffix="cost / error" /></div></Field>
    </section>
  </div>
}

function CaptureStep({ input, update }: { input: AutomationRoiInput; update: <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => void }) {
  const preview = useMemo(() => analyzeAutomationRoi(input), [input])
  return <div className="space-y-8">
    <StepIntro eyebrow="2 · Value capture" title="Model what actually disappears — then discount it." body="Time saved is returned capacity, not automatically cash. Count review, exceptions and the share of returned capacity the business can genuinely turn into avoided cost, more output or better service." />
    <section className="rounded-2xl bg-zinc-50 p-4 sm:p-5 dark:bg-zinc-900/55"><p className="text-xs font-medium text-zinc-500">Current baseline</p><div className="mt-2 flex flex-wrap gap-x-6 gap-y-2"><p className="text-sm text-zinc-800 dark:text-zinc-200"><span className="font-medium">{preview.baselineManualHours.toFixed(1)} hrs</span> manual / month</p><p className="text-sm text-zinc-800 dark:text-zinc-200"><span className="font-medium">{money(input.currency, preview.baselineLaborValueMonthly)}</span> labor capacity / month</p></div></section>
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="Automatable share" helper="The portion that can follow a stable rule or workflow without redesigning the process."><NumberInput value={input.automatablePct} onChange={(value) => update('automatablePct', value)} max={100} suffix="%" /></Field>
      <Field label="Human review" helper="How many successful automated cases still need a person, and for how long?"><div className="grid gap-2 sm:grid-cols-2"><NumberInput value={input.humanReviewPct} onChange={(value) => update('humanReviewPct', value)} max={100} suffix="% reviewed" /><NumberInput value={input.reviewMinutes} onChange={(value) => update('reviewMinutes', value)} step={0.5} suffix="min" /></div></Field>
      <Field label="Exception fallback" helper="Cases automation cannot finish and returns to a person."><NumberInput value={input.exceptionPct} onChange={(value) => update('exceptionPct', value)} max={100} suffix="%" /></Field>
      <Field label="Value capture" helper="What share of returned capacity becomes real business value: avoided hiring, more output, redeployment or actual cost reduction?"><NumberInput value={input.valueCapturePct} onChange={(value) => update('valueCapturePct', value)} max={100} suffix="%" /></Field>
      <Field label="Avoidable error share" helper="Only count errors this automation can realistically prevent."><NumberInput value={input.avoidableErrorPct} onChange={(value) => update('avoidableErrorPct', value)} max={100} suffix="%" /></Field>
    </section>
    <p className="text-xs leading-5 text-zinc-500">The model keeps returned staff time separate from captured economic value. That prevents “8 hours saved” from automatically becoming “8 hours of cash saved.”</p>
  </div>
}

function OwnershipStep({ input, update }: { input: AutomationRoiInput; update: <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => void }) {
  return <div className="space-y-8">
    <StepIntro eyebrow="3 · Ownership cost + risk" title="Price the system you will still own six months later." body="Software cost is usually the obvious line item. Maintenance, changing rules, monitoring and failure recovery are the costs that make optimistic automation cases fall apart." />
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <Field label="One-time build cost"><NumberInput value={input.buildCost} onChange={(value) => update('buildCost', value)} step={100} /></Field>
      <Field label="Software / hosting per month"><NumberInput value={input.monthlySoftwareCost} onChange={(value) => update('monthlySoftwareCost', value)} step={10} /></Field>
      <Field label="Maintenance / month" helper="Updates, monitoring, failures, credentials, changing rules and small improvements."><div className="grid gap-2 sm:grid-cols-2"><NumberInput value={input.maintenanceHoursPerMonth} onChange={(value) => update('maintenanceHoursPerMonth', value)} step={0.5} suffix="hrs" /><NumberInput value={input.maintenanceHourlyCost} onChange={(value) => update('maintenanceHourlyCost', value)} suffix="cost / hr" /></div></Field>
      <Field label="Process stability"><Select value={input.processStability} onChange={(value) => update('processStability', value as RoiProcessStability)}><option value="stable">Stable and understood</option><option value="mostly-stable">Mostly stable with known exceptions</option><option value="changing">Still changing materially</option></Select></Field>
      <Field label="How often rules change"><Select value={input.changeFrequency} onChange={(value) => update('changeFrequency', value as RoiChangeFrequency)}><option value="rare">A few times per year</option><option value="monthly">Monthly-ish</option><option value="weekly">Weekly</option><option value="daily">Constantly / daily</option></Select></Field>
      <Field label="Worst realistic failure"><Select value={input.failureImpact} onChange={(value) => update('failureImpact', value as RoiFailureImpact)}><option value="low">Low — easy to recover</option><option value="medium">Medium — manual recovery / delay</option><option value="high">High — customer, revenue or operating impact</option><option value="critical">Critical — money, legal, compliance or core state</option></Select></Field>
    </section>
  </div>
}

function money(currency: RoiCurrency, value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
}

function payback(value: number | null) {
  return value === null ? 'No payback' : `${value} mo`
}

function roi(value: number | null) {
  return value === null ? 'n/a' : `${value}%`
}

function Result({ input, onEdit }: { input: AutomationRoiInput; onEdit: (step: StepId) => void }) {
  const result = useMemo(() => analyzeAutomationRoi(input), [input])
  const expected = result.expected
  const conservative = result.conservative
  const sensitivity = [
    `Expected: ${money(input.currency, expected.firstYearNetValue)} first-year net value, ${payback(expected.paybackMonths)} payback.`,
    `Conservative: ${money(input.currency, conservative.firstYearNetValue)} first-year net value, ${payback(conservative.paybackMonths)} payback.`,
    `${expected.netHoursReturned} staff hours/month are returned after review and exception fallback; only ${input.valueCapturePct}% is treated as captured business value.`,
  ]

  return <div className="space-y-10 pb-8">
    <section className="rounded-[24px] bg-zinc-950 p-6 text-white sm:p-8 dark:bg-zinc-100 dark:text-zinc-950"><div className="flex flex-wrap items-start justify-between gap-6"><div className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Investment decision</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">{result.dispositionLabel}</h2><p className="mt-4 text-sm leading-7 text-zinc-300 dark:text-zinc-700">{result.summary}</p></div><div className="text-right"><p className="font-mono text-2xl font-medium">{result.score}/100</p><p className="text-xs text-zinc-400 dark:text-zinc-600">confidence {result.confidence}%</p></div></div><div className="mt-6"><ToolResultActions title={`Automation ROI: ${result.dispositionLabel}`} summary={result.summary} details={[...sensitivity, ...result.nextActions]} /></div></section>

    <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Decision numbers</p><h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Expected case first. Downside right beside it.</h3></div><button type="button" onClick={() => onEdit('capture')} className="text-xs font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-4">Edit assumptions</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Expected payback" value={payback(expected.paybackMonths)} /><Metric label="Conservative payback" value={payback(conservative.paybackMonths)} /><Metric label="Expected year-one net" value={money(input.currency, expected.firstYearNetValue)} /><Metric label="Conservative year-one net" value={money(input.currency, conservative.firstYearNetValue)} /></div></section>

    <section className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">What creates the value</p><ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{result.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul></div><div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">What can break the case</p><ul className="mt-3 space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{(result.risks.length ? result.risks : ['No major assumption risk was flagged by the current inputs.']).map((risk) => <li key={risk}>• {risk}</li>)}</ul></div></section>

    <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Do this next</p><ol className="mt-4 space-y-3">{result.nextActions.map((action, index) => <li key={action} className="grid grid-cols-[26px_1fr] gap-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300"><span className="font-mono text-[10px] text-zinc-500">{String(index + 1).padStart(2, '0')}</span><span>{action}</span></li>)}</ol></section>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Hours returned / month" value={`${expected.netHoursReturned} hrs`} detail="After human review and exception fallback." /><Metric label="Captured monthly value" value={money(input.currency, expected.grossMonthlyValue)} detail="Time value after capture discount + defensible avoided-error value." /><Metric label="Recurring run cost" value={money(input.currency, expected.recurringMonthlyCost)} /><Metric label="12-month build ceiling" value={money(input.currency, expected.maxBuildCostFor12MonthPayback)} /></section>

    <details className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"><summary className="cursor-pointer text-sm font-medium text-zinc-950 dark:text-zinc-50">Full model detail</summary><div className="mt-5 grid gap-6 sm:grid-cols-2"><Scenario title="Expected" scenario={expected} currency={input.currency} /><Scenario title="Conservative stress case" scenario={conservative} currency={input.currency} /></div><p className="mt-5 text-[11px] leading-5 text-zinc-500">This is a decision model, not an accounting forecast. Validate real volume, handling time, exception rate, review effort, build cost and maintenance after a pilot.</p></details>
  </div>
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/55"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 break-words text-xl font-medium tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">{value}</p>{detail ? <p className="mt-1 text-[11px] leading-4 text-zinc-500">{detail}</p> : null}</div>
}

function Scenario({ title, scenario, currency }: { title: string; scenario: ReturnType<typeof analyzeAutomationRoi>['expected']; currency: RoiCurrency }) {
  return <div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{title}</p><dl className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400"><div className="flex justify-between gap-4"><dt>First-year ROI</dt><dd>{roi(scenario.firstYearRoiPct)}</dd></div><div className="flex justify-between gap-4"><dt>First-year benefit</dt><dd>{money(currency, scenario.firstYearBenefit)}</dd></div><div className="flex justify-between gap-4"><dt>First-year cost</dt><dd>{money(currency, scenario.firstYearCost)}</dd></div><div className="flex justify-between gap-4"><dt>Monthly net value</dt><dd>{money(currency, scenario.monthlyNetValue)}</dd></div><div className="flex justify-between gap-4"><dt>Break-even volume</dt><dd>{scenario.breakEvenCasesPerMonth === null ? 'n/a' : `${scenario.breakEvenCasesPerMonth} cases/mo`}</dd></div><div className="flex justify-between gap-4"><dt>Exception cases</dt><dd>{scenario.exceptionCases}/mo</dd></div><div className="flex justify-between gap-4"><dt>Review hours</dt><dd>{scenario.reviewHours}/mo</dd></div></dl></div>
}

export function AutomationRoiCalculator() {
  const [input, setInput] = useState<AutomationRoiInput>(DEFAULT_AUTOMATION_ROI_INPUT)
  const [step, setStep] = useState<StepId>('baseline')
  const { rootRef, scrollToStart } = useToolStepNavigation()
  const index = STEPS.indexOf(step)
  const progress = step === 'result' ? 100 : Math.round(((index + 1) / 3) * 100)
  const update = <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const goTo = (nextStep: StepId) => { setStep(nextStep); scrollToStart() }
  const next = () => goTo(STEPS[Math.min(STEPS.length - 1, index + 1)])
  const back = () => goTo(STEPS[Math.max(0, index - 1)])
  const reset = () => { setInput(DEFAULT_AUTOMATION_ROI_INPUT); goTo('baseline') }

  return <section ref={rootRef} className="roi-calculator mx-auto w-full max-w-5xl scroll-mt-24 sm:scroll-mt-28"><div className="mb-8 rounded-2xl bg-zinc-50 p-4 sm:p-5 dark:bg-zinc-900/55"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Model a business case that can survive bad assumptions.</p><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">About 3 minutes. The result separates returned capacity from captured value, includes maintenance and gives you expected and deliberately worse cases.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button></div><div role="progressbar" aria-label="Tool progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500"><span aria-live="polite">{step === 'result' ? 'Business case complete' : `Step ${index + 1} of 3`}</span><span>{progress}%</span></div></div>
  <div className="min-h-[500px]">{step === 'baseline' ? <BaselineStep input={input} update={update} /> : null}{step === 'capture' ? <CaptureStep input={input} update={update} /> : null}{step === 'ownership' ? <OwnershipStep input={input} update={update} /> : null}{step === 'result' ? <Result input={input} onEdit={goTo} /> : null}</div>
  {step !== 'result' ? <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={back} disabled={index === 0} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-zinc-600 disabled:invisible dark:text-zinc-400"><ArrowLeftIcon className="h-4 w-4" />Back</button><button type="button" onClick={next} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950">{step === 'ownership' ? 'See business case' : 'Continue'}<ArrowRightIcon className="h-4 w-4" /></button></div> : <div className="mt-10 border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={() => goTo('baseline')} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"><ArrowLeftIcon className="h-4 w-4" />Edit assumptions</button></div>}
  </section>
}
