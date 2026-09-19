import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Patient, ScreeningRecord, SyncState } from '../domain/types'
import { SEED_PATIENTS, SEED_RECORDS } from '../services/mockData'
import type { SyncStatus } from '../services/sync'

interface AppState {
  workerName: string
  authed: boolean
  language: string | null
  patients: Patient[]
  records: ScreeningRecord[]
  online: boolean
  syncStatus: SyncStatus
  lastSyncedAt: string | null
  failNextSync: boolean
  setFailNextSync: (v: boolean) => void
  signIn: (name: string) => void
  signOut: () => void
  setLanguage: (code: string) => void
  addPatient: (p: Patient) => void
  addRecord: (r: ScreeningRecord) => void
  updateRecordSync: (id: string, sync: SyncState) => void
  setRecordsSyncState: (ids: string[], sync: SyncState) => void
  markRecordsSynced: (ids: string[]) => void
  markRecordsError: (ids: string[]) => void
  setOnline: (v: boolean) => void
  setSyncStatus: (s: SyncStatus) => void
  markAllSynced: () => void
  resetDemo: () => void
}

export const useApp = create<AppState>()(persist((set) => ({
  workerName: 'Priya Rajan',
  authed: false,
  language: null,
  patients: SEED_PATIENTS,
  records: SEED_RECORDS,
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncStatus: 'local',
  lastSyncedAt: null,
  failNextSync: false,
  setFailNextSync: (failNextSync) => set({ failNextSync }),
  signIn: (name) => set({ authed: true, workerName: name || 'Priya Rajan' }),
  signOut: () => set({ authed: false }),
  setLanguage: (code) => set({ language: code }),
  addPatient: (p) => set(s => {
    // Prevent duplicate patient IDs (idempotency)
    if (s.patients.some(existing => existing.id === p.id)) return s
    return { patients: [p, ...s.patients] }
  }),
  addRecord: (r) => set(s => {
    // Prevent duplicate record IDs (idempotency) — critical for retry safety
    if (s.records.some(existing => existing.id === r.id)) {
      // Update existing instead of duplicating
      return {
        records: s.records.map(existing => existing.id === r.id ? r : existing),
        syncStatus: s.online ? (s.records.some(rec => rec.sync !== 'synced') || r.sync !== 'synced' ? 'local' : s.syncStatus) : 'offline'
      }
    }
    // Determine sync state based on connectivity per spec:
    // - If offline: mark as 'local' (saved locally, waiting for connection)
    // - If online: mark as 'unsynced' (online but not yet synced)
    // Caller (Analysis) already sets initial sync, but we ensure correct
    const finalRecord = r
    const hasUnsynced = s.records.some(rec => rec.sync !== 'synced') || finalRecord.sync !== 'synced'
    return {
      records: [finalRecord, ...s.records],
      syncStatus: s.online ? (hasUnsynced ? 'local' : s.syncStatus === 'offline' ? 'local' : s.syncStatus) : 'offline'
    }
  }),
  updateRecordSync: (id, sync) => set(s => ({
    records: s.records.map(r => r.id === id ? { ...r, sync } : r)
  })),
  setRecordsSyncState: (ids, sync) => set(s => ({
    records: s.records.map(r => ids.includes(r.id) ? { ...r, sync } : r)
  })),
  markRecordsSynced: (ids) => set(s => {
    const now = new Date().toISOString()
    const updated = s.records.map(r => ids.includes(r.id) ? { ...r, sync: 'synced' as const } : r)
    const hasUnsynced = updated.some(r => r.sync !== 'synced')
    return {
      records: updated,
      syncStatus: hasUnsynced ? 'local' : 'synced',
      lastSyncedAt: hasUnsynced ? s.lastSyncedAt : now
    }
  }),
  markRecordsError: (ids) => set(s => ({
    records: s.records.map(r => ids.includes(r.id) ? { ...r, sync: 'error' as const } : r),
    syncStatus: 'failed'
  })),
  setOnline: (v) => set(s => {
    const hasUnsynced = s.records.some(r => r.sync !== 'synced')
    // When going offline, preserve existing sync status but set offline
    // When going online, if has unsynced, set to local (needs sync), else keep current or synced
    if (!v) {
      return { online: v, syncStatus: 'offline' as const }
    } else {
      return {
        online: v,
        syncStatus: hasUnsynced ? 'local' as const : s.syncStatus === 'offline' ? 'local' as const : s.syncStatus
      }
    }
  }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  markAllSynced: () => set(s => ({
    records: s.records.map(r => ({ ...r, sync: 'synced' as const })),
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString()
  })),
  resetDemo: () => set({
    patients: SEED_PATIENTS,
    records: SEED_RECORDS,
    syncStatus: 'local',
    lastSyncedAt: null,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true
  }),
}), {
  name: 'saathi-v1',
  partialize: (s) => ({
    failNextSync: s.failNextSync,
    workerName: s.workerName,
    authed: s.authed,
    language: s.language,
    patients: s.patients,
    records: s.records,
    lastSyncedAt: s.lastSyncedAt
  })
}))
