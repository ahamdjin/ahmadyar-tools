'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, PlusIcon, RotateCcwIcon, SearchIcon, XIcon } from 'lucide-react'

import { APP_BY_ID, APP_CATALOG, APP_CATEGORY_LABELS, type AppDefinition } from '@/engine/apps'
import { analyzeCrmHealth, DEFAULT_CRM_HEALTH_INPUT, type CrmHealthInput, type CrmHealthLevel } from '@/engine/crm-health'

type PageId = 'systems' | 'foundation' | 'sales' | 'operations' | 'result'

const CRM_APPS = APP_CATALOG.filter((app) => app.category === 'crm')
const QUICK_STACK_IDS = ['facebook-leads', 'meta-ads', 'google-ads', 'typeform', 'jotform', 'calendly', 'gmail', 'outlook', 'slack', 'microsoft-teams', 'stripe', 'quickbooks', 'google-sheets', 'airtable', 'zapier', 'make', 'n8n', 'power-automate']
const QUICK_STACK = QUICK_STACK_IDS.map((id) => APP_BY_ID.get(id)).filter((app): app is AppDefinition => Boolean(app))

const LEVEL_OPTIONS: Record<string, Array<{ value: CrmHealthLevel; label: string; detail?: string }>> = {
  capture: [
    { value: 0, label: 'Mostly manual', detail: 'People copy/import leads or important sources can be missed.' },
    { value: 1, label: 'Main sources are connected', detail: 'The biggest channels enter automatically, but not consistently.' },
    { value: 2, label: 'Important sources are automated', detail: 'Most leads create/update the right CRM record with context.' },
    { value: 3, label: 'Automated and verified', detail: 'Coverage is monitored and exceptions are visible.' },
  ],
  duplicates: [
    { value: 0, label: 'No real duplicate control' },
    { value: 1, label: 'People merge duplicates when noticed' },
    { value: 2, label: 'Matching / duplicate rules exist' },
    { value: 3, label: 'Prevention + normalization + review' },
  ],
  data: [
    { value: 0, label: 'Fields are inconsistent / mostly free-form' },
    { value: 1, label: 'A few important fields are standard' },
    { value: 2, label: 'Required data is defined by lifecycle point' },
    { value: 3, label: 'Validated, normalized and maintained' },
  ],
  source: [
    { value: 0, label: 'Source is often missing or overwritten' },
    { value: 1, label: 'Basic source exists on some leads' },
    { value: 2, label: 'Source is consistently captured and preserved' },
    { value: 3, label: 'Source + campaign/context carry through to outcome' },
  ],
  routing: [
    { value: 0, label: 'Manual assignment' },
    { value: 1, label: 'Basic rules / round robin' },
    { value: 2, label: 'Clear rules using real lead context' },
    { value: 3, label: 'Rules + capacity/availability + exceptions' },
  ],
  fallback: [
    { value: 0, label: 'No fallback — unassigned can sit unnoticed' },
    { value: 1, label: 'Someone checks manually' },
    { value: 2, label: 'Fallback owner/queue exists' },
    { value: 3, label: 'Fallback + alert/SLA on unassigned records' },
  ],
  response: [
    { value: 0, label: 'No measured response target' },
    { value: 1, label: 'Team expectation, but not enforced' },
    { value: 2, label: 'Target is tracked with reminders / alerts' },
    { value: 3, label: 'Response SLA is visible and actively managed' },
  ],
  followup: [
    { value: 0, label: 'Mostly memory and manual tasks' },
    { value: 1, label: 'Some reminders / simple sequences' },
    { value: 2, label: 'Standard follow-up is automated with stop rules' },
    { value: 3, label: 'Follow-up adapts to reply, booking, stage and qualification' },
  ],
  pipeline: [
    { value: 0, label: 'Stages are messy or subjective' },
    { value: 1, label: 'Basic stages, but people use them differently' },
    { value: 2, label: 'Stages have clear entry/exit meaning' },
    { value: 3, label: 'Definitions are enforced and drive automation/reporting' },
  ],
  stale: [
    { value: 0, label: 'Old opportunities stay open indefinitely' },
    { value: 1, label: 'Managers clean them up manually' },
    { value: 2, label: 'Stale records are flagged automatically' },
    { value: 3, label: 'Stage-age rules trigger action, review or closure' },
  ],
  handoff: [
    { value: 0, label: 'Won deals are handed off manually' },
    { value: 1, label: 'Some notifications / setup happen automatically' },
    { value: 2, label: 'Context + owner + standard setup transfer automatically' },
    { value: 3, label: 'Closed-loop handoff with missing-item checks and status back to CRM' },
  ],
  reporting: [
    { value: 0, label: 'We export/clean data before trusting it' },
    { value: 1, label: 'Basic dashboards exist, but questions remain' },
    { value: 2, label: 'Source, owner, stage and outcomes are mostly trusted' },
    { value: 3, label: 'Leadership uses CRM reporting directly for decisions' },
  ],
  monitoring: [
    { value: 0, label: 'We usually learn about failures from users/customers' },
    { value: 1, label: 'Someone checks failed workflows occasionally' },
    { value: 2, label: 'Failures alert an owner' },
    { value: 3, label: 'Alerts + retry/recovery process + regular review' },
  ],
  ownership: [
    { value: 0, label: 'Nobody clearly owns CRM automation' },
    { value: 1, label: 'Shared / informal ownership' },
    { value: 2, label: 'One named owner is accountable' },
    { value: 3, label: 'Named owner + change/review process' },
  ],
  adoption: [
    { value: 0, label: 'People avoid the CRM when they can' },
    { value: 1, label: 'Usage is mixed / inconsistent' },
    { value: 2, label: 'Most work happens in the CRM' },
    { value: 3, label: 'CRM behavior is consistent enough to trust operationally' },
  ],
  shadow: [
    { value: 0, label: 'CRM is the clear source of truth' },
    { value: 1, label: 'A few side spreadsheets / trackers exist' },
    { value: 2, label: 'Important work is duplicated outside the CRM' },
    { value: 3, label: 'Multiple competing sources of truth' },
  ],
}

