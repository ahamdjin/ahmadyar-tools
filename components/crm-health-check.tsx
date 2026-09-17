'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, RotateCcwIcon, SearchIcon, XIcon } from 'lucide-react'

import { ToolResultActions } from '@/components/tool-result-actions'
import { APP_BY_ID, APP_CATALOG, type AppDefinition } from '@/engine/apps'
import { analyzeCrmHealth, DEFAULT_CRM_HEALTH_INPUT, type CrmHealthInput, type CrmHealthLevel } from '@/engine/crm-health'

type StepId = 'context' | 'truth' | 'operations' | 'result'

const STEPS: StepId[] = ['context', 'truth', 'operations', 'result']
const CRM_APPS = APP_CATALOG.filter((app) => app.category === 'crm')
const QUICK_STACK_IDS = ['facebook-leads', 'google-ads', 'linkedin-ads', 'typeform', 'calendly', 'gmail', 'outlook', 'slack', 'stripe', 'quickbooks', 'google-sheets', 'airtable', 'zapier', 'make', 'n8n', 'power-automate']
const QUICK_STACK = QUICK_STACK_IDS.map((id) => APP_BY_ID.get(id)).filter((app): app is AppDefinition => Boolean(app))

const LEVELS: Record<string, readonly [string, string, string, string]> = {
  capture: ['Manual / missing', 'Main sources connected', 'Important sources automated', 'Automated + verified'],
  duplicates: ['No control', 'Manual cleanup', 'Matching rules', 'Prevention + review'],
  data: ['Free-form / inconsistent', 'Some standards', 'Required by lifecycle', 'Validated + maintained'],
  source: ['Missing / overwritten', 'Partial source data', 'Consistent + preserved', 'Source through outcome'],
  pipeline: ['Messy / subjective', 'Basic stages', 'Clear entry / exit rules', 'Enforced + automated'],
  stale: ['No stale control', 'Manager cleanup', 'Automatically flagged', 'Age rules + action'],
  reporting: ['Exports needed', 'Basic dashboards', 'Mostly trusted', 'Leadership trusts CRM directly'],
  adoption: ['People avoid CRM', 'Mixed usage', 'Most work in CRM', 'Consistent operating behavior'],
  shadow: ['CRM is source of truth', 'A few side trackers', 'Important work duplicated', 'Multiple competing truths'],
  routing: ['Manual assignment', 'Basic rules', 'Context-aware rules', 'Capacity + exceptions'],
  fallback: ['No fallback', 'Manual checking', 'Fallback queue / owner', 'Fallback + SLA alert'],
  response: ['No measured target', 'Team expectation', 'Tracked target', 'Actively managed SLA'],
  followup: ['Memory / tasks', 'Basic reminders', 'Automated + stop rules', 'State-aware follow-up'],
  handoff: ['Manual handoff', 'Some setup automated', 'Context + owner transfer', 'Closed-loop handoff'],
  monitoring: ['Users find failures', 'Occasional checks', 'Failure alerts', 'Alerts + recovery process'],
  owner: ['No owner', 'Informal ownership', 'Named owner', 'Owner + change process'],
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100">{children}</select>
}

