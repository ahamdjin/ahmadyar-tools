'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, RotateCcwIcon } from 'lucide-react'

import { APP_BY_ID, APP_CATALOG, type AppCategory, type AppDefinition } from '@/engine/apps'
import {
  analyzeOnboarding,
  DEFAULT_ONBOARDING_INPUT,
  type OnboardingInput,
  type OnboardingLevel,
  type TriggerMode,
} from '@/engine/onboarding'

type PageId = 'systems' | 'trigger' | 'setup' | 'reliability' | 'result'

type RoleDefinition = {
  key: keyof Pick<OnboardingInput, 'crmId' | 'contractAppId' | 'billingAppId' | 'projectAppId' | 'intakeAppId' | 'communicationAppId' | 'fileAppId'>
  label: string
  helper: string
  categories: AppCategory[]
  required?: boolean
}

const SYSTEM_ROLES: RoleDefinition[] = [
  { key: 'crmId', label: 'CRM / source of truth', helper: 'Where the deal and client record live.', categories: ['crm'], required: true },
  { key: 'contractAppId', label: 'Contract / signature', helper: 'Optional. The system that knows when the agreement is complete.', categories: ['documents'] },
  { key: 'billingAppId', label: 'Payment / billing', helper: 'Optional. The system that owns payment state.', categories: ['finance', 'commerce'] },
  { key: 'projectAppId', label: 'Delivery workspace', helper: 'Where projects, tasks, dates and delivery ownership live.', categories: ['project'] },
  { key: 'intakeAppId', label: 'Client intake', helper: 'Form or system used to collect delivery information.', categories: ['forms', 'project', 'crm'] },
  { key: 'communicationAppId', label: 'Client communication', helper: 'Primary welcome / onboarding communication channel.', categories: ['communication', 'crm'] },
  { key: 'fileAppId', label: 'Files / assets', helper: 'Where client assets and working files should live.', categories: ['documents', 'project'] },
]

