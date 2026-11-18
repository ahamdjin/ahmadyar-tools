import assert from 'node:assert/strict'
import test from 'node:test'
import { runJob } from '../lib/utilities/engine'

test('NDJSON preserves numeric spelling without rounding identifiers or decimals', () => {
  const raw = '{"id":12345678901234567891,"price":0.1234567890123456789,"scaled":1.00e+4}'
  const result = runJob({kind:'ndjson',input:raw+'\r\n\r\nnull\r\n'})
  assert.equal(result.text, '[\n'+raw+',\nnull\n]')
  assert.match(result.summary, /Skipped blank lines: 1/)
  assert.throws(() => runJob({kind:'ndjson',input:'\uFEFFnull'}), /byte order mark/)
})

test('query decoding flags broken escapes but accepts literal encoded percent and reserved keys', () => {
  const decode = (input: string) => runJob({kind:'query',input})
  assert.equal(decode('v=%FF').warnings.length, 1)
  assert.equal(decode('v=%ZZ').warnings.length, 1)
  const valid = decode('__proto__=%25')
  assert.equal(valid.warnings.length, 0)
  assert.deepEqual(JSON.parse(valid.text)['__proto__'], ['%'])
  assert.match(decode('https://example.com/#only').summary, /No query parameters/)
})

test('query decoder retains order, blank values and encoded plus signs', () => {
  const result = runJob({kind: 'query', input: 'https://example.com/?tag=A+B&tag=%2B&empty=#ignored'})
  assert.deepEqual(JSON.parse(result.text), {tag: ['A B', '+'], empty: ['']})
})

test('NDJSON handles blank lines and reports the original line on invalid data', () => {
  const convert = (input: string) => runJob({kind: 'ndjson', input})
  assert.deepEqual(JSON.parse(convert('0\r\n\r\n{"id":"001"}').text), [0, {id:'001'}])
  assert.throws(() => convert('0\n\n{bad}'), /Line 3:/)
  assert.throws(() => convert('{"id":1,"id":2}'), /Duplicate key/)
})
