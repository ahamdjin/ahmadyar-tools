import { SiteFooter, SiteHeader } from '@/components/site-shell'

export function RouteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full font-[family-name:var(--font-geist)]">
      <div className="site-frame mx-auto flex min-h-screen w-full max-w-none flex-col px-4 pt-8 sm:px-6 sm:pt-14 md:px-8 md:pt-20 lg:px-10 xl:px-12">
        <SiteHeader />
        <main className="site-main min-w-0 w-full flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}
