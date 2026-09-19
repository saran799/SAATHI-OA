import { useNavigate } from 'react-router-dom'
import { ChevronRight, Languages, User, Bluetooth, Info, LogOut, RotateCcw, Lock, RefreshCw, ClipboardList, Radio, Share2, ShieldCheck, Activity, HardDrive, AlertTriangle, CloudOff } from 'lucide-react'
import { AppShell, useSyncModel } from '../../components/layout/Shells'
import { Avatar, Button, IconTile, Toggle, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { useT } from '../../i18n'

function RowLink({ icon: Icon, label, value, onClick }: { icon: typeof User; label: string; value?: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="w-full min-h-[60px] px-3 flex items-center gap-3 text-left border-b border-tint last:border-0"><IconTile icon={Icon} size={40} iconSize={20} /><span className="flex-1 text-[15px] font-semibold break-words">{label}</span>{value && <span className="text-[13px] text-secondary break-words">{value}</span>}<ChevronRight size={18} className="text-secondary" aria-hidden /></button>
}

export default function Settings() {
  const nav = useNavigate()
  const { workerName, language, online, setOnline, signOut, resetDemo, failNextSync, setFailNextSync, records } = useApp()
  const { unsynced, unsyncedRecords, localRecords, errorRecords, syncingRecords, start, clickable, syncStatus, ui } = useSyncModel()
  const { t } = useT()
  const lang = t(`languages.${language}.native`)
  const pendingMovement = unsyncedRecords.filter(r => r.movement?.performed).length

  return (
    <AppShell title={t('common.appName')} subtitle={t('settings.subtitle')}>
      <section className={cx('card mt-4 p-4 overflow-hidden relative', !online && 'bg-[linear-gradient(135deg,#FFFFFF_60%,#E1FBF8_100%)]')}>
        <div className="flex items-start gap-3">
          <IconTile icon={online ? RefreshCw : Lock} tone="mint" size={48} iconSize={24} />
          <div className="flex-1 min-w-0">
            <p className="text-[20px] font-bold leading-tight flex items-center gap-2 break-words"><span className={cx('h-2 w-2 rounded-full', online ? 'bg-primary' : 'bg-warning')} aria-hidden />{online ? (syncStatus === 'synced' ? t('settings.syncPanel.upToDate') : syncStatus === 'failed' ? t('settings.syncPanel.syncFailed') : syncStatus === 'syncing' ? t('settings.syncPanel.syncing') : t('settings.syncPanel.readySync')) : t('settings.syncPanel.offlineActive')}</p>
            <p className="text-[12px] font-semibold text-primary mt-0.5 break-words">{t('settings.syncPanel.savedLocal')}</p>
          </div>
          <span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-bold inline-flex items-center gap-1 shrink-0"><Lock size={11} aria-hidden />{t('settings.syncPanel.local')}</span>
        </div>
        <p className="text-[13px] text-secondary leading-snug mt-3 break-words">{online ? t('settings.syncPanel.descOnline') : t('settings.syncPanel.descOffline')}</p>

        {/* Offline-first status per spec: Offline, Saved locally, Syncing, Synced, Sync failed */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-[12px] bg-tint p-2.5 flex items-center gap-2">
            <HardDrive size={16} className="text-secondary shrink-0" />
            <div className="min-w-0"><p className="text-[12px] font-bold break-words">{t('sync.local')}</p><p className="text-[11px] text-secondary break-words">{localRecords.length} {t('common.local')}</p></div>
          </div>
          <div className="rounded-[12px] bg-warning-tint p-2.5 flex items-center gap-2">
            <CloudOff size={16} className="text-warning-text shrink-0" />
            <div className="min-w-0"><p className="text-[12px] font-bold break-words">{t('sync.unsynced')}</p><p className="text-[11px] text-secondary break-words">{records.filter(r=>r.sync==='unsynced').length} pending</p></div>
          </div>
          <div className="rounded-[12px] bg-info-tint p-2.5 flex items-center gap-2">
            <RefreshCw size={16} className={cx('text-info shrink-0', syncStatus==='syncing' && 'spin')} />
            <div className="min-w-0"><p className="text-[12px] font-bold break-words">{t('sync.syncing')}</p><p className="text-[11px] text-secondary break-words">{syncingRecords.length} syncing</p></div>
          </div>
          <div className="rounded-[12px] bg-error-tint p-2.5 flex items-center gap-2">
            <AlertTriangle size={16} className="text-error-text shrink-0" />
            <div className="min-w-0"><p className="text-[12px] font-bold break-words">{t('sync.failed')}</p><p className="text-[11px] text-secondary break-words">{errorRecords.length} failed</p></div>
          </div>
        </div>

        <div className="mt-3 rounded-[14px] bg-mint-soft p-3 flex items-center gap-3">
          <span className="h-11 w-11 rounded-[10px] bg-primary text-white text-[20px] font-bold flex items-center justify-center shrink-0">{unsynced}</span>
          <div className="flex-1 min-w-0"><p className="text-[15px] font-bold break-words">{t('settings.syncPanel.pendingTitle')}</p><p className="text-[12px] text-secondary break-words">{t('settings.syncPanel.pendingSub', { reports: unsynced, plural: unsynced===1?'':'s', movement: pendingMovement, plural2: pendingMovement===1?'':'s' } as any)}</p></div>
          <ClipboardList size={20} className="text-primary shrink-0" aria-hidden />
        </div>
        <div className="mt-3 rounded-[12px] bg-tint p-3">
          <div className="flex items-center justify-between text-[13px]"><span className="font-bold break-words">{t('settings.syncPanel.network', { status: online ? t('settings.syncPanel.available') : t('settings.syncPanel.offline') })}</span><span className="h-6 px-2 rounded-full bg-surface text-[11px] font-semibold text-secondary inline-flex items-center break-words">{online ? t('settings.syncPanel.ready') : t('settings.syncPanel.standby')}</span></div>
          <p className="text-[12px] text-secondary mt-1 leading-snug break-words">{online ? t('settings.syncPanel.tapSync') : t('settings.syncPanel.tapOffline')}</p>
          <p className="text-[11px] text-secondary mt-2 break-words">{online ? t('sync.offlineLong') : t('sync.savedLocalLong')}</p>
          <div className="mt-2 flex items-center justify-between text-[12px]"><span className="text-secondary font-medium break-words">{t('settings.syncPanel.storage')}</span><span className="font-bold text-primary break-words">{t('settings.syncPanel.storageValue', { used: (records.length * 0.4).toFixed(1) })}</span></div>
          <div className="h-1.5 rounded-full bg-info-tint mt-1.5 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(1.5, records.length * 0.4 / 40)}%` }} /></div>
        </div>
      </section>

      <section className="card mt-3 p-4">
        <div className="flex items-center justify-between mb-3"><h2 className="text-[18px] font-bold break-words">{t('settings.queued.title')}</h2><span className="text-[12px] text-secondary font-medium break-words">{t('settings.queued.onDevice')}</span></div>
        <div className="space-y-2">
          {[
            { icon: Activity, k: 'joint', count: unsynced, desc: `${unsynced} ${t('sync.pending', { count: unsynced })}` },
            { icon: ClipboardList, k: 'symptom', count: unsynced, desc: `${unsynced} intake` },
            { icon: Radio, k: 'movement', count: pendingMovement, desc: `${pendingMovement} streams` },
          ].map(x => (
            <div key={x.k} className="rounded-[12px] bg-tint p-3 flex items-center gap-3"><IconTile icon={x.icon} tone="mint" size={40} iconSize={20} className="!bg-surface !text-primary" /><div className="flex-1 min-w-0"><p className="text-[14px] font-bold break-words">{t(`settings.queued.${x.k}.t`)}</p><p className="text-[12px] text-secondary break-words">{x.desc}</p></div><span className="h-6 px-2 rounded-full bg-mint text-primary-dark text-[11px] font-semibold inline-flex items-center break-words">{t(`settings.queued.${x.k}.tag`)}</span></div>
          ))}
        </div>
        {unsyncedRecords.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-[11px] font-bold tracking-wider text-secondary uppercase break-words">Sync queue — idempotent by ID</p>
            {unsyncedRecords.slice(0,5).map(r => (
              <div key={r.id} className="h-10 px-3 rounded-[10px] bg-tint flex items-center gap-2 text-[12px]">
                <span className={cx('h-2 w-2 rounded-full', r.sync==='local'?'bg-muted': r.sync==='error' || r.sync==='failed' ? 'bg-error' : r.sync==='syncing' ? 'bg-info' : 'bg-warning')} />
                <span className="font-mono truncate">{r.id}</span>
                <span className="ml-auto text-[11px] font-semibold capitalize break-words">{r.sync}</span>
              </div>
            ))}
            {unsyncedRecords.length > 5 && <p className="text-[11px] text-secondary">+{unsyncedRecords.length - 5} more</p>}
          </div>
        )}
      </section>

      <div className="mt-3 rounded-[16px] bg-tint p-4 flex gap-3">
        <span className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center shrink-0" aria-hidden><Share2 size={20} /></span>
        <div><p className="text-[15px] font-bold break-words">{t('settings.shareSupervisor')}</p><p className="text-[13px] text-secondary leading-snug break-words">{t('settings.shareDesc')}</p></div>
      </div>

      <div className="mt-4 space-y-2">
        <Button full icon={RefreshCw} onClick={start} disabled={!clickable} loading={syncStatus === 'syncing'}>{syncStatus === 'failed' ? t('settings.syncRetry') : syncStatus === 'synced' ? t('settings.upToDateBtn') : online ? t('settings.syncNow') : t('settings.offlineBtn')}</Button>
        <p className="text-center text-[12px] text-secondary break-words" aria-live="polite">{ui.text}{ui.sub ? ` · ${ui.sub}` : ''}</p>
        <p className="text-center text-[11px] text-muted break-words">Local-first: saved immediately, synced only after success, preserved on failure. No data leaves device in prototype (simulated sync).</p>
      </div>

      <section className="mt-6">
        <h2 className="text-[13px] font-bold tracking-wider uppercase text-secondary mb-2 px-1 break-words">{t('settings.demoControls')}</h2>
        <div className="card px-3">
          <Toggle checked={!online} onChange={v => setOnline(!v)} label={t('settings.simulateOffline')} description={t('settings.simulateOfflineDesc')} />
          <div className="border-t border-tint"><Toggle checked={failNextSync} onChange={setFailNextSync} label={t('settings.failNextSync')} description={t('settings.failNextSyncDesc')} /></div>
          <button onClick={() => { if (confirm(t('settings.resetConfirm'))) resetDemo() }} className="w-full min-h-14 flex items-center gap-3 text-left border-t border-tint"><RotateCcw size={20} className="text-secondary" aria-hidden /><span className="text-[15px] font-semibold break-words">{t('settings.resetDemo')}</span></button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[13px] font-bold tracking-wider uppercase text-secondary mb-2 px-1 break-words">{t('settings.account')}</h2>
        <div className="card p-3 flex items-center gap-3 mb-2"><Avatar name={workerName} size={44} /><div><p className="font-bold break-words">{workerName}</p><p className="text-[13px] text-secondary break-words">{t('settings.workerRole')}</p></div></div>
        <div className="card">
          <RowLink icon={Languages} label={t('settings.language')} value={lang} onClick={() => nav('/settings/language')} />
          <RowLink icon={Bluetooth} label={t('settings.sensor')} value={t('settings.sensorValue')} onClick={() => alert(t('settings.sensorAlert'))} />
          <RowLink icon={Info} label={t('settings.about')} value={t('settings.aboutValue')} onClick={() => alert(t('settings.aboutAlert'))} />
        </div>
      </section>

      <button onClick={() => { signOut(); nav('/login') }} className="mt-6 mb-2 w-full h-[52px] rounded-[16px] card text-error-text font-bold flex items-center justify-center gap-2"><LogOut size={18} aria-hidden />{t('settings.signOut')}</button>
      <p className="text-center text-[11px] text-muted mt-3 inline-flex w-full items-center justify-center gap-1 break-words"><ShieldCheck size={12} aria-hidden />{t('settings.screeningSupportNote')}</p>
    </AppShell>
  )
}
