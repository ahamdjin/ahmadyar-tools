import Link from 'next/link'
import { ArrowLeftIcon, ArrowUpRightIcon } from 'lucide-react'

import { SITE } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="site-header mx-auto mb-10 flex w-full max-w-screen-sm min-w-0 items-center sm:mb-8">
      <div className="group flex min-w-0 items-center gap-3">
        <a
          href={`${SITE.origin}/`}
          aria-label="Go to Ahmad Yar homepage"
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100 bg-cover bg-center ring-1 ring-zinc-200 transition-[transform,opacity,box-shadow] duration-200 group-hover:-rotate-1 group-hover:scale-[1.03] group-hover:shadow-md sm:h-12 sm:w-12 dark:bg-zinc-900 dark:ring-zinc-800"
          style={{ backgroundImage: `url(${SITE.origin}/assets/ahmad-profile.webp)` }}
        />
        <div className="min-w-0">
          <a
            href={`${SITE.origin}/`}
            className="inline-flex min-h-8 items-center font-medium text-black transition-opacity hover:opacity-75 dark:text-white"
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
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-4 text-xs text-zinc-500 dark:bg-zinc-900/55 dark:text-zinc-500">
        <span>Ahmad Yar · Practical automation tools.</span>
        <a
          href={`${SITE.origin}/connect`}
          className="group inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-zinc-600 transition-[background-color,color] hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-950 dark:hover:text-zinc-50"
        >
          Work with me
          <ArrowUpRightIcon aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </footer>
  )
}

export function BackLink({ href = '/', children = 'All tools' }: { href?: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-9 items-center gap-2 rounded-full bg-zinc-100 px-3 text-xs font-medium text-zinc-600 transition-[transform,background-color,color,box-shadow] duration-200 hover:-translate-x-0.5 hover:bg-zinc-200 hover:text-zinc-950 hover:shadow-sm dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      <ArrowLeftIcon aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
      {children}
    </Link>
  )
}