const LEVEL_COPY: Record<string, Array<{ value: OnboardingLevel; label: string; detail: string }>> = {
  repeatability: [
    { value: 0, label: 'Every client is different', detail: 'The process changes materially each time.' },
    { value: 1, label: 'Some common steps', detail: 'A loose process exists, but exceptions dominate.' },
    { value: 2, label: 'Mostly repeatable', detail: 'A few service variants cover most clients.' },
    { value: 3, label: 'Standardized', detail: 'Clear service families, gates, owners and templates.' },
  ],
  handoff: [
    { value: 0, label: 'Sales explains it manually', detail: 'Scope and promises can live in calls or messages.' },
    { value: 1, label: 'Some fields / notes transfer', detail: 'Delivery still asks for missing context.' },
    { value: 2, label: 'Required handoff fields exist', detail: 'Delivery gets scope, contacts, dates and commercial context.' },
    { value: 3, label: 'Validated handoff payload', detail: 'Missing required context blocks readiness.' },
  ],
  intake: [
    { value: 0, label: 'Mostly email / chat', detail: 'Information arrives in different places and formats.' },
    { value: 1, label: 'One basic form', detail: 'Useful, but not matched to service requirements.' },
    { value: 2, label: 'Structured by service', detail: 'Known data is prefilled and required inputs are clear.' },
    { value: 3, label: 'Validated and adaptive', detail: 'Questions change by service and missing information is visible.' },
  ],
  tracking: [
    { value: 0, label: 'People chase it manually', detail: 'Missing items are buried in messages.' },
    { value: 1, label: 'A checklist exists', detail: 'Someone still has to watch it.' },
    { value: 2, label: 'Owned checklist + reminders', detail: 'Every required item has status and accountability.' },
    { value: 3, label: 'Verified readiness gate', detail: 'Required access is checked before delivery can start.' },
  ],
  template: [
    { value: 0, label: 'Built from scratch', detail: 'Projects and tasks are recreated manually.' },
    { value: 1, label: 'Copied from an old project', detail: 'Some consistency, but easy to drift.' },
    { value: 2, label: 'Service templates', detail: 'Tasks, roles and relative dates are standardized.' },
    { value: 3, label: 'Governed templates', detail: 'Templates have owners, versioning and controlled exceptions.' },
  ],
  communication: [
    { value: 0, label: 'Manual each time', detail: 'Welcome and expectations depend on memory.' },
    { value: 1, label: 'Template message', detail: 'Consistent copy, but manually initiated.' },
    { value: 2, label: 'Triggered automatically', detail: 'Welcome is personalized from source data.' },
    { value: 3, label: 'State-aware communication', detail: 'Messages change based on missing items and readiness.' },
  ],
  kickoff: [
    { value: 0, label: 'Booked ad hoc', detail: 'Kickoff can happen before prerequisites are complete.' },
    { value: 1, label: 'Scheduling link sent', detail: 'Simple, but not tied to readiness.' },
    { value: 2, label: 'Scheduled after prerequisites', detail: 'Kickoff timing respects intake and access.' },
    { value: 3, label: 'Readiness-aware scheduling', detail: 'Reschedules, owners and service rules are handled explicitly.' },
  ],
  owner: [
    { value: 0, label: 'No clear owner', detail: 'Everyone helps, so nobody owns the finish line.' },
    { value: 1, label: 'Someone usually takes it', detail: 'Ownership is informal.' },
    { value: 2, label: 'One owner assigned', detail: 'Accountability is explicit from the start.' },
    { value: 3, label: 'Owner + backup + SLA', detail: 'Coverage and escalation are defined.' },
  ],
  reminders: [
    { value: 0, label: 'Manual chasing', detail: 'Follow-up depends on memory.' },
    { value: 1, label: 'Basic reminders', detail: 'Some nudges exist.' },
    { value: 2, label: 'Missing-item reminders', detail: 'Reminders stop automatically when complete.' },
    { value: 3, label: 'Escalation by age / risk', detail: 'Different blockers trigger different actions.' },
  ],
  gate: [
    { value: 0, label: 'No formal ready state', detail: 'Sold and ready-for-delivery mean the same thing.' },
    { value: 1, label: 'People know what ready means', detail: 'The rule is not enforced in systems.' },
    { value: 2, label: 'Explicit readiness checklist', detail: 'Required conditions are visible.' },
    { value: 3, label: 'System-enforced readiness', detail: 'Delivery cannot start until required gates pass.' },
  ],
  duplicate: [
    { value: 0, label: 'Not considered', detail: 'Repeated events could create duplicate projects/messages.' },
    { value: 1, label: 'People notice duplicates', detail: 'Recovery is manual.' },
    { value: 2, label: 'Stable key / duplicate check', detail: 'Creation actions are guarded.' },
    { value: 3, label: 'Idempotent + resumable', detail: 'Retries safely continue from recorded state.' },
  ],
  exceptions: [
    { value: 0, label: 'Handled in chat', detail: 'The happy path is automated; unusual cases disappear.' },
    { value: 1, label: 'Manual exception list', detail: 'Someone tracks problems separately.' },
    { value: 2, label: 'Visible exception queue', detail: 'Reason, owner and next action are explicit.' },
    { value: 3, label: 'Resumable exception workflow', detail: 'Resolved cases continue from the correct point.' },
  ],
  monitoring: [
    { value: 0, label: 'We find out from people', detail: 'Failures are silent.' },
    { value: 1, label: 'Logs checked sometimes', detail: 'Reactive monitoring.' },
    { value: 2, label: 'Critical failures alert an owner', detail: 'Someone knows when setup fails.' },
    { value: 3, label: 'Alerts + reconciliation', detail: 'Missing projects/status mismatches are detected proactively.' },
  ],
}

function AppIcon({ app }: { app: AppDefinition }) {
  if (!app.icon) return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{app.name.slice(0, 2).toUpperCase()}</span>
  return <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-md bg-zinc-100 bg-[length:66%] bg-center bg-no-repeat dark:bg-zinc-900" style={{ backgroundImage: `url(https://cdn.simpleicons.org/${app.icon})` }} />
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100">{children}</select>
}

