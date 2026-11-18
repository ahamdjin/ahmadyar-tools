import Papa from 'papaparse'
import { MAX_INPUT, validateTokens } from './engine'

export function jsonCsv(input: string, flatten = true, expand = '') {
  if (input.length > MAX_INPUT) throw Error('Use at most 200,000 characters.')
  let value
  try { value = JSON.parse(input) } catch { throw Error('Enter valid JSON: one object or an array of records.') }
  validateTokens(input, true)
  const records: unknown[] = Array.isArray(value) ? value : [value]
  if (!records.length || records.length > 3000) throw Error('Use between 1 and 3,000 records.')
  const headers = new Set<string>(), arrays = new Set<string>()
  const maps = records.map(record => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw Error('Every record must be a JSON object.')
    const map = new Map<string,unknown>()
    function visit(obj: object, prefix: string[], depth: number) {
      if (depth > 40) throw Error('Use at most 40 nested levels.')
      for (const [key,v] of Object.entries(obj)) {
        const path = [...prefix,key.replace(/\\/g,'\\\\').replace(/\./g,'\\.')]
        if (flatten && v && typeof v==='object' && !Array.isArray(v) && Object.keys(v).length) visit(v,path,depth+1)
        else {
          const name = path.join('.')
          headers.add(name); map.set(name,v)
          if (headers.size>100) throw Error('Use at most 100 output columns.')
          if (Array.isArray(v) && name) arrays.add(name)
        }
      }
    }
    visit(record,[],0)
    return map
  })
  if (!headers.size) throw Error('At least one record needs a field.')
  const columns = [...headers], rows: (string|number|boolean)[][] = []
  let size = 0
  for (const map of maps) {
    const list = expand ? map.get(expand) : undefined
    for (const item of Array.isArray(list) && list.length ? list : [Array.isArray(list)?null:list]) {
      const row = columns.map(k => {
        const v = expand && k===expand ? item : map.get(k)
        return v == null ? '' : typeof v==='object' ? JSON.stringify(v) : v as string|number|boolean
      })
      size += row.reduce<number>((sum,v)=>sum+String(v).length+1,0)
      if (rows.length>=5000 || size>2000000) throw Error('Expanded CSV is too large. Keep arrays in cells or use fewer records.')
      rows.push(row)
    }
  }
  const csv = Papa.unparse([columns,...rows],{escapeFormulae:true,newline:'\r\n'})
  return {columns, arrays:[...arrays], preview:rows.slice(0,15), total:rows.length, csv}
}
