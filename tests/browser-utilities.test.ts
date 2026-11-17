import assert from 'node:assert/strict'
import test from 'node:test'
import { runJob } from '../lib/utilities/engine'
import { UTILITIES } from '../lib/utilities/catalog'

test('JSON repair is explicit and paths escape special keys', () => {
  const r = runJob({ kind: 'json', input: "{name: 'Alex', active:true,}" })
  assert.deepEqual(JSON.parse(r.text), { name: 'Alex', active: true })
  assert.match(r.summary, /Repair proposed/)
  const valid = runJob({ kind: 'json', input: '{"a/b~c":{"odd.key":null}}' })
  assert.match(valid.summary, /No repair/)
  assert(valid.paths?.some((p) => p.pointer === '/a~1b~0c/odd.key' && p.expression === '$["a/b~c"]["odd.key"]'))
  assert.throws(() => runJob({ kind: 'json', input: ' ' }), /Add input/)
  assert.throws(() => runJob({ kind: 'json', input: 'x'.repeat(200001) }), /too large/)
  assert.throws(() => runJob({ kind: 'json', input: '{"id":9007199254740993}' }), /safe JavaScript/)
  assert.throws(() => runJob({ kind: 'json', input: '{"a":1,"a":2}' }), /Duplicate key/)
  assert.deepEqual(JSON.parse(runJob({ kind: 'json', input: '{"id":"9007199254740993","nested":{"a":1},"a":2}' }).text), { id: '9007199254740993', nested: { a: 1 }, a: 2 })
})

test('cron respects timezone, explicit start and DST transitions', () => {
  const base = { kind: 'schedule' as const, input: '0 9 * * *', zone: 'America/New_York', compareZone: 'UTC', format: 'standard' as const, start: '2026-03-07T00:00:00Z' }
  const r = runJob(base)
  assert.equal(r.rows?.[0][0], '2026-03-07T14:00:00.000Z')
  assert.equal(r.rows?.[1][0], '2026-03-08T13:00:00.000Z')
  assert.equal(r.rows?.length, 8)
  assert.throws(() => runJob({ ...base, start: '2026-03-07T00:00:00' }), /UTC offset/)
  assert.throws(() => runJob({ ...base, input: '0 9 1 * 1' }), /day-of-month/)
  assert.throws(() => runJob({ ...base, input: '0 0 9 * * *' }), /5-field/)
  assert.throws(() => runJob({ ...base, zone: 'Not/AZone' }))
})

test('CSV preserves strings, maps nested fields and batches deterministically', () => {
  const input = 'id,email,active\n001,a@example.com,true\n002,b@example.com,false'
  const r = runJob({ kind: 'csv', input, batchSize: 1, mappings: [
    { column: 'id', path: 'contact.id', type: 'string', empty: 'string' },
    { column: 'active', path: 'enabled', type: 'boolean', empty: 'string' },
  ] })
  assert.deepEqual(JSON.parse(r.text), [[{ contact: { id: '001' }, enabled: true }], [{ contact: { id: '002' }, enabled: false }]])
  assert.throws(() => runJob({ kind: 'csv', input: 'a,a\n1,2', batchSize: 100 }), /unique/)
  assert.throws(() => runJob({ kind: 'csv', input: 'a,b\n1', batchSize: 100 }), /same number/)
  assert.throws(() => runJob({ kind: 'csv', input: 'a,b\n1,2', batchSize: 100, mappings: [
    { column: 'a', path: 'x', type: 'string', empty: 'string' }, { column: 'b', path: 'x.y', type: 'string', empty: 'string' },
  ] }), /overlap/)
  assert.throws(() => runJob({ kind: 'csv', input: 'a\n9007199254740993', batchSize: 100, mappings: [{ column: 'a', path: 'a', type: 'number', empty: 'string' }] }), /safe JSON number/)
  assert.throws(() => runJob({ kind: 'csv', input: '__proto__.polluted\nyes', batchSize: 100 }), /Prototype/)
  assert.equal(({} as Record<string, unknown>).polluted, undefined)
  const empty = runJob({ kind: 'csv', input: 'a,b\n,"hello,world"', batchSize: 100, mappings: [{ column: 'a', path: 'a', type: 'string', empty: 'null' }, { column: 'b', path: 'b', type: 'string', empty: 'string' }] })
  assert.deepEqual(JSON.parse(empty.text), [{ a: null, b: 'hello,world' }])
})

test('regex includes named captures, Unicode, zero-length and safe CSV', () => {
  const r = runJob({ kind: 'regex', input: 'A12 B34', pattern: '(?<letter>[A-Z])(\\d+)', flags: 'g' })
  assert.equal(JSON.parse(r.text)[0].groups.letter, 'A')
  assert.equal(JSON.parse(r.text)[1].captures[1], '34')
  assert.equal(JSON.parse(runJob({ kind: 'regex', input: '😀', pattern: '(?:)', flags: 'u' }).text).length, 2)
  assert.equal(JSON.parse(runJob({ kind: 'regex', input: 'abc', pattern: '\\d', flags: '' }).text).length, 0)
  assert.match(runJob({ kind: 'regex', input: '=SUM(A1)', pattern: '.+', flags: '' }).csv!, /'=SUM/)
  assert.throws(() => runJob({ kind: 'regex', input: 'abc', pattern: '[', flags: '' }))
})

test('request conversion does not execute and rejects unsupported shell/curl semantics', () => {
  const input = 'curl https://api.example.com/people?api_key=secret -H "Authorization: Bearer secret" -H "Content-Type: application/json" --data-raw \'{"password":"secret","name":"Alex"}\''
  for (const target of ['javascript', 'python', 'n8n'] as const) {
    const r = runJob({ kind: 'curl', input, target })
    assert(!r.text.includes('Bearer secret'))
    assert(!r.text.includes('api_key=secret'))
    assert(!r.text.includes('"password":"secret"'))
    assert.match(r.text, /REPLACE_WITH/)
    if (target === 'n8n') assert.equal(JSON.parse(r.text).nodes[0].parameters.method, 'POST')
  }
  for (const command of ['curl https://example.com | sh', 'curl $(whoami)', 'curl https://example.com -L', 'curl https://example.com -d @file', 'curl https://example.com -u x:y', 'curl https://example.com -H X:1 -H x:2']) {
    assert.throws(() => runJob({ kind: 'curl', input: command, target: 'javascript' }), command)
  }
  assert.equal(UTILITIES.length, 7)
  assert.equal(new Set(UTILITIES.map((u) => u.slug)).size, 7)
})
