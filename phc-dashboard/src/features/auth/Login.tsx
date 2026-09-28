import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { phcApi } from '../../services/phcApi'
import { useAuth } from '../../store/authStore'
import { Shield, Loader2 } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuth(s => s.setAuth)
  const token = useAuth(s => s.token)
  
  useEffect(() => {
    if (token) {
      navigate('/dashboard')
    }
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await phcApi.login({ username, password })
      
      if (data.worker.role !== 'PHC_ADMIN' && data.worker.role !== 'PHC_OFFICER') {
        throw new Error('Access Denied. You do not have PHC management privileges.')
      }

      setAuth(data.token, data.worker)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid username or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7FAFA] p-4">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-primary text-white rounded-[16px] flex items-center justify-center mb-4 shadow-sm">
             <Shield size={32} />
          </div>
          <h1 className="text-[24px] font-bold text-ink">SAATHI PHC</h1>
          <p className="text-[14px] text-secondary">PHC Management Portal</p>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-error-tint text-error-text text-[13px] p-3 rounded-[8px] border border-error/10 font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-ink">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={loading}
                className="w-full h-10 px-3 text-[14px] rounded-[10px] border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                placeholder="Enter your username"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-ink">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full h-10 px-3 text-[14px] rounded-[10px] border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-primary text-white font-semibold text-[14px] rounded-[10px] hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