function AppIcon({ app }: { app: AppDefinition }) {
  if (!app.icon) return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{app.name.slice(0, 2).toUpperCase()}</span>
  return <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-md bg-zinc-100 bg-[length:66%] bg-center bg-no-repeat dark:bg-zinc-900" style={{ backgroundImage: `url(https://cdn.simpleicons.org/${app.icon})` }} />
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100">{children}</select>
}

function LevelField({ label, helper, value, options, onChange }: { label: string; helper: string; value: CrmHealthLevel; options: Array<{ value: CrmHealthLevel; label: string; detail?: string }>; onChange: (value: CrmHealthLevel) => void }) {
  return (
    <fieldset className="py-5 sm:grid sm:grid-cols-[250px_1fr] sm:gap-8">
      <legend className="contents">
        <span className="block text-[15px] font-medium text-zinc-950 dark:text-zinc-50">{label}</span>
      </legend>
      <div className="mt-1 sm:mt-0">
        <p className="mb-3 text-xs leading-5 text-zinc-500 sm:hidden">{helper}</p>
        <div className="grid gap-2">
          {options.map((option) => {
            const active = option.value === value
            return (
              <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`flex min-h-12 items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${active ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'}`}>
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'}`}>{active ? <CheckIcon className="h-3 w-3" /> : null}</span>
                <span><span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{option.label}</span>{option.detail ? <span className="mt-0.5 block text-xs leading-5 text-zinc-500">{option.detail}</span> : null}</span>
              </button>
            )
          })}
        </div>
      </div>
      <p className="hidden max-w-[230px] text-xs leading-5 text-zinc-500 sm:col-start-1 sm:row-start-1 sm:mt-7 sm:block">{helper}</p>
    </fieldset>
  )
}

