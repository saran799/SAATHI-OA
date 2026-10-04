import { useAuth } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getAuthToken() {
  return useAuth.getState().token
}

async function fetchAuth(endpoint: string) {
  const token = getAuthToken()
  if (!token) {
    useAuth.getState().logout()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      useAuth.getState().logout()
      window.location.href = '/login'
    }
    throw new Error(`HTTP error ${res.status}`)
  }
  return res.json()
}

export const phcApi = {
  getDashboard: () => fetchAuth('/api/phc/dashboard'),
  getPatients: () => fetchAuth('/api/phc/patients'),
  getScreenings: () => fetchAuth('/api/phc/screenings'),
  getWorkers: () => fetchAuth('/api/phc/workers'),
  getFollowUps: () => fetchAuth('/api/phc/follow-ups'),
  getAnalytics: (timeRange = '30d') => fetchAuth(`/api/phc/analytics?timeRange=${timeRange}`),
  getReports: (search = '') => fetchAuth(`/api/phc/reports?search=${encodeURIComponent(search)}`),
  getReport: (id: string) => fetchAuth(`/api/phc/reports/${id}`),
  getSyncStatus: () => fetchAuth('/api/phc/sync-status'),
  getCommunity: () => fetchAuth('/api/phc/community'),
  login: async (credentials: any) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to login')
    return data
  },
  changePassword: async (username: string, newPassword: string) => {
    const res = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, newPassword })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to change password')
    return data
  }
}
