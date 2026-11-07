import Image from 'next/image'
import { SiteFooter, SiteHeader } from '@/components/site-shell'

export function RouteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full font-[family-name:var(--font-geist)]">
      <div className="site-frame mx-auto flex min-h-screen w-full max-w-none flex-col px-4 pt-8 sm:px-6 sm:pt-14 md:px-8 md:pt-20 lg:px-10 xl:px-12">
        <SiteHeader />
        <main className="site-main min-w-0 w-full flex-1">{children}</main>
        {/* Temporary launch attribution; intentionally outside the tools footer. */}
        <div className="mx-auto flex w-full max-w-screen-sm justify-end pt-20 sm:pt-24">
          <a
            href="https://fazier.com"
            target="_blank"
            rel="nofollow noopener noreferrer"
            aria-label="Visit Fazier"
            className="inline-flex rounded-sm opacity-75 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-500"
          >
            <Image
              src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark"
              alt="Launched on Fazier"
              width={120}
              height={40}
              unoptimized
              className="h-auto w-[120px]"
            />
          </a>
        </div>
        <SiteFooter />
      </div>
    </div>
  )
}
