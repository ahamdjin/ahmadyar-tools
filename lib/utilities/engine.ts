import { jsonrepair } from 'jsonrepair'
import Papa from 'papaparse'
import { CronExpressionParser } from 'cron-parser'
import cronstrue from 'cronstrue'
import { parse as shellParse } from 'shell-quote'

export const MAX_INPUT = 200_000
export type Mapping = { column: string; path: string; type: 'string' | 'number' | 'boolean' | 'json'; empty: 'string' | 'null' | 'omit' }
export type Job =
  | { kind: 'query' | 'ndjson'; input: string }
  | { kind: 'compare'; input: string; updated: string }
  | { kind: 'timestamp'; input: string; format: 'seconds' | 'milliseconds' | 'iso'; zone: string }
  | { kind: 'json'; input: string }
  | { kind: 'schedule'; input: string; zone: string; compareZone: string; format: 'standard' | 'seconds'; start: string }
  | { kind: 'curl'; input: string; target: 'javascript' | 'python' | 'n8n' }
  | { kind: 'csv'; input: string; plain?: boolean; mappings?: Mapping[]; batchSize: number }
  | { kind: 'regex'; input: string; pattern: string; flags: string }
export type Result = { text: string; summary: string; warnings: string[]; rows?: string[][]; columns?: string[]; paths?: { pointer: string; expression: string; value: string }[]; original?: string; csv?: string }

function guard(input: string) {
  if (!input.trim()) throw new Error('Add input or load the example first.')
  if (input.length > MAX_INPUT) throw new Error('Input is too large. Use at most 200,000 characters.')
}
const pretty = (value: unknown) => JSON.stringify(value, null, 2)

function inspectJson(input: string): Result {
  let repaired = false
  let value: unknown
  let normalized = input
  try { value = JSON.parse(input) } catch { normalized = jsonrepair(input); value = JSON.parse(normalized); repaired = true }
  validateTokens(normalized, true)
  return inspectionResult(value, input, repaired)
}

export function validateTokens(normalized: string, checkNumbers: boolean) {
  const scopes: (Set<string> | null)[] = []
  const tokens = /"(?:\\.|[^"\\])*"|[{}\[\]]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g
  for (const token of normalized.matchAll(tokens)) {
    const text = token[0]
    if (text === '{') scopes.push(new Set())
    else if (text === '[') scopes.push(null)
    else if (text === '}' || text === ']') scopes.pop()
    else if (text.startsWith('"')) {
      if (/^\s*:/.test(normalized.slice(token.index + text.length))) {
        const key = JSON.parse(text) as string
        const keys = scopes.at(-1)
        if (keys?.has(key)) throw new Error(`Duplicate key ${JSON.stringify(key)}. Resolve it in the original before formatting or repairing.`)
        keys?.add(key)
      }
    } else if (checkNumbers) {
      const n = Number(text)
      if (!Number.isFinite(n) || (Number.isInteger(n) && !Number.isSafeInteger(n))) throw new Error('A number exceeds safe JavaScript precision. Quote large identifiers or use a lossless JSON tool before continuing.')
    }
  }
}

function inspectionResult(value: unknown, input: string, repaired: boolean): Result {
  const paths: NonNullable<Result['paths']> = []
  function walk(node: unknown, pointer: string, expression: string, depth: number) {
    if (depth > 40) throw new Error('JSON nesting exceeds the 40-level inspection limit.')
    if (paths.length >= 500) return
    paths.push({ pointer, expression, value: typeof node === 'object' && node !== null ? (Array.isArray(node) ? `Array (${node.length})` : 'Object') : String(node).slice(0, 100) })
    if (node !== null && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) {
        if (paths.length >= 500) break
        walk(child, `${pointer}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`, `${expression}[${Array.isArray(node) ? key : JSON.stringify(key)}]`, depth + 1)
      }
    }
  }
  walk(value, '', '$', 0)
  return { text: pretty(value), original: input, paths, summary: repaired ? 'Repair proposed. Compare both versions before using it.' : 'Valid JSON. No repair was needed.', warnings: [repaired ? 'Repairs can change meaning. This is a proposal, not proof of the intended values.' : 'JSON values are parsed and reserialized, not preserved byte for byte.', 'Numeric formatting and decimal precision follow JavaScript. Keep exact amounts and identifiers as strings when required.', ...(paths.length === 500 ? ['Field inspection is limited to 500 paths. The output still contains the complete value.'] : [])] }
}

