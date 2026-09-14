import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, FolderOpen, CloudOff, Cloud, ChevronRight, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react'
import { AppShell } from '../../components/layout/Shells'
import { Avatar, Card, Empty, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { RISK_META } from '../../domain/risk'
import { fmtDate, jointName } from '../../domain/copy'

type Filter = 'all' | 'higher' | 'moderate' | 'low' | 'due' | 'unsynced'
export default function Records() {
  const nav = useNavigate(); const [sp] = useSearchParams()
  const { records, patients } = useApp()
  const [q, setQ] = useState(''); const [filter, setFilter] = useState<Filter>((sp.get('filter') as Filter) || 'all')
  const all = useMemo(() => [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(r => ({ r, p: patients.find(p => p.id === r.patientId)! })).filter(x => x.p), [records, patients])
  const isDue = (d: string) => new Date(d).getTime() - Date.now() < 7 * 864e5
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return all.filter(({ r, p }) => !s || p.name.toLowerCase().includes(s) || p.village.toLowerCase().includes(s) || r.id.toLowerCase().includes(s))
      .filter(({ r }) => filter === 'all' || (filter === 'due' && isDue(r.followUpDate)) || (filter === 'unsynced' && r.sync !== 'synced') || r.result.band === filter)
  }, [q, filter, all])
  const count = (f: Filter) => f === 'all' ? all.length : f === 'due' ? all.filter(x => isDue(x.r.followUpDate)).length : f === 'unsynced' ? all.filter(x => x.r.sync !== 'synced').length : all.filter(x => x.r.result.band === f).length
  const chipTone = { low: 'bg-mint text-primary-dark', moderate: 'bg-info-tint text-info', higher: 'bg-error-tint text-error-text' }
  const chipIcon = { low: ShieldCheck, moderate: ShieldAlert, higher: AlertTriangle }
  const filters: [Filter, string][] = [['all', 'All'], ['higher', 'Higher risk'], ['moderate', 'Moderate'], ['low', 'Low'], ['due', 'Follow-up due'], ['unsynced', 'Pending sync']]

  return (
    <AppShell title="SAATHI" subtitle="Clinical Reports">
      <div className="pt-4 flex items-center gap-3">
        <h1 className="text-[22px] font-bold tracking-tight whitespace-nowrap">Screening Reports</h1>
        <span className="h-7 px-2.5 rounded-full bg-info-tint text-info text-[12px] font-semibold inline-flex items-center">{all.length} screened</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px] font-medium"><span className="text-secondary inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />Community outreach</span><span className="text-primary">Stored on this device</span></div>

      <div className="relative mt-3">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" aria-hidden />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by patient name, village or ID…" aria-label="Search records" className="w-full h-[52px] pl-11 pr-4 rounded-[14px] bg-surface shadow-[var(--shadow-card)] text-[15px] focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Filter">
        {filters.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={cx('h-10 px-3.5 rounded-full text-[13px] font-semibold whitespace-nowrap inline-flex items-center gap-2 shrink-0', filter === k ? 'bg-primary text-white' : 'bg-surface text-ink shadow-[var(--shadow-card)]')}>
            {l}<span className={cx('h-5 min-w-5 px-1.5 rounded-full text-[11px] inline-flex items-center justify-center', filter === k ? 'bg-primary-mid text-white' : 'bg-tint text-secondary')}>{count(k)}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? <Card><Empty icon={FolderOpen} title="No records found" body="Try a different search or filter." /></Card> : list.map(({ r, p }) => {
          const m = RISK_META[r.result.band]; const due = isDue(r.followUpDate); const Icon = chipIcon[r.result.band]
          return (
            <button key={r.id} type="button" onClick={() => nav(`/records/${r.id}`)} className={cx('w-full card p-3.5 text-left hover:bg-tint/40 transition-colors', r.result.band === 'higher' && 'border-l-4 border-error')}>
              <div className="flex items-start gap-3">
                <Avatar name={p.name} size={46} />
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-bold leading-tight truncate">{p.name} <span className="text-[13px] font-medium text-secondary">({p.age}{p.sex[0]})</span></p>
                  <p className="text-[13px] text-secondary mt-0.5 truncate">{jointName(r.joint, r.side)}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={cx('h-6 px-2 rounded-full text-[11px] font-semibold inline-flex items-center gap-1', r.sync === 'synced' ? 'bg-tint text-secondary' : 'bg-warning-tint text-warning-text')}>{r.sync === 'synced' ? <Cloud size={11} aria-hidden /> : <CloudOff size={11} aria-hidden />}{r.sync === 'synced' ? 'Synced' : 'Pending sync'}</span>
                  <p className="text-[12px] text-secondary mt-1">{fmtDate(r.createdAt)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={cx('h-8 px-3 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5', chipTone[r.result.band])}><Icon size={13} aria-hidden />{m.label}</span>
                <span className={cx('text-[13px] font-bold inline-flex items-center gap-0.5', due ? 'text-error-text' : 'text-primary')}>{due ? 'Follow-up due' : 'View report'}<ChevronRight size={16} aria-hidden /></span>
              </div>
            </button>
          )
        })}
      </div>
    </AppShell>
  )
}
