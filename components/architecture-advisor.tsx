'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react'

import { ToolResultActions } from '@/components/tool-result-actions'
import { useToolStepNavigation } from '@/components/use-tool-step-navigation'
import {
  analyzeArchitecture,
  APP_BY_ID,
  APP_CATALOG,
  APP_CATEGORY_LABELS,
  DEFAULT_ASSESSMENT,
  POPULAR_APP_IDS,
  recommendOperatingModel,
  stressTestArchitecture,
  type AppDefinition,
  type AssessmentInput,
  type BudgetBand,
  type ChangeFrequency,
  type FailureImpact,
  type PortfolioShape,
  type Priority,
  type SelfHostingNeed,
  type TechnicalOwner,
} from '@/engine'

type StepId = 'systems' | 'shape' | 'ownership' | 'result'

type Preset = {
  label: string
  detail: string
  apps: string[]
  primary: string | null
  patch: Partial<AssessmentInput>
}

const STEPS: StepId[] = ['systems', 'shape', 'ownership', 'result']
const POPULAR_ORDER = new Map<string, number>(POPULAR_APP_IDS.map((id, index) => [id, index]))

const PRESETS: Preset[] = [
  {
    label: 'CRM + sales operations',
    detail: 'Lead capture, routing, follow-up, pipeline and handoffs.',
    apps: ['hubspot', 'gmail', 'slack', 'google-sheets'],
    primary: 'hubspot',
    patch: {
      crmCentered: true,
      currentWorkflows: 8,
      futureWorkflows: 24,
      monthlyRuns: 5000,
      portfolioShape: 'mixed',
      appsPerWorkflow: 3,
      typicalSteps: 6,
      branching: 'simple',
      technicalOwner: 'automation-specialist',
      team: 'automation',
      maintenance: 'high',
      failureImpact: 'high',
      priorities: ['ease', 'reliability', 'speed'],
    },
  },
  {
    label: 'Agency / client operations',
    detail: 'CRM, signed work, payments, projects and client communication.',
    apps: ['gohighlevel', 'stripe', 'clickup', 'slack', 'google-drive'],
    primary: 'gohighlevel',
    patch: {
      crmCentered: true,
      currentWorkflows: 10,
      futureWorkflows: 30,
      monthlyRuns: 5000,
      portfolioShape: 'mixed',
      appsPerWorkflow: 4,
      typicalSteps: 8,
      branching: 'simple',
      technicalOwner: 'power-user',
      team: 'business',
      maintenance: 'medium',
      failureImpact: 'medium',
      priorities: ['ease', 'speed', 'cost'],
    },
  },
  {
    label: 'Ecommerce operations',
    detail: 'Orders, marketing, payments, support and fulfillment events.',
    apps: ['shopify', 'klaviyo', 'stripe', 'gorgias', 'google-sheets'],
    primary: 'shopify',
    patch: {
      currentWorkflows: 12,
      futureWorkflows: 40,
      monthlyRuns: 25000,
      portfolioShape: 'mixed',
      appsPerWorkflow: 4,
      typicalSteps: 8,
      branching: 'simple',
      loopsOrBatching: true,
      technicalOwner: 'automation-specialist',
      team: 'automation',
      maintenance: 'high',
      failureImpact: 'high',
      duplicateUnsafe: true,
      retriesRequired: true,
      priorities: ['reliability', 'scale', 'cost'],
    },
  },
  {
    label: 'Microsoft-first business',
    detail: 'Dynamics, Outlook, Teams, Excel and Microsoft automation.',
    apps: ['dynamics-365', 'outlook', 'microsoft-teams', 'excel', 'power-automate'],
    primary: 'dynamics-365',
    patch: {
      microsoftFirst: true,
      crmCentered: true,
      currentWorkflows: 14,
      futureWorkflows: 45,
      monthlyRuns: 25000,
      portfolioShape: 'mixed',
      appsPerWorkflow: 4,
      technicalOwner: 'automation-specialist',
      team: 'automation',
      maintenance: 'high',
      governance: true,
      failureImpact: 'high',
      priorities: ['reliability', 'ease', 'scale'],
    },
  },
  {
    label: 'Product / internal software',
    detail: 'APIs, databases, durable jobs and product-like business logic.',
    apps: ['postgresql', 'github', 'stripe', 'openai', 'n8n'],
    primary: 'postgresql',
    patch: {
      currentWorkflows: 18,
      futureWorkflows: 70,
      monthlyRuns: 100000,
      portfolioShape: 'advanced',
      appsPerWorkflow: 5,
      typicalSteps: 12,
      branching: 'advanced',
      customApi: true,
      databaseWork: true,
      durableJobs: true,
      technicalOwner: 'developer',
      team: 'developer',
      maintenance: 'high',
      failureImpact: 'high',
      retriesRequired: true,
      priorities: ['reliability', 'control', 'scale'],
    },
  },
]

