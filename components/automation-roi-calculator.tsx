'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CircleDollarSignIcon,
  ClipboardCheckIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  WorkflowIcon,
  WrenchIcon,
  type LucideIcon,
} from 'lucide-react'

import { useStepScroll } from '@/components/use-step-scroll'
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

type PageId = 'volume' | 'baseline' | 'automation' | 'risk' | 'cost' | 'result'

const STEP_LABELS: Record<Exclude<PageId, 'result'>, string> = {
  volume: 'Workload',
  baseline: 'Baseline',
  automation: 'Automation',
  risk: 'Reality check',
  cost: 'Ownership cost',
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 min-w-0 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-950 outline-none transition-[border-color,box-shadow,background-color] focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100">{children}</select>
}

function NumberInput({ value, onChange, min = 0, max, step = 1, suffix }: { value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return <label className="relative block min-w-0"><input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className={`min-h-12 min-w-0 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-950 outline-none transition-[border-color,box-shadow,background-color] focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100 ${suffix ? 'pr-12' : ''}`} />{suffix ? <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">{suffix}</span> : null}</label>
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return <div className="roi-field grid min-w-0 gap-3 rounded-2xl px-4 py-4 sm:grid-cols-[210px_minmax(0,1fr)] sm:gap-7 sm:px-5"><div><p className="text-[15px] font-medium leading-6 text-zinc-950 dark:text-zinc-50">{label}</p>{helper ? <p className="mt-1 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">{helper}</p> : null}</div><div className="min-w-0 self-center">{children}</div></div>
}

function StepHeader({ icon: Icon, eyebrow, title, body }: { icon: LucideIcon; eyebrow: string; title: string; body: string }) {
  return <header className="roi-step-header max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"><Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />{eyebrow}</div><h2 className="mt-4 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">{title}</h2><p className="mt-3 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">{body}</p></header>
}

function VolumeForm({ input, update }: { input: AutomationRoiInput; update: <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => void }) {
  return <div className="min-w-0 space-y-5">
    <StepHeader icon={CircleDollarSignIcon} eyebrow="Start with one normal month" title="How much work happens before automation?" body="Use the usual process, not the best day or the worst day. Four numbers are enough to establish the baseline workload." />
    <div className="space-y-2"><Field label="Currency"><Select value={input.currency} onChange={(value) => update('currency', value as RoiCurrency)}><option value="USD">USD — US dollar</option><option value="EUR">EUR — euro</option><option value="GBP">GBP — pound sterling</option><option value="PKR">PKR — Pakistani rupee</option><option value="AED">AED — UAE dirham</option></Select></Field>
    <Field label="Cases / runs per month" helper="Invoices, leads, orders, tickets, reports, records — whatever one unit of work is."><NumberInput value={input.monthlyCases} onChange={(value) => update('monthlyCases', value)} min={0} /></Field>
    <Field label="Manual minutes per case" helper="Use normal handling time, not the single worst case."><NumberInput value={input.manualMinutesPerCase} onChange={(value) => update('manualMinutesPerCase', value)} min={0} step={0.5} suffix="min" /></Field>
    <Field label="Loaded labor cost / hour" helper="Salary plus payroll burden or the real blended internal cost of the people doing the work."><NumberInput value={input.loadedHourlyCost} onChange={(value) => update('loadedHourlyCost', value)} min={0} step={1} /></Field></div>
  </div>
}

function BaselineForm({ input, update }: { input: AutomationRoiInput; update: <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => void }) {
  return <div className="min-w-0 space-y-5">
    <StepHeader icon={ClipboardCheckIcon} eyebrow="Check the quality of the baseline" title="How much of the current cost can you defend?" body="A precise-looking ROI is useless if the baseline is guessed. This step separates measured operations from convenient assumptions." />
    <div className="space-y-2"><Field label="How solid is this baseline?"><Select value={input.baselineSource} onChange={(value) => update('baselineSource', value as RoiBaselineSource)}><option value="measured">Measured from real work</option><option value="estimated">Reasonable operational estimate</option><option value="guess">Mostly a guess</option></Select></Field>
    <Field label="Current error / rework rate" helper="Share of cases that require correction or create a meaningful operational error."><NumberInput value={input.currentErrorPct} onChange={(value) => update('currentErrorPct', value)} min={0} max={100} suffix="%" /></Field>
    <Field label="Cost of one avoidable error" helper="Use zero if errors are annoying but do not have a defensible cost."><NumberInput value={input.costPerError} onChange={(value) => update('costPerError', value)} min={0} step={1} /></Field></div>
  </div>
}

function AutomationForm({ input, update }: { input: AutomationRoiInput; update: <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => void }) {
  return <div className="min-w-0 space-y-5">
    <StepHeader icon={WorkflowIcon} eyebrow="Model the work that actually disappears" title="How autonomous can the workflow really be?" body="Automation coverage is only useful after human review and exception fallback are counted." />
    <div className="space-y-2"><Field label="Automatable share" helper="The portion that can follow a repeatable rule or workflow without redesigning the whole process."><NumberInput value={input.automatablePct} onChange={(value) => update('automatablePct', value)} min={0} max={100} suffix="%" /></Field>
    <Field label="Human review share" helper="Of successful automated cases, how many still need a person to check the result?"><NumberInput value={input.humanReviewPct} onChange={(value) => update('humanReviewPct', value)} min={0} max={100} suffix="%" /></Field>
    <Field label="Review minutes" helper="Average human time for each reviewed automated case."><NumberInput value={input.reviewMinutes} onChange={(value) => update('reviewMinutes', value)} min={0} step={0.5} suffix="min" /></Field>
    <Field label="Exception / fallback rate" helper="Cases that automation cannot finish and hands back to a person."><NumberInput value={input.exceptionPct} onChange={(value) => update('exceptionPct', value)} min={0} max={100} suffix="%" /></Field></div>
  </div>
}

function RiskForm({ input, update }: { input: AutomationRoiInput; update: <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => void }) {
  return <div className="min-w-0 space-y-5">
    <StepHeader icon={ShieldCheckIcon} eyebrow="Run the reality check" title="What value survives contact with reality?" body="This is where optimistic spreadsheet savings get discounted for value capture, changing rules and failure risk." />
    <div className="space-y-2"><Field label="Value capture" helper="What share of returned staff capacity becomes real economic value: avoided hiring, more output, redeployment, or actual cost reduction?"><NumberInput value={input.valueCapturePct} onChange={(value) => update('valueCapturePct', value)} min={0} max={100} suffix="%" /></Field>
    <Field label="Avoidable error share" helper="What percentage of today's errors would this automation actually prevent?"><NumberInput value={input.avoidableErrorPct} onChange={(value) => update('avoidableErrorPct', value)} min={0} max={100} suffix="%" /></Field>
    <Field label="Process stability"><Select value={input.processStability} onChange={(value) => update('processStability', value as RoiProcessStability)}><option value="stable">Stable and understood</option><option value="mostly-stable">Mostly stable with known exceptions</option><option value="changing">Still changing materially</option></Select></Field>
    <Field label="How often rules change"><Select value={input.changeFrequency} onChange={(value) => update('changeFrequency', value as RoiChangeFrequency)}><option value="rare">A few times per year</option><option value="monthly">Monthly-ish</option><option value="weekly">Weekly</option><option value="daily">Constantly / daily</option></Select></Field>
    <Field label="Worst realistic failure"><Select value={input.failureImpact} onChange={(value) => update('failureImpact', value as RoiFailureImpact)}><option value="low">Low — easy to recover</option><option value="medium">Medium — manual recovery / delay</option><option value="high">High — customer, revenue or operating impact</option><option value="critical">Critical — money, legal, compliance or core state</option></Select></Field></div>
  </div>
}

function CostForm({ input, update }: { input: AutomationRoiInput; update: <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => void }) {
  const preview = useMemo(() => analyzeAutomationRoi(input), [input])
  return <div className="min-w-0 space-y-6">
    <StepHeader icon={WrenchIcon} eyebrow="Price the system you will own" title="What does build + maintenance cost?" body="A cheap subscription can still be expensive to operate. Include implementation, software and recurring ownership." />
    <div className="space-y-2"><Field label="One-time build cost"><NumberInput value={input.buildCost} onChange={(value) => update('buildCost', value)} min={0} step={100} /></Field>
    <Field label="Software / hosting per month"><NumberInput value={input.monthlySoftwareCost} onChange={(value) => update('monthlySoftwareCost', value)} min={0} step={10} /></Field>
    <Field label="Maintenance hours / month" helper="Updates, monitoring, failures, credentials, changing rules and small improvements."><NumberInput value={input.maintenanceHoursPerMonth} onChange={(value) => update('maintenanceHoursPerMonth', value)} min={0} step={0.5} suffix="hrs" /></Field>
    <Field label="Maintenance labor cost / hour"><NumberInput value={input.maintenanceHourlyCost} onChange={(value) => update('maintenanceHourlyCost', value)} min={0} step={1} /></Field></div>
    <div className="roi-live-read min-w-0 rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900"><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Live read</p><p className="mt-2 text-lg font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">{preview.dispositionLabel}</p><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Current confidence {preview.confidence}%. The final result also stress-tests a deliberately worse case.</p></div>
  </div>
}

function money(currency: RoiCurrency, value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="roi-metric min-w-0 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 break-words text-xl font-medium tracking-[-0.03em] text-zinc-950 [overflow-wrap:anywhere] dark:text-zinc-50">{value}</p>{detail ? <p className="mt-1 text-[11px] leading-4 text-zinc-500">{detail}</p> : null}</div>
}

function Result({ input }: { input: AutomationRoiInput }) {
  const result = useMemo(() => analyzeAutomationRoi(input), [input])
  const expected = result.expected
  const conservative = result.conservative
  const payback = expected.paybackMonths === null ? 'No payback' : `${expected.paybackMonths} mo`
  const roi = expected.firstYearRoiPct === null ? 'n/a' : `${expected.firstYearRoiPct}%`
  return <div className="min-w-0 space-y-10 pb-8">
    <header><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Automation investment decision · {result.score}/100</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">{result.dispositionLabel}</h2><p className="mt-4 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">{result.summary}</p><div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500"><span>Confidence {result.confidence}%</span><span>·</span><span>{result.baselineManualHours} baseline hours / month</span></div></header>

    <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Expected case</p><div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2"><Metric label="First-year net value" value={money(input.currency, expected.firstYearNetValue)} /><Metric label="Payback" value={payback} /><Metric label="Net hours returned / month" value={`${expected.netHoursReturned} hrs`} detail="After review and exception fallback." /><Metric label="First-year ROI" value={roi} /><Metric label="Monthly value after run cost" value={money(input.currency, expected.monthlyNetValue)} /><Metric label="12-month build ceiling" value={money(input.currency, expected.maxBuildCostFor12MonthPayback)} detail="Approx. maximum one-time build cost for 12-month payback under this expected case." /></div></section>

    <section className="min-w-0 rounded-2xl bg-zinc-950 p-5 text-white dark:bg-zinc-100 dark:text-zinc-950"><p className="text-xs font-medium uppercase tracking-[0.12em] opacity-60">Conservative stress case</p><div className="mt-4 grid min-w-0 gap-5 sm:grid-cols-2"><div className="min-w-0"><p className="text-xs opacity-60">First-year net</p><p className="mt-1 break-words text-xl font-medium [overflow-wrap:anywhere]">{money(input.currency, conservative.firstYearNetValue)}</p></div><div className="min-w-0"><p className="text-xs opacity-60">Payback</p><p className="mt-1 text-xl font-medium">{conservative.paybackMonths === null ? 'No payback' : `${conservative.paybackMonths} mo`}</p></div></div><p className="mt-4 text-xs leading-5 opacity-70">This case assumes lower automation coverage and value capture, more review and exceptions, plus higher build and recurring cost. It is a stress test, not a prediction.</p></section>

    <section><h3 className="text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">What creates the value</h3><div className="mt-4 space-y-3">{result.reasons.map((reason) => <p key={reason} className="rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">{reason}</p>)}</div></section>

    {result.risks.length ? <section><h3 className="text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">What could break the business case</h3><ul className="mt-4 space-y-3">{result.risks.map((risk) => <li key={risk} className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">• {risk}</li>)}</ul></section> : null}

    <section><h3 className="text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">Decision numbers</h3><div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2"><Metric label="Gross capacity value / month" value={money(input.currency, expected.grossCapacityValueMonthly)} detail="Value of time returned before value-capture discount." /><Metric label="Captured time value / month" value={money(input.currency, expected.capturedTimeValueMonthly)} /><Metric label="Avoided error value / month" value={money(input.currency, expected.avoidedErrorValueMonthly)} /><Metric label="Recurring ownership cost / month" value={money(input.currency, expected.recurringMonthlyCost)} /><Metric label="Exception cases / month" value={`${expected.exceptionCases}`} /><Metric label="Break-even volume" value={expected.breakEvenCasesPerMonth === null ? 'n/a' : `${expected.breakEvenCasesPerMonth} cases/mo`} /></div></section>

    <section><h3 className="text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">What to do next</h3><ol className="mt-4 space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.nextActions.map((action, index) => <li key={action}><span className="mr-2 font-mono text-[10px] text-zinc-400">{String(index + 1).padStart(2, '0')}</span>{action}</li>)}</ol>{result.disposition === 'automate-now' || result.disposition === 'pilot-first' ? <Link href="/automation-architecture-advisor" className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50">Choose the architecture next →</Link> : null}</section>
  </div>
}

export function AutomationRoiCalculator() {
  const [input, setInput] = useState<AutomationRoiInput>(DEFAULT_AUTOMATION_ROI_INPUT)
  const [page, setPage] = useState<PageId>('volume')
  const { rootRef, scrollToStart } = useStepScroll()
  const pages: PageId[] = ['volume', 'baseline', 'automation', 'risk', 'cost', 'result']
  const index = pages.indexOf(page)
  const answerSteps = pages.slice(0, -1) as Array<Exclude<PageId, 'result'>>
  const answerStepCount = answerSteps.length
  const progress = page === 'result' ? 100 : Math.round(((index + 1) / answerStepCount) * 100)
  const update = <K extends keyof AutomationRoiInput>(key: K, value: AutomationRoiInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const goTo = (nextPage: PageId) => { setPage(nextPage); scrollToStart() }
  const reset = () => { setInput(DEFAULT_AUTOMATION_ROI_INPUT); goTo('volume') }
  const next = () => goTo(pages[Math.min(pages.length - 1, index + 1)])
  const back = () => goTo(pages[Math.max(0, index - 1)])

  return <section ref={rootRef} className="roi-calculator scroll-mt-6 grid min-h-0 min-w-0 grid-rows-[auto_auto_auto] overflow-visible">
    <div className="roi-progress min-w-0 pb-5">
      <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">{answerSteps.map((step, stepIndex) => <span key={step} className={`h-1.5 rounded-full transition-colors duration-300 ${page === 'result' || stepIndex <= index ? 'bg-zinc-950 dark:bg-zinc-50' : 'bg-zinc-200 dark:bg-zinc-800'}`} />)}</div>
      <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-3"><span className="text-xs font-medium text-zinc-500">{page === 'result' ? 'Analysis complete' : `Step ${index + 1} of ${answerStepCount} · ${STEP_LABELS[page as Exclude<PageId, 'result'>]}`}</span><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button></div>
    </div>
    <div className="min-w-0 overflow-visible">{page === 'volume' ? <VolumeForm input={input} update={update} /> : null}{page === 'baseline' ? <BaselineForm input={input} update={update} /> : null}{page === 'automation' ? <AutomationForm input={input} update={update} /> : null}{page === 'risk' ? <RiskForm input={input} update={update} /> : null}{page === 'cost' ? <CostForm input={input} update={update} /> : null}{page === 'result' ? <Result input={input} /> : null}</div>
    <div className="tool-action-bar flex min-w-0 flex-wrap items-center justify-between gap-4 pt-4">{page !== 'result' ? <><button type="button" onClick={back} disabled={index === 0} className="tool-secondary-action inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-zinc-600 hover:text-zinc-950 disabled:invisible dark:text-zinc-400 dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Back</button><button type="button" onClick={next} className="tool-primary-action inline-flex min-h-12 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950">{page === 'cost' ? 'Calculate ROI' : 'Continue'}<ArrowRightIcon className="h-4 w-4" /></button></> : <button type="button" onClick={() => goTo('volume')} className="tool-secondary-action inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Edit assumptions</button>}</div>
  </section>
}
