import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, IdCard, Lock, ArrowRight, Check, ShieldCheck, Activity } from 'lucide-react'
import { Button, cx } from '../../components/ui'
import { Frame } from '../../components/layout/Shells'
import { useApp } from '../../store/appStore'
import logo from '../../assets/saathi-logo.png'

export default function Login() {
  const nav = useNavigate()
  const signIn = useApp(s => s.signIn)
  const [id, setId] = useState('ASHA-7749')
  const [pin, setPin] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState<{ id?: string; pin?: string }>({})
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof err = {}
    if (!id.trim()) next.id = 'Enter your worker ID.'
    if (!/^\d{4}$/.test(pin)) next.pin = 'Enter your 4-digit PIN.'
    setErr(next); if (Object.keys(next).length) return
    setLoading(true)
    setTimeout(() => { signIn('Priya Rajan'); nav('/language') }, 700)
  }
  const field = 'w-full h-[44px] rounded-[12px] bg-tint pl-11 pr-11 text-[14px] font-medium text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <Frame>
      <main className="flex-1 flex flex-col px-5 pt-3 pb-5 page-enter relative overflow-hidden">
        {/* soft halo behind logo, as in Figma */}
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-mint/25 blur-3xl" aria-hidden />

        <div className="relative flex items-center gap-2">
          <span className="h-[44px] flex-1 max-w-[200px] rounded-[14px] bg-surface shadow-[var(--shadow-card)] px-3 flex items-center gap-2 text-[12px] font-bold text-ink">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />Field mode active
          </span>
          <span className="h-[44px] rounded-[14px] bg-surface shadow-[var(--shadow-card)] px-3 flex items-center gap-2 text-[12px] font-semibold text-secondary">
            <Lock size={13} aria-hidden />Offline ready
          </span>
        </div>

        <div className="relative mt-3 mx-auto w-full max-w-[272px] h-[268px] rounded-[24px] bg-surface shadow-[var(--shadow-card)] p-5 flex items-center justify-center">
          <img src={logo} alt="SAATHI — Your companion for healthier movement. AI-assisted osteoarthritis screening" className="max-h-full w-auto object-contain" />
        </div>

        <div className="relative mt-3 flex justify-center gap-2">
          <span className="h-8 px-3 rounded-full bg-tint text-primary text-[12px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"><Activity size={13} aria-hidden />Movement AI</span>
          <span className="h-8 px-3 rounded-full bg-mint-soft text-primary text-[12px] font-semibold inline-flex items-center gap-1.5 border border-mint whitespace-nowrap"><ShieldCheck size={13} aria-hidden />Screening support</span>
        </div>

        <form onSubmit={submit} noValidate className="relative mt-3 card p-4">
          <div className="flex items-start justify-between gap-3">
            <div><h1 className="text-[17px] font-bold tracking-tight whitespace-nowrap">Field Worker Sign In</h1><p className="text-[12px] text-secondary mt-0.5">Enter credentials to access screening intake</p></div>
            <span className="h-6 px-2 rounded-full bg-mint text-primary-dark text-[10px] font-bold tracking-wide shrink-0 inline-flex items-center">OFFLINE AUTH</span>
          </div>

          <label htmlFor="wid" className="block text-[12px] font-semibold mt-4 mb-1.5">Worker ID / Username</label>
          <div className="relative">
            <IdCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" aria-hidden />
            <input id="wid" value={id} onChange={e => setId(e.target.value)} autoComplete="username" aria-invalid={!!err.id || undefined} className={cx(field, err.id && 'ring-2 ring-error')} />
          </div>
          {err.id && <p role="alert" className="text-[12px] text-error-text mt-1">{err.id}</p>}

          <label htmlFor="pin" className="block text-[12px] font-semibold mt-3 mb-1.5">4-Digit Security PIN / Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" aria-hidden />
            <input id="pin" type={show ? 'text' : 'password'} inputMode="numeric" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••" autoComplete="current-password" aria-invalid={!!err.pin || undefined} className={cx(field, 'tracking-[0.2em]', err.pin && 'ring-2 ring-error')} />
            <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide PIN' : 'Show PIN'} className="absolute right-0 top-0 h-[44px] w-11 flex items-center justify-center text-secondary">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          {err.pin ? <p role="alert" className="text-[12px] text-error-text mt-1">{err.pin}</p> : <p className="text-[11px] text-muted mt-1">Demo: enter any 4 digits</p>}

          <div className="flex items-center justify-between mt-2">
            <button type="button" role="checkbox" aria-checked={remember} onClick={() => setRemember(r => !r)} className="inline-flex items-center gap-2 text-[12px] font-medium h-9 whitespace-nowrap">
              <span className={cx('h-5 w-5 rounded-[6px] flex items-center justify-center', remember ? 'bg-primary text-white' : 'border-2 border-tint-2')} aria-hidden>{remember && <Check size={13} strokeWidth={3} />}</span>Remember device
            </button>
            <button type="button" className="text-[12px] font-semibold text-primary h-9 whitespace-nowrap" onClick={() => alert('In this prototype, contact your PHC supervisor to reset the PIN.')}>Offline Recovery</button>
          </div>

          <Button type="submit" full loading={loading} className="mt-2 !h-[50px] text-[15px]">Sign In &amp; Enter Field Intake <ArrowRight size={18} aria-hidden /></Button>
        </form>

        <p className="relative mt-3 text-center text-[11px] text-secondary">v0.1 demo · Screening support only · <span className="text-primary font-semibold">Offline secure</span></p>
        <p className="relative mt-1 text-center text-[11px] text-muted">SAATHI does not diagnose osteoarthritis.</p>
      </main>
    </Frame>
  )
}
