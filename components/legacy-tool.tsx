'use client'

import { useMemo, useState } from 'react'

import type { ToolSlug } from '@/lib/tools'

type LegacySlug = Exclude<ToolSlug, 'automation-architecture-advisor'>
type Option = { value: string; label: string }
type Question = { id: string; title: string; helper: string; options: Option[] }

const QUESTIONS: Record<LegacySlug, Question[]> = {
  'crm-automation-health-check': [
    { id: 'capture', title: 'How do leads enter the CRM?', helper: 'Think about all important lead sources.', options: [{ value: '0', label: 'Mostly manual' }, { value: '1', label: 'Main sources are connected' }, { value: '2', label: 'All important sources enter automatically with context' }] },
    { id: 'routing', title: 'How is ownership assigned?', helper: 'A lead should never wait for someone to notice it.', options: [{ value: '0', label: 'Manual assignment' }, { value: '1', label: 'Basic rules' }, { value: '2', label: 'Rules plus fallback and unassigned checks' }] },
    { id: 'followup', title: 'What happens after a new lead arrives?', helper: 'Look for reminders, sequences, and stop rules.', options: [{ value: '0', label: 'People remember to follow up' }, { value: '1', label: 'Some reminders or sequences' }, { value: '2', label: 'Follow-up, reminders, and stop rules are reliable' }] },
    { id: 'handoff', title: 'What happens when a deal is won?', helper: 'Sales context should survive the handoff.', options: [{ value: '0', label: 'Onboarding starts manually' }, { value: '1', label: 'Some setup is automated' }, { value: '2', label: 'Welcome, intake, ownership, and project setup are connected' }] },
    { id: 'reporting', title: 'Can you see source, response, pipeline, and outcome together?', helper: 'Good automation should make reporting easier, not messier.', options: [{ value: '0', label: 'Reporting needs manual cleanup' }, { value: '1', label: 'Basic dashboards exist' }, { value: '2', label: 'The key journey is connected end to end' }] },
  ],
  'client-onboarding-automation-planner': [
    { id: 'trigger', title: 'What should start onboarding?', helper: 'Use one event that clearly means the client is ready.', options: [{ value: 'won', label: 'Deal marked won' }, { value: 'signed', label: 'Contract signed' }, { value: 'paid', label: 'Payment received' }] },
    { id: 'intake', title: 'How much information do you need?', helper: 'The intake should match delivery complexity.', options: [{ value: 'basic', label: 'Basic details' }, { value: 'structured', label: 'Structured multi-section intake' }, { value: 'review', label: 'Detailed intake plus internal review' }] },
    { id: 'access', title: 'What must the client provide?', helper: 'Missing access is a common onboarding blocker.', options: [{ value: 'none', label: 'Very little' }, { value: 'files', label: 'Files / assets' }, { value: 'access', label: 'Files plus account access' }] },
    { id: 'workspace', title: 'What should be prepared automatically?', helper: 'Create the delivery environment before kickoff.', options: [{ value: 'tasks', label: 'Tasks / project' }, { value: 'folders', label: 'Folders plus project' }, { value: 'full', label: 'Folders, project, brief, tasks, and team notification' }] },
  ],
  'lead-routing-rules-builder': [
    { id: 'basis', title: 'What should decide ownership first?', helper: 'Choose the primary rule, then add fallback.', options: [{ value: 'round', label: 'Availability / round robin' }, { value: 'service', label: 'Service / lead type' }, { value: 'territory', label: 'Location / territory' }, { value: 'priority', label: 'Lead value / priority' }, { value: 'mixed', label: 'A combination of rules' }] },
    { id: 'priority', title: 'Do some leads need faster treatment?', helper: 'Priority should be explainable.', options: [{ value: 'none', label: 'No' }, { value: 'basic', label: 'A few clear priority signals' }, { value: 'advanced', label: 'Several signals / scoring' }] },
    { id: 'hours', title: 'What happens after hours?', helper: 'A lead still needs acknowledgement and ownership.', options: [{ value: 'queue', label: 'Acknowledge and queue' }, { value: 'oncall', label: 'Route high-priority leads to on-call owner' }] },
    { id: 'duplicate', title: 'What if the contact already exists?', helper: 'Duplicate handling should happen before ownership changes.', options: [{ value: 'keep', label: 'Keep existing owner when possible' }, { value: 'reroute', label: 'Re-evaluate using current rules' }] },
  ],
}

