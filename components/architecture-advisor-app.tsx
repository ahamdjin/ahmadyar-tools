import { ArchitectureAdvisor } from '@/components/architecture-advisor'
import { BackLink } from '@/components/site-shell'

export function ArchitectureAdvisorApp({ title }: { title: string }) {
  return (
    <section className="advisor-app" aria-label={title}>
      <div className="advisor-app-toolbar">
        <BackLink />
        <div className="min-w-0 text-right">
          <p className="text-[10px] uppercase tracking-[0.13em] text-zinc-400 dark:text-zinc-600">Automation tool</p>
          <h1 className="truncate text-sm font-medium tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">{title}</h1>
        </div>
      </div>

      <div className="advisor-app-workspace">
        <div className="advisor-app-core">
          <ArchitectureAdvisor />
        </div>
      </div>
    </section>
  )
}