function LevelField({ label, helper, value, options, onChange }: { label: string; helper: string; value: CrmHealthLevel; options: readonly [string, string, string, string]; onChange: (value: CrmHealthLevel) => void }) {
  return (
    <div className="border-b border-zinc-200 py-5 last:border-b-0 dark:border-zinc-800">
      <div className="sm:grid sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-7">
        <div>
          <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{label}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:grid-cols-4">
          {options.map((option, index) => {
            const active = index === value
            return (
              <button key={option} type="button" onClick={() => onChange(index as CrmHealthLevel)} className={`min-h-14 rounded-xl px-2.5 py-2 text-left text-xs leading-4 transition-colors ${active ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-900'}`}>
                <span className="block font-mono text-[9px] opacity-60">{index}</span>
                <span className="mt-1 block font-medium">{option}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AppIcon({ app }: { app: AppDefinition }) {
  if (!app.icon) return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[9px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{app.name.slice(0, 2).toUpperCase()}</span>
  return <span aria-hidden="true" className="h-7 w-7 shrink-0 rounded-md bg-zinc-100 bg-[length:66%] bg-center bg-no-repeat dark:bg-zinc-900" style={{ backgroundImage: `url(https://cdn.simpleicons.org/${app.icon})` }} />
}

function StepIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">{eyebrow}</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">{title}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{body}</p></header>
}

function ContextStep({ input, setInput, update }: { input: CrmHealthInput; setInput: React.Dispatch<React.SetStateAction<CrmHealthInput>>; update: <K extends keyof CrmHealthInput>(key: K, value: CrmHealthInput[K]) => void }) {
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!term) return QUICK_STACK
    return APP_CATALOG.filter((app) => app.category !== 'crm' && `${app.name} ${app.vendor}`.toLowerCase().includes(term)).slice(0, 18)
  }, [term])
  const crm = input.crmId ? APP_BY_ID.get(input.crmId) : null
  const selectedApps = input.connectedApps.map((id) => APP_BY_ID.get(id)).filter((app): app is AppDefinition => Boolean(app))
  const toggleApp = (id: string) => setInput((current) => ({ ...current, connectedApps: current.connectedApps.includes(id) ? current.connectedApps.filter((item) => item !== id) : [...current.connectedApps, id] }))

  return (
    <div className="space-y-8">
      <StepIntro eyebrow="1 · Context" title="What system are we trying to trust?" body="A CRM health score is only useful when it reflects the real operating system around it. Start with the CRM, lead volume and the systems that create or depend on customer data." />
      <section>
        <p className="text-xs font-medium text-zinc-500">CRM / customer system of record</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CRM_APPS.map((app) => {
            const active = input.crmId === app.id
            return <button key={app.id} type="button" onClick={() => update('crmId', app.id)} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${active ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950' : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-900'}`}><AppIcon app={app} /><span className="min-w-0 truncate text-sm font-medium">{app.name}</span>{active ? <CheckIcon className="ml-auto h-3.5 w-3.5" /> : null}</button>
          })}
        </div>
      </section>

      {crm ? (
        <section className="grid gap-4 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-2 sm:p-5 dark:bg-zinc-900/55">
          <label><span className="text-xs font-medium text-zinc-500">New leads / month</span><Select value={input.monthlyLeads} onChange={(value) => update('monthlyLeads', Number(value))}><option value={50}>Under 100</option><option value={250}>100–500</option><option value={1000}>500–2,000</option><option value={5000}>2,000–10,000</option><option value={20000}>10,000+</option></Select></label>
          <label><span className="text-xs font-medium text-zinc-500">Sales reps / owners</span><Select value={input.salesReps} onChange={(value) => update('salesReps', Number(value))}><option value={1}>1</option><option value={3}>2–4</option><option value={8}>5–10</option><option value={20}>11–30</option><option value={50}>30+</option></Select></label>
        </section>
      ) : null}

      {crm ? (
        <section>
          <p className="text-xs font-medium text-zinc-500">What else touches leads or customers?</p>
          <label className="relative mt-3 block"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search forms, ads, email, billing, spreadsheets, automation…" className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white py-2 pl-10 pr-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100" /></label>
          {selectedApps.length ? <div className="mt-3 flex flex-wrap gap-2">{selectedApps.map((app) => <button key={app.id} type="button" onClick={() => toggleApp(app.id)} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"><AppIcon app={app} />{app.name}<XIcon className="h-3 w-3" /></button>)}</div> : null}
          <div className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">{searchResults.map((app) => { const active = input.connectedApps.includes(app.id); return <button key={app.id} type="button" onClick={() => toggleApp(app.id)} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors ${active ? 'bg-zinc-100 font-medium text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/60'}`}><AppIcon app={app} /><span className="truncate">{app.name}</span>{active ? <CheckIcon className="ml-auto h-3 w-3" /> : null}</button> })}</div>
        </section>
      ) : null}
    </div>
  )
}

function TruthStep({ input, update }: { input: CrmHealthInput; update: <K extends keyof CrmHealthInput>(key: K, value: CrmHealthInput[K]) => void }) {
  return (
    <div className="space-y-8">
      <StepIntro eyebrow="2 · Data truth" title="Can the CRM be trusted without a cleanup ritual?" body="This is the part teams feel first: duplicates, missing source data, subjective stages, stale opportunities and reports that need a spreadsheet rebuild before anyone believes them." />
      <section className="border-y border-zinc-200 dark:border-zinc-800">
        <LevelField label="Lead capture" helper="Do important sources create the right record with context?" value={input.captureCoverage} options={LEVELS.capture} onChange={(value) => update('captureCoverage', value)} />
        <LevelField label="Duplicate control" helper="Can the same person/company enter more than once and split history?" value={input.duplicateControl} options={LEVELS.duplicates} onChange={(value) => update('duplicateControl', value)} />
        <LevelField label="Required data" helper="Are the fields needed for the next lifecycle step actually controlled?" value={input.requiredData} options={LEVELS.data} onChange={(value) => update('requiredData', value)} />
        <LevelField label="Lead / acquisition source" helper="Can you preserve where a record came from through to outcome?" value={input.sourceTracking} options={LEVELS.source} onChange={(value) => update('sourceTracking', value)} />
        <LevelField label="Pipeline definitions" helper="Do stages mean the same thing to every rep and report?" value={input.pipelineDefinition} options={LEVELS.pipeline} onChange={(value) => update('pipelineDefinition', value)} />
        <LevelField label="Stale pipeline" helper="What happens when an opportunity sits too long?" value={input.stalePipelineControl} options={LEVELS.stale} onChange={(value) => update('stalePipelineControl', value)} />
        <LevelField label="Reporting trust" helper="Can leadership use CRM numbers without rebuilding them first?" value={input.reportingTrust} options={LEVELS.reporting} onChange={(value) => update('reportingTrust', value)} />
        <LevelField label="CRM adoption" helper="Does the real work happen in the CRM?" value={input.crmAdoption} options={LEVELS.adoption} onChange={(value) => update('crmAdoption', value)} />
        <LevelField label="Shadow systems" helper="How much important customer state lives in side spreadsheets or trackers?" value={input.shadowSystems} options={LEVELS.shadow} onChange={(value) => update('shadowSystems', value)} />
      </section>
    </div>
  )
}