function schedule(job: Extract<Job, { kind: 'schedule' }>): Result {
  const fields = job.input.trim().split(/\s+/)
  const count = job.format === 'standard' ? 5 : 6
  if (fields.length !== count) throw new Error(`Choose a ${count}-field expression for this format. Quartz and AWS expressions are not supported.`)
  if (/[?#HLW]/i.test(job.input)) throw new Error('Use numeric cron fields, ranges, lists and steps. Quartz syntax, names and hashed/random schedules are not supported.')
  if (job.format === 'seconds' && fields[0] !== '0') throw new Error('This preview supports a fixed zero seconds field. Use five-field cron for minute-level schedules.')
  // A single explicit DOM or DOW avoids platform-dependent AND/OR interpretations.
  const offset = count === 6 ? 1 : 0
  if (fields[2 + offset] !== '*' && fields[4 + offset] !== '*') throw new Error('Choose either day-of-month or day-of-week, leaving the other as *. Platform semantics differ when both are restricted.')
  const start = new Date(job.start)
  if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(job.start) || !Number.isFinite(start.getTime())) throw new Error('Choose a valid start date/time with a UTC offset, for example 2026-11-17T00:00:00Z.')
  const fmt = (zone: string) => new Intl.DateTimeFormat('en-GB', { timeZone: zone, dateStyle: 'medium', timeStyle: 'long' })
  const primary = fmt(job.zone), secondary = fmt(job.compareZone)
  const cron = CronExpressionParser.parse(job.input, { currentDate: start, tz: job.zone, endDate: new Date(start.getTime() + 366 * 86400000 * 8) })
  const rows = Array.from({ length: 8 }, () => {
    const next = cron.next().toDate()
    return [next.toISOString(), primary.format(next), secondary.format(next)]
  })
  return { text: pretty({ expression: job.input.trim(), timezone: job.zone, runs: rows.map(([utc, local, comparison]) => ({ utc, local, comparison })) }), summary: cronstrue.toString(job.input), rows, warnings: ['Times use your selected IANA time zone and its daylight-saving rules. Verify skipped or repeated local times with the actual scheduler.', 'Preview only: this does not create or run a scheduled job. Five-field cron is not interchangeable with Quartz or AWS syntax.'] }
}

function csvPayload(job: Extract<Job, { kind: 'csv' }>): Result {
  const parsed = Papa.parse<string[]>(job.input, { skipEmptyLines: 'greedy', delimiter: ',' })
  if (parsed.errors.length) throw new Error(`CSV could not be parsed: ${parsed.errors[0].message}`)
  const [columns, ...rows] = parsed.data
  if (!columns?.length || columns.some((c) => !c.trim()) || new Set(columns).size !== columns.length) throw new Error('CSV headers must be nonempty and unique.')
  if (columns.length > 100 || rows.length > 3000) throw new Error('Use at most 100 columns and 3,000 data rows.')
  if (rows.some((row) => row.length !== columns.length)) throw new Error('Each CSV row must have the same number of fields as the header.')
  if (!rows.length) throw new Error('Add at least one data row below the header.')
  if (job.plain) {
    const records = rows.map(row => Object.fromEntries(columns.map((key,i) => [key,row[i]])))
    return {text: pretty(records), summary: rows.length + ' records · ' + columns.length + ' columns', warnings: ['Values are strings. Use API payload options to change field types or create batches.']}
  }
  const mappings = job.mappings ?? columns.map((column) => ({ column, path: column, type: 'string' as const, empty: 'string' as const }))
  if (mappings.some((m) => !columns.includes(m.column)) || new Set(mappings.map((m) => m.column)).size !== mappings.length) throw new Error('Mapping columns are duplicated or no longer match this CSV. Inspect columns again.')
  const paths = mappings.filter((m) => m.path.trim()).map((m) => m.path.trim().split('.'))
  for (const parts of paths) {
    if (parts.length > 10 || parts.some((p) => !p || ['__proto__', 'constructor', 'prototype'].includes(p))) throw new Error('Use nonempty dot-separated keys, up to 10 levels. Prototype-related keys are not allowed.')
  }
  const joined = paths.map((p) => p.join('.'))
  if (!joined.length) throw new Error('Map at least one column to an output field.')
  if (joined.some((p, i) => joined.some((q, j) => i !== j && (q === p || q.startsWith(`${p}.`))))) throw new Error('Output paths overlap. Do not map both contact and contact.email, or repeat a path.')
  const output = rows.map((row, index) => {
    const object: Record<string, unknown> = Object.create(null)
    for (const m of mappings) {
      if (!m.path.trim()) continue
      const raw = row[columns.indexOf(m.column)]
      if (raw === '' && m.empty === 'omit') continue
      let value: unknown = raw
      if (raw === '' && m.empty === 'null') value = null
      else if (m.type !== 'string') {
        if (m.type === 'number') {
          if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(raw) || !Number.isFinite(Number(raw)) || (Number.isInteger(Number(raw)) && !Number.isSafeInteger(Number(raw)))) throw new Error(`Row ${index + 2}, ${m.column}: not a safe JSON number. Keep identifiers as strings.`)
          value = Number(raw)
        } else if (m.type === 'boolean') {
          if (!/^(true|false)$/i.test(raw)) throw new Error(`Row ${index + 2}, ${m.column}: boolean must be true or false.`)
          value = raw.toLowerCase() === 'true'
        } else { try { value = JSON.parse(raw) } catch { throw new Error(`Row ${index + 2}, ${m.column}: invalid JSON value.`) } }
      }
      const parts = m.path.trim().split('.')
      let target = object
      for (const part of parts.slice(0, -1)) { target[part] ??= Object.create(null); target = target[part] as Record<string, unknown> }
      target[parts.at(-1)!] = value
    }
    return object
  })
  if (!Number.isInteger(job.batchSize) || job.batchSize < 1 || job.batchSize > 1000) throw new Error('Batch size must be a whole number from 1 to 1,000.')
  const batches = Array.from({ length: Math.ceil(output.length / job.batchSize) }, (_, i) => output.slice(i * job.batchSize, (i + 1) * job.batchSize))
  return { text: pretty(batches.length === 1 ? output : batches), columns, summary: `${rows.length} records in ${batches.length} ${batches.length === 1 ? 'batch' : 'batches'}.`, warnings: ['All fields start as strings to preserve IDs and leading zeros. Change types deliberately.', 'Multiple batches are an array of arrays, not a provider-specific API envelope. Check the target API schema before sending.'] }
}

