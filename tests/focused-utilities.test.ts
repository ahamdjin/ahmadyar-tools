import assert from 'node:assert/strict'
import test from 'node:test'
import { runJob } from '../lib/utilities/engine'

const compare = (input: string, updated: string) => runJob({ kind: 'compare', input, updated })
const timestamp = (input: string, format: 'seconds' | 'milliseconds' | 'iso' = 'seconds', zone = 'UTC') => JSON.parse(runJob({ kind: 'timestamp', input, format, zone }).text)

test('JSON comparison preserves value types, missing fields and escaped pointers', () => {
  const result = JSON.parse(compare('{"a":null,"b":false,"a/b~":1}', '{"a":0,"new":true,"a/b~":2}').text)
  assert.deepEqual(result.changes, [
    { type: 'changed', pointer: '/a', before: null, after: 0 },
    { type: 'removed', pointer: '/b', before: false },
    { type: 'changed', pointer: '/a~1b~0', before: 1, after: 2 },
    { type: 'added', pointer: '/new', after: true },
  ])
})
test('JSON comparison ignores key order but compares arrays by position and root types', () => {
  assert.equal(JSON.parse(compare('{"b":2,"a":1}', '{"a":1,"b":2}').text).changes.length, 0)
  assert.equal(JSON.parse(compare('[1,2]', '[2,1]').text).changes.length, 2)
  assert.equal(JSON.parse(compare('null', '[]').text).changes[0].pointer, '')
})
test('JSON comparison rejects malformed input, duplicate keys and unsafe integers', () => {
  assert.throws(() => compare('{a:1}', '{}'), /valid JSON/)
  assert.throws(() => compare('{}', '{"a":1,"a":2}'), /Duplicate key/)
  assert.throws(() => compare('{"id":9007199254740993}', '{}'), /safe JavaScript/)
})
test('JSON comparison marks truncated reports explicitly', () => {
  const a = Object.fromEntries(Array.from({ length: 501 }, (_, i) => [i, false]))
  const b = Object.fromEntries(Array.from({ length: 501 }, (_, i) => [i, true]))
  const result = JSON.parse(compare(JSON.stringify(a), JSON.stringify(b)).text)
  assert.equal(result.changes.length, 500); assert.equal(result.truncated, true)
})
test('timestamp formats represent the same instant with exact negative milliseconds', () => {
  assert.equal(timestamp('0').iso, '1970-01-01T00:00:00.000Z')
  assert.equal(timestamp('-1', 'milliseconds').unixSeconds, '-0.001')
  assert.equal(timestamp('1001', 'milliseconds').unixSeconds, '1.001')
  assert.equal(timestamp('2026-11-17T09:00:00+05:00', 'iso').iso, '2026-11-17T04:00:00.000Z')
  assert.equal(timestamp('2024-02-29T00:00Z', 'iso').unixMilliseconds, '1709164800000')
})
test('timestamps reject invalid calendar values, offsets, units and zones', () => {
  for (const value of ['2026-02-29T09:00Z', '2026-04-31T09:00Z', '2026-11-17T24:00Z', '2026-11-17T09:00+24:00', '2026-11-17T09:00']) assert.throws(() => timestamp(value, 'iso'))
  assert.throws(() => timestamp('1.5'), /whole-number/)
  assert.throws(() => timestamp('8640000000000001', 'milliseconds'), /supported date range/)
  assert.throws(() => timestamp('0', 'seconds', 'Invalid/Zone'), /valid IANA/)
})
test('timestamp display changes zone without changing UTC', () => {
  const utc = timestamp('1794906000'), ny = timestamp('1794906000', 'seconds', 'America/New_York')
  assert.equal(utc.iso, ny.iso); assert.notEqual(utc.localTime, ny.localTime)
})
