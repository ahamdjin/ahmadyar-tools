import Link from 'next/link'

import { SITE } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="site-header mx-auto mb-10 flex w-full max-w-screen-sm min-w-0 items-center justify-between gap-4 sm:mb-8">
      <div className="flex min-w-0 items-center gap-3">
        <a
          href={`${SITE.origin}/`}
          aria-label="Go to Ahmad Yar homepage"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-medium tracking-[-0.02em] text-zinc-700 ring-1 ring-zinc-200 transition-all hover:-translate-y-0.5 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-800 dark:hover:bg-zinc-800 sm:h-12 sm:w-12"
        >
          AY
        </a>
        <div className="min-w-0">
          <a
            href={`${SITE.origin}/`}
            className="inline-flex min-h-7 items-center font-medium text-zinc-950 transition-opacity hover:opacity-70 dark:text-zinc-50"
          >
            {SITE.name}
          </a>
          <a
            href={`${SITE.origin}/ai-automation`}
            className="block max-w-[15rem] truncate text-xs leading-5 text-zinc-500 transition-opacity hover:opacity-70 sm:max-w-none sm:text-sm dark:text-zinc-500"
          >
            {SITE.role}
          </a>
        </div>
      </div>
      <Link
        href="/"
        className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-950 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        Tools
      </Link>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer mx-auto mt-20 w-full max-w-screen-sm py-8 text-xs text-zinc-500 dark:text-zinc-500">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900/60">
        <span>Practical automation tools by Ahmad Yar.</span>
        <a
          href={`${SITE.origin}/connect`}
          className="font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
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