function SystemRole({ role, value, onChange }: { role: RoleDefinition; value: string | null; onChange: (value: string | null) => void }) {
  const apps = APP_CATALOG.filter((app) => role.categories.includes(app.category)).sort((a, b) => b.nativeAutomation - a.nativeAutomation || a.name.localeCompare(b.name))
  const selected = value ? APP_BY_ID.get(value) : null
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-8">
      <div>
        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{role.label}{role.required ? ' *' : ''}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{role.helper}</p>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        {selected ? <AppIcon app={selected} /> : <span className="h-8 w-8 shrink-0 rounded-md bg-zinc-100 dark:bg-zinc-900" />}
        <Select value={value ?? ''} onChange={(next) => onChange(next || null)}>
          <option value="">{role.required ? 'Choose a system' : 'Not used / not needed'}</option>
          {apps.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
        </Select>
      </div>
    </div>
  )
}

function LevelField({ label, helper, value, options, onChange }: { label: string; helper: string; value: OnboardingLevel; options: Array<{ value: OnboardingLevel; label: string; detail: string }>; onChange: (value: OnboardingLevel) => void }) {
  return (
    <div className="py-4 sm:grid sm:grid-cols-[240px_1fr] sm:gap-8">
      <div>
        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{label}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p>
      </div>
      <div className="mt-3 grid gap-2 sm:mt-0 sm:grid-cols-2">
        {options.map((option) => {
          const active = option.value === value
          return <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`min-h-16 rounded-xl px-3 py-3 text-left transition-colors ${active ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'}`}><span className="flex items-start gap-2"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'}`}>{active ? <CheckIcon className="h-3 w-3" /> : null}</span><span><span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{option.label}</span><span className="mt-0.5 block text-xs leading-5 text-zinc-500">{option.detail}</span></span></span></button>
        })}
      </div>
    </div>
  )
}

