import type { Metadata } from 'next'
import { SITE } from './site'
import { UTILITIES, type UtilitySlug } from './utilities/catalog'
import { TOOLS } from './tools'

export const UTILITY_SEO: Record<UtilitySlug, { title: string; description: string; guide: string; guideLabel: string }> = {
  'remove-c2pa': {title:'100% Free C2PA Metadata Remover | Unlimited Batches',description:'Create a JPG copy without embedded Content Credentials. Preview the export, keep the original filename if you like, and download it in your browser.',guide:'claude-n8n',guideLabel:'Claude and n8n workflow setup'},
  'content-credentials': {title:'100% Free C2PA Credential Inspector | Unlimited Checks',description:'Check an image for embedded C2PA credentials and explore its recorded signer, editing history and declared AI tools in your browser.',guide:'claude-n8n',guideLabel:'Claude and n8n workflow setup'},
  'query-string-to-json': { title: 'Query String to JSON Converter', description: 'Decode URL parameters into JSON arrays while preserving repeated keys and blank values. Copy or download the result for your next workflow step.', guide: 'claude-n8n', guideLabel: 'Claude and n8n workflow setup' },
  'ndjson-to-json': { title: 'NDJSON to JSON Array Converter', description: 'Convert newline-delimited JSON to an array and identify invalid records by line number. Copy or download the result for your next workflow step.', guide: 'claude-n8n', guideLabel: 'Claude and n8n workflow setup' },
  'retry-budget-calculator': { title: 'API Retry Budget Calculator', description: 'Model capped exponential backoff, full jitter and timeout budgets. See how retries at multiple layers multiply downstream requests.', guide: 'claude-n8n', guideLabel: 'Claude and n8n workflow setup' },
  'queue-recovery-calculator': { title: 'Queue Backlog Recovery Calculator', description: 'Estimate the backlog from a traffic burst, the time it takes to drain, and whether adding workers can help under a downstream throughput cap.', guide: 'claude-n8n', guideLabel: 'Claude and n8n workflow setup' },
  'json-to-csv': { title: 'JSON to CSV Converter with Spreadsheet Preview', description: 'Convert JSON records to CSV with a spreadsheet preview. Flatten nested fields, expand arrays into rows, and export a file for Excel or Google Sheets.', guide: 'claude-airtable', guideLabel: 'Claude and Airtable setup' },
  'image-compressor': {title:'100% Free Image Compressor | Unlimited Forever', description:'100% free image compression, unlimited forever. Set a target size in KB, compare JPG or WebP previews, and download individual images or a batch ZIP.',guide:'claude-n8n',guideLabel:'Claude and n8n workflow setup'},
  'image-converter': {title:'100% Free Image Converter | Unlimited Conversions', description:'Resize images in your browser, compare original and converted file sizes, adjust image quality and download JPG, WebP or PNG files.', guide:'claude-n8n',guideLabel:'Claude and n8n workflow setup'},
  'json-compare': { title: 'JSON Compare & Diff: Added, Removed and Changed Fields', description: 'Compare two JSON documents by value. Review added, removed and changed fields with JSON Pointer paths, then copy or download the comparison report.', guide: 'claude-airtable', guideLabel: 'Claude and Airtable: record fields and API payloads' },
  'timestamp-converter': { title: 'Unix Timestamp Converter: Seconds, Milliseconds & ISO', description: 'Convert Unix seconds, milliseconds and ISO 8601 dates with explicit input units. View UTC and a selected time zone, then copy or download the result.', guide: 'claude-n8n', guideLabel: 'Claude and n8n: workflow setup and execution' },
  'json-repair-payload-inspector': { title: 'JSON Repair & Validator with Field Paths', description: 'Repair malformed JSON, check syntax and inspect JSON Pointer paths. Compare original and repaired payloads before copying or downloading the result.', guide: 'claude-airtable', guideLabel: 'Claude and Airtable: record fields and API payloads' },
  'automation-schedule-builder': { title: 'Cron Expression Generator & Time Zone Preview', description: 'Build a cron expression and preview the next eight runs in two time zones. Check five-field cron, UTC offsets and daylight-saving changes.', guide: 'claude-n8n', guideLabel: 'Claude and n8n: workflow setup and execution' },
  'api-request-converter': { title: 'cURL to Python, JavaScript & n8n Converter', description: 'Convert supported cURL requests into Python requests, JavaScript fetch or an n8n node. Review credential placeholders and copy the generated code.', guide: 'claude-hubspot', guideLabel: 'Claude and HubSpot: authentication and API endpoints' },
  'csv-to-api-payload': { title: 'CSV to JSON Converter', description: 'Convert CSV to nested JSON with field mapping, explicit data types, empty-cell rules and batches. Preserve IDs and review payloads before sending.', guide: 'claude-google-sheets', guideLabel: 'Claude and Google Sheets: ranges and data types' },
  'regex-extraction-workbench': { title: 'Regex Tester & Capture Group Extractor', description: 'Test JavaScript regex, inspect matches and capture groups, and export JSON or CSV. Extract text with bounded processing and a cancellation control.', guide: 'claude-zapier', guideLabel: 'Claude and Zapier: cross-app actions and data' },
}
// Route names are fixed catalog values; private input never appears in share URLs.
export function toolImage(slug?: string) {
  return { url: `${SITE.origin}${SITE.toolsPath}/share-image${slug ? `?tool=${encodeURIComponent(slug)}` : ''}`, width: 1200, height: 630, alt: slug ? `${[...UTILITIES, ...TOOLS].find((u) => u.slug === slug)?.title || 'Automation tool'} by Ahmad Yar` : 'Automation and browser tools by Ahmad Yar' }
}
export function utilityMetadata(slug: UtilitySlug): Metadata {
  const seo = UTILITY_SEO[slug]
  const canonical = `${SITE.origin}${SITE.toolsPath}/${slug}`
  const title = `${seo.title} | ${SITE.name}`
  const image = toolImage(slug)
  return {
    title: seo.title, description: seo.description, alternates: { canonical },
    authors: [{ name: SITE.name, url: SITE.origin }], category: 'Developer tools',
    robots: { index: process.env.VERCEL_ENV === 'production', follow: true },
    openGraph: { title, description: seo.description, url: canonical, type: 'website', locale: 'en_US', siteName: SITE.name, images: [image] },
    twitter: { card: 'summary_large_image', title, description: seo.description, images: [image] },
  }
}
