import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, Users, ClipboardList, ShieldPlus, Settings as SettingsIcon, 
  Menu, X, RefreshCw, User,
  Activity, BarChart2, Calendar, MapPin
} from 'lucide-react'
import { cx, Logo } from '../ui'
import { useApp } from '../../store/appStore'
import { SyncPill } from './Shells'
import { useT } from '../../i18n'

export function WideShell({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) {
  const { t } = useT()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const mainNav = [
    { to: '/phc/dashboard', label: 'Overview', icon: Home },
    { to: '/phc/patients', label: 'Patients', icon: Users },
    { to: '/phc/screenings', label: 'Screenings', icon: Activity },
    { to: '/phc/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/phc/follow-ups', label: 'Follow-ups', icon: Calendar },
    { to: '/phc/reports', label: 'Reports', icon: ClipboardList },
    { to: '/phc/community', label: 'Community', icon: MapPin },
  ]
  
  const secondaryNav = [
    { to: '/phc/sync', label: 'Sync & Field Status', icon: RefreshCw },
    { to: '/awareness', label: 'Awareness', icon: ShieldPlus },
    { to: '/phc/settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row w-full font-sans">
      {/* Mobile/Tablet Header */}
      <header className="md:hidden sticky top-0 z-30 bg-bg/95 backdrop-blur shadow-[0_2px_10px_rgba(16,30,54,0.05)] h-[68px] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-ink">
            <Menu size={24} />
          </button>
          <Logo size={34} />
          <span className="font-bold text-[18px] text-ink hidden sm:block">{t('common.appName')}</span>
        </div>
        <div className="flex items-center gap-3">
          <SyncPill />
          <button className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center">
            <User size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-ink/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cx(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-surface border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-[68px] px-6 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <Logo size={34} />
            <span className="font-bold text-[20px] text-primary tracking-tight">SAATHI PHC</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 md:hidden text-secondary">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
          <div>
            <div className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-3 px-2">Main Menu</div>
            <nav className="flex flex-col gap-1">
              {mainNav.map(item => (
                <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-semibold text-[15px] transition-colors",
                  isActive ? "bg-primary text-white" : "text-ink/80 hover:bg-tint"
                )}>
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <div className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-3 px-2">System</div>
            <nav className="flex flex-col gap-1">
              {secondaryNav.map(item => (
                <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => cx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-semibold text-[15px] transition-colors",
                  isActive ? "bg-primary text-white" : "text-ink/80 hover:bg-tint"
                )}>
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 bg-tint p-3 rounded-[14px]">
             <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
               {useApp(s => s.workerName).charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px] truncate">{useApp(s => s.workerName)}</div>
                <div className="text-[12px] text-secondary truncate">Community Health Worker</div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden relative h-screen overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex h-[68px] px-8 items-center justify-between bg-bg/95 backdrop-blur sticky top-0 z-30 border-b border-border">
          <div>
            {title && <h1 className="text-[22px] font-bold text-ink">{title}</h1>}
            {subtitle && <p className="text-[13px] font-medium text-secondary">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
             <SyncPill />
          </div>
        </header>
        
        <div className="flex-1 p-4 md:p-8">
           {/* Mobile Header title space if no desktop header is visible */}
           <div className="md:hidden mb-6">
             {title && <h1 className="text-[24px] font-bold text-ink leading-tight">{title}</h1>}
             {subtitle && <p className="text-[14px] font-medium text-secondary mt-1">{subtitle}</p>}
           </div>
           {children}
        </div>
      </main>
    </div>
  )
}
