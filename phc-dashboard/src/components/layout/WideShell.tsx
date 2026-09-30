import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, Users, ClipboardList, Settings as SettingsIcon, 
  Menu, X, RefreshCw, User,
  Activity, BarChart2, Calendar, MapPin
} from 'lucide-react'
import { cx, Logo } from '../ui'

export function WideShell({ children, title, subtitle, headerRight }: { children: React.ReactNode, title?: string, subtitle?: string, headerRight?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const mainNav = [
    { to: '/dashboard', label: 'Overview', icon: Home },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/screenings', label: 'Screenings', icon: Activity },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/follow-ups', label: 'Follow-ups', icon: Calendar },
    { to: '/reports', label: 'Reports', icon: ClipboardList },
    { to: '/community', label: 'Community', icon: MapPin },
    { to: '/workers', label: 'Workers', icon: Users },
  ]
  
  const secondaryNav = [
    { to: '/sync', label: 'Sync & Field Status', icon: RefreshCw },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen bg-[#F7FAFA] flex flex-col md:flex-row w-full font-sans">
      {/* Mobile/Tablet Header */}
      <header className="md:hidden sticky top-0 z-30 bg-bg/95 backdrop-blur shadow-[0_2px_10px_rgba(16,30,54,0.05)] h-[68px] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-ink">
            <Menu size={24} />
          </button>
          <Logo size={34} />
          <span className="font-bold text-[18px] text-ink hidden sm:block">SAATHI PHC</span>
        </div>
        <div className="flex items-center gap-3">
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
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-surface border-r border-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-[68px] px-6 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-bold text-[18px] text-ink tracking-tight">SAATHI PHC</span>
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-medium text-[14px] transition-colors",
                  isActive ? "bg-tint text-primary font-semibold" : "text-secondary hover:bg-gray-50 hover:text-ink"
                )}>
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-3 rounded-[10px] hover:bg-gray-50 transition-colors cursor-pointer">
             <div className="h-9 w-9 rounded-full bg-tint text-primary flex items-center justify-center font-bold text-[14px]">
               A
             </div>
             <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-ink truncate">PHC Admin</div>
                <div className="text-[12px] text-secondary truncate">Medical Officer</div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden relative h-screen overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex h-[72px] px-8 items-center justify-between bg-[#F7FAFA]/95 backdrop-blur sticky top-0 z-30 border-b border-border">
          <div>
            {title && <h1 className="text-[20px] font-bold text-ink">{title}</h1>}
            {subtitle && <p className="text-[13px] text-secondary">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
             {headerRight}
             <div className="flex items-center gap-2 bg-white border border-border px-3 py-1.5 rounded-full shadow-sm">
                <div className="h-2 w-2 rounded-full bg-success"></div>
                <span className="text-[12px] font-medium text-secondary">Connected to SAATHI</span>
             </div>
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
