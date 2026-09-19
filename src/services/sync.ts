/**
 * SAATHI Offline-First Sync Layer
 * - Local-first: records saved immediately, marked unsynced/local
 * - Sync queue: records.filter(r.sync !== 'synced')
 * - Per-record states: local, unsynced, syncing, synced, error/failed
 * - Simulated sync for prototype: no data leaves device, boundary obvious for real backend
 * - Idempotency via stable record IDs (uid('S'))
 * - Never deletes local record on failure
 * - Privacy: no patient data logged, no external APIs
 */

import type { ScreeningRecord, SyncState } from '../domain/types'

export type SyncStatus = 'offline' | 'local' | 'syncing' | 'synced' | 'failed'

export interface SyncResult {
  syncedIds: string[]
  failedIds: string[]
}

export interface SyncOptions {
  fail?: boolean
  failIds?: string[]
}

// Simulated sync — prototype only, no network
// Replace with real API client later: POST /api/records with idempotency key = record.id
export function simulateSync(onDone: (ok: boolean) => void, opts?: { fail?: boolean }) {
  const id = setTimeout(() => onDone(!opts?.fail), 1800)
  return () => clearTimeout(id)
}

// Per-record simulated sync with idempotency
export function simulateRecordSync(
  record: ScreeningRecord,
  opts?: SyncOptions
): Promise<{ id: string; ok: boolean }> {
  return new Promise((resolve) => {
    const shouldFail = opts?.fail || (opts?.failIds && opts.failIds.includes(record.id))
    const delay = 400 + Math.random() * 600 // 400-1000ms per record
    setTimeout(() => {
      // Simulate idempotency: same ID never creates duplicate, just updates
      // In real backend, use record.id as idempotency key
      resolve({ id: record.id, ok: !shouldFail })
    }, delay)
  })
}

// Sync queue abstraction — processes unsynced/error records sequentially to avoid duplicates
export async function syncQueue(
  records: ScreeningRecord[],
  onProgress?: (id: string, state: SyncState) => void,
  opts?: SyncOptions
): Promise<SyncResult> {
  const toSync = records.filter(r => r.sync === 'local' || r.sync === 'unsynced' || r.sync === 'error' || r.sync === 'failed')
  const syncedIds: string[] = []
  const failedIds: string[] = []

  for (const rec of toSync) {
    // Mark syncing
    onProgress?.(rec.id, 'syncing')

    try {
      const result = await simulateRecordSync(rec, opts)
      if (result.ok) {
        syncedIds.push(result.id)
        onProgress?.(result.id, 'synced')
      } else {
        failedIds.push(result.id)
        onProgress?.(result.id, 'error')
      }
    } catch {
      failedIds.push(rec.id)
      onProgress?.(rec.id, 'error')
    }
  }

  return { syncedIds, failedIds }
}

// Check if backend reachable (beyond navigator.onLine)
// For prototype, we simulate: if online, assume reachable unless fail flag
// Real implementation would do fetch('/api/health') with timeout
export async function isBackendReachable(): Promise<boolean> {
  if (!navigator.onLine) return false
  // In prototype, we don't actually ping backend to avoid external calls
  // Return true if online — real implementation should ping
  return true
}

// Stable ID check for idempotency
export function isDuplicateRecord(existing: ScreeningRecord[], newRecord: ScreeningRecord): boolean {
  return existing.some(r => r.id === newRecord.id)
}