function SystemsPage({ input, setInput }: { input: CrmHealthInput; setInput: React.Dispatch<React.SetStateAction<CrmHealthInput>> }) {
  const [query, setQuery] = useState('')
  const [customName, setCustomName] = useState('')
  const crm = input.crmId ? APP_BY_ID.get(input.crmId) : null
  const term = query.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!term) return QUICK_STACK
    return APP_CATALOG.filter((app) => app.category !== 'crm' && `${app.name} ${app.vendor} ${APP_CATEGORY_LABELS[app.category]}`.toLowerCase().includes(term)).slice(0, 24)
  }, [term])

  const toggleApp = (id: string) => setInput((current) => ({ ...current, connectedApps: current.connectedApps.includes(id) ? current.connectedApps.filter((item) => item !== id) : [...current.connectedApps, id] }))
  const addCustom = () => {
    const value = customName.trim()
    if (!value) return
    setInput((current) => current.customSystems.some((item) => item.toLowerCase() === value.toLowerCase()) ? current : { ...current, customSystems: [...current.customSystems, value] })
    setCustomName('')
  }

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Start with the system you actually run.</p>
        <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">What CRM owns the customer record?</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">The audit changes based on the CRM and the systems feeding or reading it. Pick the real stack first so I can skip generic questions.</p>
      </header>

      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">CRM</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CRM_APPS.map((app) => {
            const active = app.id === input.crmId
            return <button key={app.id} type="button" onClick={() => setInput((current) => ({ ...current, crmId: app.id }))} className={`flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${active ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'}`}><AppIcon app={app} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">{app.name}</span><span className="block text-xs text-zinc-500">Native automation {app.nativeAutomation >= 85 ? 'strong' : app.nativeAutomation >= 65 ? 'good' : 'lighter'}</span></span><span className={`h-5 w-5 rounded-full border ${active ? 'border-zinc-950 bg-zinc-950 dark:border-zinc-50 dark:bg-zinc-50' : 'border-zinc-300 dark:border-zinc-700'}`} /></button>
          })}
        </div>
      </section>

      {crm ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">What else touches leads or customers?</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Forms, ads, inboxes, calendars, spreadsheets, billing, support, automation platforms—anything that creates, updates or depends on CRM data.</p>
          </div>
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 140+ systems…" className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white py-2 pl-10 pr-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100" />
          </label>
          {input.connectedApps.length ? <div className="flex flex-wrap gap-2">{input.connectedApps.map((id) => APP_BY_ID.get(id)).filter((app): app is AppDefinition => Boolean(app)).map((app) => <button key={app.id} type="button" onClick={() => toggleApp(app.id)} className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">{app.name}<XIcon className="h-3 w-3" /></button>)}</div> : null}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((app) => {
              const active = input.connectedApps.includes(app.id)
              return <button key={app.id} type="button" onClick={() => toggleApp(app.id)} className={`flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${active ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'}`}><AppIcon app={app} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">{app.name}</span><span className="block text-xs text-zinc-500">{APP_CATEGORY_LABELS[app.category]}</span></span>{active ? <CheckIcon className="h-4 w-4" /> : null}</button>
            })}
          </div>
        </section>
      ) : null}

      {crm ? (
        <section className="grid gap-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/50 sm:grid-cols-[1fr_190px]">
          <div>
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Internal or niche system missing?</p>
            <div className="mt-3 flex gap-2"><input value={customName} onChange={(event) => setCustomName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustom() } }} placeholder="e.g. internal quoting app" className="min-h-11 min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-100" /><button type="button" onClick={addCustom} className="inline-flex items-center gap-1 rounded-xl bg-zinc-950 px-3 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950"><PlusIcon className="h-4 w-4" />Add</button></div>
            {input.customSystems.length ? <div className="mt-2 flex flex-wrap gap-2">{input.customSystems.map((name) => <button key={name} type="button" onClick={() => setInput((current) => ({ ...current, customSystems: current.customSystems.filter((item) => item !== name) }))} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs dark:bg-zinc-950">{name}<XIcon className="h-3 w-3" /></button>)}</div> : null}
          </div>
          <div><p className="mb-2 text-xs text-zinc-500">Other unlisted systems</p><Select value={input.otherSystemsCount} onChange={(value) => setInput((current) => ({ ...current, otherSystemsCount: Number(value) }))}><option value={0}>None</option><option value={1}>1</option><option value={3}>2–3</option><option value={6}>4–6</option><option value={10}>7+</option></Select></div>
        </section>
      ) : null}

      {crm ? <div className="rounded-2xl bg-zinc-950 p-5 text-white dark:bg-zinc-100 dark:text-zinc-950"><p className="text-xs uppercase tracking-[0.12em] opacity-55">Audit is now tailored</p><p className="mt-2 text-lg font-medium">{crm.name} + {input.connectedApps.length + input.customSystems.length + input.otherSystemsCount} surrounding systems</p><p className="mt-2 max-w-2xl text-sm leading-6 opacity-70">I’ll check the revenue path, not just whether automations exist: capture → identity → ownership → response → pipeline → handoff → reporting → failure handling.</p></div> : null}
    </div>
  )
}