function SystemsPage({ input, update }: { input: OnboardingInput; update: <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => void }) {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Start with the actual handoff stack.</p>
        <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">Where does a sold client move next?</h2>
        <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">Choose the systems that own each state. The planner uses this to avoid asking questions that your stack already answers.</p>
      </header>
      <div className="rounded-2xl bg-zinc-50 px-4 sm:px-5 dark:bg-zinc-900/50">
        {SYSTEM_ROLES.map((role) => <SystemRole key={role.key} role={role} value={input[role.key]} onChange={(value) => update(role.key, value)} />)}
      </div>
      <div className="grid gap-3 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-8">
        <div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Internal / niche systems</p><p className="mt-1 text-xs leading-5 text-zinc-500">Comma-separated is enough. Unknown systems raise integration uncertainty.</p></div>
        <input value={input.customSystems.join(', ')} onChange={(event) => update('customSystems', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="e.g. Internal quoting system, legacy portal" className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100" />
      </div>
    </div>
  )
}

function TriggerPage({ input, update }: { input: OnboardingInput; update: <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => void }) {
  const triggerOptions: Array<{ value: TriggerMode; label: string; detail: string }> = [
    { value: 'deal-won', label: 'Deal marked won', detail: 'Good when commercial approval means work may start.' },
    { value: 'contract-signed', label: 'Contract signed', detail: 'Use when signature is the real commitment point.' },
    { value: 'payment-received', label: 'Payment received', detail: 'Use when payment must clear before delivery begins.' },
    { value: 'compound', label: 'Several conditions must be true', detail: 'For example: won + signed + paid.' },
    { value: 'manual', label: 'Manual approval', detail: 'Useful when judgment is still required before onboarding.' },
  ]
  return (
    <div className="space-y-7">
      <header className="max-w-2xl"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Define readiness before automation.</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">What event really means “start onboarding”?</h2></header>
      <div className="grid gap-2 sm:grid-cols-2">{triggerOptions.map((option) => { const active = input.triggerMode === option.value; return <button key={option.value} type="button" onClick={() => update('triggerMode', option.value)} className={`rounded-xl px-4 py-4 text-left transition-colors ${active ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'}`}><span className="flex items-start gap-3"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'}`}>{active ? <CheckIcon className="h-3 w-3" /> : null}</span><span><span className="block text-sm font-medium text-zinc-950 dark:text-zinc-50">{option.label}</span><span className="mt-1 block text-xs leading-5 text-zinc-500">{option.detail}</span></span></span></button> })}</div>
      {input.triggerMode === 'compound' ? <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50"><p className="mb-3 text-sm font-medium text-zinc-950 dark:text-zinc-50">Required before onboarding may start</p><div className="grid gap-2 sm:grid-cols-3">{([['requireWon', 'Deal won'], ['requireSigned', 'Contract signed'], ['requirePaid', 'Payment received']] as const).map(([key, label]) => <button key={key} type="button" onClick={() => update(key, !input[key])} className={`flex min-h-12 items-center gap-2 rounded-lg px-3 text-left text-sm ${input[key] ? 'bg-zinc-200 font-medium dark:bg-zinc-800' : 'bg-white dark:bg-zinc-950'}`}><span className={`flex h-5 w-5 items-center justify-center rounded border ${input[key] ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'}`}>{input[key] ? <CheckIcon className="h-3 w-3" /> : null}</span>{label}</button>)}</div></div> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2"><span className="text-xs font-medium text-zinc-500">New clients / month</span><Select value={input.monthlyClients} onChange={(v) => update('monthlyClients', Number(v))}>{[5, 15, 40, 100, 250].map((n) => <option key={n} value={n}>{n === 250 ? '250+' : `~${n}`}</option>)}</Select></label>
        <label className="space-y-2"><span className="text-xs font-medium text-zinc-500">Service variants</span><Select value={input.serviceVariants} onChange={(v) => update('serviceVariants', Number(v))}>{[1, 3, 6, 12].map((n) => <option key={n} value={n}>{n === 12 ? '12+' : n}</option>)}</Select></label>
        <label className="space-y-2"><span className="text-xs font-medium text-zinc-500">Accountable owner</span><Select value={input.owner} onChange={(v) => update('owner', v as OnboardingInput['owner'])}><option value="sales">Sales</option><option value="operations">Operations</option><option value="account-management">Account management</option><option value="delivery">Delivery</option><option value="shared">Shared / unclear</option></Select></label>
      </div>
      <LevelField label="How repeatable is onboarding?" helper="Automation should follow a stable process, not encode chaos." value={input.processRepeatability} options={LEVEL_COPY.repeatability} onChange={(v) => update('processRepeatability', v)} />
    </div>
  )
}

function SetupPage({ input, update }: { input: OnboardingInput; update: <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => void }) {
  return <div className="space-y-2"><header className="mb-5 max-w-2xl"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Model the actual handoff.</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">What must be true before delivery starts?</h2></header><LevelField label="Sales → delivery context" helper="Scope, promises, contacts, dates and commercial context." value={input.handoffData} options={LEVEL_COPY.handoff} onChange={(v) => update('handoffData', v)} /><LevelField label="Client intake" helper="How structured and service-specific is the information request?" value={input.intakeQuality} options={LEVEL_COPY.intake} onChange={(v) => update('intakeQuality', v)} /><div className="py-4 sm:grid sm:grid-cols-[240px_1fr] sm:gap-8"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Access / credential complexity</p><p className="mt-1 text-xs leading-5 text-zinc-500">This changes how strict the readiness and security model should be.</p></div><Select value={input.accessComplexity} onChange={(v) => update('accessComplexity', v as OnboardingInput['accessComplexity'])}><option value="none">No meaningful access required</option><option value="light">A few files / simple permissions</option><option value="multi">Several tools, accounts or permissions</option><option value="sensitive">Sensitive credentials / privileged access</option></Select></div><LevelField label="Access + asset tracking" helper="Missing access should be a visible state, not a conversation buried in chat." value={input.accessTracking} options={LEVEL_COPY.tracking} onChange={(v) => update('accessTracking', v)} /><LevelField label="Delivery workspace setup" helper="Projects should be created from a stable template, not rebuilt in automation." value={input.workspaceTemplate} options={LEVEL_COPY.template} onChange={(v) => update('workspaceTemplate', v)} /><LevelField label="Welcome communication" helper="Set expectations and next actions immediately." value={input.clientWelcome} options={LEVEL_COPY.communication} onChange={(v) => update('clientWelcome', v)} /><LevelField label="Kickoff scheduling" helper="Kickoff should happen when it can actually move the work forward." value={input.kickoffScheduling} options={LEVEL_COPY.kickoff} onChange={(v) => update('kickoffScheduling', v)} /><LevelField label="Onboarding ownership" helper="One person should be accountable for moving the client to ready." value={input.ownerAssignment} options={LEVEL_COPY.owner} onChange={(v) => update('ownerAssignment', v)} /></div>
}

function ReliabilityPage({ input, update }: { input: OnboardingInput; update: <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => void }) {
  return <div className="space-y-2"><header className="mb-5 max-w-2xl"><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Now make it survive reality.</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">What happens when a client is late, an event repeats, or setup fails?</h2></header><LevelField label="Missing-item reminders" helper="Chase only what is missing and stop when it is complete." value={input.reminders} options={LEVEL_COPY.reminders} onChange={(v) => update('reminders', v)} /><LevelField label="Ready-for-delivery gate" helper="Sold is not the same as operationally ready." value={input.readinessGate} options={LEVEL_COPY.gate} onChange={(v) => update('readinessGate', v)} /><LevelField label="Duplicate / retry protection" helper="Payment and webhook events may repeat. Creation actions should be safe to retry." value={input.duplicateProtection} options={LEVEL_COPY.duplicate} onChange={(v) => update('duplicateProtection', v)} /><LevelField label="Exception handling" helper="Partial payment, failed project creation and unusual services need an owned path." value={input.exceptionHandling} options={LEVEL_COPY.exceptions} onChange={(v) => update('exceptionHandling', v)} /><LevelField label="Monitoring" helper="A paying client should never disappear because an integration failed silently." value={input.monitoring} options={LEVEL_COPY.monitoring} onChange={(v) => update('monitoring', v)} /><div className="py-4 sm:grid sm:grid-cols-[240px_1fr] sm:gap-8"><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Target time to ready</p><p className="mt-1 text-xs leading-5 text-zinc-500">From commercial readiness to ready-for-delivery.</p></div><Select value={input.targetDays} onChange={(v) => update('targetDays', Number(v))}><option value={1}>Within 1 day</option><option value={3}>Within 3 days</option><option value={5}>Within 5 days</option><option value={10}>Within 10 days</option><option value={20}>Within 20 days</option></Select></div></div>
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50"><div className="flex items-center justify-between gap-4"><span className="text-xs text-zinc-500">{label}</span><span className="font-mono text-xs font-medium text-zinc-950 dark:text-zinc-50">{value}/100</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 dark:bg-zinc-50" style={{ width: `${value}%` }} /></div></div>
}

function ResultPage({ input }: { input: OnboardingInput }) {
  const result = useMemo(() => analyzeOnboarding(input), [input])
  return <div className="space-y-9 pb-3"><section className="grid gap-6 lg:grid-cols-[1fr_230px]"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Onboarding readiness</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] text-zinc-950 sm:text-4xl dark:text-zinc-50">{result.status}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{result.summary}</p></div><div className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-900"><p className="text-4xl font-medium tracking-[-0.05em] text-zinc-950 dark:text-zinc-50">{result.score}</p><p className="mt-1 text-xs text-zinc-500">health / 100 · {result.confidence}% confidence</p></div></section><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Metric label="Trigger clarity" value={result.metrics.triggerClarity} /><Metric label="Handoff quality" value={result.metrics.handoffQuality} /><Metric label="Client readiness" value={result.metrics.clientReadiness} /><Metric label="Delivery setup" value={result.metrics.deliverySetup} /><Metric label="Reliability" value={result.metrics.reliability} /><Metric label="Ownership" value={result.metrics.ownership} /></section>{result.issues.length ? <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Fix first</p><div className="mt-4 grid gap-3 lg:grid-cols-2">{result.issues.slice(0, 6).map((issue) => <article key={issue.id} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/50"><div className="flex items-start justify-between gap-4"><h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{issue.title}</h3><span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">{issue.severity}</span></div><p className="mt-2 text-xs leading-5 text-zinc-500">{issue.impact}</p><p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{issue.fix}</p><p className="mt-3 text-[11px] text-zinc-500">Owner: {issue.owner}</p></article>)}</div></section> : null}<section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Recommended flow</p><div className="mt-4 grid gap-2">{result.stages.map((stage, index) => <div key={stage.id} className="grid gap-2 rounded-xl bg-zinc-50 px-4 py-4 sm:grid-cols-[32px_170px_150px_1fr] sm:items-start dark:bg-zinc-900/50"><span className="font-mono text-[10px] text-zinc-400">{String(index + 1).padStart(2, '0')}</span><div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{stage.label}</p><p className="mt-1 text-[11px] text-zinc-500">{stage.owner}</p></div><p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{stage.system}</p><div><p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">{stage.purpose}</p>{stage.gate ? <p className="mt-1 text-[11px] font-medium text-zinc-500">Gate: {stage.gate}</p> : null}</div></div>)}</div></section><section className="grid gap-6 lg:grid-cols-2"><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Architecture</p><ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.architecture.map((item) => <li key={item}>• {item}</li>)}</ul></div><div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Safeguards</p><ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.safeguards.map((item) => <li key={item}>• {item}</li>)}</ul></div></section><section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">30-day repair plan</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{result.thirtyDayPlan.map((week) => <div key={week.week} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50"><p className="text-[11px] text-zinc-500">{week.week}</p><p className="mt-1 text-sm font-medium text-zinc-950 dark:text-zinc-50">{week.focus}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-500">{week.actions.map((item) => <li key={item}>• {item}</li>)}</ul></div>)}</div></section>{result.nextQuestions.length ? <section><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Still worth confirming</p><ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{result.nextQuestions.map((item) => <li key={item}>• {item}</li>)}</ul></section> : null}</div>
}

export function OnboardingPlanner() {
  const [input, setInput] = useState<OnboardingInput>(DEFAULT_ONBOARDING_INPUT)
  const [page, setPage] = useState<PageId>('systems')
  const pages: PageId[] = ['systems', 'trigger', 'setup', 'reliability', 'result']
  const index = pages.indexOf(page)
  const progress = Math.round((index / (pages.length - 1)) * 100)
  const canContinue = page !== 'systems' || Boolean(input.crmId)
  const update = <K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const next = () => setPage(pages[Math.min(pages.length - 1, index + 1)])
  const back = () => setPage(pages[Math.max(0, index - 1)])
  const reset = () => { setInput(DEFAULT_ONBOARDING_INPUT); setPage('systems') }

  return <section className="onboarding-planner grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden"><div className="mb-3"><div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${Math.max(7, progress)}%` }} /></div><div className="mt-3 flex items-center justify-between gap-4"><span className="text-xs font-medium text-zinc-500">{page === 'result' ? 'Plan complete' : `${progress}% complete`}</span><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button></div></div><div className="min-h-0 overflow-y-auto overscroll-contain pr-1">{page === 'systems' ? <SystemsPage input={input} update={update} /> : null}{page === 'trigger' ? <TriggerPage input={input} update={update} /> : null}{page === 'setup' ? <SetupPage input={input} update={update} /> : null}{page === 'reliability' ? <ReliabilityPage input={input} update={update} /> : null}{page === 'result' ? <ResultPage input={input} /> : null}</div><div className="mt-3 flex items-center justify-between pt-2">{page !== 'systems' && page !== 'result' ? <button type="button" onClick={back} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Back</button> : <span />}{page !== 'result' ? <button type="button" onClick={next} disabled={!canContinue} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-zinc-950 px-5 text-sm font-medium text-white hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-zinc-50 dark:text-zinc-950">Continue<ArrowRightIcon className="h-4 w-4" /></button> : <button type="button" onClick={() => setPage('systems')} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Edit answers</button>}</div></section>
}
