'use client'

import { usePathname } from 'next/navigation'

import { SiteFooter, SiteHeader } from '@/components/site-shell'

const IMMERSIVE_TOOL_PATHS = [
  '/automation-architecture-advisor',
  '/crm-automation-health-check',
  '/client-onboarding-automation-planner',
  '/lead-routing-rules-builder',
] as const

export function RouteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const immersive = IMMERSIVE_TOOL_PATHS.some((path) => pathname?.endsWith(path))

  if (immersive) {
    return (
      <div className="min-h-screen w-full font-[family-name:var(--font-geist)]">
        <main className="site-main w-full">{children}</main>
        <div className="mx-auto w-[min(92vw,1080px)]">
          <SiteFooter />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full font-[family-name:var(--font-geist)]">
      <div className="site-frame mx-auto flex min-h-screen w-full max-w-screen-sm flex-col px-4 pt-8 sm:px-5 sm:pt-14 md:pt-20">
        <SiteHeader />
        <main className="site-main flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}
