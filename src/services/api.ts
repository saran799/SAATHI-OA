import type { Patient, ScreeningRecord } from '../domain/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getAuthToken() {
  return localStorage.getItem('token')
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error ${response.status}`)
    }
    
    return response
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout')
    }
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Network failure')
  } finally {
    clearTimeout(id)
  }
}

export const api = {
  async checkHealth(): Promise<boolean> {
    if (!navigator.onLine) return false
    try {
      await fetchWithTimeout(`${API_URL}/api/health`, { method: 'GET' }, 5000)
      return true
    } catch {
      return false
    }
  },

  async login(username: string, password: string): Promise<{ worker: any, token: string }> {
    const res = await fetchWithTimeout(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return res.json()
  },

  async syncPatients(patients: Patient[]): Promise<{ synced: string[], failed: string[] }> {
    const token = getAuthToken()
    if (!token) throw new ApiError(401, 'Unauthorized')

    const res = await fetchWithTimeout(`${API_URL}/api/sync/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ patients })
    })
    return res.json()
  },

  async syncRecords(records: ScreeningRecord[]): Promise<{ synced: string[], failed: string[] }> {
    const token = getAuthToken()
    if (!token) throw new ApiError(401, 'Unauthorized')

    const res = await fetchWithTimeout(`${API_URL}/api/sync/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ records })
    })
    return res.json()
  }
}
