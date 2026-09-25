import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import type { Patient, ScreeningRecord, SyncState } from '../domain/types'
import { SEED_PATIENTS, SEED_RECORDS } from '../services/mockData'
import type { SyncStatus } from '../services/sync'

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name)
  },
}

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
  signIn: (name: string, token?: string) => void
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
  signIn: (name, token) => {
    if (token) localStorage.setItem('token', token)
    set({ authed: true, workerName: name || 'Priya Rajan' })
  },
  signOut: () => {
    localStorage.removeItem('token')
    set({ authed: false })
  },
  setLanguage: (code) => set({ language: code }),
  addPatient: (p) => set(s => {
    if (s.patients.some(existing => existing.id === p.id)) return s
    return { patients: [p, ...s.patients] }
  }),
  addRecord: (r) => set(s => {
    if (s.records.some(existing => existing.id === r.id)) {
      return {
        records: s.records.map(existing => existing.id === r.id ? r : existing),
        syncStatus: s.online ? (s.records.some(rec => rec.sync !== 'synced') || r.sync !== 'synced' ? 'local' : s.syncStatus) : 'offline'
      }
    }
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
  storage: createJSONStorage(() => idbStorage),
  partialize: (s) => ({
    failNextSync: s.failNextSync,
    workerName: s.workerName,
    authed: s.authed,
    language: s.language,
    patients: s.patients,
    records: s.records,
    lastSyncedAt: s.lastSyncedAt
  }),
  onRehydrateStorage: () => (state) => {
    if (state) {
      // FIX BUG #2: Reset any stuck 'syncing' records to 'local' on load
      state.records = state.records.map((r: ScreeningRecord) => 
        r.sync === 'syncing' ? { ...r, sync: 'local' as const } : r
      )
    }
  }
}))

