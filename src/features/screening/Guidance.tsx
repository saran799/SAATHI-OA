import { useNavigate } from 'react-router-dom'
import { Dumbbell, Accessibility, Apple, AlertTriangle, MessageSquare, Printer, Share2, Home, CheckCircle2, Cross, Users } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Avatar, Button, cx } from '../../components/ui'
import { useScreeningPatient } from './useGuard'
import { RISK_META } from '../../domain/risk'
import { SUPPORTING_GUIDANCE } from '../../domain/guidance'
import { useApp } from '../../store/appStore'
import { fmtDate, jointName } from '../../domain/copy'
import { useSession } from '../../store/sessionStore'

export default function Guidance() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const rec = useApp(s => s.records.find(r => r.id === session.recordId))
  const reset = useSession(s => s.reset)
  if (!patient || !session.result || !session.joint) return null
  const r = session.result; const m = RISK_META[r.band]; const g = SUPPORTING_GUIDANCE[r.band]
  const chip = { success: 'bg-mint text-primary-dark', warning: 'bg-info-tint text-info', error: 'bg-error-tint text-error-text' }[m.tone]
  const dot = { success: 'bg-primary', warning: 'bg-info', error: 'bg-error' }[m.tone]

  const rows = [
    { icon: Dumbbell, t: 'Recommended Exercises', b: 'Gentle strengthening and range-of-movement routine', tag: 'Daily 15 min', tagCls: 'bg-mint text-primary-dark', to: '/screening/exercises' },
    { icon: Accessibility, t: 'Lifestyle & Joint Care', b: g[0], tag: 'Essential', tagCls: 'bg-info-tint text-info' },
    { icon: Apple, t: 'Weight & Activity Advice', b: g[1] ?? 'Maintain a healthy body weight; stay gently active.', tag: 'Guideline', tagCls: 'bg-tint text-ink' },
    { icon: AlertTriangle, t: 'When to Visit the PHC', b: g[g.length - 1], tag: 'Priority', tagCls: 'bg-error-tint text-error-text' },
  ]

  return (
    <FlowShell title="" barTitle="Post Screening Guidance" back="/screening/result"
      pill={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center gap-1.5"><CheckCircle2 size={13} aria-hidden />Ready</span>}
      footer={<div className="space-y-2">
        <Button full icon={Share2} onClick={async () => { const text = `SAATHI screening — ${patient.name}: ${m.label}. ${r.recommendedAction} (Screening result, not a diagnosis.)`; if (navigator.share) { try { await navigator.share({ title: 'SAATHI guidance', text }) } catch { /* cancelled */ } } else { await navigator.clipboard?.writeText(text); alert('Summary copied to clipboard.') } }}>Share with Patient (SMS / Print)</Button>
        <Button full variant="secondary" size="md" icon={Home} onClick={() => { reset(); nav('/dashboard') }}>Back to Home Dashboard</Button>
      </div>}>
      <div className="-mt-6 rounded-[14px] bg-tint p-3 flex items-center gap-3">
        <Avatar name={patient.name} size={44} />
        <div className="flex-1 min-w-0"><p className="text-[15px] font-bold truncate">{patient.name} <span className="font-medium text-secondary">{patient.age}{patient.sex[0]}</span></p><p className="text-[12px] text-secondary truncate">ID: {patient.id} · {jointName(session.joint, session.side)}</p></div>
        <span className={cx('h-7 px-2.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 shrink-0', chip)}><span className={cx('h-1.5 w-1.5 rounded-full', dot)} aria-hidden />{m.short} risk</span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div><h1 className="text-[23px] font-bold tracking-tight leading-tight">Personalised Guidelines</h1><p className="text-[14px] text-secondary mt-1 leading-snug">Actionable care steps tailored to {m.label.toLowerCase()}</p></div>
        <span className="h-11 w-11 rounded-full bg-tint text-primary flex items-center justify-center shrink-0" aria-hidden><Cross size={20} /></span>
      </div>

      <div className="card mt-4 p-3 flex gap-3">
        <span className="h-[76px] w-[76px] rounded-[12px] bg-mint-soft flex items-center justify-center shrink-0 text-primary" aria-hidden><Users size={34} /></span>
        <div className="min-w-0"><p className="text-[11px] font-bold tracking-wider text-primary uppercase inline-flex items-center gap-1"><CheckCircle2 size={12} aria-hidden />Target joint: {jointName(session.joint, session.side)}</p><p className="text-[15px] font-bold mt-0.5 leading-snug">Recommended action</p><p className="text-[13px] text-secondary leading-snug mt-0.5">{r.recommendedAction}</p></div>
      </div>

      <div className="mt-3 space-y-3">
        {rows.map(row => (
          <button key={row.t} type="button" onClick={() => row.to ? nav(row.to) : undefined} className={cx('w-full card p-3 flex items-start gap-3 text-left', row.to && 'hover:bg-tint/40 transition-colors')}>
            <span className="h-12 w-12 rounded-[12px] bg-tint text-primary flex items-center justify-center shrink-0" aria-hidden><row.icon size={22} /></span>
            <span className="flex-1 min-w-0"><span className="flex items-start gap-2"><span className="text-[16px] font-bold leading-tight">{row.t}</span><span className={cx('ml-auto mt-0.5 h-6 px-2 rounded-full text-[11px] font-semibold whitespace-nowrap inline-flex items-center shrink-0', row.tagCls)}>{row.tag}</span></span><span className="block text-[13px] text-secondary mt-1 leading-snug">{row.b}</span></span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-[16px] bg-primary text-white p-4 flex gap-3">
        <span className="h-9 w-9 rounded-full bg-primary-mid flex items-center justify-center shrink-0" aria-hidden><MessageSquare size={18} /></span>
        <div><p className="text-[11px] font-bold tracking-wider uppercase text-white/90">Community health worker note</p><p className="text-[14px] mt-1 leading-snug">Explain to {patient.name.split(' ')[0]} that this is a screening result, not a diagnosis, and that a doctor will do the proper examination. Do not force movement beyond the pain threshold.</p></div>
      </div>

      <div className="card mt-4 p-3">
        <p className="text-[11px] font-bold tracking-wider text-secondary uppercase mb-2">Follow-up</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 rounded-[12px] bg-mint text-primary-dark px-3 flex items-center gap-2 text-[13px] font-bold"><CheckCircle2 size={16} aria-hidden />{rec ? fmtDate(rec.followUpDate) : `${m.followUpDays} days`}</div>
          <button type="button" onClick={() => nav(`/records/${session.recordId}`)} className="h-12 rounded-[12px] bg-tint text-ink px-3 flex items-center gap-2 text-[13px] font-bold"><Printer size={16} aria-hidden />Print booklet</button>
        </div>
      </div>
    </FlowShell>
  )
}