const PRIORITIES: Array<{ id: Priority; label: string; detail: string }> = [
  { id: 'ease', label: 'Easy to own', detail: 'The people running it can safely change and recover it.' },
  { id: 'speed', label: 'Fast to ship', detail: 'Useful automation should reach production quickly.' },
  { id: 'cost', label: 'Cost efficiency', detail: 'Usage and ownership cost should stay sensible.' },
  { id: 'reliability', label: 'Reliability', detail: 'Failures, retries and recovery matter a lot.' },
  { id: 'control', label: 'Control', detail: 'Hosting, APIs, code and infrastructure freedom matter.' },
  { id: 'scale', label: 'Scale', detail: 'The portfolio or run volume will grow materially.' },
]

function ownerDefaults(owner: TechnicalOwner): Pick<AssessmentInput, 'team' | 'maintenance'> {
  if (owner === 'developer') return { team: 'developer', maintenance: 'high' }
  if (owner === 'automation-specialist') return { team: 'automation', maintenance: 'high' }
  if (owner === 'power-user') return { team: 'business', maintenance: 'medium' }
  return { team: 'business', maintenance: 'low' }
}

function Select({ value, onChange, children }: { value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100"
    >
      {children}
    </select>
  )
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-b border-zinc-200 py-4 last:border-b-0 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-7 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{label}</p>
        {helper ? <p className="mt-1 text-xs leading-5 text-zinc-500">{helper}</p> : null}
      </div>
      <div className="min-w-0 self-center">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label, detail }: { checked: boolean; onChange: (value: boolean) => void; label: string; detail?: string }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${checked ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'}`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${checked ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'}`}>
        {checked ? <CheckIcon className="h-3 w-3" /> : null}
      </span>
      <span>
        <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
        {detail ? <span className="mt-0.5 block text-xs leading-5 text-zinc-500">{detail}</span> : null}
      </span>
    </button>
  )
}

function AppIcon({ app }: { app: AppDefinition }) {
  if (!app.icon) {
    return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[9px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{app.name.slice(0, 2).toUpperCase()}</span>
  }
  return <span aria-hidden="true" className="h-7 w-7 shrink-0 rounded-md bg-zinc-100 bg-[length:66%] bg-center bg-no-repeat dark:bg-zinc-900" style={{ backgroundImage: `url(https://cdn.simpleicons.org/${app.icon})` }} />
}

function StepIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <header className="max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-500">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em] text-zinc-950 sm:text-3xl dark:text-zinc-50">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{body}</p>
    </header>
  )
}