function FoundationPage({ input, update }: { input: CrmHealthInput; update: <K extends keyof CrmHealthInput>(key: K, value: CrmHealthInput[K]) => void }) {
  return <div><header className="mb-4 max-w-2xl"><h2 className="text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Can you trust what enters the CRM?</h2><p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Bad routing and bad reporting usually start as a capture or identity problem.</p></header><LevelField label="Lead capture coverage" helper="Think about every source that matters, not only your website form." value={input.captureCoverage} options={LEVEL_OPTIONS.capture} onChange={(value) => update('captureCoverage', value)} /><LevelField label="Duplicate control" helper="Can one person become several CRM records or get followed up twice?" value={input.duplicateControl} options={LEVEL_OPTIONS.duplicates} onChange={(value) => update('duplicateControl', value)} /><LevelField label="Required / normalized data" helper="Do downstream rules get the fields they actually need in a consistent format?" value={input.requiredData} options={LEVEL_OPTIONS.data} onChange={(value) => update('requiredData', value)} /><LevelField label="Source & campaign tracking" helper="Can you trace a lead from acquisition context to outcome without rebuilding it in a spreadsheet?" value={input.sourceTracking} options={LEVEL_OPTIONS.source} onChange={(value) => update('sourceTracking', value)} /></div>
}

function SalesPage({ input, update }: { input: CrmHealthInput; update: <K extends keyof CrmHealthInput>(key: K, value: CrmHealthInput[K]) => void }) {
  return <div><header className="mb-5 max-w-2xl"><h2 className="text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Does every good lead get handled?</h2><p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">This is where a working CRM becomes a revenue system—or quietly leaks.</p></header><div className="grid gap-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/50 sm:grid-cols-2"><div><p className="mb-2 text-xs text-zinc-500">Leads per month</p><Select value={input.monthlyLeads} onChange={(value) => update('monthlyLeads', Number(value))}><option value={50}>Under 100</option><option value={250}>100–500</option><option value={1000}>500–2,000</option><option value={5000}>2,000–10,000</option><option value={20000}>10,000+</option></Select></div><div><p className="mb-2 text-xs text-zinc-500">People receiving / working leads</p><Select value={input.salesReps} onChange={(value) => update('salesReps', Number(value))}><option value={1}>1</option><option value={3}>2–4</option><option value={8}>5–10</option><option value={20}>11–30</option><option value={50}>30+</option></Select></div></div><LevelField label="Routing quality" helper="How reliably does the right lead reach the right owner?" value={input.routingQuality} options={LEVEL_OPTIONS.routing} onChange={(value) => update('routingQuality', value)} /><LevelField label="Unassigned protection" helper="What happens when no routing rule matches or an owner is unavailable?" value={input.unassignedProtection} options={LEVEL_OPTIONS.fallback} onChange={(value) => update('unassignedProtection', value)} /><LevelField label="First-response discipline" helper="A target only matters if the system makes misses visible." value={input.responseDiscipline} options={LEVEL_OPTIONS.response} onChange={(value) => update('responseDiscipline', value)} /><LevelField label="Follow-up quality" helper="Check the normal sequence and the stop rules when the lead replies/books/converts." value={input.followupQuality} options={LEVEL_OPTIONS.followup} onChange={(value) => update('followupQuality', value)} /></div>
}

