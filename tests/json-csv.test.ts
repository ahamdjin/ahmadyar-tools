import assert from 'node:assert/strict'
import test from 'node:test'
import Papa from 'papaparse'
import {jsonCsv} from '../lib/utilities/json-csv'
import {runJob} from '../lib/utilities/engine'

test('plain CSV conversion retains literal keys, strings and a single record array',()=>{
  const result=runJob({kind:'csv',plain:true,batchSize:1,input:'contact.id,active\n00123,true\n00456,false'})
  assert.deepEqual(JSON.parse(result.text),[{'contact.id':'00123',active:'true'},{'contact.id':'00456',active:'false'}])
})
test('CSV round trip preserves quoted text, identifiers and literal dotted keys',()=>{
  const result=jsonCsv(JSON.stringify([{id:'00123','a.b':'literal',a:{b:'nested'},note:'hello,"world"\nagain',formula:'=SUM(1)'}]))
  assert.deepEqual(Papa.parse(result.csv).data,[['id','a\\.b','a.b','note','formula'],['00123','literal','nested','hello,"world"\nagain',"'=SUM(1)"]])
})
test('expanding one array repeats parent values without multiplying sibling arrays',()=>{
  const result=jsonCsv('[{"id":1,"x":[1,2],"y":[3,4]},{"id":2,"x":[]}]',true,'x')
  assert.deepEqual(result.preview,[[1,1,'[3,4]'],[1,2,'[3,4]'],[2,'','']])
  assert.deepEqual(jsonCsv('{"a":{"b":1}}',false).preview,[['{"b":1}']])
})
test('rejects invalid records and lossy integer or duplicate fields',()=>{
  for(const s of ['[]','[null]','{bad}','{"a":1,"a":3}','{"id":1234567890123456789}'])assert.throws(()=>jsonCsv(s))
})