function regexExtract(job: Extract<Job, { kind: 'regex' }>): Result {
  if (job.pattern.length > 1000) throw new Error('Keep the pattern under 1,000 characters.')
  if (!job.pattern) throw new Error('Add a regular expression without / delimiters.')
  if (/[^dgimsuvy]/.test(job.flags) || new Set(job.flags).size !== job.flags.length) throw new Error('Use unique JavaScript regex flags only.')
  const re = new RegExp(job.pattern, job.flags.includes('g') ? job.flags : `${job.flags}g`)
  const matches: { match: string; index: number; captures: (string | null)[]; groups: Record<string, string | null> }[] = []
  for (const m of job.input.matchAll(re)) {
    if (matches.length >= 1000) throw new Error('More than 1,000 matches. Narrow the pattern or reduce the input.')
    matches.push({ match: m[0], index: m.index, captures: m.slice(1).map((v) => v ?? null), groups: Object.fromEntries(Object.entries(m.groups ?? {}).map(([k, v]) => [k, v ?? null])) })
  }
  const csvRows = matches.map((m) => ({ match: m.match, index: m.index, captures: JSON.stringify(m.captures), groups: JSON.stringify(m.groups) }))
  return { text: pretty(matches), csv: Papa.unparse(csvRows, { escapeFormulae: true }), summary: `${matches.length} matches. JavaScript regex; global extraction is enabled.`, rows: matches.map((m) => [String(m.index), m.match, pretty(m.captures), pretty(m.groups)]), warnings: ['Offsets are UTF-16 string indices, not byte offsets. Other regex engines may produce different results. CSV export escapes spreadsheet-formula prefixes.'] }
}

