import { runJob, type Job } from './engine'

self.onmessage = ({ data }: MessageEvent<Job>) => {
  try { self.postMessage({ result: runJob(data) }) }
  catch (error) { self.postMessage({ error: error instanceof Error ? error.message : 'Processing failed. Check the input.' }) }
}
