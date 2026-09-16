import Link from 'next/link'

import { SITE } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="site-header mx-auto mb-10 flex w-full max-w-screen-sm min-w-0 items-center sm:mb-8">
      <div className="flex min-w-0 items-center gap-3">
        <a
          href={`${SITE.origin}/`}
          aria-label="Go to Ahmad Yar homepage"
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100 bg-cover bg-center ring-1 ring-zinc-200 transition-opacity hover:opacity-80 sm:h-12 sm:w-12 dark:bg-zinc-900 dark:ring-zinc-800"
          style={{ backgroundImage: `url(${SITE.origin}/assets/ahmad-profile.webp)` }}
        />
        <div className="min-w-0">
          <a
            href={`${SITE.origin}/`}
            className="inline-flex min-h-8 items-center font-medium text-black transition-opacity hover:opacity-80 dark:text-white"
          >
            {SITE.name}
          </a>
          <a
            href={`${SITE.origin}/ai-automation`}
            className="block max-w-[15rem] truncate text-xs leading-4 text-zinc-600 transition-opacity hover:opacity-70 sm:max-w-none sm:text-sm sm:leading-5 dark:text-zinc-500"
          >
            {SITE.role}
          </a>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer mx-auto mt-auto w-full max-w-screen-sm pt-20 sm:pt-24">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-zinc-100 py-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        <span>Ahmad Yar · Practical automation tools.</span>
        <a
          href={`${SITE.origin}/connect`}
          className="font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Work with me →
        </a>
      </div>
    </footer>
  )
}

export function BackLink({ href = '/', children = 'All tools' }: { href?: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 items-center gap-2 rounded-full bg-zinc-100 px-3 text-xs font-medium text-zinc-600 transition-all hover:-translate-x-0.5 hover:bg-zinc-200 hover:text-zinc-950 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  )
}
