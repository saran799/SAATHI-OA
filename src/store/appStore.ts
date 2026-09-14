import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Patient, ScreeningRecord } from '../domain/types'
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
  online: true,
  syncStatus: 'local',
  lastSyncedAt: null,
  failNextSync: false,
  setFailNextSync: (failNextSync) => set({ failNextSync }),
  signIn: (name) => set({ authed: true, workerName: name || 'Priya Rajan' }),
  signOut: () => set({ authed: false }),
  setLanguage: (code) => set({ language: code }),
  addPatient: (p) => set(s => ({ patients: [p, ...s.patients] })),
  addRecord: (r) => set(s => ({ records: [r, ...s.records], syncStatus: s.online ? 'local' : 'offline' })),
  setOnline: (v) => set(s => ({ online: v, syncStatus: v ? (s.records.some(r => r.sync !== 'synced') ? 'local' : s.syncStatus === 'offline' ? 'local' : s.syncStatus) : 'offline' })),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  markAllSynced: () => set(s => ({ records: s.records.map(r => ({ ...r, sync: 'synced' as const })), syncStatus: 'synced', lastSyncedAt: new Date().toISOString() })),
  resetDemo: () => set({ patients: SEED_PATIENTS, records: SEED_RECORDS, syncStatus: 'local', lastSyncedAt: null }),
}), { name: 'saathi-v1', partialize: (s) => ({ failNextSync: s.failNextSync, workerName: s.workerName, authed: s.authed, language: s.language, patients: s.patients, records: s.records, lastSyncedAt: s.lastSyncedAt }) }))
