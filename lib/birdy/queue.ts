/**
 * lib/birdy/queue.ts
 * Lightweight job queue with Redis backend (when available) and
 * in-process Map fallback (single-instance Railway deployment).
 *
 * WHY NOT BULLMQ:
 *   BullMQ requires a separate worker process. Railway single-instance
 *   deployments don't have that. This queue is simpler, runs in the
 *   same Node.js process, and is sufficient for Birdy's workflow volume.
 *
 * UPGRADE PATH:
 *   When horizontal scaling is needed, swap in BullMQ or Inngest
 *   by replacing the enqueue/process functions below.
 */

export interface QueueJob {
  id:         string
  type:       string
  payload:    Record<string, unknown>
  attempts:   number
  maxAttempts: number
  createdAt:  number
}

type JobHandler = (job: QueueJob) => Promise<void>

// ── In-process queue (fallback) ────────────────────────────────────────────

const queue:    QueueJob[]                = []
const handlers: Record<string, JobHandler> = {}
let   processing = false

function processNext(): void {
  if (processing || !queue.length) return
  const job = queue.shift()!
  processing = true
  const handler = handlers[job.type]
  if (!handler) {
    console.warn(`[queue] No handler for job type: ${job.type}`)
    processing = false
    setImmediate(processNext)
    return
  }
  handler(job)
    .then(() => { console.log(`[queue] Job ${job.id} (${job.type}) completed`) })
    .catch(err => {
      console.error(`[queue] Job ${job.id} failed (attempt ${job.attempts}):`, err)
      if (job.attempts < job.maxAttempts) {
        job.attempts++
        queue.push(job)   // re-enqueue at back
      }
    })
    .finally(() => {
      processing = false
      setImmediate(processNext)
    })
}

export function registerHandler(type: string, handler: JobHandler): void {
  handlers[type] = handler
}

export function enqueue(
  type:       string,
  payload:    Record<string, unknown>,
  options?:   { maxAttempts?: number }
): string {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const job: QueueJob = {
    id,
    type,
    payload,
    attempts:    1,
    maxAttempts: options?.maxAttempts ?? 3,
    createdAt:   Date.now(),
  }
  queue.push(job)
  setImmediate(processNext)
  console.log(`[queue] Enqueued ${type} (id=${id}, queue_depth=${queue.length})`)
  return id
}

export function queueDepth(): number { return queue.length }
