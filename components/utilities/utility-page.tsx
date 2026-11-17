import Link from 'next/link'
import { ArrowUpRight, Braces, CalendarClock, FileJson, Regex, Terminal, GitCompareArrows, Clock } from 'lucide-react'
import { BackLink } from '@/components/site-shell'
import { UtilityWorkbench } from './workbench'
import { FocusedWorkbench } from './focused-workbench'
import { UTILITIES, type UtilitySlug } from '@/lib/utilities/catalog'
import { SITE } from '@/lib/site'
import { UTILITY_SEO } from '@/lib/tools-seo'
import { relatedPlanners } from '@/lib/related-tools'

export const UTILITY_ICONS = { 'json-compare': GitCompareArrows, 'timestamp-converter': Clock, 'json-repair-payload-inspector': Braces, 'automation-schedule-builder': CalendarClock, 'api-request-converter': Terminal, 'csv-to-api-payload': FileJson, 'regex-extraction-workbench': Regex }

const NOTES: Record<UtilitySlug, { how: string[]; limits: string; source: { label: string; url: string }[]; faq: { question: string; answer: string }[] }> = {
  'json-compare': {
    how: ['Paste valid JSON into Original and Updated, or load the example.', 'Choose Compare JSON to inspect added, removed and changed values. Paths identify the exact field; an empty pointer refers to the document root.', 'Copy or download the change report. The tool does not apply changes to either document.'],
    limits: 'Up to 200,000 characters per document and 500 reported differences. Object key order is ignored; array positions are significant. Duplicate keys and unsafe numeric integers are rejected. Numbers follow JavaScript decimal precision. This is a comparison report, not an executable JSON Patch.',
    source: [{ label: 'JSON Pointer specification', url: 'https://www.rfc-editor.org/rfc/rfc6901' }],
    faq: [{ question: 'Will reordered keys count as changes?', answer: 'No for objects. Arrays are compared by position, so moving an array item can produce multiple differences.' }, { question: 'Does it repair invalid input?', answer: 'No. Repair malformed input with the JSON inspector first, then review the proposed repair before comparing.' }],
  },
  'timestamp-converter': {
    how: ['Select Unix seconds, Unix milliseconds or ISO 8601. Units are explicit rather than guessed.', 'Enter the timestamp and an IANA display time zone. ISO dates must include Z or a UTC offset.', 'Convert to see UTC, Unix values and a localized display. Use current time fills a single instant; it does not start a live clock.'],
    limits: 'Unix inputs must be whole numbers; negative timestamps are supported. ISO input accepts four-digit years, valid calendar dates and up to three fractional digits. Leap seconds and offset-free local times are rejected. Display uses the browser timezone database and JavaScript Date range.',
    source: [{ label: 'JavaScript Date and timestamps', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date' }],
    faq: [{ question: 'Why must I select seconds or milliseconds?', answer: 'Guessing by length can misinterpret valid historical or future timestamps. Explicit units keep the conversion predictable.' }, { question: 'Does changing the time zone change the instant?', answer: 'No. It changes the display only. UTC and Unix values continue to identify the same instant.' }],
  },
  'json-repair-payload-inspector': {
    how: ['Paste a JSON response or a malformed payload, then choose Inspect JSON.', 'Review the original beside the proposed result. Missing quotes or commas can be inferred, but the tool cannot know what the sender intended.', 'Expand Field paths to inspect bracket expressions and JSON Pointers. Copy a path from the page or download the complete result.'],
    limits: 'The inspector lists up to 500 paths and rejects nesting beyond 40 levels. Duplicate object keys and unsafe numeric integers are rejected to avoid silently losing values. Decimal precision and formatting follow JavaScript; keep exact amounts and large identifiers quoted. It does not validate an API schema or prove the data is correct.',
    source: [{ label: 'jsonrepair library and supported repairs', url: 'https://github.com/josdejong/jsonrepair' }, { label: 'JSON Pointer specification', url: 'https://www.rfc-editor.org/rfc/rfc6901' }],
    faq: [{ question: 'Does repairing JSON guarantee correct data?', answer: 'No. Syntactic repairs are proposals. Compare the original with the repaired result, particularly truncated strings, numbers and missing values.' }, { question: 'Are field paths the same in every automation platform?', answer: 'No. The inspector displays JSON bracket expressions and RFC 6901 JSON Pointers. Your platform may need a different wrapper or expression syntax.' }],
  },
  'automation-schedule-builder': {
    how: ['Enter numeric cron fields, or start with the weekday-at-9am example.', 'Select an IANA schedule time zone and a second time zone for comparison. Leave the start timestamp empty to preview from now.', 'Read the next eight runs in UTC and both selected zones. Copy the JSON as a planning reference; configure the scheduler separately.'],
    limits: 'Supports standard five-field cron and six-field expressions with seconds fixed at zero. Both day-of-month and day-of-week cannot be restricted together. Quartz, AWS, random and hashed syntax are deliberately rejected. The preview stops after an eight-year search window. DST handling is the parser model, not a guarantee about another scheduler.',
    source: [{ label: 'cron-parser syntax and timezone behavior', url: 'https://github.com/harrisiirak/cron-parser' }, { label: 'cronstrue descriptions', url: 'https://github.com/bradymholt/cRonstrue' }],
    faq: [{ question: 'Does this schedule a job?', answer: 'No. It generates a preview only. You must set the expression and timezone in your actual scheduler.' }, { question: 'Will daylight saving move my automation?', answer: 'A wall-clock schedule can move relative to UTC as DST changes. The preview displays offsets, but skipped and repeated local hours must be checked against your production scheduler.' }],
  },
  'api-request-converter': {
    how: ['Paste one cURL command using a literal HTTP(S) URL, explicit headers and an optional literal body.', 'Choose server-side JavaScript fetch, Python requests or an n8n HTTP Request node template.', 'Replace credential placeholders through your runtime or credential store. Review body and custom fields for sensitive data before copying. Nothing is executed by this tool.'],
    limits: 'Supports --request/-X, --header/-H, --url, one --data/--data-raw/--data-binary option, and quiet/fail flags. Unsupported flags fail explicitly rather than being ignored. No file uploads, basic-auth conversion, shell pipelines, redirects, cookie jars or multiple requests. n8n templates require version and credential review before import.',
    source: [{ label: 'cURL option reference', url: 'https://curl.se/docs/manpage.html' }, { label: 'n8n HTTP Request node', url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/' }, { label: 'Python requests', url: 'https://requests.readthedocs.io/en/latest/' }],
    faq: [{ question: 'Does the converter call my API?', answer: 'No. It parses a supported request and produces text locally. Executing the generated code can make a real request, including writes, so inspect it first.' }, { question: 'Will it remove every secret?', answer: 'No. Recognized sensitive headers, query parameters and JSON keys get placeholders, but arbitrary secrets in paths or unstructured bodies cannot be detected reliably. Review the complete output.' }],
  },
  'csv-to-api-payload': {
    how: ['Paste a CSV with unique header names, including quoted cells when they contain commas or line breaks.', 'Choose Inspect columns. Map each header to an output field, using dot-separated keys for nested objects. Select string, number, boolean or JSON and an explicit empty-cell rule.', 'Build the payload and review every field type. One batch is an array of records; multiple batches are an array of arrays, which you must adapt to the destination API.'],
    limits: 'Up to 3,000 data rows, 100 columns, 10 path levels and 200,000 input characters. Arrays in mapping paths and overlapping output paths are not supported. Identifiers stay strings by default. Number conversion rejects unsafe integers, and booleans require true or false. This does not connect to a CRM or validate a provider-specific request envelope.',
    source: [{ label: 'Papa Parse documentation', url: 'https://www.papaparse.com/docs' }],
    faq: [{ question: 'Will leading zeros survive conversion?', answer: 'Yes when the field stays a string. Changing a numeric-looking identifier to number deliberately removes formatting, so keep account IDs, postal codes and phone numbers as strings.' }, { question: 'Can I upload the output directly to HubSpot or another API?', answer: 'Only after matching its schema, required fields, batch limits and authentication. This is generic JSON, not a guarantee of provider compatibility.' }],
  },
  'regex-extraction-workbench': {
    how: ['Enter a JavaScript regular expression without slash delimiters and select flags.', 'Paste representative text, then extract. Global matching is enabled so all matches are collected.', 'Inspect matches, capture groups, named groups and indices. Download JSON or spreadsheet-safe CSV. No-match results are valid, not errors.'],
    limits: 'Patterns are limited to 1,000 characters and results to 1,000 matches. Processing runs in a disposable worker with a three-second timeout and a cancel control. JavaScript regex is not PCRE, Python re or another engine. Offsets count UTF-16 code units. CSV cells that could start spreadsheet formulas are escaped.',
    source: [{ label: 'JavaScript regular expressions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions' }],
    faq: [{ question: 'Can a bad expression freeze the page?', answer: 'Matching runs in a separate worker. The page terminates it after three seconds, and you can cancel it. Very large or complex patterns should still be simplified.' }, { question: 'Why does a pattern work differently in another tool?', answer: 'Regex dialects and flags differ. This tool uses your browser’s JavaScript regex engine; confirm compatibility with the actual automation runtime.' }],
  },
}

export function UtilityPage({ slug }: { slug: UtilitySlug }) {
  const tool = UTILITIES.find((item) => item.slug === slug)!
  const notes = NOTES[slug]
  const Icon = UTILITY_ICONS[slug]
  const canonical = `${SITE.origin}${SITE.toolsPath}/${slug}`
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebApplication', name: tool.title, description: tool.description, url: canonical, applicationCategory: 'DeveloperApplication', operatingSystem: 'Web browser', browserRequirements: 'JavaScript and Web Workers enabled', isAccessibleForFree: true, creator: { '@type': 'Person', name: SITE.name, url: SITE.origin } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Tools', item: `${SITE.origin}${SITE.toolsPath}` }, { '@type': 'ListItem', position: 2, name: tool.title, item: canonical }] },
  ] }
  const seo = UTILITY_SEO[slug]
  const planners = relatedPlanners(slug)
  return <article className="utility-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <BackLink />
    <header className="mt-8 max-w-2xl"><div className="mb-4 flex items-center gap-2 text-xs text-zinc-500"><Icon size={16} aria-hidden />{tool.category} / Browser utilities</div><h1 className="text-balance text-2xl font-medium sm:text-3xl">{tool.title}</h1><p className="mt-4 text-pretty text-sm leading-7 text-zinc-600 dark:text-zinc-400">{tool.description}</p></header>
    {slug === 'json-compare' || slug === 'timestamp-converter' ? <FocusedWorkbench compare={slug === 'json-compare'} /> : <UtilityWorkbench slug={slug} />}
    <div className="utility-reading text-sm leading-7 text-zinc-600 dark:text-zinc-400">
      <section><h2 className="mb-4 text-balance text-lg font-medium text-zinc-950 dark:text-zinc-50">How to use it</h2><ol className="list-decimal space-y-3 pl-5">{notes.how.map((text) => <li key={text} className="text-pretty">{text}</li>)}</ol></section>
      <section><h2 className="mb-3 text-balance text-lg font-medium text-zinc-950 dark:text-zinc-50">Supported formats & limits</h2><p className="text-pretty">{notes.limits}</p><details className="utility-data-details mt-4"><summary>Data handling</summary><p className="mt-3 text-pretty">Input is processed in a background worker, not uploaded or included in analytics events. Copying or downloading creates a separate copy. The site can load hosting analytics; it is not an offline application.</p></details></section>
      <section><h2 className="mb-4 text-balance text-lg font-medium text-zinc-950 dark:text-zinc-50">Common questions</h2>{notes.faq.map((faq) => <details key={faq.question} className="mb-3 rounded-xl bg-zinc-50 px-5 py-3 dark:bg-zinc-900"><summary className="min-h-11 cursor-pointer content-center font-medium text-zinc-950 dark:text-zinc-100">{faq.question}</summary><p className="pb-2 pt-3 text-pretty">{faq.answer}</p></details>)}</section>
      <section><h2 className="mb-3 text-balance text-lg font-medium text-zinc-950 dark:text-zinc-50">Documentation</h2><ul>{notes.source.map((s) => <li key={s.url}><a className="inline-flex min-h-11 items-center gap-2 hover:underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}<ArrowUpRight size={14} aria-hidden /><span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul><h3 className="mb-2 mt-5 font-medium text-zinc-950 dark:text-zinc-50">In the integration handbook</h3><a className="inline-flex min-h-11 items-center gap-2 hover:underline" href={`${SITE.origin}/integrations/${seo.guide.replace('claude-', 'claude/')}`}>{seo.guideLabel}<ArrowUpRight size={14} aria-hidden /></a></section>
      <section className="utility-related"><h2 className="mb-4 text-balance text-lg font-medium text-zinc-950 dark:text-zinc-50">Related tools</h2><nav aria-label="Related browser utilities" className="grid auto-rows-fr gap-3 sm:grid-cols-2">{UTILITIES.filter((u) => u.slug !== slug).map((u) => <Link key={u.slug} href={`/${u.slug}`} className="grid min-h-14 grid-cols-[minmax(0,1fr)_16px] items-start gap-3 rounded-xl bg-zinc-50 p-5 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"><span><span className="block font-medium text-zinc-950 dark:text-zinc-50">{u.shortTitle}</span><span className="mt-2 block text-xs leading-6">{u.description}</span></span><ArrowUpRight size={14} className="mt-1" aria-hidden /></Link>)}</nav></section>
      {planners.length > 0 && <section className="utility-related"><h2 className="mb-4 text-balance text-lg font-medium text-zinc-950 dark:text-zinc-50">Plan the workflow</h2><nav aria-label="Related planning tools" className="grid auto-rows-fr gap-3 sm:grid-cols-2">{planners.map((p) => <Link key={p.slug} href={`/${p.slug}`} className="flex items-start justify-between gap-4 rounded-xl bg-zinc-50 p-5 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"><span><span className="block font-medium text-zinc-950 dark:text-zinc-50">{p.shortTitle}</span><span className="mt-2 block text-pretty text-xs leading-6">{p.description}</span></span><ArrowUpRight size={16} className="mt-1 shrink-0" aria-hidden /></Link>)}</nav></section>}
    </div>
  </article>
}
