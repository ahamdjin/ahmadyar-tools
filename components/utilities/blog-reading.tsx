import catalog from '@/lib/site-connections.generated.json'
import { SITE } from '@/lib/site'

export function UtilityBlogReading({ slug }: { slug: string }) {
  const entry = (catalog as Record<string, { reading: { href: string; title: string }[] }>)[`${SITE.toolsPath}/${slug}`]
  if (!entry?.reading.length) return null
  return <section className="utility-related"><h2 className="mb-3 text-balance text-lg font-medium text-zinc-950 dark:text-zinc-50">Related guides from the blog</h2><nav aria-label="Related blog guides"><ul className="space-y-1">{entry.reading.map((item) => <li key={item.href}><a href={`${SITE.origin}${item.href}`} className="inline-flex min-h-11 items-center text-pretty text-sm leading-6 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-950 dark:decoration-zinc-700 dark:hover:text-zinc-50">{item.title}</a></li>)}</ul></nav></section>
}