function OperationsPage({ input, update }: { input: CrmHealthInput; update: <K extends keyof CrmHealthInput>(key: K, value: CrmHealthInput[K]) => void }) {
  return <div><header className="mb-4 max-w-2xl"><h2 className="text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Can the CRM run the process without babysitting?</h2><p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">The last checks are about truth, handoff and what happens when automation fails.</p></header><LevelField label="Pipeline definitions" helper="Would two reps move the same opportunity through stages the same way?" value={input.pipelineDefinition} options={LEVEL_OPTIONS.pipeline} onChange={(value) => update('pipelineDefinition', value)} /><LevelField label="Stale pipeline control" helper="Are old deals automatically surfaced before the pipeline becomes fiction?" value={input.stalePipelineControl} options={LEVEL_OPTIONS.stale} onChange={(value) => update('stalePipelineControl', value)} /><LevelField label="Won-deal handoff" helper="How much context/setup gets recreated manually after sales closes the deal?" value={input.handoffQuality} options={LEVEL_OPTIONS.handoff} onChange={(value) => update('handoffQuality', value)} /><LevelField label="Reporting trust" helper="Can leadership use CRM numbers without exporting and cleaning them first?" value={input.reportingTrust} options={LEVEL_OPTIONS.reporting} onChange={(value) => update('reportingTrust', value)} /><LevelField label="Automation monitoring" helper="How quickly would you know a lead-routing or follow-up workflow stopped working?" value={input.workflowMonitoring} options={LEVEL_OPTIONS.monitoring} onChange={(value) => update('workflowMonitoring', value)} /><LevelField label="Operating ownership" helper="Who is accountable for failures, changes and cleanup—not just building workflows?" value={input.operatingOwnership} options={LEVEL_OPTIONS.ownership} onChange={(value) => update('operatingOwnership', value)} /><LevelField label="CRM adoption" helper="Does the team actually use the CRM as the operating system for sales?" value={input.crmAdoption} options={LEVEL_OPTIONS.adoption} onChange={(value) => update('crmAdoption', value)} /><LevelField label="Shadow systems" helper="How much important work exists in spreadsheets/private trackers that duplicate CRM state?" value={input.shadowSystems} options={LEVEL_OPTIONS.shadow} onChange={(value) => update('shadowSystems', value)} /></div>
}

