import { useEffect, useState } from 'react'
import { WideShell } from '../../components/layout/WideShell'
import { usePHC } from '../../store/phcStore'
import { Activity, Users, Calendar, AlertCircle } from 'lucide-react'
import { EmptyState, LoadingState, cx } from '../../components/ui'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = {
  higher: '#ef4444', // error
  moderate: '#f59e0b', // warning
  low: '#0f766e', // primary
  insufficient: '#94a3b8', // slate-400
  default: '#0f766e',
  secondary: '#38bdf8' // light blue for contrast
}

export default function PHCAnalytics() {
  const { analytics, loading, fetchAnalytics } = usePHC()
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics(timeRange)
  }, [fetchAnalytics, timeRange])

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col justify-between h-[120px]">
       <div className="flex justify-between items-start">
         <div className="text-[13px] font-semibold text-secondary">{title}</div>
         <div className={cx("h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0", colorClass)}>
           <Icon size={20} />
         </div>
       </div>
       <div className="text-[32px] font-bold text-ink leading-none mt-2">
         {loading.analytics ? <span className="animate-pulse bg-tint text-transparent rounded w-16 h-8 inline-block"></span> : value ?? '-'}
       </div>
    </div>
  )

  const renderContent = () => {
    if (loading.analytics && !analytics) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[16px] border border-border">
          <LoadingState />
        </div>
      )
    }

    if (!analytics) {
      return (
        <div className="bg-white rounded-[16px] border border-border p-8">
           <EmptyState 
             icon={Activity} 
             title="Unable to load analytics" 
             body="There was a problem connecting to the database."
             action={
               <button 
                 onClick={() => fetchAnalytics(timeRange)}
                 className="px-4 py-2 bg-tint text-primary font-semibold rounded-[10px] hover:bg-tint-2 transition-colors"
               >
                 Retry
               </button>
             }
           />
        </div>
      )
    }

    const { summary, screeningActivity, riskDistribution, ageDistribution, workerActivity, communityActivity } = analytics

    // Check if there's any data
    if (summary.totalScreenings === 0 && summary.totalPatients === 0) {
      return (
        <div className="bg-white rounded-[16px] border border-border p-8">
           <EmptyState 
             icon={Activity} 
             title="No analytics data available yet" 
             body="Screening and patient activity will appear here once field workers sync their records."
           />
        </div>
      )
    }

    return (
      <>
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Patients" value={summary.totalPatients} icon={Users} colorClass="bg-blue-50/50 text-blue-600" />
          <StatCard title="Screenings in Period" value={summary.totalScreenings} icon={Activity} colorClass="bg-emerald-50/50 text-emerald-600" />
          <StatCard title="Higher Risk Indications" value={summary.higherRisk} icon={AlertCircle} colorClass="bg-red-50/50 text-red-600" />
          <StatCard title="Follow-ups Due" value={summary.followUpsDue} icon={Calendar} colorClass="bg-amber-50/50 text-amber-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Screening Activity */}
          <div className="bg-white p-5 rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col min-h-[300px]">
             <h2 className="text-[16px] font-bold text-ink mb-4">Screening Activity</h2>
             {screeningActivity && screeningActivity.length > 0 ? (
               <div className="flex-1 w-full h-full min-h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={screeningActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                     <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                     <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                     <Line type="monotone" dataKey="count" name="Screenings" stroke={COLORS.default} strokeWidth={3} dot={{r: 4, fill: COLORS.default}} activeDot={{r: 6}} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             ) : (
               <div className="flex-1 flex items-center justify-center text-[13px] text-secondary">Insufficient data for period</div>
             )}
          </div>

          {/* Chart 2: Screening Indication */}
          <div className="bg-white p-5 rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col min-h-[300px]">
             <h2 className="text-[16px] font-bold text-ink mb-4">Screening Indication</h2>
             {riskDistribution && riskDistribution.length > 0 ? (
               <div className="flex-1 w-full h-full min-h-[200px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={riskDistribution.filter((d: any) => d.value > 0)}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {riskDistribution.map((entry: any, index: number) => (
                         <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.default} />
                       ))}
                     </Pie>
                     <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                     <Legend wrapperStyle={{ fontSize: '13px' }} formatter={(val) => <span className="capitalize">{val}</span>} />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             ) : (
               <div className="flex-1 flex items-center justify-center text-[13px] text-secondary">Insufficient data for period</div>
             )}
          </div>

          {/* Chart 3: Age Distribution */}
          <div className="bg-white p-5 rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col min-h-[300px]">
             <h2 className="text-[16px] font-bold text-ink mb-4">Patient Age Distribution</h2>
             {ageDistribution && ageDistribution.length > 0 && ageDistribution.some((d: any) => d.value > 0) ? (
               <div className="flex-1 w-full h-full min-h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={ageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                     <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                     <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                     <Bar dataKey="value" name="Patients" fill={COLORS.default} radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             ) : (
               <div className="flex-1 flex items-center justify-center text-[13px] text-secondary">Insufficient data for period</div>
             )}
          </div>

          {/* Chart 4: Worker Activity */}
          <div className="bg-white p-5 rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col min-h-[300px]">
             <h2 className="text-[16px] font-bold text-ink mb-4">Field Worker Activity</h2>
             {workerActivity && workerActivity.length > 0 ? (
               <div className="flex-1 overflow-y-auto pr-2">
                 <div className="space-y-4">
                   {workerActivity.map((w: any) => (
                     <div key={w.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-tint flex items-center justify-center text-primary font-bold text-[12px]">
                           {w.name.charAt(0)}
                         </div>
                         <div className="text-[14px] font-semibold text-ink">{w.name}</div>
                       </div>
                       <div className="text-[14px] font-bold text-ink">{w.screenings} <span className="text-[12px] font-normal text-secondary ml-1">screenings</span></div>
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
               <div className="flex-1 flex items-center justify-center text-[13px] text-secondary">Insufficient data for period</div>
             )}
          </div>
          
          {/* Chart 5: Community/Village Activity */}
          <div className="bg-white p-5 rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col min-h-[300px] lg:col-span-2">
             <h2 className="text-[16px] font-bold text-ink mb-4">Community Screening Activity</h2>
             {communityActivity && communityActivity.length > 0 && communityActivity.some((d: any) => d.value > 0) ? (
               <div className="flex-1 w-full h-full min-h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={communityActivity.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                     <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                     <YAxis type="category" dataKey="name" tick={{fontSize: 12, fill: '#1e293b', fontWeight: 500}} axisLine={false} tickLine={false} width={100} />
                     <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                     <Bar dataKey="value" name="Screenings" fill={COLORS.secondary} radius={[0, 4, 4, 0]} barSize={24} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             ) : (
               <div className="flex-1 flex items-center justify-center text-[13px] text-secondary">Insufficient data for period</div>
             )}
          </div>

        </div>
      </>
    )
  }

  return (
    <WideShell 
      title="Analytics" 
      subtitle="Screening and community health activity across your PHC"
      headerRight={
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-border text-ink text-[13px] font-medium rounded-[10px] px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      }
    >
      <div className="max-w-[1200px] w-full">
        {renderContent()}
      </div>
    </WideShell>
  )
}