function resultFor(tool: LegacySlug, answers: Record<string, string>) {
  if (tool === 'crm-automation-health-check') {
    const score = Math.round((Object.values(answers).reduce((sum, value) => sum + Number(value), 0) / (QUESTIONS[tool].length * 2)) * 100)
    const title = score >= 80 ? 'Strong foundation' : score >= 60 ? 'Good, with a few leaks' : score >= 40 ? 'Useful, but fragile' : 'Mostly manual'
    return { title, eyebrow: `CRM automation score: ${score}/100`, lines: ['Fix the lowest-scoring handoff before adding more automation.', 'Keep ownership, source, next action, and outcome visible in the CRM.', 'Use external automation only where the CRM cannot cleanly own the logic.'] }
  }
  if (tool === 'client-onboarding-automation-planner') {
    const trigger = answers.trigger === 'paid' ? 'Payment received' : answers.trigger === 'signed' ? 'Contract signed' : 'Deal marked won'
    return { title: 'A simple, visible onboarding flow', eyebrow: 'Onboarding blueprint', lines: [`Use ${trigger} as the single trigger.`, 'Send welcome + intake and assign one onboarding owner.', answers.access === 'access' ? 'Collect files and account access with a visible missing-items checklist.' : answers.access === 'files' ? 'Create one place for client files and request missing assets.' : 'Keep intake lightweight and avoid asking for data delivery does not need.', answers.workspace === 'full' ? 'Create the delivery workspace, standard tasks, internal brief, and team notification from the intake.' : 'Create the delivery project from a standard template.', 'Do not mark onboarding ready until required information, ownership, and setup are complete.'] }
  }
  return { title: 'Route with a primary rule and a visible fallback', eyebrow: 'Lead routing blueprint', lines: ['Normalize the incoming lead before routing.', answers.duplicate === 'keep' ? 'Check for an existing contact first and preserve the current owner when appropriate.' : 'Check for an existing contact first, then re-run current ownership rules.', answers.priority === 'advanced' ? 'Score or classify priority using several explainable signals before normal assignment.' : answers.priority === 'basic' ? 'Check the small set of priority signals before normal assignment.' : 'Use the same priority path for most leads.', `Assign using ${answers.basis === 'mixed' ? 'priority first, then service / territory / availability' : answers.basis}.`, answers.hours === 'oncall' ? 'After hours, acknowledge every lead and route qualified priority leads to the on-call owner.' : 'After hours, acknowledge the lead and queue it for the next business period.', 'Escalate anything that remains unassigned or untouched past the response target.'] }
}

export function LegacyTool({ tool }: { tool: LegacySlug }) {
  const questions = QUESTIONS[tool]
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const complete = Object.keys(answers).length === questions.length
  const result = useMemo(() => complete ? resultFor(tool, answers) : null, [answers, complete, tool])
  const question = questions[step]

  if (result) return (
    <div className="space-y-7 tool-reveal">
      <div><p className="text-xs text-zinc-500">{result.eyebrow}</p><h2 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-zinc-950 dark:text-zinc-50">{result.title}</h2></div>
      <div className="border-y border-zinc-200 dark:border-zinc-800">{result.lines.map((line, index) => <div key={line} className={`grid gap-2 py-4 sm:grid-cols-[32px_1fr] ${index ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}><span className="font-mono text-[10px] text-zinc-400">{String(index + 1).padStart(2, '0')}</span><p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">{line}</p></div>)}</div>
      <button type="button" onClick={() => { setAnswers({}); setStep(0) }} className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50">Start again</button>
    </div>
  )

  return (
    <div className="space-y-7 tool-reveal">
      <div className="flex items-center justify-between text-xs text-zinc-400"><span>Question {step + 1} of {questions.length}</span><span>{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span></div>
      <div><h2 className="text-xl font-medium tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">{question.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{question.helper}</p></div>
      <div className="border-y border-zinc-200 dark:border-zinc-800">{question.options.map((option, index) => <button key={option.value} type="button" onClick={() => { const next = { ...answers, [question.id]: option.value }; setAnswers(next); if (step < questions.length - 1) setStep(step + 1) }} className={`flex w-full items-center justify-between gap-4 py-4 text-left text-sm text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50 ${index ? 'border-t border-zinc-200 dark:border-zinc-800' : ''}`}><span>{option.label}</span><span className="text-zinc-300 dark:text-zinc-700">→</span></button>)}</div>
      {step > 0 ? <button type="button" onClick={() => setStep((current) => current - 1)} className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50">← Back</button> : null}
    </div>
  )
}