function SystemsStep({ input, setInput }: { input: AssessmentInput; setInput: React.Dispatch<React.SetStateAction<AssessmentInput>> }) {
  const [query, setQuery] = useState('')
  const selected = input.selectedApps.map((id) => APP_BY_ID.get(id)).filter((app): app is AppDefinition => Boolean(app))
  const term = query.trim().toLowerCase()
  const apps = useMemo(() => {
    return [...APP_CATALOG]
      .filter((app) => !term || `${app.name} ${app.vendor} ${APP_CATEGORY_LABELS[app.category]}`.toLowerCase().includes(term))
      .sort((a, b) => {
        if (term) return a.name.localeCompare(b.name)
        return (POPULAR_ORDER.get(a.id) ?? 999) - (POPULAR_ORDER.get(b.id) ?? 999) || a.name.localeCompare(b.name)
      })
      .slice(0, term ? 24 : 16)
  }, [term])

  const applyPreset = (preset: Preset) => {
    setInput({
      ...DEFAULT_ASSESSMENT,
      ...preset.patch,
      selectedApps: preset.apps,
      primarySystemId: preset.primary,
    })
  }

  const toggleApp = (id: string) => {
    setInput((current) => {
      const exists = current.selectedApps.includes(id)
      const selectedApps = exists ? current.selectedApps.filter((item) => item !== id) : [...current.selectedApps, id]
      const app = APP_BY_ID.get(id)
      const primarySystemId = exists && current.primarySystemId === id
        ? null
        : !current.primarySystemId && app?.category === 'crm'
          ? id
          : current.primarySystemId
      return { ...current, selectedApps, primarySystemId }
    })
  }

  const selectedCrms = selected.filter((app) => app.category === 'crm')

  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="1 · Systems"
        title="Start with the environment, not a favorite platform."
        body="Pick a common starting point or choose the systems your important workflows actually touch. You can change every assumption before the recommendation."
      />

      <section>
        <p className="text-xs font-medium text-zinc-500">Common starting points</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PRESETS.map((preset) => (
            <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="rounded-2xl border border-zinc-200 px-4 py-3.5 text-left transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600">
              <span className="block text-sm font-medium text-zinc-950 dark:text-zinc-50">{preset.label}</span>
              <span className="mt-1 block text-xs leading-5 text-zinc-500">{preset.detail}</span>
            </button>
          ))}
        </div>
      </section>

      {selected.length ? (
        <section className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/55">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium text-zinc-500">Selected systems · {selected.length}</p>
            <button type="button" onClick={() => setInput((current) => ({ ...current, selectedApps: [], primarySystemId: null }))} className="text-xs text-zinc-500 underline decoration-zinc-300 underline-offset-4">Clear</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((app) => (
              <button key={app.id} type="button" onClick={() => toggleApp(app.id)} className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 shadow-sm dark:bg-zinc-950 dark:text-zinc-200">
                <AppIcon app={app} />
                {app.name}
                <XIcon className="h-3 w-3 text-zinc-500" />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <label className="relative block">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search HubSpot, Shopify, Slack, PostgreSQL…" className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white py-2 pl-10 pr-3 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100" />
        </label>
        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          {apps.map((app) => {
            const active = input.selectedApps.includes(app.id)
            return (
              <button key={app.id} type="button" onClick={() => toggleApp(app.id)} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${active ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'}`}>
                <AppIcon app={app} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">{app.name}</span>
                  <span className="block text-[11px] text-zinc-500">{APP_CATEGORY_LABELS[app.category]}</span>
                </span>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'}`}>{active ? <CheckIcon className="h-3 w-3" /> : null}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="border-y border-zinc-200 dark:border-zinc-800">
        {selectedCrms.length ? (
          <Field label="Primary CRM / source of truth" helper="When customer systems disagree, which record should win?">
            <Select value={input.primarySystemId ?? ''} onChange={(value) => setInput((current) => ({ ...current, primarySystemId: value || null }))}>
              <option value="">Not sure yet</option>
              {selectedCrms.map((app) => <option key={app.id} value={app.id}>{app.name}</option>)}
            </Select>
          </Field>
        ) : null}
        <Field label="Internal / niche systems" helper="Optional. Separate names with commas.">
          <input value={input.customSystems.join(', ')} onChange={(event) => setInput((current) => ({ ...current, customSystems: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))} placeholder="Legacy portal, internal quoting app…" className="min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-100" />
        </Field>
      </section>
    </div>
  )
}

function ShapeStep({ input, update }: { input: AssessmentInput; update: <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => void }) {
  return (
    <div className="space-y-8">
      <StepIntro eyebrow="2 · Work" title="Describe the hard part of the work." body="Volume matters, but the bigger architecture signal is what happens when the happy path stops being simple: branches, APIs, state, approvals and retries." />
      <section className="border-y border-zinc-200 dark:border-zinc-800">
        <Field label="Workflow portfolio" helper="Choose the shape of the work, not the fanciest workflow you have.">
          <Select value={input.portfolioShape} onChange={(value) => update('portfolioShape', value as PortfolioShape)}>
            <option value="mostly-simple">Mostly simple triggers and updates</option>
            <option value="mixed">Mixed: simple flows + some deeper logic</option>
            <option value="advanced">Advanced APIs, branches, transformations or AI</option>
            <option value="product-like">Product-like state, transactions or customer logic</option>
          </Select>
        </Field>
        <Field label="Workflows today / in 12–24 months" helper="The future count matters for governance and reuse.">
          <div className="grid gap-2 sm:grid-cols-2">
            <Select value={input.currentWorkflows} onChange={(value) => update('currentWorkflows', Number(value))}>
              <option value={3}>Today: 0–5</option><option value={10}>Today: 6–15</option><option value={22}>Today: 16–30</option><option value={45}>Today: 31–60</option><option value={80}>Today: 61–100</option><option value={150}>Today: 100+</option>
            </Select>
            <Select value={input.futureWorkflows} onChange={(value) => update('futureWorkflows', Number(value))}>
              <option value={6}>Future: under 10</option><option value={18}>Future: 10–25</option><option value={40}>Future: 26–50</option><option value={75}>Future: 51–100</option><option value={150}>Future: 101–200</option><option value={300}>Future: 200+</option>
            </Select>
          </div>
        </Field>
        <Field label="Monthly workflow runs" helper="A rough range is enough. This is used as an architecture signal, not a vendor quote.">
          <Select value={input.monthlyRuns} onChange={(value) => update('monthlyRuns', Number(value))}>
            <option value={500}>Under 1,000</option><option value={5000}>1,000–10,000</option><option value={25000}>10,000–50,000</option><option value={100000}>50,000–250,000</option><option value={500000}>250,000–1M</option><option value={2000000}>1M+</option>
          </Select>
        </Field>
        <Field label="Typical workflow" helper="How many systems and how much decision logic are normal?">
          <div className="grid gap-2 sm:grid-cols-2">
            <Select value={input.appsPerWorkflow} onChange={(value) => update('appsPerWorkflow', Number(value))}>
              <option value={2}>1–2 systems</option><option value={4}>3–4 systems</option><option value={6}>5–6 systems</option><option value={9}>7–10 systems</option><option value={12}>10+ systems</option>
            </Select>
            <Select value={input.branching} onChange={(value) => update('branching', value as AssessmentInput['branching'])}>
              <option value="none">Mostly straight-line</option><option value="simple">A few conditions / routes</option><option value="advanced">Many branches / reusable rules</option>
            </Select>
          </div>
        </Field>
      </section>

      <section className="grid gap-2 sm:grid-cols-2">
        <Toggle checked={input.customApi} onChange={(value) => update('customApi', value)} label="Custom APIs or webhooks" detail="Important systems do not fit normal connectors." />
        <Toggle checked={input.databaseWork} onChange={(value) => update('databaseWork', value)} label="Database / shared state" detail="The workflow reads or writes durable shared data." />
        <Toggle checked={input.loopsOrBatching} onChange={(value) => update('loopsOrBatching', value)} label="Batching / many records" detail="Lists, pages, invoices, enrichments or bulk syncs." />
        <Toggle checked={input.humanApprovals} onChange={(value) => update('humanApprovals', value)} label="Human approval gates" detail="Some decisions should pause for review." />
        <Toggle checked={input.aiSteps} onChange={(value) => update('aiSteps', value)} label="AI influences decisions" detail="AI classification or generation affects later actions." />
        <Toggle checked={input.realtime} onChange={(value) => update('realtime', value)} label="Seconds matter" detail="Customer-facing, routing or transactional events." />
        <Toggle checked={input.durableJobs} onChange={(value) => update('durableJobs', value)} label="Long-running / durable jobs" detail="Work must survive waits, outages or long execution." />
        <Toggle checked={input.productLogic || input.portfolioShape === 'product-like'} onChange={(value) => update('productLogic', value)} label="Application logic" detail="Persistent state, transactions or rules that feel like software." />
      </section>
    </div>
  )
}

function OwnershipStep({ input, setInput, update }: { input: AssessmentInput; setInput: React.Dispatch<React.SetStateAction<AssessmentInput>>; update: <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => void }) {
  const setOwner = (owner: TechnicalOwner) => setInput((current) => ({ ...current, technicalOwner: owner, ...ownerDefaults(owner) }))
  const togglePriority = (priority: Priority) => {
    const exists = input.priorities.includes(priority)
    const next = exists ? input.priorities.filter((item) => item !== priority) : [...input.priorities, priority]
    update('priorities', next.slice(-3))
  }

  return (
    <div className="space-y-8">
      <StepIntro eyebrow="3 · Ownership + risk" title="Choose what the team can actually operate." body="Production architecture is an ownership decision. A technically powerful stack is a poor fit if nobody can debug it, recover failed work, or safely change it six months from now." />
      <section className="border-y border-zinc-200 dark:border-zinc-800">
        <Field label="Day-to-day owner" helper="Who will debug failures and change workflows after launch?">
          <Select value={input.technicalOwner} onChange={(value) => setOwner(value as TechnicalOwner)}>
            <option value="none">Business team — no technical owner</option><option value="power-user">Power user / operations generalist</option><option value="automation-specialist">Automation / RevOps specialist</option><option value="developer">Developer / engineering team</option>
          </Select>
        </Field>
        <Field label="Process stability" helper="Automating a moving target creates expensive rework.">
          <Select value={input.processStability} onChange={(value) => update('processStability', value as AssessmentInput['processStability'])}>
            <option value="stable">Stable and well understood</option><option value="mostly-stable">Mostly stable with known exceptions</option><option value="changing">Still changing significantly</option>
          </Select>
        </Field>
        <Field label="How often rules change">
          <Select value={input.changeFrequency} onChange={(value) => update('changeFrequency', value as ChangeFrequency)}>
            <option value="rare">A few times per year</option><option value="monthly">Monthly-ish</option><option value="weekly">Weekly</option><option value="daily">Constantly / daily</option>
          </Select>
        </Field>
        <Field label="Worst realistic failure" helper="Choose the business consequence, not how scary the technical error looks.">
          <Select value={input.failureImpact} onChange={(value) => update('failureImpact', value as FailureImpact)}>
            <option value="low">Low — inconvenience, easy recovery</option><option value="medium">Medium — manual recovery or delay</option><option value="high">High — revenue/customer/operating impact</option><option value="critical">Critical — money, legal, compliance or core state</option>
          </Select>
        </Field>
        <Field label="Software budget" helper="Monthly platform budget only. Ownership and engineering time still count.">
          <Select value={input.budget} onChange={(value) => update('budget', value as BudgetBand)}>
            <option value="under-100">Under $100 / month</option><option value="100-300">$100–$300 / month</option><option value="300-1000">$300–$1,000 / month</option><option value="1000-5000">$1,000–$5,000 / month</option><option value="flexible">Flexible / enterprise</option>
          </Select>
        </Field>
        <Field label="Hosting preference">
          <Select value={input.selfHosting} onChange={(value) => update('selfHosting', value as SelfHostingNeed)}>
            <option value="none">Managed cloud is fine</option><option value="preferred">Prefer self-hosting if sensible</option><option value="required">Self-hosting is mandatory</option>
          </Select>
        </Field>
      </section>

      <section className="grid gap-2 sm:grid-cols-2">
        <Toggle checked={input.retriesRequired} onChange={(value) => update('retriesRequired', value)} label="Failed work must retry" detail="Silently dropping work is not acceptable." />
        <Toggle checked={input.duplicateUnsafe} onChange={(value) => update('duplicateUnsafe', value)} label="Duplicate execution can cause damage" detail="Charges, orders, contracts or irreversible updates." />
        <Toggle checked={input.sensitiveData} onChange={(value) => update('sensitiveData', value)} label="Sensitive / regulated data" detail="PII, finance, health, employee or credential data." />
        <Toggle checked={input.governance} onChange={(value) => update('governance', value)} label="Controlled publishing / governance" detail="Review, environments, permissions or auditability matter." />
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">What matters most?</p>
            <p className="mt-1 text-xs text-zinc-500">Pick up to three. This changes trade-offs, not hard constraints.</p>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">{input.priorities.length}/3</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {PRIORITIES.map((priority) => <Toggle key={priority.id} checked={input.priorities.includes(priority.id)} onChange={() => togglePriority(priority.id)} label={priority.label} detail={priority.detail} />)}
        </div>
      </section>
    </div>
  )
}

function Result({ input, onEdit }: { input: AssessmentInput; onEdit: (step: StepId) => void }) {
  const result = useMemo(() => analyzeArchitecture(input), [input])
  const operating = useMemo(() => recommendOperatingModel(input), [input])
  const stress = useMemo(() => stressTestArchitecture(input), [input])
  const reasons = result.primary.reasons.slice(0, 3)
  const caution = result.primary.cautions[0] ?? result.primary.tradeoffs[0]
  const nextActions = [
    result.portfolioPlan[0] ? `Start with ${result.portfolioPlan[0].label.toLowerCase()}: ${result.portfolioPlan[0].purpose}` : null,
    result.safeguards[0] ? `Put the first safeguard in place: ${result.safeguards[0]}` : null,
    operating.practices[0] ? `Set the ownership rule: ${operating.practices[0]}` : null,
  ].filter((item): item is string => Boolean(item))

  return (
    <div className="space-y-10">
      <section className="rounded-[24px] bg-zinc-950 p-6 text-white sm:p-8 dark:bg-zinc-100 dark:text-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Recommendation</p>
            <p className="mt-3 text-sm text-zinc-300 dark:text-zinc-700">{result.kindLabel}</p>
            <h2 className="mt-1 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">{result.primary.name}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300 dark:text-zinc-700">{result.summary}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-medium">{result.metrics.confidence}%</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">confidence</p>
          </div>
        </div>
        <div className="mt-6">
          <ToolResultActions
            title={`${result.kindLabel}: ${result.primary.name}`}
            summary={result.summary}
            details={[...reasons, ...nextActions]}
          />
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Why this landed here</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {(reasons.length ? reasons : [result.primary.strengths[0] ?? 'It best matches the operating constraints you selected.']).map((reason) => <li key={reason} className="border-t border-zinc-200 pt-3 first:border-t-0 first:pt-0 dark:border-zinc-800">{reason}</li>)}
          </ul>
          {caution ? <p className="mt-4 rounded-xl bg-zinc-50 px-3.5 py-3 text-xs leading-5 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400"><span className="font-medium text-zinc-900 dark:text-zinc-100">Watch:</span> {caution}</p> : null}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Do this next</p>
          <ol className="mt-4 space-y-4">
            {nextActions.map((action, index) => <li key={action} className="grid grid-cols-[24px_1fr] gap-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300"><span className="font-mono text-[10px] text-zinc-500">{String(index + 1).padStart(2, '0')}</span><span>{action}</span></li>)}
          </ol>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Architecture boundary</p>
            <h3 className="mt-2 text-xl font-medium tracking-[-0.025em] text-zinc-950 dark:text-zinc-50">Keep commodity work simple. Escalate only what needs it.</h3>
          </div>
          <button type="button" onClick={() => onEdit('shape')} className="text-xs font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-4">Edit workflow assumptions</button>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55">
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Keep native</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.keepNative.slice(0, 4).map((item) => <li key={item}>• {item}</li>)}</ul>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55">
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Orchestration / code should own</p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{result.orchestrationResponsibilities.slice(0, 4).map((item) => <li key={item}>• {item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Portfolio plan</p>
        <div className="mt-4 border-y border-zinc-200 dark:border-zinc-800">
          {result.portfolioPlan.map((lane, index) => (
            <div key={lane.id} className={`grid gap-2 py-4 sm:grid-cols-[145px_180px_1fr] ${index ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}>
              <div><p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{lane.label}</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">{lane.useWhen}</p></div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{lane.platformName}</p>
              <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">{lane.purpose}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">What would change the answer?</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {stress.slice(0, 4).map((scenario) => (
            <div key={scenario.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{scenario.label}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{scenario.note}</p>
              <p className="mt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">{scenario.changedRecommendation ? `Changes → ${scenario.primaryName}` : `Stays → ${scenario.primaryName}`}</p>
            </div>
          ))}
        </div>
      </section>

      {result.alternatives.length ? (
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Other viable options</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.alternatives.slice(0, 2).map((alternative) => (
              <div key={alternative.id} className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900/55">
                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{alternative.name}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{alternative.reasons[0] ?? alternative.strengths[0]}</p>
                {alternative.tradeoffs[0] ? <p className="mt-2 text-xs leading-5 text-zinc-500">Trade-off: {alternative.tradeoffs[0]}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <details className="group rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-zinc-950 dark:text-zinc-50">
          Technical comparison
          <ChevronDownIcon className="h-4 w-4 text-zinc-500 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-5 grid gap-7 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-zinc-500">Architecture signals</p>
            <dl className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between gap-4"><dt>Complexity</dt><dd>{result.metrics.complexity}/100</dd></div>
              <div className="flex justify-between gap-4"><dt>Integration difficulty</dt><dd>{result.metrics.integrationDifficulty}/100</dd></div>
              <div className="flex justify-between gap-4"><dt>Reliability risk</dt><dd>{result.metrics.reliabilityRisk}/100</dd></div>
              <div className="flex justify-between gap-4"><dt>Ownership risk</dt><dd>{result.metrics.ownershipRisk}/100</dd></div>
              <div className="flex justify-between gap-4"><dt>Scale pressure</dt><dd>{result.metrics.scale}/100</dd></div>
            </dl>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">Top platform fit</p>
            <div className="mt-3 space-y-2">
              {result.ranking.slice(0, 6).map((platform, index) => <div key={platform.id} className="flex items-center justify-between gap-4 text-xs"><span className={platform.eligible ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 line-through'}>{index + 1}. {platform.name}</span><span className="font-mono text-zinc-500">{platform.score}/100</span></div>)}
            </div>
          </div>
        </div>
        <p className="mt-5 text-[11px] leading-5 text-zinc-500">Scores are comparative decision signals, not vendor performance guarantees or price quotes. Verify current product capabilities, security and commercial terms before implementation.</p>
      </details>

      {result.nextQuestions.length ? (
        <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Before you commit</p>
          <h3 className="mt-2 text-lg font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">Answer these to raise confidence.</h3>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{result.nextQuestions.slice(0, 4).map((question, index) => <li key={question} className="grid grid-cols-[24px_1fr] gap-3"><span className="font-mono text-[10px] text-zinc-500">{String(index + 1).padStart(2, '0')}</span><span>{question}</span></li>)}</ol>
        </section>
      ) : null}
    </div>
  )
}

export function ArchitectureAdvisor() {
  const [input, setInput] = useState<AssessmentInput>(DEFAULT_ASSESSMENT)
  const [step, setStep] = useState<StepId>('systems')
  const { rootRef, scrollToStart } = useToolStepNavigation()
  const index = STEPS.indexOf(step)
  const progress = step === 'result' ? 100 : Math.round(((index + 1) / 3) * 100)
  const canContinue = step !== 'systems' || input.selectedApps.length + input.customSystems.length + input.otherSystemsCount > 0

  const update = <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => setInput((current) => ({ ...current, [key]: value }))
  const goTo = (nextStep: StepId) => { setStep(nextStep); scrollToStart() }
  const next = () => goTo(STEPS[Math.min(STEPS.length - 1, index + 1)])
  const back = () => goTo(STEPS[Math.max(0, index - 1)])
  const reset = () => { setInput(DEFAULT_ASSESSMENT); goTo('systems') }

  return (
    <section ref={rootRef} className="mx-auto w-full max-w-[960px] scroll-mt-24 sm:scroll-mt-28">
      <div className="mb-8 rounded-2xl bg-zinc-50 p-4 sm:p-5 dark:bg-zinc-900/55">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Architecture decision, not a platform quiz.</p>
            <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">About 3 minutes. The result separates what should stay native, what needs orchestration, what needs code, and what the team must own.</p>
          </div>
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"><RotateCcwIcon className="h-3.5 w-3.5" />Start over</button>
        </div>
        <div role="progressbar" aria-label="Tool progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-zinc-950 transition-[width] duration-500 dark:bg-zinc-50" style={{ width: `${progress}%` }} /></div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500"><span aria-live="polite">{step === 'result' ? 'Analysis complete' : `Step ${index + 1} of 3`}</span><span>{progress}%</span></div>
      </div>

      <div className="min-h-[500px]">
        {step === 'systems' ? <SystemsStep input={input} setInput={setInput} /> : null}
        {step === 'shape' ? <ShapeStep input={input} update={update} /> : null}
        {step === 'ownership' ? <OwnershipStep input={input} setInput={setInput} update={update} /> : null}
        {step === 'result' ? <Result input={input} onEdit={goTo} /> : null}
      </div>

      {step !== 'result' ? (
        <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <button type="button" onClick={back} disabled={index === 0} className="inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 disabled:invisible dark:text-zinc-400 dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Back</button>
          <button type="button" onClick={next} disabled={!canContinue} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-zinc-50 dark:text-zinc-950">{step === 'ownership' ? 'See recommendation' : 'Continue'}<ArrowRightIcon className="h-4 w-4" /></button>
        </div>
      ) : (
        <div className="mt-10 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <button type="button" onClick={() => goTo('systems')} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"><ArrowLeftIcon className="h-4 w-4" />Edit inputs</button>
        </div>
      )}
    </section>
  )
}
