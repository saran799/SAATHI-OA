import { useNavigate } from 'react-router-dom'
import { ChevronRight, Languages, User, Bluetooth, Info, LogOut, RotateCcw, Lock, RefreshCw, ClipboardList, Radio, Share2, ShieldCheck, Activity } from 'lucide-react'
import { AppShell, useSyncModel } from '../../components/layout/Shells'
import { Avatar, Button, IconTile, Toggle, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { LANGUAGES } from '../../domain/copy'
import { useT } from '../../i18n'
import { api } from '../../services/api'

function RowLink({ icon: Icon, label, value, onClick }: { icon: typeof User; label: string; value?: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="w-full min-h-[60px] px-3 flex items-center gap-3 text-left border-b border-tint last:border-0"><IconTile icon={Icon} size={40} iconSize={20} /><span className="flex-1 text-[15px] font-semibold">{label}</span>{value && <span className="text-[13px] text-secondary">{value}</span>}<ChevronRight size={18} className="text-secondary" aria-hidden /></button>
}

export default function Settings() {
  const nav = useNavigate()
  const { t } = useT()
  const { workerName, language, online, setOnline, signOut, resetDemo, failNextSync, setFailNextSync, records, lastSyncedAt } = useApp()
  const { unsynced, start, clickable, syncStatus, ui } = useSyncModel()
  const lang = LANGUAGES.find(l => l.code === language)
  const pendingReports = records.filter(r => r.sync !== 'synced').length
  const pendingMovement = records.filter(r => r.sync !== 'synced' && r.movement?.performed).length

  return (
    <AppShell title={t('settings.title')} subtitle={t('settings.subtitle')}>
      {/* Figma 16 — Data synchronisation panel */}
      <section className={cx('card mt-4 p-4 overflow-hidden relative', !online && 'bg-[linear-gradient(135deg,#FFFFFF_60%,#E1FBF8_100%)]')}>
        <div className="flex items-start gap-3">
          <IconTile icon={online ? RefreshCw : Lock} tone="mint" size={48} iconSize={24} />
          <div className="flex-1 min-w-0">
            <p className="text-[20px] font-bold leading-tight flex items-center gap-2"><span className={cx('h-2 w-2 rounded-full', online ? 'bg-primary' : 'bg-warning')} aria-hidden />{online ? (syncStatus === 'synced' ? t('settings.syncPanel.upToDate') : syncStatus === 'failed' ? t('settings.syncPanel.syncFailed') : syncStatus === 'syncing' ? t('settings.syncPanel.syncing') : t('settings.syncPanel.readySync')) : t('settings.syncPanel.offlineActive')}</p>
            <p className="text-[12px] font-semibold text-primary mt-0.5">{t('settings.syncPanel.savedLocal')}</p>
          </div>
          <span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-bold inline-flex items-center gap-1 shrink-0"><Lock size={11} aria-hidden />{t('settings.syncPanel.local')}</span>
        </div>
        <p className="text-[13px] text-secondary leading-snug mt-3">{online ? t('settings.syncPanel.descOnline') : t('settings.syncPanel.descOffline')}</p>
        <div className="mt-3 rounded-[14px] bg-mint-soft p-3 flex items-center gap-3">
          <span className="h-11 w-11 rounded-[10px] bg-primary text-white text-[20px] font-bold flex items-center justify-center shrink-0">{unsynced}</span>
          <div className="flex-1 min-w-0"><p className="text-[15px] font-bold">{t('settings.syncPanel.pendingTitle')}</p><p className="text-[12px] text-secondary">{t('settings.syncPanel.pendingSub', { reports: pendingReports, plural: pendingReports === 1 ? '' : 's', movement: pendingMovement, plural2: pendingMovement === 1 ? '' : 's' })}</p></div>
          <ClipboardList size={20} className="text-primary shrink-0" aria-hidden />
        </div>
        <div className="mt-3 rounded-[12px] bg-tint p-3">
          <div className="flex items-center justify-between text-[13px]"><span className="font-bold">{t('settings.syncPanel.network', { status: online ? t('settings.syncPanel.available') : t('settings.syncPanel.offline') })}</span><span className="h-6 px-2 rounded-full bg-surface text-[11px] font-semibold text-secondary inline-flex items-center">{online ? t('settings.syncPanel.ready') : t('settings.syncPanel.standby')}</span></div>
          <p className="text-[12px] text-secondary mt-1 leading-snug">{online ? t('settings.syncPanel.tapSync') : t('settings.syncPanel.tapOffline')}</p>
          <div className="mt-2 flex items-center justify-between text-[12px]"><span className="text-secondary font-medium">{t('settings.syncPanel.storage')}</span><span className="font-bold text-primary">{t('settings.syncPanel.storageValue', { used: (records.length * 0.4).toFixed(1) })}</span></div>
          <div className="h-1.5 rounded-full bg-info-tint mt-1.5 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(1.5, records.length * 0.4 / 40)}%` }} /></div>
        </div>
      </section>

      <section className="card mt-3 p-4">
        <div className="flex items-center justify-between mb-3"><h2 className="text-[18px] font-bold">{t('settings.queued.title')}</h2><span className="text-[12px] text-secondary font-medium">{t('settings.queued.onDevice')}</span></div>
        <div className="space-y-2">
          {[{ icon: Activity, t: t('settings.queued.joint.t'), b: t('settings.queued.joint.b', { count: pendingReports, plural: pendingReports === 1 ? '' : 's' }), tag: t('settings.queued.joint.tag') }, { icon: ClipboardList, t: t('settings.queued.symptom.t'), b: t('settings.queued.symptom.b', { count: pendingReports, plural: pendingReports === 1 ? '' : 's' }), tag: t('settings.queued.symptom.tag') }, { icon: Radio, t: t('settings.queued.movement.t'), b: t('settings.queued.movement.b', { count: pendingMovement, plural: pendingMovement === 1 ? '' : 's' }), tag: t('settings.queued.movement.tag') }].map(x => (
            <div key={x.t} className="rounded-[12px] bg-tint p-3 flex items-center gap-3"><IconTile icon={x.icon} tone="mint" size={40} iconSize={20} className="!bg-surface !text-primary" /><div className="flex-1 min-w-0"><p className="text-[14px] font-bold">{x.t}</p><p className="text-[12px] text-secondary">{x.b}</p></div><span className="h-6 px-2 rounded-full bg-mint text-primary-dark text-[11px] font-semibold inline-flex items-center">{x.tag}</span></div>
          ))}
        </div>
      </section>

      <div className="mt-3 rounded-[16px] bg-tint p-4 flex gap-3">
        <span className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center shrink-0" aria-hidden><Share2 size={20} /></span>
        <div><p className="text-[15px] font-bold">{t('settings.shareSupervisor')}</p><p className="text-[13px] text-secondary leading-snug">{t('settings.shareDesc')}</p></div>
      </div>

      <div className="mt-4 space-y-2">
        <Button full icon={RefreshCw} onClick={start} disabled={!clickable} loading={syncStatus === 'syncing'}>{syncStatus === 'failed' ? t('settings.syncRetry') : syncStatus === 'synced' ? t('settings.upToDateBtn') : online ? t('settings.syncNow') : t('settings.offlineBtn')}</Button>
        <p className="text-center text-[12px] text-secondary" aria-live="polite">{ui.text}{ui.sub ? ` · ${ui.sub}` : ''}{lastSyncedAt && syncStatus === 'synced' ? '' : ''}</p>
      </div>

      <section className="mt-6">
        <h2 className="text-[13px] font-bold tracking-wider uppercase text-secondary mb-2 px-1">{t('settings.demoControls')}</h2>
        <div className="card px-3">
          <Toggle checked={!online} onChange={v => setOnline(!v)} label={t('settings.simulateOffline')} description={t('settings.simulateOfflineDesc')} />
          <div className="border-t border-tint"><Toggle checked={failNextSync} onChange={setFailNextSync} label={t('settings.failNextSync')} description={t('settings.failNextSyncDesc')} /></div>
          <button onClick={() => { if (confirm(t('settings.resetConfirm'))) resetDemo() }} className="w-full min-h-14 flex items-center gap-3 text-left border-t border-tint"><RotateCcw size={20} className="text-secondary" aria-hidden /><span className="text-[15px] font-semibold">{t('settings.resetDemo')}</span></button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[13px] font-bold tracking-wider uppercase text-secondary mb-2 px-1">{t('settings.account')}</h2>
        <div className="card p-3 flex items-center gap-3 mb-2"><Avatar name={workerName} size={44} /><div><p className="font-bold">{workerName}</p><p className="text-[13px] text-secondary">{t('settings.workerRole')}</p></div></div>
        <div className="card">
          <RowLink icon={Lock} label="Change Password" onClick={async () => {
            const pwd = window.prompt('Enter new password (4-digit PIN for demo):');
            if (!pwd) return;
            try {
              await api.changePassword(workerName, pwd);
              alert('Password updated successfully.');
            } catch (err) {
              alert('Failed to update password.');
            }
          }} />
          <RowLink icon={Languages} label={t('settings.language')} value={lang?.native} onClick={() => nav('/settings/language')} />
          <RowLink icon={Bluetooth} label={t('settings.sensor')} value={t('settings.sensorValue')} onClick={() => alert(t('settings.sensorAlert'))} />
          <RowLink icon={Info} label={t('settings.about')} value={t('settings.aboutValue')} onClick={() => alert(t('settings.aboutAlert'))} />
        </div>
      </section>

      <button onClick={() => { signOut(); nav('/login') }} className="mt-6 mb-2 w-full h-[52px] rounded-[16px] card text-error-text font-bold flex items-center justify-center gap-2"><LogOut size={18} aria-hidden />{t('settings.signOut')}</button>
      <p className="text-center text-[11px] text-muted mt-3 inline-flex w-full items-center justify-center gap-1"><ShieldCheck size={12} aria-hidden />{t('settings.screeningSupportNote')}</p>
    </AppShell>
  )
}
