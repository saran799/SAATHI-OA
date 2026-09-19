import { useMemo, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, FolderOpen, CloudOff, Cloud, ChevronRight, AlertTriangle, ShieldAlert, ShieldCheck, RefreshCw, HardDrive } from 'lucide-react'
import { AppShell } from '../../components/layout/Shells'
import { Avatar, Card, Empty, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { fmtDate } from '../../domain/copy'
import { useT } from '../../i18n'
import type { SyncState } from '../../domain/types'
import { simulateRecordSync } from '../../services/sync'

type Filter = 'all' | 'higher' | 'moderate' | 'low' | 'due' | 'unsynced'
export default function Records() {
  const nav = useNavigate(); const [sp] = useSearchParams()
  const { records, patients, updateRecordSync, failNextSync } = useApp()
  const { t } = useT()
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
  const filters: Filter[] = ['all', 'higher', 'moderate', 'low', 'due', 'unsynced']

  const getSyncDisplay = (sync: SyncState) => {
    switch (sync) {
      case 'local':
        return { icon: HardDrive, label: t('records.local'), cls: 'bg-tint text-secondary', sub: t('sync.localSub', { count: 1 } as any) || 'Saved locally', desc: t('sync.savedLocalLong') }
      case 'unsynced':
        return { icon: CloudOff, label: t('records.pending'), cls: 'bg-warning-tint text-warning-text', sub: t('sync.unsyncedSub', { count: 1 } as any) || 'Waiting for connection', desc: t('sync.unsyncedSub', { count: 1 } as any) }
      case 'syncing':
        return { icon: RefreshCw, label: t('records.syncing'), cls: 'bg-info-tint text-info', sub: t('sync.syncingSub'), desc: t('sync.syncingLong') }
      case 'synced':
        return { icon: Cloud, label: t('records.synced'), cls: 'bg-tint text-secondary', sub: t('sync.syncedSub'), desc: t('sync.syncedSub') }
      case 'error':
      case 'failed':
        return { icon: AlertTriangle, label: t('records.failed'), cls: 'bg-error-tint text-error-text', sub: t('sync.failedSub'), desc: t('sync.failedLong') }
      default:
        return { icon: CloudOff, label: t('records.pending'), cls: 'bg-warning-tint text-warning-text', sub: '', desc: '' }
    }
  }

  const retryRecord = useCallback(async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const rec = records.find(r => r.id === id)
    if (!rec) return
    // Do not duplicate, preserve stable ID
    updateRecordSync(id, 'syncing')
    try {
      const result = await simulateRecordSync(rec, { fail: failNextSync })
      if (result.ok) {
        updateRecordSync(id, 'synced')
      } else {
        updateRecordSync(id, 'error')
      }
    } catch {
      updateRecordSync(id, 'error')
    }
  }, [records, updateRecordSync, failNextSync])

  return (
    <AppShell title={t('common.appName')} subtitle={t('records.title')}>
      <div className="pt-4 flex items-center gap-3 flex-wrap">
        <h1 className="text-[22px] font-bold tracking-tight break-words">{t('records.title')}</h1>
        <span className="h-7 px-2.5 rounded-full bg-info-tint text-info text-[12px] font-semibold inline-flex items-center break-words">{t('records.screened', { count: all.length })}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px] font-medium flex-wrap gap-2"><span className="text-secondary inline-flex items-center gap-1.5 break-words"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />{t('records.outreach')}</span><span className="text-primary break-words">{t('records.stored')}</span></div>

      <div className="relative mt-3">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" aria-hidden />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('records.placeholder')} aria-label={t('records.placeholder')} className="w-full h-[52px] min-h-[44px] pl-11 pr-4 rounded-[14px] bg-surface shadow-[var(--shadow-card)] text-[15px] focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Filter records">
        {filters.map(k => (
          <button key={k} role="tab" aria-selected={filter === k} aria-label={`${t(`records.filters.${k}`)} ${count(k)}`} onClick={() => setFilter(k)} className={cx('h-11 px-3.5 rounded-full text-[13px] font-semibold whitespace-nowrap inline-flex items-center gap-2 shrink-0 break-words min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none', filter === k ? 'bg-primary text-white' : 'bg-surface text-ink shadow-[var(--shadow-card)]')}>
            {t(`records.filters.${k}`)}<span className={cx('h-5 min-w-5 px-1.5 rounded-full text-[11px] inline-flex items-center justify-center', filter === k ? 'bg-primary-mid text-white' : 'bg-tint text-secondary')}>{count(k)}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 ? <Card><Empty icon={FolderOpen} title={t('records.noRecords')} body={t('records.noRecordsBody')} /></Card> : list.map(({ r, p }) => {
          const due = isDue(r.followUpDate); const Icon = chipIcon[r.result.band]
          const jointLabel = (() => { const j = t(`screening.joint.joints.${r.joint}.label`); const s = t(`screening.joint.${r.side}`); return r.side === 'both' ? j : `${s} ${j.toLowerCase()}` })()
          const syncInfo = getSyncDisplay(r.sync as SyncState)
          const SyncIcon = syncInfo.icon
          const isError = r.sync === 'error' || r.sync === 'failed'
          return (
            <div key={r.id} className={cx('w-full card p-3.5 text-left hover:bg-tint/40 transition-colors', r.result.band === 'higher' && 'border-l-4 border-error')}>
              <button type="button" onClick={() => nav(`/records/${r.id}`)} className="w-full text-left focus-visible:outline-none">
                <div className="flex items-start gap-3">
                  <Avatar name={p.name} size={46} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-bold leading-tight break-words">{p.name} <span className="text-[13px] font-medium text-secondary">({p.age}{p.sex[0]})</span></p>
                    <p className="text-[13px] text-secondary mt-0.5 break-words">{jointLabel}</p>
                    <p className="text-[11px] font-mono text-muted mt-0.5 break-words">ID: {r.id}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cx('h-6 px-2 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 break-words max-w-[110px]', syncInfo.cls)}>
                      <SyncIcon size={11} className={cx((r.sync === 'syncing') && 'spin')} aria-hidden />
                      <span className="truncate">{syncInfo.label}</span>
                    </span>
                    <p className="text-[12px] text-secondary mt-1">{fmtDate(r.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className={cx('h-8 px-3 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5 break-words', chipTone[r.result.band])}><Icon size={13} aria-hidden />{t(`screening.result.riskMeta.${r.result.band}.label`)}</span>
                  <span className={cx('text-[13px] font-bold inline-flex items-center gap-0.5 break-words', due ? 'text-error-text' : 'text-primary')}>{due ? t('records.followUpDue') : t('records.viewReport')}<ChevronRight size={16} aria-hidden /></span>
                </div>
              </button>
              {/* Per-record sync information - understandable state */}
              <div className="mt-2">
                <p className="text-[11px] text-secondary break-words leading-snug">{syncInfo.desc}</p>
                {isError && (
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => retryRecord(r.id, e)}
                      aria-label={`${t('sync.retry')} ${r.id}`}
                      className="min-h-[44px] h-11 px-4 rounded-full bg-error-tint text-error-text text-[12px] font-semibold inline-flex items-center gap-1.5 hover:bg-error/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                      <RefreshCw size={14} aria-hidden />{t('sync.retry')}
                    </button>
                    <span className="text-[10px] text-muted self-center break-words">ID preserved: {r.id} · No data leaves device (simulated)</span>
                  </div>
                )}
                {r.sync === 'local' && (
                  <p className="text-[10px] text-muted mt-1 break-words">Saved on this device · waiting for connection · No real upload (simulated sync)</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
