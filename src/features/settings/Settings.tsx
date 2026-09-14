import { useNavigate } from 'react-router-dom'
import { ChevronRight, Languages, User, Bluetooth, Info, LogOut, RotateCcw, Lock, RefreshCw, ClipboardList, Radio, Share2, ShieldCheck, Activity } from 'lucide-react'
import { AppShell, useSyncModel } from '../../components/layout/Shells'
import { Avatar, Button, IconTile, Toggle, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { LANGUAGES } from '../../domain/copy'

function RowLink({ icon: Icon, label, value, onClick }: { icon: typeof User; label: string; value?: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="w-full min-h-[60px] px-3 flex items-center gap-3 text-left border-b border-tint last:border-0"><IconTile icon={Icon} size={40} iconSize={20} /><span className="flex-1 text-[15px] font-semibold">{label}</span>{value && <span className="text-[13px] text-secondary">{value}</span>}<ChevronRight size={18} className="text-secondary" aria-hidden /></button>
}

export default function Settings() {
  const nav = useNavigate()
  const { workerName, language, online, setOnline, signOut, resetDemo, failNextSync, setFailNextSync, records, lastSyncedAt } = useApp()
  const { unsynced, start, clickable, syncStatus, ui } = useSyncModel()
  const lang = LANGUAGES.find(l => l.code === language)
  const pendingReports = records.filter(r => r.sync !== 'synced').length
  const pendingMovement = records.filter(r => r.sync !== 'synced' && r.movement?.performed).length

  return (
    <AppShell title="SAATHI" subtitle="Home Dashboard">
      {/* Figma 16 — Data synchronisation panel */}
      <section className={cx('card mt-4 p-4 overflow-hidden relative', !online && 'bg-[linear-gradient(135deg,#FFFFFF_60%,#E1FBF8_100%)]')}>
        <div className="flex items-start gap-3">
          <IconTile icon={online ? RefreshCw : Lock} tone="mint" size={48} iconSize={24} />
          <div className="flex-1 min-w-0">
            <p className="text-[20px] font-bold leading-tight flex items-center gap-2"><span className={cx('h-2 w-2 rounded-full', online ? 'bg-primary' : 'bg-warning')} aria-hidden />{online ? (syncStatus === 'synced' ? 'Up to date' : syncStatus === 'failed' ? 'Sync failed' : syncStatus === 'syncing' ? 'Syncing…' : 'Ready to sync') : 'Offline Mode Active'}</p>
            <p className="text-[12px] font-semibold text-primary mt-0.5">Saved on this device · zero data loss</p>
          </div>
          <span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-bold inline-flex items-center gap-1 shrink-0"><Lock size={11} aria-hidden />Local</span>
        </div>
        <p className="text-[13px] text-secondary leading-snug mt-3">{online ? 'Screenings, questionnaires and movement data are stored on this device. Sync in this prototype is simulated — nothing leaves the phone.' : 'All screening assessments and movement data are stored safely on this device. You can keep screening patients without disruption.'}</p>
        <div className="mt-3 rounded-[14px] bg-mint-soft p-3 flex items-center gap-3">
          <span className="h-11 w-11 rounded-[10px] bg-primary text-white text-[20px] font-bold flex items-center justify-center shrink-0">{unsynced}</span>
          <div className="flex-1 min-w-0"><p className="text-[15px] font-bold">Records Pending Sync</p><p className="text-[12px] text-secondary">{pendingReports} report{pendingReports === 1 ? '' : 's'} · {pendingMovement} movement stream{pendingMovement === 1 ? '' : 's'}</p></div>
          <ClipboardList size={20} className="text-primary shrink-0" aria-hidden />
        </div>
        <div className="mt-3 rounded-[12px] bg-tint p-3">
          <div className="flex items-center justify-between text-[13px]"><span className="font-bold">Network: {online ? 'Available' : 'Offline'}</span><span className="h-6 px-2 rounded-full bg-surface text-[11px] font-semibold text-secondary inline-flex items-center">{online ? 'Ready' : 'Standby'}</span></div>
          <p className="text-[12px] text-secondary mt-1 leading-snug">{online ? 'Tap Sync Now to run a simulated sync of pending records.' : 'Sync can be run manually as soon as the device is back online.'}</p>
          <div className="mt-2 flex items-center justify-between text-[12px]"><span className="text-secondary font-medium">Local storage used</span><span className="font-bold text-primary">{(records.length * 0.4).toFixed(1)} MB / 4 GB</span></div>
          <div className="h-1.5 rounded-full bg-info-tint mt-1.5 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(1.5, records.length * 0.4 / 40)}%` }} /></div>
        </div>
      </section>

      <section className="card mt-3 p-4">
        <div className="flex items-center justify-between mb-3"><h2 className="text-[18px] font-bold">Queued Records</h2><span className="text-[12px] text-secondary font-medium">On device</span></div>
        <div className="space-y-2">
          {[{ icon: Activity, t: 'Joint screenings', b: `${pendingReports} evaluation${pendingReports === 1 ? '' : 's'} ready`, tag: 'Ready' }, { icon: ClipboardList, t: 'Symptom questionnaires', b: `${pendingReports} intake form${pendingReports === 1 ? '' : 's'}`, tag: 'Ready' }, { icon: Radio, t: 'Movement data (simulated)', b: `${pendingMovement} stream${pendingMovement === 1 ? '' : 's'}`, tag: 'Compressed' }].map(x => (
            <div key={x.t} className="rounded-[12px] bg-tint p-3 flex items-center gap-3"><IconTile icon={x.icon} tone="mint" size={40} iconSize={20} className="!bg-surface !text-primary" /><div className="flex-1 min-w-0"><p className="text-[14px] font-bold">{x.t}</p><p className="text-[12px] text-secondary">{x.b}</p></div><span className="h-6 px-2 rounded-full bg-mint text-primary-dark text-[11px] font-semibold inline-flex items-center">{x.tag}</span></div>
          ))}
        </div>
      </section>

      <div className="mt-3 rounded-[16px] bg-tint p-4 flex gap-3">
        <span className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center shrink-0" aria-hidden><Share2 size={20} /></span>
        <div><p className="text-[15px] font-bold">Share with supervisor</p><p className="text-[13px] text-secondary leading-snug">No network? Reports can be printed or shared from each patient's report screen.</p></div>
      </div>

      <div className="mt-4 space-y-2">
        <Button full icon={RefreshCw} onClick={start} disabled={!clickable} loading={syncStatus === 'syncing'}>{syncStatus === 'failed' ? 'Sync Now (Retry)' : syncStatus === 'synced' ? 'Up to date' : online ? 'Sync Now (simulated)' : "You're offline"}</Button>
        <p className="text-center text-[12px] text-secondary" aria-live="polite">{ui.text}{ui.sub ? ` · ${ui.sub}` : ''}{lastSyncedAt && syncStatus === 'synced' ? '' : ''}</p>
      </div>

      <section className="mt-6">
        <h2 className="text-[13px] font-bold tracking-wider uppercase text-secondary mb-2 px-1">Demo controls</h2>
        <div className="card px-3">
          <Toggle checked={!online} onChange={v => setOnline(!v)} label="Simulate offline mode" description="Shows how SAATHI behaves without network" />
          <div className="border-t border-tint"><Toggle checked={failNextSync} onChange={setFailNextSync} label="Make next sync fail" description="Demonstrates the Sync failed → Retry state" /></div>
          <button onClick={() => { if (confirm('Reset demo data to the original sample patients?')) resetDemo() }} className="w-full min-h-14 flex items-center gap-3 text-left border-t border-tint"><RotateCcw size={20} className="text-secondary" aria-hidden /><span className="text-[15px] font-semibold">Reset demo data</span></button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[13px] font-bold tracking-wider uppercase text-secondary mb-2 px-1">Account & preferences</h2>
        <div className="card p-3 flex items-center gap-3 mb-2"><Avatar name={workerName} size={44} /><div><p className="font-bold">{workerName}</p><p className="text-[13px] text-secondary">Community Health Worker · ASHA-7749</p></div></div>
        <div className="card">
          <RowLink icon={Languages} label="Language" value={lang?.native} onClick={() => nav('/settings/language')} />
          <RowLink icon={Bluetooth} label="Sensor" value="Simulated" onClick={() => alert('This prototype uses a simulated sensor. Real device pairing will appear here.')} />
          <RowLink icon={Info} label="About SAATHI" value="v0.1 demo" onClick={() => alert('SAATHI — Your companion for healthier movement.\n\nAI-assisted osteoarthritis screening support for community health workers. It does not diagnose osteoarthritis.')} />
        </div>
      </section>

      <button onClick={() => { signOut(); nav('/login') }} className="mt-6 mb-2 w-full h-[52px] rounded-[16px] card text-error-text font-bold flex items-center justify-center gap-2"><LogOut size={18} aria-hidden />Sign out</button>
      <p className="text-center text-[11px] text-muted mt-3 inline-flex w-full items-center justify-center gap-1"><ShieldCheck size={12} aria-hidden />Screening support only · not a diagnostic device</p>
    </AppShell>
  )
}
