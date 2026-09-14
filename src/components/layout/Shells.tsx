import React, { useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, ClipboardList, ShieldPlus, MoreHorizontal, Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, User, ArrowLeft, type LucideIcon } from 'lucide-react'
import { cx, ProgressBar, Logo } from '../ui'
import { useApp } from '../../store/appStore'
import { simulateSync } from '../../services/sync'

/** Phone-width container; centred at 430px on desktop. */
export function Frame({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full mx-auto w-full max-w-[430px] bg-bg flex flex-col relative sm:shadow-[0_0_0_1px_var(--color-border)]">{children}</div>
}

/* ---------------- Sync status (Figma: small pill "● Synced") ---------------- */
export function useSyncModel() {
  const { online, syncStatus, records, setSyncStatus, markAllSynced, lastSyncedAt, setOnline, failNextSync, setFailNextSync } = useApp()
  const unsynced = records.filter(r => r.sync !== 'synced').length
  const cancel = useRef<() => void>(null)
  const start = () => { const fail = failNextSync; setFailNextSync(false); setSyncStatus('syncing'); cancel.current = simulateSync(ok => ok ? markAllSynced() : setSyncStatus('failed'), { fail }) }
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { cancel.current?.(); window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [setOnline])
  const map: Record<string, { icon: LucideIcon; text: string; sub: string; cls: string; dot: string }> = {
    offline: { icon: CloudOff, text: "You're offline", sub: 'Your work is saved locally', cls: 'bg-warning-tint text-warning-text', dot: 'bg-warning' },
    local: { icon: Cloud, text: unsynced ? `${unsynced} pending` : 'Saved locally', sub: 'Tap to sync (simulated)', cls: 'bg-tint text-secondary', dot: 'bg-muted' },
    syncing: { icon: RefreshCw, text: 'Syncing…', sub: 'Simulated sync', cls: 'bg-info-tint text-info', dot: 'bg-info' },
    synced: { icon: CheckCircle2, text: 'Synced', sub: lastSyncedAt ? `at ${new Date(lastSyncedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : '', cls: 'bg-surface text-ink shadow-[var(--shadow-card)]', dot: 'bg-primary' },
    failed: { icon: AlertCircle, text: 'Sync failed', sub: 'Tap to retry', cls: 'bg-error-tint text-error-text', dot: 'bg-error' },
  }
  const clickable = online && (syncStatus === 'local' || syncStatus === 'failed')
  return { syncStatus, unsynced, start, clickable, ui: map[syncStatus], online }
}

/** Compact pill (used in headers, matches Figma "● Synced"). */
export function SyncPill() {
  const { ui, clickable, start, syncStatus } = useSyncModel()
  const Icon = ui.icon
  return (
    <button type="button" disabled={!clickable} onClick={start} aria-live="polite" title={ui.sub}
      className={cx('h-8 px-3 rounded-full inline-flex items-center gap-1.5 text-[12px] font-semibold whitespace-nowrap', ui.cls, clickable && 'cursor-pointer')}>
      {syncStatus === 'syncing' ? <Icon size={13} className="spin" aria-hidden /> : <span className={cx('h-2 w-2 rounded-full', ui.dot)} aria-hidden />}
      {syncStatus === 'failed' ? 'Retry sync' : ui.text}
    </button>
  )
}

/** Full-width strip; shown only when there's something to say (offline / failed / syncing). */
export function SyncStrip() {
  const { ui, clickable, start, syncStatus } = useSyncModel()
  if (syncStatus === 'synced' || syncStatus === 'local') return null
  const Icon = ui.icon
  return (
    <button type="button" disabled={!clickable} onClick={start} aria-live="polite"
      className={cx('mx-4 mt-3 h-11 px-4 rounded-[14px] flex items-center gap-2 text-[13px] font-semibold text-left', ui.cls, clickable && 'cursor-pointer')}>
      <Icon size={16} className={cx(syncStatus === 'syncing' && 'spin')} aria-hidden />
      <span className="whitespace-nowrap">{ui.text}</span>
      {ui.sub && <span className="opacity-70 font-normal truncate">· {ui.sub}</span>}
      {syncStatus === 'failed' && <span className="ml-auto underline">Retry</span>}
    </button>
  )
}

/* ---------------- Top app bar (Figma) ---------------- */
export function TopBar({ title, subtitle, back, onBack, right, showLogo = true }: { title?: string; subtitle?: string; back?: string | boolean; onBack?: () => void; right?: React.ReactNode; showLogo?: boolean }) {
  const nav = useNavigate()
  return (
    <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur shadow-[0_2px_10px_rgba(16,30,54,0.05)]">
      <div className="h-[68px] px-4 flex items-center gap-2">
        {back && <button type="button" aria-label="Back" onClick={() => onBack ? onBack() : typeof back === 'string' ? nav(back) : nav(-1)} className="h-11 w-11 -ml-2 inline-flex items-center justify-center rounded-full text-ink hover:bg-tint"><ArrowLeft size={24} /></button>}
        {showLogo && <Logo size={34} />}
        <div className="flex-1 min-w-0">
          {title && <p className={cx('font-bold text-ink leading-tight truncate', subtitle ? 'text-[19px] text-primary' : 'text-[18px]')}>{title}</p>}
          {subtitle && <p className="text-[11px] font-semibold tracking-wide text-secondary uppercase leading-tight">{subtitle}</p>}
        </div>
        {right}
        <button type="button" onClick={() => nav('/settings')} aria-label="Profile and settings" className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0"><User size={18} /></button>
      </div>
    </header>
  )
}

const tabs = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/records', label: 'Reports', icon: ClipboardList },
  { to: '/awareness', label: 'Awareness', icon: ShieldPlus },
  { to: '/settings', label: 'More', icon: MoreHorizontal },
]

/** Shell with bottom tabs (dashboard-level screens) */
export function AppShell({ title, subtitle, children, right, headerLess, back }: { title?: string; subtitle?: string; children: React.ReactNode; right?: React.ReactNode; headerLess?: boolean; back?: string }) {
  const loc = useLocation()
  return (
    <Frame>
      {!headerLess && <TopBar title={title ?? 'SAATHI'} subtitle={subtitle} back={back} right={right ?? <SyncPill />} />}
      <SyncStrip />
      <main key={loc.pathname} className="flex-1 px-4 pb-32 page-enter">{children}</main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-surface shadow-[0_-4px_16px_rgba(16,30,54,0.06)] no-print" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Main">
        <ul className="grid grid-cols-5 px-2 py-2">
          {tabs.map(t => (
            <li key={t.to} className="flex justify-center"><NavLink to={t.to} className={({ isActive }) => cx('h-[58px] w-full max-w-[72px] rounded-[14px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold', isActive ? 'bg-primary-light text-primary' : 'text-ink/80')}>
              {({ isActive }) => <><t.icon size={22} strokeWidth={isActive ? 2.25 : 1.9} aria-hidden />{t.label}{isActive && <span className="sr-only">(current)</span>}</>}
            </NavLink></li>
          ))}
        </ul>
      </nav>
    </Frame>
  )
}

/** Shell for linear flows: Figma header (back · logo · title · Saved · avatar) + "STEP N OF M" progress + sticky footer. */
export function FlowShell({ title, subtitle, step, total, stepLabel, back, children, footer, hideBack, onBack, barTitle = 'Screening Intake', pill }: {
  title: string; subtitle?: string; step?: number; total?: number; stepLabel?: string; back?: string; children: React.ReactNode; footer?: React.ReactNode; hideBack?: boolean; onBack?: () => void; barTitle?: string; pill?: React.ReactNode
}) {
  const loc = useLocation()
  return (
    <Frame>
      <TopBar title={barTitle} back={hideBack ? undefined : (back ?? true)} onBack={onBack}
        right={pill ?? <span className="h-8 px-3 rounded-full bg-tint text-ink text-[12px] font-semibold inline-flex items-center gap-1.5"><Cloud size={13} aria-hidden />Saved</span>} />
      <main key={loc.pathname} className={cx('flex-1 px-4 pt-3 page-enter', footer ? 'pb-36' : 'pb-8')}>
        {step && total && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2"><span className="text-[12px] font-bold tracking-wide text-primary uppercase">Step {step} of {total}</span>{stepLabel && <span className="text-[12px] text-secondary font-medium">{stepLabel}</span>}</div>
            <ProgressBar value={(step / total) * 100} label="Screening progress" />
          </div>
        )}
        <h1 className="text-[22px] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="text-secondary text-[15px] mt-1 leading-snug">{subtitle}</p>}
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
