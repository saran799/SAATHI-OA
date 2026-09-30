import { useNavigate } from 'react-router-dom'
import { UserPlus, ArrowRight, ChevronRight, Users, FileText, ShieldPlus, RefreshCw } from 'lucide-react'
import { AppShell, useSyncModel } from '../../components/layout/Shells'
import { IconTile, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { useSession } from '../../store/sessionStore'

export default function Dashboard() {
  const nav = useNavigate()
  const { workerName, patients } = useApp()
  const { unsynced, start, clickable, syncStatus } = useSyncModel()
  const session = useSession()
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const first = workerName.split(' ')[0]
  const inProgress = session.patientId && !session.result ? patients.find(p => p.id === session.patientId) : null

  const rows = [
    { icon: Users, label: 'Patients', to: '/patients' },
    { icon: FileText, label: 'View Reports', to: '/records' },
    { icon: ShieldPlus, label: 'Health Awareness', to: '/awareness' },
  ]

  return (
    <AppShell>
      <div className="pt-6">
        <h1 className="text-[26px] font-bold tracking-tight leading-tight">{greet}, {first}</h1>
        <p className="text-secondary text-[15px] mt-1">Here's what's waiting for you today.</p>
      </div>

      <button type="button" onClick={() => nav('/patients/new')}
        className="mt-6 w-full rounded-[18px] bg-primary text-white text-left p-4 flex items-center gap-4 shadow-[var(--shadow-btn)] hover:bg-primary-dark transition-colors">
        <IconTile icon={UserPlus} tone="primary" size={52} iconSize={26} className="!rounded-[14px] !bg-primary-mid" />
        <span className="flex-1 min-w-0"><span className="block text-[22px] font-bold leading-tight">New Patient</span><span className="block text-[13px] text-white/85 mt-1 leading-snug">Start rapid osteoarthritis screening</span></span>
        <span className="h-10 w-10 rounded-full bg-primary-mid flex items-center justify-center shrink-0" aria-hidden><ArrowRight size={20} /></span>
      </button>

      {inProgress && (
        <button type="button" onClick={() => nav(`/patients/${inProgress.id}`)} className="mt-3 w-full card p-4 flex items-center gap-3 text-left border-2 border-mint">
          <span className="h-2.5 w-2.5 rounded-full bg-primary pulse-dot" aria-hidden />
          <span className="flex-1 min-w-0"><span className="block text-[12px] font-bold text-primary uppercase tracking-wide">Screening in progress</span><span className="block text-[15px] font-semibold truncate">{inProgress.name}</span></span>
          <ChevronRight size={20} className="text-secondary" aria-hidden />
        </button>
      )}

      <div className="mt-5 space-y-3">
        {rows.map(r => (
          <button key={r.label} type="button" onClick={() => nav(r.to)} className="w-full card p-3 pr-4 flex items-center gap-4 text-left hover:bg-tint/40 transition-colors min-h-[72px]">
            <IconTile icon={r.icon} size={44} iconSize={22} />
            <span className="flex-1 text-[17px] font-semibold">{r.label}</span>
            <ChevronRight size={20} className="text-secondary" aria-hidden />
          </button>
        ))}
        <button type="button" onClick={() => clickable ? start() : nav('/settings')} className="w-full card p-3 pr-4 flex items-center gap-4 text-left hover:bg-tint/40 transition-colors min-h-[72px]">
          <IconTile icon={RefreshCw} size={44} iconSize={22} className={cx(syncStatus === 'syncing' && '[&>svg]:spin')} />
          <span className="flex-1 text-[17px] font-semibold">Sync Data</span>
          {syncStatus === 'offline' ? <span className="h-7 px-2.5 rounded-full bg-warning-tint text-warning-text text-[12px] font-semibold">Offline</span>
            : syncStatus === 'failed' ? <span className="h-7 px-2.5 rounded-full bg-error-tint text-error-text text-[12px] font-semibold">Failed · Retry</span>
            : syncStatus === 'syncing' ? <span className="h-7 px-2.5 rounded-full bg-info-tint text-info text-[12px] font-semibold">Syncing…</span>
            : unsynced > 0 ? <span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">{unsynced} pending</span>
            : <span className="h-7 px-2.5 rounded-full bg-tint text-secondary text-[12px] font-semibold inline-flex items-center">Up to date</span>}
          <ChevronRight size={20} className="text-secondary" aria-hidden />
        </button>
      </div>
      <p className="mt-6 text-[11px] text-muted text-center">Sync is simulated in this prototype — no data leaves the device.</p>
    </AppShell>
  )
}
