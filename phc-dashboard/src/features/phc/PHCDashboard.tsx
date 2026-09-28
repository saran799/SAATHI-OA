import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WideShell } from '../../components/layout/WideShell'
import { usePHC } from '../../store/phcStore'
import { Users, Activity, Calendar, CheckCircle } from 'lucide-react'
import { cx, EmptyState, LoadingState } from '../../components/ui'

export default function PHCDashboard() {
  const { dashboard, loading, fetchDashboard } = usePHC()
  const workerName = 'PHC Admin'
  const nav = useNavigate()

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const StatCard = ({ title, value, icon: Icon, colorClass, onClick }: any) => (
    <div 
      onClick={onClick}
      className={cx(
        "bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col justify-between transition-all hover:shadow-md hover:border-primary/30 cursor-pointer h-[120px]"
      )}
    >
       <div className="flex justify-between items-start">
         <div className="text-[13px] font-semibold text-secondary">{title}</div>
         <div className={cx("h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0", colorClass)}>
           <Icon size={20} />
         </div>
       </div>
       <div className="text-[32px] font-bold text-ink leading-none mt-2">
         {loading.dashboard ? <span className="animate-pulse bg-tint text-transparent rounded w-16 h-8 inline-block"></span> : value ?? '-'}
       </div>
    </div>
  )

  return (
    <WideShell title="PHC Overview" subtitle={`Welcome back, ${workerName.split(' ')[0]}`}>
      
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Patients" value={dashboard?.totalPatients} icon={Users} colorClass="bg-blue-50/50 text-blue-600" onClick={() => nav('/patients')} />
        <StatCard title="Total Screenings" value={dashboard?.totalScreenings} icon={Activity} colorClass="bg-emerald-50/50 text-emerald-600" onClick={() => nav('/screenings')} />
        <StatCard title="Follow-ups Due" value={dashboard?.followUpsDue} icon={Calendar} colorClass={dashboard?.followUpsDue > 0 ? "bg-amber-50/50 text-amber-600" : "bg-gray-50/50 text-gray-500"} onClick={() => nav('/follow-ups')} />
        <StatCard title="Active Field Workers" value={dashboard?.workers} icon={Users} colorClass="bg-teal-50/50 text-teal-600" onClick={() => nav('/workers')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Distribution */}
        <div className="lg:col-span-2 bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-bold text-ink tracking-tight">Screening Indications</h2>
            <button className="text-[13px] font-medium text-primary hover:bg-tint px-3 py-1.5 rounded-[8px] transition-colors" onClick={() => nav('/analytics')}>View Details</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-[12px] border border-border hover:border-error-tint transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-error"></div>
                <div className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Higher Risk</div>
              </div>
              <div className="text-[28px] font-bold text-ink group-hover:text-error transition-colors">{loading.dashboard ? '-' : (dashboard?.riskDistribution?.higher || 0)}</div>
            </div>
            <div className="p-4 bg-white rounded-[12px] border border-border hover:border-warning-tint transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <div className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Moderate</div>
              </div>
              <div className="text-[28px] font-bold text-ink group-hover:text-warning transition-colors">{loading.dashboard ? '-' : (dashboard?.riskDistribution?.moderate || 0)}</div>
            </div>
            <div className="p-4 bg-white rounded-[12px] border border-border hover:border-border transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <div className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Low Risk</div>
              </div>
              <div className="text-[28px] font-bold text-ink">{loading.dashboard ? '-' : (dashboard?.riskDistribution?.low || 0)}</div>
            </div>
            <div className="p-4 bg-white rounded-[12px] border border-border hover:border-border transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <div className="text-[12px] font-semibold text-secondary uppercase tracking-wider">Insufficient</div>
              </div>
              <div className="text-[28px] font-bold text-ink">{loading.dashboard ? '-' : (dashboard?.riskDistribution?.insufficient || 0)}</div>
            </div>
          </div>
        </div>

        {/* Sync Status Mini */}
        <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col">
          <h2 className="text-[16px] font-bold text-ink mb-6 tracking-tight">System Status</h2>
          <div className="flex-1 flex flex-col justify-center items-center text-center">
             <div className="h-14 w-14 rounded-full bg-success-tint flex items-center justify-center mb-4 text-success">
                <CheckCircle size={28} />
             </div>
             <div className="text-[15px] font-semibold text-ink mb-1">Online & Synchronized</div>
             <div className="text-[13px] text-secondary px-4">All PHC operations are connected to the central database.</div>
          </div>
          <button onClick={() => nav('/sync')} className="mt-6 w-full py-2.5 rounded-[10px] bg-white border border-border text-ink font-semibold text-[14px] hover:bg-gray-50 transition-colors">
            Manage Connections
          </button>
        </div>

        {/* Recent Screenings */}
        <div className="lg:col-span-3 bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-ink tracking-tight">Recent Screenings</h2>
            <button className="text-[13px] font-medium text-primary hover:bg-tint px-3 py-1.5 rounded-[8px] transition-colors" onClick={() => nav('/screenings')}>View All</button>
          </div>
          <div className="overflow-x-auto">
            {loading.dashboard ? (
               <LoadingState compact />
            ) : dashboard?.recentScreenings?.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#F7FAFA] text-[12px] text-secondary font-medium uppercase tracking-wider border-b border-border">
                    <th className="px-5 py-3.5">Patient</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Joint</th>
                    <th className="px-5 py-3.5">Indication</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dashboard.recentScreenings.map((r: any) => (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-ink text-[14px]">{r.patient?.name || 'Unknown'}</div>
                        <div className="text-[12px] text-secondary">{r.patient?.village || 'Unknown village'}</div>
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-secondary font-medium">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-[14px] text-ink capitalize font-medium">{r.joint} ({r.side})</td>
                      <td className="px-5 py-3.5">
                        <span className={cx(
                          "px-2.5 py-1 rounded-[6px] text-[12px] font-semibold",
                          r.result?.band === 'higher' ? 'bg-error-tint text-error-text' :
                          r.result?.band === 'moderate' ? 'bg-warning-tint text-warning-text' :
                          'bg-tint text-primary'
                        )}>
                          {r.result?.band || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => nav(`/reports/${r.id}`)} className="text-[13px] font-semibold text-primary hover:text-primary-dark opacity-0 group-hover:opacity-100 transition-opacity">
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState 
                icon={Activity} 
                title="No recent screenings" 
                body="Screening activity will appear here once field workers sync their devices." 
                compact 
              />
            )}
          </div>
        </div>
      </div>
    </WideShell>
  )
}