export function runJob(job: Job): Result {
  guard(job.input)
  switch (job.kind) {
    case 'query': {
      const input = job.input.trim()
      const query = /^https?:\/\//i.test(input) ? new URL(input).search : input.split('#')[0]
      const fields: Record<string, string[]> = Object.create(null)
      const params = new URLSearchParams(query)
      for (const [key, value] of params) (fields[key] ??= []).push(value)
      const warnings: string[] = []
      try { decodeURIComponent(query) } catch {
        warnings.push('Malformed percent encoding or invalid UTF-8 detected. The result shows how a browser interprets it; check the original URL before reusing it.')
      }
      const keys = Object.keys(fields).length
      return { text: pretty(fields), summary: params.size ? params.size + ' values across ' + keys + ' distinct names.' + (warnings.length ? ' Check encoding in Notes & limitations.' : '') : 'No query parameters found.', warnings }
    }
    case 'ndjson': {
      const records: string[] = []
      let blanks = 0
      if (job.input.startsWith('\uFEFF')) throw new Error('Line 1: Remove the byte order mark before converting JSON Lines.')
      for (const [i, line] of job.input.split('\n').entries()) {
        if (!line.trim()) { blanks++; continue }
        try {
          JSON.parse(line)
          validateTokens(line, false)
          records.push(line.trim())
        } catch (error) { throw new Error('Line ' + (i + 1) + ': ' + (error instanceof Error ? error.message : 'Invalid JSON')) }
      }
      if (job.input.endsWith('\n')) blanks--
      return { text: '[\n' + records.join(',\n') + '\n]', summary: records.length + ' records converted.' + (blanks ? ' Skipped blank lines: ' + blanks + '.' : ''), warnings: ['Number literals are preserved exactly in the export. The application importing the array must support the precision you need.'] }
    }
    case 'compare': return compareJson(job)
    case 'timestamp': return convertTimestamp(job)
    case 'json': return inspectJson(job.input)
    case 'schedule': return schedule(job)
    case 'csv': return csvPayload(job)
    case 'regex': return regexExtract(job)
    case 'curl': return convertCurl(job)
  }
}

function compareJson(job: Extract<Job, { kind: 'compare' }>): Result {
  guard(job.updated)
  const parse = (text: string, label: string) => {
    try { JSON.parse(text) } catch { throw new Error(`${label} must be valid JSON. Use JSON repair first if needed.`) }
    const value = JSON.parse(inspectJson(text).text) as unknown
    const pending = [{ value, depth: 0 }]
    while (pending.length) {
      const current = pending.pop()!
      if (current.depth > 40) throw new Error('JSON nesting exceeds the 40-level comparison limit.')
      if (current.value !== null && typeof current.value === 'object') for (const child of Object.values(current.value)) pending.push({ value: child, depth: current.depth + 1 })
    }
    return value
  }
  const before = parse(job.input, 'Original'), after = parse(job.updated, 'Updated')
  type Change = { type: 'added' | 'removed' | 'changed'; pointer: string; before?: unknown; after?: unknown }
  const changes: Change[] = []
  let truncated = false
  function add(change: Change) { if (changes.length < 500) changes.push(change); else truncated = true }
  function walk(a: unknown, b: unknown, pointer: string, depth: number) {
    if (depth > 40) throw new Error('JSON nesting exceeds the 40-level comparison limit.')
    if (a === b) return
    if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
      const x = a as Record<string, unknown>, y = b as Record<string, unknown>
      for (const key of new Set([...Object.keys(x), ...Object.keys(y)])) {
        const path = `${pointer}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`
        if (!Object.hasOwn(x, key)) add({ type: 'added', pointer: path, after: y[key] })
        else if (!Object.hasOwn(y, key)) add({ type: 'removed', pointer: path, before: x[key] })
        else walk(x[key], y[key], path, depth + 1)
      }
    } else add({ type: 'changed', pointer, before: a, after: b })
  }
  walk(before, after, '', 0)
  return { text: pretty({ changes, truncated }), summary: truncated ? 'Showing the first 500 differences. The report is incomplete.' : changes.length ? `${changes.length} differences found.` : 'No differences. Object key order is ignored.', rows: changes.map((c) => [c.type, c.pointer || '(root)', Object.hasOwn(c, 'before') ? pretty(c.before) : '(absent)', Object.hasOwn(c, 'after') ? pretty(c.after) : '(absent)']), warnings: ['Arrays are compared by position, not matched by IDs. Paths use JSON Pointer, not JSON Patch operations.', 'Numbers use JavaScript decimal precision. Keep exact monetary values and large identifiers as strings. Reports stop at 500 differences.'] }
}

