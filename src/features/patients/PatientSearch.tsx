import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, ChevronRight, UserX, SlidersHorizontal, Plus, Cloud, CloudOff } from 'lucide-react'
import { AppShell } from '../../components/layout/Shells'
import { Avatar, Button, Card, Empty, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { RISK_META } from '../../domain/risk'
import { fmtDate, jointName } from '../../domain/copy'
import type { RiskBand } from '../../domain/types'

type Filter = 'all' | RiskBand
export default function PatientSearch() {
  const nav = useNavigate()
  const { patients, records } = useApp()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const withLast = useMemo(() => patients.map(p => ({ p, last: records.filter(r => r.patientId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] })), [patients, records])
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return withLast.filter(({ p }) => !s || p.name.toLowerCase().includes(s) || p.phone.replace(/\s/g, '').includes(s.replace(/\s/g, '')) || p.id.toLowerCase().includes(s) || p.village.toLowerCase().includes(s))
      .filter(({ last }) => filter === 'all' || last?.result.band === filter)
  }, [q, withLast, filter])
  const count = (f: Filter) => f === 'all' ? patients.length : withLast.filter(x => x.last?.result.band === f).length
  const chipTone: Record<RiskBand, string> = { low: 'bg-mint text-primary-dark', moderate: 'bg-info-tint text-info', higher: 'bg-error-tint text-error-text' }

  return (
    <AppShell title="SAATHI" subtitle="Patient Registry">
      <div className="pt-4 flex items-center gap-3">
        <h1 className="text-[22px] font-bold tracking-tight whitespace-nowrap">Patient Records</h1>
        <span className="h-7 px-2.5 rounded-full bg-info-tint text-info text-[12px] font-semibold inline-flex items-center">{patients.length} registered</span>
        <button type="button" onClick={() => nav('/patients/new')} aria-label="Register new patient" className="ml-auto h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center shadow-[var(--shadow-btn)]"><UserPlus size={20} /></button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" aria-hidden />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, phone or ID…" aria-label="Search patients" className="w-full h-[52px] pl-11 pr-4 rounded-[14px] bg-surface shadow-[var(--shadow-card)] text-[15px] focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <span className="h-[52px] w-[52px] rounded-[14px] bg-tint text-primary flex items-center justify-center shrink-0" aria-hidden><SlidersHorizontal size={20} /></span>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Filter by screening risk">
        {([['all', 'All'], ['higher', 'Higher risk'], ['moderate', 'Moderate'], ['low', 'Low']] as [Filter, string][]).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={cx('h-10 px-3.5 rounded-full text-[13px] font-semibold whitespace-nowrap inline-flex items-center gap-2 shrink-0', filter === k ? 'bg-primary text-white' : 'bg-surface text-ink shadow-[var(--shadow-card)]')}>
            {l}<span className={cx('h-5 min-w-5 px-1.5 rounded-full text-[11px] inline-flex items-center justify-center', filter === k ? 'bg-primary-mid text-white' : 'bg-tint text-secondary')}>{count(k)}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3" aria-live="polite">
        {list.length === 0 ? (
          <Card><Empty icon={UserX} title="Patient not found" body={q ? `No patient matches "${q}". Check the spelling or register a new patient.` : 'No patients in this filter.'}
            action={<Button variant="secondary" size="md" icon={UserPlus} onClick={() => nav(`/patients/new?name=${encodeURIComponent(q)}`)}>Register new patient</Button>} /></Card>
        ) : list.map(({ p, last }) => {
          const band = last?.result.band
          return (
            <button key={p.id} type="button" onClick={() => nav(`/patients/${p.id}`)} className={cx('w-full card p-3.5 text-left hover:bg-tint/40 transition-colors', band === 'higher' && 'border-l-4 border-error')}>
              <div className="flex items-start gap-3">
                <Avatar name={p.name} size={46} />
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-bold leading-tight truncate">{p.name} <span className="text-[13px] font-medium text-secondary">({p.age}{p.sex[0]})</span></p>
                  <p className="text-[13px] text-secondary mt-0.5 truncate">{last ? jointName(last.joint, last.side) : `${p.village} · not screened yet`}</p>
                </div>
                <div className="text-right shrink-0">
                  {last ? <span className={cx('h-6 px-2 rounded-full text-[11px] font-semibold inline-flex items-center gap-1', last.sync === 'synced' ? 'bg-tint text-secondary' : 'bg-warning-tint text-warning-text')}>{last.sync === 'synced' ? <Cloud size={11} aria-hidden /> : <CloudOff size={11} aria-hidden />}{last.sync === 'synced' ? 'Synced' : 'Pending'}</span> : <span className="h-6 px-2 rounded-full bg-tint text-secondary text-[11px] font-semibold inline-flex items-center">New</span>}
                  <p className="text-[12px] text-secondary mt-1">{last ? fmtDate(last.createdAt) : fmtDate(p.createdAt)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {band ? <span className={cx('h-8 px-3 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5', chipTone[band])}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{RISK_META[band].label}</span> : <span className="h-8 px-3 rounded-full bg-tint text-secondary text-[12px] font-semibold inline-flex items-center">No screening yet</span>}
                <span className="text-[13px] font-bold text-primary inline-flex items-center gap-0.5">{last ? 'View profile' : 'Start screening'}<ChevronRight size={16} aria-hidden /></span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 text-center text-[12px] text-secondary">Search first to avoid duplicate records.</div>
      <button type="button" onClick={() => nav('/patients/new')} className="fixed bottom-24 right-4 sm:right-[calc(50%-215px+16px)] h-14 pl-4 pr-5 rounded-full bg-primary text-white font-bold text-[15px] inline-flex items-center gap-2 shadow-[var(--shadow-btn)] no-print"><Plus size={20} aria-hidden />New Screening</button>
    </AppShell>
  )
}
