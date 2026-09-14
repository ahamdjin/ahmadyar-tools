import Link from 'next/link'

import { SITE } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="mb-10 flex items-center justify-between gap-4 sm:mb-12">
      <div className="min-w-0">
        <a href={`${SITE.origin}/`} className="inline-flex min-h-8 items-center text-sm font-medium text-zinc-950 transition-opacity hover:opacity-70 dark:text-zinc-50">
          {SITE.name}
        </a>
        <a href={`${SITE.origin}/ai-automation`} className="block text-xs leading-5 text-zinc-500 transition-opacity hover:opacity-70 dark:text-zinc-500">
          {SITE.role}
        </a>
      </div>
      <Link href="/" className="text-xs text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-50">
        Tools
      </Link>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-zinc-200 py-8 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>Practical automation tools by Ahmad Yar.</span>
        <a href={`${SITE.origin}/connect`} className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50">
          Work with me →
        </a>
      </div>
    </footer>
  )
}

export function BackLink({ href = '/', children = 'All tools' }: { href?: string; children?: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-xs text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-50">
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  )
}
