export const scenarios = {
  'retry-budget-calculator': [
    ['Attempts including first', 4], ['Attempt timeout (ms)', 800],
    ['Initial backoff (ms)', 200], ['Maximum backoff (ms)', 500],
    ['Caller deadline (ms)', 3500], ['Layers with this retry policy', 2],
  ],
  'queue-recovery-calculator': [
    ['Normal arrivals (jobs/s)', 20], ['Burst arrivals (jobs/s)', 100],
    ['Burst duration (s)', 60], ['Concurrent workers', 8],
    ['Mean processing time (ms/job)', 200], ['Downstream cap (jobs/s)', 50],
    ['Recovery target after burst (s)', 120],
  ],
} as const
export type Scenario = keyof typeof scenarios
type Report = { verdict: string; rows: [string,string][]; detail: string[] }
const number = (n: number) => n.toLocaleString('en-US', {maximumFractionDigits: 3})

export function assess(slug: Scenario, values: number[]): Report {
  if (values.length !== scenarios[slug].length || values.some(n => !Number.isFinite(n) || n < 0 || n > 1e9)) throw Error('Use finite numbers between 0 and one billion.')
  if (slug === 'retry-budget-calculator') {
    const [attempts, timeout, base, cap, deadline, layers] = values
    if (![attempts, layers].every(n => Number.isInteger(n) && n >= 1 && n <= 10)) throw Error('Use 1 to 10 whole attempts and layers.')
    if (!timeout || !deadline) throw Error('Timeout and deadline must be positive.')
    const windows = Array.from({length: attempts - 1}, (_, i) => Math.min(cap, base * 2 ** i))
    const wait = windows.reduce((a,b) => a+b, 0), worst = attempts * timeout + wait
    return {verdict: worst <= deadline ? 'All attempts fit the single-layer deadline.' : 'The full retry sequence can overrun the deadline.',
      rows: [['Worst-case duration',number(worst)+' ms'],['Deadline margin',number(deadline-worst)+' ms'],['Mean total wait with full jitter',number(wait/2)+' ms'],['Maximum downstream calls per request',number(attempts ** layers)]],
      detail: windows.length ? windows.map((w,i) => 'Before attempt '+(i+2)+': wait 0 to '+number(w)+' ms.') : ['No retry waits: one attempt only.']}
  }
  const [normal, burst, duration, workers, ms, cap, target] = values
  if (!Number.isInteger(workers) || workers<1 || !ms || !target || !duration) throw Error('Use a positive whole worker count and positive processing time, burst duration and recovery target.')
  const workerRate = workers * 1000/ms, throughput = Math.min(workerRate,cap)
  const backlog = Math.max(0,(burst-throughput)*duration), spare = throughput-normal
  const recovery = backlog === 0 ? 0 : spare > 0 ? backlog/spare : Infinity
  // Size the whole scenario again: adding workers also reduces the backlog built during the burst.
  const required = Math.max(normal,(burst*duration+normal*target)/(duration+target))
  return {verdict: spare < 0 ? 'Normal traffic exceeds capacity.' : recovery <= target ? 'The recovery target is achievable in this model.' : 'The current configuration misses the recovery target.',
    rows:[['Effective throughput',number(throughput)+' jobs/s'],['Backlog at end of burst',number(backlog)+' jobs'],['Time to clear backlog',Number.isFinite(recovery)?number(recovery)+' s':'Cannot drain at normal load'],['Minimum workers for target',required>cap?'Downstream cap must increase':String(Math.max(1,Math.ceil(required*ms/1000)))]],
    detail:['Capacity is limited by '+(workerRate===cap?'both workers and downstream throughput.':workerRate<cap?'worker throughput.':'the downstream cap.'),'Required processing rate for this burst and recovery window: '+number(required)+' jobs/s.']}
}