function convertTimestamp(job: Extract<Job, { kind: 'timestamp' }>): Result {
  const input = job.input.trim()
  let ms: bigint
  if (job.format === 'iso') {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/.exec(input)
    if (!match) throw new Error('Use an ISO date/time with Z or an explicit offset, for example 2026-11-17T09:00:00Z.')
    const [, year, month, day, hour, minute, second = '0', , offset] = match
    const y = Number(year), m = Number(month), d = Number(day)
    const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (m < 1 || m > 12 || d < 1 || d > days[m - 1] || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59 || (offset !== 'Z' && (Number(offset.slice(1, 3)) > 23 || Number(offset.slice(4)) > 59))) throw new Error('Invalid calendar date, time or UTC offset.')
    const parsed = Date.parse(input)
    if (!Number.isFinite(parsed)) throw new Error('Date is outside the supported range.')
    ms = BigInt(parsed)
  } else if (job.format === 'seconds' && /^[+-]?\d{1,16}\.\d{1,3}$/.test(input)) {
    const [whole, fraction] = input.split('.')
    ms = BigInt(whole + fraction.padEnd(3, '0'))
  } else {
    if (!/^[+-]?\d+$/.test(input)) throw new Error(job.format === 'seconds' ? 'Enter Unix seconds with at most three fractional digits.' : 'Enter whole-number Unix milliseconds.')
    if (input.length > 20) throw new Error('Timestamp is outside the supported date range.')
    ms = BigInt(input) * BigInt(job.format === 'seconds' ? 1000 : 1)
  }
  if (ms < BigInt('-8640000000000000') || ms > BigInt('8640000000000000')) throw new Error('Timestamp is outside the supported date range.')
  let formatter: Intl.DateTimeFormat
  try { formatter = new Intl.DateTimeFormat('en-GB', { timeZone: job.zone, dateStyle: 'full', timeStyle: 'long' }) }
  catch { throw new Error('Enter a valid IANA time zone, for example UTC or America/New_York.') }
  const date = new Date(Number(ms)), absolute = ms < BigInt(0) ? -ms : ms
  const seconds = `${ms < BigInt(0) ? '-' : ''}${absolute / BigInt(1000)}${absolute % BigInt(1000) ? `.${String(absolute % BigInt(1000)).padStart(3, '0').replace(/0+$/, '')}` : ''}`
  const value = { iso: date.toISOString(), unixSeconds: seconds, unixMilliseconds: ms.toString(), timeZone: job.zone, localTime: formatter.format(date) }
  return { text: pretty(value), summary: 'One instant, shown in UTC and your selected time zone.', rows: [['ISO 8601 (UTC)', value.iso], ['Unix seconds', seconds], ['Unix milliseconds', value.unixMilliseconds], [job.zone, value.localTime]], warnings: ['Unix time does not represent leap seconds. ISO input requires an offset; ambiguous local times are not guessed.', 'Input supports millisecond precision. Time-zone display follows your browser timezone database.'] }
}

