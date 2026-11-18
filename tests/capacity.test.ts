import assert from 'node:assert/strict'
import test from 'node:test'
import { assess } from '../lib/utilities/capacity'

test('retry budget includes N attempts and N-1 capped waits', () => {
  const result = assess('retry-budget-calculator',[4,800,200,500,3500,2])
  assert.deepEqual(result.rows.map(r=>r[1]),['4,300 ms','-800 ms','550 ms','16'])
  assert.equal(assess('retry-budget-calculator',[1,50,100,500,50,3]).rows[1][1],'0 ms')
  assert.throws(()=>assess('retry-budget-calculator',[1.5,50,100,500,50,3]))
})
test('queue model sizes workers across burst and recovery, subject to provider cap', () => {
  const run = (cap:number, workers=8) => assess('queue-recovery-calculator',[20,100,60,workers,200,cap,120])
  assert.deepEqual(run(50).rows.map(r=>r[1]),['40 jobs/s','3,600 jobs','180 s','10'])
  assert.equal(run(40).rows[3][1],'Downstream cap must increase')
  assert.equal(run(20).rows[2][1],'Cannot drain at normal load')
  assert.match(run(50,10).verdict,/achievable/)
})
