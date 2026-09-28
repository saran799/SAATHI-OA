import { create } from 'zustand'
import { phcApi } from '../services/phcApi'

interface PHCState {
  dashboard: any | null
  patients: any[]
  screenings: any[]
  workers: any[]
  followUps: any[]
  reports: any[]
  currentReport: any | null
  analytics: any | null
  syncStatus: any | null
  community: any | null
  loading: Record<string, boolean>
  error: string | null
  
  fetchDashboard: () => Promise<void>
  fetchPatients: () => Promise<void>
  fetchScreenings: () => Promise<void>
  fetchWorkers: () => Promise<void>
  fetchFollowUps: () => Promise<void>
  fetchReports: (search?: string) => Promise<void>
  fetchReport: (id: string) => Promise<void>
  fetchAnalytics: (timeRange?: string) => Promise<void>
  fetchSyncStatus: () => Promise<void>
  fetchCommunity: () => Promise<void>
}

export const usePHC = create<PHCState>((set) => ({
  dashboard: null,
  patients: [],
  screenings: [],
  workers: [],
  followUps: [],
  reports: [],
  currentReport: null,
  analytics: null,
  syncStatus: null,
  community: null,
  loading: {},
  error: null,
  
  fetchDashboard: async () => {
    set(s => ({ loading: { ...s.loading, dashboard: true }, error: null }))
    try {
      const data = await phcApi.getDashboard()
      set(s => ({ dashboard: data, loading: { ...s.loading, dashboard: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, dashboard: false } }))
    }
  },
  
  fetchPatients: async () => {
    set(s => ({ loading: { ...s.loading, patients: true }, error: null }))
    try {
      const data = await phcApi.getPatients()
      set(s => ({ patients: data, loading: { ...s.loading, patients: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, patients: false } }))
    }
  },

  fetchScreenings: async () => {
    set(s => ({ loading: { ...s.loading, screenings: true }, error: null }))
    try {
      const data = await phcApi.getScreenings()
      set(s => ({ screenings: data, loading: { ...s.loading, screenings: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, screenings: false } }))
    }
  },

  fetchWorkers: async () => {
    set(s => ({ loading: { ...s.loading, workers: true }, error: null }))
    try {
      const data = await phcApi.getWorkers()
      set(s => ({ workers: data, loading: { ...s.loading, workers: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, workers: false } }))
    }
  },

  fetchFollowUps: async () => {
    set(s => ({ loading: { ...s.loading, followUps: true }, error: null }))
    try {
      const data = await phcApi.getFollowUps()
      set(s => ({ followUps: data, loading: { ...s.loading, followUps: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, followUps: false } }))
    }
  },

  fetchReports: async (search = '') => {
    set(s => ({ loading: { ...s.loading, reports: true }, error: null }))
    try {
      const data = await phcApi.getReports(search)
      set(s => ({ reports: data, loading: { ...s.loading, reports: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, reports: false } }))
    }
  },

  fetchReport: async (id: string) => {
    set(s => ({ loading: { ...s.loading, currentReport: true }, error: null, currentReport: null }))
    try {
      const data = await phcApi.getReport(id)
      set(s => ({ currentReport: data, loading: { ...s.loading, currentReport: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, currentReport: false } }))
    }
  },

  fetchAnalytics: async (timeRange = '30d') => {
    set(s => ({ loading: { ...s.loading, analytics: true }, error: null }))
    try {
      const data = await phcApi.getAnalytics(timeRange)
      set(s => ({ analytics: data, loading: { ...s.loading, analytics: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, analytics: false } }))
    }
  },

  fetchSyncStatus: async () => {
    set(s => ({ loading: { ...s.loading, syncStatus: true }, error: null }))
    try {
      const data = await phcApi.getSyncStatus()
      set(s => ({ syncStatus: data, loading: { ...s.loading, syncStatus: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, syncStatus: false } }))
    }
  },

  fetchCommunity: async () => {
    set(s => ({ loading: { ...s.loading, community: true }, error: null }))
    try {
      const data = await phcApi.getCommunity()
      set(s => ({ community: data, loading: { ...s.loading, community: false } }))
    } catch (e: any) {
      set(s => ({ error: e.message, loading: { ...s.loading, community: false } }))
    }
  }
}))