function convertCurl(job: Extract<Job, { kind: 'curl' }>): Result {
  if (/`|\$\(/.test(job.input)) throw new Error('Shell command substitutions are not supported. Paste a literal request instead.')
  const tokens = shellParse(job.input.replace(/\\\r?\n/g, ' '), (name) => `\$${name}`).map((token) => {
    if (typeof token === 'object' && 'op' in token && token.op === 'glob' && 'pattern' in token && /^https?:\/\/[^*\[\]{}]+$/.test(String(token.pattern))) return String(token.pattern)
    return token
  })
  if (tokens.some((t) => typeof t !== 'string') || tokens[0] !== 'curl') throw new Error('Paste one cURL command. Shell operators, comments, substitutions and pipelines are not supported.')
  const args = tokens as string[]
  let url = '', method = '', body: string | undefined
  const headers: Record<string, string> = Object.create(null)
  for (let i = 1; i < args.length; i++) {
    const a = args[i]
    if (['-s', '--silent', '-S', '--show-error', '--fail', '--fail-with-body'].includes(a)) continue
    if (['-X', '--request', '-H', '--header', '-d', '--data', '--data-raw', '--data-binary', '--url', '-u', '--user'].includes(a)) {
      const value = args[++i]
      if (value === undefined) throw new Error(`Missing value after ${a}.`)
      if (['-X', '--request'].includes(a)) method = value.toUpperCase()
      else if (['-H', '--header'].includes(a)) {
        const colon = value.indexOf(':')
        if (colon < 1 || /[\r\n]/.test(value)) throw new Error('Headers need a name: value pair without line breaks.')
        const key = value.slice(0, colon).trim()
        if (!/^[!#$%&'*+.^_`|~\w-]+$/.test(key)) throw new Error('Invalid header name.')
        if (Object.keys(headers).some((k) => k.toLowerCase() === key.toLowerCase())) throw new Error('Repeated header names are not supported.')
        headers[key] = value.slice(colon + 1).trim()
      } else if (a === '--url') { if (url) throw new Error('Only one URL is supported.'); url = value }
      else if (a === '-u' || a === '--user') throw new Error('Basic authentication is not converted. Use an explicit placeholder Authorization header instead.')
      else { if (body !== undefined || value.startsWith('@')) throw new Error('Only one literal body is supported; files and multiple data options are not converted.'); body = value }
    } else if (a.startsWith('-')) throw new Error(`Unsupported flag ${a}. Supported: --request, --header, --url, one --data/--data-raw/--data-binary body and quiet/fail flags. No options are silently dropped.`)
    else { if (url) throw new Error('Only one URL is supported.'); url = a }
  }
  const parsed = new URL(url)
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Only HTTP and HTTPS request URLs are supported.')
  if (parsed.username || parsed.password) throw new Error('Remove credentials from the URL and use an Authorization placeholder.')
  const warnings = ['Conversion only. Nothing is sent, executed or imported. Supported cURL subset only; no redirects, file uploads, shell execution or cookie jars.', 'Check the output for personal data and secrets in paths, bodies and custom headers. Automatic redaction is not exhaustive.']
  for (const key of Object.keys(headers)) if (/authorization|cookie|token|api[-_]?key|secret/i.test(key)) headers[key] = `REPLACE_WITH_${key.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
  for (const key of [...parsed.searchParams.keys()]) if (/token|key|secret|password|signature|credential/i.test(key)) parsed.searchParams.set(key, 'REPLACE_WITH_SECRET')
  if (body) {
    try {
      const value: unknown = JSON.parse(body)
      let changed = false
      function redact(node: unknown, depth = 0): unknown {
        if (depth > 40) throw new Error('Request body nesting exceeds the 40-level conversion limit.')
        if (Array.isArray(node)) return node.map((item) => redact(item, depth + 1))
        if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([key, val]) => {
          if (/authorization|cookie|token|api[-_]?key|secret|password|credential/i.test(key)) { changed = true; return [key, 'REPLACE_WITH_SECRET'] }
          return [key, redact(val, depth + 1)]
        }))
        return node
      }
      const safe = redact(value)
      if (changed) body = JSON.stringify(safe)
    } catch (error) {
      if (error instanceof SyntaxError) warnings.push('The body is not JSON. Secrets in unstructured or form bodies are not automatically removed.')
      else throw error
    }
  }
  if (body && !Object.keys(headers).some((h) => h.toLowerCase() === 'content-type')) headers['Content-Type'] = 'application/x-www-form-urlencoded'
  method ||= body === undefined ? 'GET' : 'POST'
  if (!/^[A-Z]+$/.test(method) || (body !== undefined && ['GET', 'HEAD'].includes(method))) throw new Error('This method/body combination is not safely portable to fetch. Choose a body-compatible method.')
  const safeUrl = parsed.href
  let text: string
  if (job.target === 'python') {
    // JSON literals are decoded instead of interpolating arbitrary values into Python syntax.
    const literal = (value: unknown) => `json.loads(${JSON.stringify(JSON.stringify(value))})`
    text = `import json\nimport requests\n\nurl = ${literal(safeUrl)}\nheaders = ${literal(headers)}\n${body !== undefined ? `body = ${literal(body)}\n` : ''}\nresponse = requests.request(${literal(method)}, url, headers=headers${body !== undefined ? ', data=body' : ''}, timeout=30)\nresponse.raise_for_status()\nprint(response.text)`
  } else if (job.target === 'n8n') {
    text = pretty({ nodes: [{ name: 'HTTP Request', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [0, 0], parameters: { method, url: safeUrl, sendHeaders: true, headerParameters: { parameters: Object.entries(headers).map(([name, value]) => ({ name, value })) }, ...(body !== undefined ? { sendBody: true, contentType: 'raw', rawContentType: headers[Object.keys(headers).find((k) => k.toLowerCase() === 'content-type')!] || 'text/plain', body } : {}) } }], connections: {} })
    warnings.push('n8n output is an HTTP Request node template, not a tested live workflow. Configure credentials securely and check your installed node version.')
  } else {
    text = `const url = ${pretty(safeUrl)};\nconst response = await fetch(url, ${pretty({ method, headers, ...(body !== undefined ? { body } : {}) })});\nif (!response.ok) throw new Error(\`HTTP \${response.status}\`);\nconsole.log(await response.text());`
    warnings.push('Generated JavaScript is intended for a trusted server-side runtime. Browser requests may be blocked by CORS.')
  }
  return { text, summary: `${method} request converted. Sensitive header/query values replaced with placeholders.`, warnings }
}