function ResultPage({ input, onEdit }: { input: CrmHealthInput; onEdit: (page: PageId) => void }) {
  const result = useMemo(() => analyzeCrmHealth(input), [input])
  return (
    <div className="space-y-10 pb-4">
      <section className="grid gap-7 lg:grid-cols-[1fr_260px] lg:items-start"><div><p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">CRM automation health</p><div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2"><h2 className="text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">{result.label}</h2><span className="font-mono text-2xl font-medium text-zinc-950 dark:text-zinc-50">{result.score}/100</span></div><p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{result.summary}</p><div className="mt-5 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900"><p className="text-xs text-zinc-500">Recommended operating architecture</p><p className="mt-1 text-base font-medium text-zinc-950 dark:text-zinc-50">{result.architecture}</p>{result.warning ? <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.warning}</p> : null}</div></div><div className="rounded-2xl bg-zinc-950 p-5 text-white dark:bg-zinc-100 dark:text-zinc-950"><p className="text-xs uppercase tracking-[0.12em] opacity-55">Confidence</p><p className="mt-2 font-mono text-3xl font-medium">{result.confidence}%</p><p className="mt-3 text-xs leading-5 opacity-65">Based on your CRM, stack, lead volume, sales ownership and operating controls.</p><button type="button" onClick={() => onEdit('systems')} className="mt-5 text-xs font-medium underline underline-offset-4">Edit stack</button></div></section>

      <section><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Where the system is weak</p><h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Fix the leaks in this order.</h3></div></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{result.issues.slice(0, 6).map((item, index) => <article key={item.id} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/60"><div className="flex items-center justify-between gap-3"><span className="font-mono text-[10px] text-zinc-500">{String(index + 1).padStart(2, '0')} · {item.severity}</span><span className="font-mono text-xs text-zinc-500">impact {item.impact}</span></div><h4 className="mt-3 text-base font-medium text-zinc-950 dark:text-zinc-50">{item.title}</h4><p className="mt-2 text-xs leading-5 text-zinc-500">{item.why}</p><p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{item.fix}</p><p className="mt-3 text-xs text-zinc-500">Owner: {item.owner}</p></article>)}</div></section>

      <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Health by system</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{result.dimensions.map((dimension) => <div key={dimension.id} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/60"><div className="flex items-baseline justify-between gap-3"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{dimension.label}</p><span className="font-mono text-sm">{dimension.score}</span></div><div className="mt-3 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 dark:bg-zinc-50" style={{ width: `${dimension.score}%` }} /></div><p className="mt-3 text-xs leading-5 text-zinc-500">{dimension.summary}</p></div>)}</div></section>

      <section className="grid gap-8 lg:grid-cols-2"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">30-day repair plan</p><div className="mt-4 space-y-3">{result.plan.map((item) => <div key={`${item.phase}-${item.title}`} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/60"><span className="text-xs font-medium text-zinc-500">{item.phase}</span><h4 className="mt-1 text-sm font-medium text-zinc-950 dark:text-zinc-50">{item.title}</h4><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.action}</p></div>)}</div></div><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Keep native where it wins</p><div className="mt-4 space-y-3">{result.nativeMoves.map((move) => <p key={move} className="rounded-2xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">{move}</p>)}</div>{result.strengths.length ? <><p className="mt-7 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Already healthy</p><div className="mt-3 space-y-2">{result.strengths.map((strength) => <p key={strength} className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">✓ {strength}</p>)}</div></> : null}</div></section>
    </div>
  )
}

export function CrmHealthCheck() {
  const [input, setInput] = useState<CrmHealthInput>(DEFAULT_CRM_HEALTH_INPUT)
  const [page, setPage] = useState<PageId>('systems')
  const pages: PageId[] = ['systems', 'foundation', 'sales', 'operations', 'result']
  const index = pages.indexOf(page)
  const progress = Math.max(6, Math.round((index / (pages.length - 1)) * 100))
  const update = <K extends keyof CrmHealthInput>(key: K, value: CrmHealthInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const reset = () => { setInput(DEFAULT_CRM_HEALTH_INPUT); setPage('systems') }
  const canContinue = page !== 'systems' || Boolean(input.crmId)

  return (
    <section className="crm-health-check flex h-full min-h-0 w-full max-w-[1120px] flex-col">
      <div className="flex-none pb-3"><div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${progress}%` }} /></div><div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs font-medium text-zinc-500">{page === 'result' ? 'Health check complete' : `${progress}% complete`}</span><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button></div></div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 scrollbar-thin">{page === 'systems' ? <SystemsPage input={input} setInput={setInput} /> : null}{page === 'foundation' ? <FoundationPage input={input} update={update} /> : null}{page === 'sales' ? <SalesPage input={input} update={update} /> : null}{page === 'operations' ? <OperationsPage input={input} update={update} /> : null}{page === 'result' ? <ResultPage input={input} onEdit={setPage} /> : null}</div>
      <div className="flex flex-none items-center justify-between gap-4 pt-3">{page !== 'result' ? <><button type="button" onClick={() => setPage(pages[Math.max(0, index - 1)])} disabled={index === 0} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-zinc-500 hover:text-zinc-950 disabled:invisible dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Back</button><button type="button" onClick={() => setPage(pages[Math.min(pages.length - 1, index + 1)])} disabled={!canContinue} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-zinc-50 dark:text-zinc-950">Continue<ArrowRightIcon className="h-4 w-4" /></button></> : <button type="button" onClick={() => setPage('systems')} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Edit answers</button>}</div>
    </section>
  )
}