function OperationsStep({ input, update }: { input: CrmHealthInput; update: <K extends keyof CrmHealthInput>(key: K, value: CrmHealthInput[K]) => void }) {
  return (
    <div className="space-y-8">
      <StepIntro eyebrow="3 · Revenue operations" title="Does the CRM create action, or just store records?" body="A clean database is not enough. Ownership, response, follow-up, handoffs and workflow recovery decide whether the CRM actually protects revenue and customer experience." />
      <section className="border-y border-zinc-200 dark:border-zinc-800">
        <LevelField label="Routing quality" helper="Does lead context determine the right eligible owner?" value={input.routingQuality} options={LEVELS.routing} onChange={(value) => update('routingQuality', value)} />
        <LevelField label="Unassigned fallback" helper="If no routing rule matches, does the record still get owned and surfaced?" value={input.unassignedProtection} options={LEVELS.fallback} onChange={(value) => update('unassignedProtection', value)} />
        <LevelField label="First-response discipline" helper="Is response time visible and managed rather than assumed?" value={input.responseDiscipline} options={LEVELS.response} onChange={(value) => update('responseDiscipline', value)} />
        <LevelField label="Follow-up" helper="Does outreach stop, adapt and hand off based on real state?" value={input.followupQuality} options={LEVELS.followup} onChange={(value) => update('followupQuality', value)} />
        <LevelField label="Closed-won handoff" helper="Does delivery receive the context, owner and prerequisites it needs?" value={input.handoffQuality} options={LEVELS.handoff} onChange={(value) => update('handoffQuality', value)} />
        <LevelField label="Workflow monitoring" helper="How quickly does someone know when automation stops doing its job?" value={input.workflowMonitoring} options={LEVELS.monitoring} onChange={(value) => update('workflowMonitoring', value)} />
        <LevelField label="Operating ownership" helper="Who owns CRM automation, changes and recovery?" value={input.operatingOwnership} options={LEVELS.owner} onChange={(value) => update('operatingOwnership', value)} />
      </section>
    </div>
  )
}

