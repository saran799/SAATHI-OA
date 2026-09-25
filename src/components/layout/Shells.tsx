import React, { useEffect, useRef, useCallback } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, ClipboardList, ShieldPlus, MoreHorizontal, Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, User, ArrowLeft, type LucideIcon } from 'lucide-react'
import { cx, ProgressBar, Logo } from '../ui'
import { useApp } from '../../store/appStore'
import { syncQueue, isBackendReachable } from '../../services/sync'
import { useT } from '../../i18n'
import type { SyncState } from '../../domain/types'

export function Frame({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full mx-auto w-full max-w-[430px] bg-bg flex flex-col relative sm:shadow-[0_0_0_1px_var(--color-border)]">{children}</div>
}

export function useSyncModel() {
  const {
    online, syncStatus, records,
    setSyncStatus, lastSyncedAt, setOnline,
    setFailNextSync,
    updateRecordSync, markRecordsSynced, markRecordsError, setRecordsSyncState
  } = useApp()
  const { t } = useT()
  const cancel = useRef<boolean>(false)
  const syncingRef = useRef<boolean>(false)

  const unsynced = records.filter(r => r.sync !== 'synced')
  const unsyncedCount = unsynced.length
  const localRecords = records.filter(r => r.sync === 'local')
  const errorRecords = records.filter(r => r.sync === 'error' || r.sync === 'failed')
  const syncingRecords = records.filter(r => r.sync === 'syncing')

  // Core sync function — per-record, idempotent, retry only unsynced/failed
  const start = useCallback(async () => {
    if (syncingRef.current) return
    const appState = useApp.getState()
    const toSync = appState.records.filter(r => r.sync === 'local' || r.sync === 'unsynced' || r.sync === 'error' || r.sync === 'failed')
    if (toSync.length === 0) return

    // Check backend reachability beyond navigator.onLine per spec
    const reachable = await isBackendReachable()
    if (!reachable) {
      setOnline(false)
      return
    }

    syncingRef.current = true
    cancel.current = false
    setFailNextSync(false)
    setSyncStatus('syncing')
    // Mark all toSync as syncing for per-record UI
    setRecordsSyncState(toSync.map(r => r.id), 'syncing')

    try {
      const result = await syncQueue(
        toSync,
        useApp.getState().patients, // Pass patients
        (id, state) => {
          if (cancel.current) return
          updateRecordSync(id, state as SyncState)
        }
      )

      if (cancel.current) return

      if (result.failedIds.length > 0) {
        // Preserve records, mark error, show retry status per spec
        markRecordsError(result.failedIds)
        // Synced ones
        if (result.syncedIds.length > 0) {
          markRecordsSynced(result.syncedIds)
        }
        setSyncStatus('failed')
      } else {
        // All succeeded — mark synced only after successful completion per spec
        markRecordsSynced(result.syncedIds)
        setSyncStatus('synced')
      }
    } catch (e) {
      console.error('Sync queue error', e)
      // On exception, preserve all records and mark error
      const ids = toSync.map(r => r.id)
      markRecordsError(ids)
      setSyncStatus('failed')
    } finally {
      syncingRef.current = false
    }
  }, [setFailNextSync, setSyncStatus, setRecordsSyncState, updateRecordSync, markRecordsSynced, markRecordsError, setOnline])

  // Auto sync when connectivity returns per spec: 1.Save locally 2.Mark unsynced 3.Queue 4.Attempt when online 5.Mark synced after success 6.Preserve on fail
  useEffect(() => {
    const onOnline = () => {
      setOnline(true)
      // Auto attempt sync when connectivity returns, but only if we have unsynced
      const hasUnsynced = useApp.getState().records.some(r => r.sync !== 'synced')
      if (hasUnsynced) {
        // Small delay to allow UI to update and avoid race
        setTimeout(() => {
          const state = useApp.getState()
          if (state.online && !syncingRef.current && state.records.some(r => r.sync !== 'synced')) {
            start()
          }
        }, 1500)
      }
    }
    const onOffline = () => {
      setOnline(false)
      // Cancel any ongoing sync? Preserve records, just set offline
      cancel.current = true
      syncingRef.current = false
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    // Initial online state
    setOnline(navigator.onLine)

    return () => {
      cancel.current = true
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [setOnline, start])

  // UI mapping per spec: Offline, Online/not yet synced, Syncing, Synced, Sync failed
  const map: Record<string, { icon: LucideIcon; text: string; sub: string; cls: string; dot: string }> = {
    offline: {
      icon: CloudOff,
      text: t('sync.offline'),
      sub: t('sync.offlineSub'),
      cls: 'bg-warning-tint text-warning-text',
      dot: 'bg-warning'
    },
    local: {
      icon: Cloud,
      text: unsyncedCount ? t('sync.pending', { count: unsyncedCount }) : t('sync.saved'),
      sub: localRecords.length ? t('sync.localSub', { count: localRecords.length } as any) : t('sync.pendingSub'),
      cls: 'bg-tint text-secondary',
      dot: 'bg-muted'
    },
    syncing: {
      icon: RefreshCw,
      text: t('sync.syncing'),
      sub: syncingRecords.length ? t('sync.syncingSubCount', { count: syncingRecords.length } as any) : t('sync.syncingSub'),
      cls: 'bg-info-tint text-info',
      dot: 'bg-info'
    },
    synced: {
      icon: CheckCircle2,
      text: t('sync.synced'),
      sub: lastSyncedAt ? t('sync.syncedAt', { time: new Date(lastSyncedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }) : t('sync.syncedSub') || '',
      cls: 'bg-surface text-ink shadow-[var(--shadow-card)]',
      dot: 'bg-primary'
    },
    failed: {
      icon: AlertCircle,
      text: t('sync.failed'),
      sub: errorRecords.length ? t('sync.failedSubCount', { count: errorRecords.length } as any) : t('sync.failedSub'),
      cls: 'bg-error-tint text-error-text',
      dot: 'bg-error'
    },
  }

  // Determine UI state: if offline, show offline; else if syncing, show syncing; else if failed, show failed; else if unsynced, show local/pending; else synced
  let displayStatus = syncStatus
  if (!online) displayStatus = 'offline'
  else if (syncingRecords.length > 0 || syncStatus === 'syncing') displayStatus = 'syncing'
  else if (errorRecords.length > 0 || syncStatus === 'failed') displayStatus = 'failed'
  else if (unsyncedCount > 0) displayStatus = 'local'
  else displayStatus = 'synced'

  const ui = map[displayStatus] || map['local']
  const clickable = online && (syncStatus === 'local' || syncStatus === 'failed' || unsyncedCount > 0) && syncStatus !== 'syncing'

  return {
    syncStatus: displayStatus as any,
    rawSyncStatus: syncStatus,
    unsynced: unsyncedCount,
    unsyncedRecords: unsynced,
    localRecords,
    errorRecords,
    syncingRecords,
    start,
    clickable,
    ui,
    online
  }
}

export function SyncPill() {
  const { ui, clickable, start, syncStatus } = useSyncModel()
  const { t } = useT()
  const Icon = ui.icon
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={start}
      aria-live="polite"
      title={ui.sub}
      className={cx('h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap break-words max-w-[160px]', ui.cls, clickable && 'cursor-pointer min-h-[32px]')}
    >
      {syncStatus === 'syncing' ? <Icon size={13} className="spin shrink-0" aria-hidden /> : <span className={cx('h-2 w-2 rounded-full shrink-0', ui.dot)} aria-hidden />}
      <span className="truncate">{syncStatus === 'failed' ? t('sync.retry') : ui.text}</span>
    </button>
  )
}

export function SyncStrip() {
  const { ui, clickable, start, syncStatus } = useSyncModel()
  const { t } = useT()
  if (syncStatus === 'synced') return null
  const Icon = ui.icon
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={start}
      aria-live="polite"
      className={cx('mx-4 mt-3 min-h-[44px] px-4 rounded-[14px] flex items-center gap-2 text-[13px] font-semibold text-left break-words', ui.cls, clickable && 'cursor-pointer')}
    >
      <Icon size={16} className={cx('shrink-0', syncStatus === 'syncing' && 'spin')} aria-hidden />
      <span className="break-words">{ui.text}</span>
      {ui.sub && <span className="opacity-70 font-normal break-words line-clamp-2">{ui.sub}</span>}
      {syncStatus === 'failed' && <span className="ml-auto underline shrink-0">{t('sync.retryShort')}</span>}
    </button>
  )
}

export function TopBar({ title, subtitle, back, onBack, right, showLogo = true }: { title?: string; subtitle?: string; back?: string | boolean; onBack?: () => void; right?: React.ReactNode; showLogo?: boolean }) {
  const nav = useNavigate()
  const { t } = useT()
  return (
    <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur shadow-[0_2px_10px_rgba(16,30,54,0.05)]">
      <div className="h-[68px] px-4 flex items-center gap-2">
        {back && <button type="button" aria-label={t('common.back')} onClick={() => onBack ? onBack() : typeof back === 'string' ? nav(back) : nav(-1)} className="h-11 w-11 -ml-2 inline-flex items-center justify-center rounded-full text-ink hover:bg-tint min-h-[44px] min-w-[44px]"><ArrowLeft size={24} /></button>}
        {showLogo && <Logo size={34} />}
        <div className="flex-1 min-w-0">
          {title && <p className={cx('font-bold text-ink leading-tight truncate break-words', subtitle ? 'text-[19px] text-primary' : 'text-[18px]')}>{title}</p>}
          {subtitle && <p className="text-[11px] font-semibold tracking-wide text-secondary uppercase leading-tight break-words">{subtitle}</p>}
        </div>
        {right}
        <button type="button" onClick={() => nav('/settings')} aria-label="Profile and settings" className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 min-h-[36px] min-w-[36px]"><User size={18} /></button>
      </div>
    </header>
  )
}

export function AppShell({ title, subtitle, children, right, headerLess, back }: { title?: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode; headerLess?: boolean; back?: string }) {
  const loc = useLocation()
  const { t } = useT()
  const tabs = [
    { to: '/dashboard', label: t('nav.home'), icon: Home },
    { to: '/patients', label: t('nav.patients'), icon: Users },
    { to: '/records', label: t('nav.reports'), icon: ClipboardList },
    { to: '/awareness', label: t('nav.awareness'), icon: ShieldPlus },
    { to: '/settings', label: t('nav.more'), icon: MoreHorizontal },
  ]
  return (
    <Frame>
      {!headerLess && <TopBar title={title ?? t('common.appName')} subtitle={subtitle} back={back} right={right ?? <SyncPill />} />}
      <SyncStrip />
      <main key={loc.pathname} className="flex-1 px-4 pb-32 page-enter">{children}</main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface shadow-[0_-4px_16px_rgba(16,30,54,0.06)] no-print" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Main">
        <ul className="grid grid-cols-5 px-2 py-2">
          {tabs.map(tab => (
            <li key={tab.to} className="flex justify-center"><NavLink to={tab.to} className={({ isActive }) => cx('min-h-[58px] w-full max-w-[80px] rounded-[14px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-center leading-tight px-1 break-words', isActive ? 'bg-primary-light text-primary' : 'text-ink/80')}>
              {({ isActive }) => <><tab.icon size={22} strokeWidth={isActive ? 2.25 : 1.9} aria-hidden /><span className="break-words line-clamp-2">{tab.label}</span>{isActive && <span className="sr-only">(current)</span>}</>}
            </NavLink></li>
          ))}
        </ul>
      </nav>
    </Frame>
  )
}

export function FlowShell({ title, subtitle, step, total, stepLabel, back, children, footer, hideBack, onBack, barTitle = 'Screening Intake', pill }: {
  title: string; subtitle?: string; step?: number; total?: number; stepLabel?: string; back?: string; children: React.ReactNode; footer?: React.ReactNode; hideBack?: boolean; onBack?: () => void; barTitle?: string; pill?: React.ReactNode
}) {
  const loc = useLocation()
  const { t } = useT()
  return (
    <Frame>
      <TopBar title={barTitle} back={hideBack ? undefined : (back ?? true)} onBack={onBack}
        right={pill ?? <span className="h-8 px-3 rounded-full bg-tint text-ink text-[12px] font-semibold inline-flex items-center gap-1.5 break-words"><Cloud size={13} aria-hidden />{t('common.saved')}</span>} />
      <main key={loc.pathname} className={cx('flex-1 px-4 pt-3 page-enter', footer ? 'pb-36' : 'pb-8')}>
        {step && total && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2"><span className="text-[12px] font-bold tracking-wide text-primary uppercase break-words">{t('screening.common.stepOf', { current: step, total })}</span>{stepLabel && <span className="text-[12px] text-secondary font-medium break-words">{stepLabel}</span>}</div>
            <ProgressBar value={(step / total) * 100} label={t('screening.common.screeningProgress')} />
          </div>
        )}
        {title && <h1 className="text-[22px] font-bold leading-tight tracking-tight break-words">{title}</h1>}
        {subtitle && <p className="text-secondary text-[15px] mt-1 leading-snug break-words">{subtitle}</p>}
        <div className="mt-4">{children}</div>
      </main>
      {footer && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-bg/95 backdrop-blur px-4 pt-3 pb-3 no-print" style={{ paddingBottom: 'calc(14px + env(safe-area-inset-bottom))' }}>
          {footer}
        </div>
      )}
    </Frame>
  )
}
