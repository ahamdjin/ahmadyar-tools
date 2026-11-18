import catalog from '@/lib/site-connections.generated.json'
import { SITE } from '@/lib/site'

export function UtilityBlogReading({ slug }: { slug: string }) {
  const entry = (catalog as Record<string, { reading: { href: string; title: string }[] }>)[`${SITE.toolsPath}/${slug}`]
  const mediaGuides:Record<string,string[]>={'content-credentials':['read-image-content-credentials'],'remove-c2pa':['export-images-without-embedded-credentials','read-image-content-credentials'],'image-converter':['export-images-without-embedded-credentials'],'image-compressor':['export-images-without-embedded-credentials']}
  const titles:Record<string,string>={"read-image-content-credentials":"How to read an image's Content Credentials","export-images-without-embedded-credentials":"What changes when you export an image without C2PA metadata?"}
  const reading=[...(mediaGuides[slug]??[]).map(key=>({href:'/blog/'+key,title:titles[key]})),...(entry?.reading??[])]
  if (!reading.length) return null
  return <section className="utility-related"><h2 className="mb-3 text-balance text-lg font-medium text-zinc-950 dark:text-zinc-50">Related guides from the blog</h2><nav aria-label="Related blog guides"><ul className="space-y-1">{reading.map((item) => <li key={item.href}><a href={`${SITE.origin}${item.href}`} className="inline-flex min-h-11 items-center text-pretty text-sm leading-6 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-950 dark:decoration-zinc-700 dark:hover:text-zinc-50">{item.title}</a></li>)}</ul></nav></section>
}