function Result({ input, onEdit }: { input: CrmHealthInput; onEdit: (step: StepId) => void }) {
  const result = useMemo(() => analyzeCrmHealth(input), [input])
  const topIssues = result.issues.slice(0, 3)
  const manualChecks = [
    'Check contact/company/deal associations for records linked to the wrong account or missing the relationship entirely.',
    'Check for duplicate or unused properties/fields that represent the same business concept in different ways.',
  ]

  return (
    <div className="space-y-10">
      <section className="rounded-[24px] bg-zinc-950 p-6 text-white sm:p-8 dark:bg-zinc-100 dark:text-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl"><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">CRM health</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">{result.label}</h2><p className="mt-4 text-sm leading-7 text-zinc-300 dark:text-zinc-700">{result.summary}</p></div>
          <div className="text-right"><p className="font-mono text-2xl font-medium">{result.score}/100</p><p className="text-xs text-zinc-400 dark:text-zinc-600">confidence {result.confidence}%</p></div>
        </div>
        <div className="mt-6"><ToolResultActions title={`${result.crmName} CRM health: ${result.label}`} summary={result.summary} details={topIssues.map((issue) => `${issue.title}: ${issue.fix}`)} /></div>
      </section>

      {topIssues.length ? (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Fix first</p><h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Repair the leaks in this order.</h3></div><button type="button" onClick={() => onEdit('truth')} className="text-xs font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-4">Edit audit</button></div>
          <div className="mt-5 space-y-3">{topIssues.map((issue, index) => <div key={issue.id} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase text-zinc-500">{String(index + 1).padStart(2, '0')} · {issue.severity}</p><h4 className="mt-1 text-base font-medium text-zinc-950 dark:text-zinc-50">{issue.title}</h4></div><span className="text-[10px] text-zinc-500">Owner: {issue.owner}</span></div><p className="mt-3 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{issue.why}</p><p className="mt-3 text-sm leading-6 text-zinc-800 dark:text-zinc-200"><span className="font-medium">Do:</span> {issue.fix}</p></div>)}</div>
        </section>
      ) : null}

      <section>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">30-day repair order</p>
        <div className="mt-4 border-y border-zinc-200 dark:border-zinc-800">{result.plan.map((item, index) => <div key={`${item.phase}-${item.title}`} className={`grid gap-2 py-4 sm:grid-cols-[70px_180px_1fr] ${index ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}><span className="font-mono text-[10px] uppercase text-zinc-500">{item.phase}</span><span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{item.title}</span><div><p className="text-xs leading-5 text-zinc-700 dark:text-zinc-300">{item.action}</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">{item.reason}</p></div></div>)}</div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Native-first moves</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.nativeMoves.slice(0, 4).map((item) => <li key={item}>• {item}</li>)}</ul></div>
        <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Verify manually before declaring the CRM clean</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{manualChecks.map((item) => <li key={item}>• {item}</li>)}</ul></div>
      </section>

      {result.strengths.length ? <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Already working</p><div className="mt-3 flex flex-wrap gap-2">{result.strengths.map((strength) => <span key={strength} className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{strength}</span>)}</div></section> : null}

      <details className="group rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-zinc-950 dark:text-zinc-50">Dimension detail<span className="text-xs font-normal text-zinc-500">See all 9 areas</span></summary>
        <div className="mt-5 grid gap-x-8 sm:grid-cols-2">{result.dimensions.map((dimension) => <div key={dimension.id} className="border-t border-zinc-200 py-3 dark:border-zinc-800"><div className="flex items-center justify-between gap-3"><span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{dimension.label}</span><span className="font-mono text-[10px] text-zinc-500">{dimension.score}/100</span></div><p className="mt-1 text-[11px] leading-4 text-zinc-500">{dimension.summary}</p></div>)}</div>
      </details>

      {result.warning ? <p className="rounded-xl border border-zinc-200 px-4 py-3 text-xs leading-5 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">{result.warning}</p> : null}
    </div>
  )
}

export function CrmHealthCheck() {
  const [input, setInput] = useState<CrmHealthInput>(DEFAULT_CRM_HEALTH_INPUT)
  const [step, setStep] = useState<StepId>('context')
  const index = STEPS.indexOf(step)
  const progress = step === 'result' ? 100 : Math.round(((index + 1) / 3) * 100)
  const canContinue = step !== 'context' || Boolean(input.crmId)
  const update = <K extends keyof CrmHealthInput>(key: K, value: CrmHealthInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const next = () => setStep(STEPS[Math.min(STEPS.length - 1, index + 1)])
  const back = () => setStep(STEPS[Math.max(0, index - 1)])
  const reset = () => { setInput(DEFAULT_CRM_HEALTH_INPUT); setStep('context') }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-8 rounded-2xl bg-zinc-50 p-4 sm:p-5 dark:bg-zinc-900/55"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">A repair audit, not a vanity score.</p><p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">About 3 minutes. You get the first leaks to fix, a repair order, native-first actions and the areas that still need manual inspection.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500"><span>{step === 'result' ? 'Audit complete' : `Step ${index + 1} of 3`}</span><span>{progress}%</span></div></div>

      <div className="min-h-[500px]">{step === 'context' ? <ContextStep input={input} setInput={setInput} update={update} /> : null}{step === 'truth' ? <TruthStep input={input} update={update} /> : null}{step === 'operations' ? <OperationsStep input={input} update={update} /> : null}{step === 'result' ? <Result input={input} onEdit={setStep} /> : null}</div>

      {step !== 'result' ? <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={back} disabled={index === 0} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-zinc-600 disabled:invisible dark:text-zinc-400"><ArrowLeftIcon className="h-4 w-4" />Back</button><button type="button" onClick={next} disabled={!canContinue} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-35 dark:bg-zinc-50 dark:text-zinc-950">{step === 'operations' ? 'See repair plan' : 'Continue'}<ArrowRightIcon className="h-4 w-4" /></button></div> : <div className="mt-10 border-t border-zinc-200 pt-5 dark:border-zinc-800"><button type="button" onClick={() => setStep('context')} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"><ArrowLeftIcon className="h-4 w-4" />Edit audit</button></div>}
    </section>
  )
}
