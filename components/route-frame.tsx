import { SiteFooter, SiteHeader } from '@/components/site-shell'

export function RouteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full font-[family-name:var(--font-geist)]">
      <div className="site-frame mx-auto flex min-h-screen w-full max-w-screen-sm flex-col px-4 pt-8 sm:px-5 sm:pt-14 md:pt-20">
        <SiteHeader />
        <main className="site-main min-w-0 flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}
