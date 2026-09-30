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

import type { ScreeningRecord, SyncState, Patient } from '../domain/types'
import { api } from './api'

export type SyncStatus = 'offline' | 'local' | 'syncing' | 'synced' | 'failed'

export interface SyncResult {
  syncedIds: string[]
  failedIds: string[]
}

// Check if backend reachable
export async function isBackendReachable(): Promise<boolean> {
  return await api.checkHealth()
}

// Sync queue abstraction — processes unsynced records
export async function syncQueue(
  records: ScreeningRecord[],
  patients: Patient[], // Add patients to sync
  onProgress?: (id: string, state: SyncState) => void
): Promise<SyncResult> {
  const toSync = records.filter(r => r.sync === 'local' || r.sync === 'unsynced' || r.sync === 'error' || r.sync === 'failed')
  const syncedIds: string[] = []
  const failedIds: string[] = []
  
  if (toSync.length === 0) {
    return { syncedIds, failedIds }
  }

  // Get patients for the records being synced
  const patientIds = Array.from(new Set(toSync.map(r => r.patientId)))
  const patientsToSync = patients.filter(p => patientIds.includes(p.id))

  // Mark all syncing
  toSync.forEach(r => onProgress?.(r.id, 'syncing'))

  try {
    // 1. Sync Patients first to satisfy foreign keys
    if (patientsToSync.length > 0) {
      await api.syncPatients(patientsToSync)
    }

    // 2. Sync Records
    const { synced, failed } = await api.syncRecords(toSync)

    synced.forEach((id: string) => {
      syncedIds.push(id)
      onProgress?.(id, 'synced')
    })

    failed.forEach((id: string) => {
      failedIds.push(id)
      onProgress?.(id, 'error')
    })

  } catch (err) {
    console.error('Sync failed:', err)
    toSync.forEach(r => {
      failedIds.push(r.id)
      onProgress?.(r.id, 'error')
    })
  }

  return { syncedIds, failedIds }
}

export function isDuplicateRecord(existing: ScreeningRecord[], newRecord: ScreeningRecord): boolean {
  return existing.some(r => r.id === newRecord.id)
}
