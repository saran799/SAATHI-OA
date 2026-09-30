import { useEffect } from 'react'
import { WideShell } from '../../components/layout/WideShell'
import { usePHC } from '../../store/phcStore'
import { MapPin, Users, Activity, Calendar } from 'lucide-react'
import { LoadingState, EmptyState, cx } from '../../components/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

export default function PHCCommunity() {
  const { community, loading, fetchCommunity } = usePHC()

  useEffect(() => {
    fetchCommunity()
  }, [fetchCommunity])

  const renderContent = () => {
    if (loading.community && !community) {
      return (
        <div className="flex h-64 items-center justify-center bg-white rounded-[16px] border border-border">
          <LoadingState message="Loading community activity..." />
        </div>
      )
    }

    if (!community || !community.villages || community.villages.length === 0) {
      return (
        <div className="bg-white rounded-[16px] border border-border p-8">
           <EmptyState 
             icon={MapPin} 
             title="No community data available yet" 
             body="Screening and patient activity across villages will appear here once field workers sync their records."
           />
        </div>
      )
    }

    const { summary, villages } = community;

    return (
      <div className="space-y-6 max-w-[1200px]">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <div className="text-[13px] font-semibold text-secondary">Communities</div>
              <div className="h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 bg-purple-50/50 text-purple-600">
                <MapPin size={20} />
              </div>
            </div>
            <div className="text-[32px] font-bold text-ink leading-none mt-2">{summary.totalVillages}</div>
          </div>
          <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <div className="text-[13px] font-semibold text-secondary">Registered Patients</div>
              <div className="h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 bg-blue-50/50 text-blue-600">
                <Users size={20} />
              </div>
            </div>
            <div className="text-[32px] font-bold text-ink leading-none mt-2">{summary.totalPatients}</div>
          </div>
          <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <div className="text-[13px] font-semibold text-secondary">Total Screenings</div>
              <div className="h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 bg-emerald-50/50 text-emerald-600">
                <Activity size={20} />
              </div>
            </div>
            <div className="text-[32px] font-bold text-ink leading-none mt-2">{summary.totalScreenings}</div>
          </div>
          <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
              <div className="text-[13px] font-semibold text-secondary">Follow-ups Due</div>
              <div className="h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0 bg-amber-50/50 text-amber-600">
                <Calendar size={20} />
              </div>
            </div>
            <div className="text-[32px] font-bold text-ink leading-none mt-2">{summary.followUpsDue}</div>
          </div>
        </div>

        {/* Visual Chart */}
        <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border p-6 flex flex-col h-[400px]">
           <h2 className="text-[16px] font-bold text-ink mb-2">Screening Activity by Community</h2>
           <p className="text-[13px] text-secondary mb-6">Distribution of field screenings across villages</p>
           
           <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={villages} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                 <XAxis type="number" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                 <YAxis type="category" dataKey="name" tick={{fontSize: 12, fill: '#1e293b', fontWeight: 500}} axisLine={false} tickLine={false} width={120} />
                 <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                 <Bar dataKey="screenings" name="Screenings" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={28} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-[#F7FAFA]">
            <h2 className="text-[16px] font-bold text-ink flex items-center gap-2">
               <MapPin size={18} className="text-secondary" /> Community Breakdown
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white text-[12px] text-secondary font-medium uppercase tracking-wider border-b border-border">
                  <th className="px-5 py-3.5">Village / Community</th>
                  <th className="px-5 py-3.5 text-right">Patients</th>
                  <th className="px-5 py-3.5 text-right">Screenings</th>
                  <th className="px-5 py-3.5 text-right">Higher Risk Indication</th>
                  <th className="px-5 py-3.5 text-right">Follow-ups Due</th>
                  <th className="px-5 py-3.5 text-right">Latest Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {villages.map((v: any) => (
                  <tr key={v.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink text-[14px]">{v.name}</div>
                    </td>
                    <td className="px-5 py-4 text-[14px] text-ink font-medium text-right">{v.patients}</td>
                    <td className="px-5 py-4 text-[14px] text-ink font-medium text-right">{v.screenings}</td>
                    <td className="px-5 py-4 text-[14px] text-ink font-medium text-right">
                       <span className={cx(v.higherRisk > 0 ? 'text-error-text' : 'text-secondary')}>
                         {v.higherRisk}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-[14px] text-ink font-medium text-right">
                       <span className={cx(v.followUpsDue > 0 ? 'text-amber-600' : 'text-secondary')}>
                         {v.followUpsDue}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-secondary font-medium text-right">
                      {v.latestActivity ? new Date(v.latestActivity).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    )
  }

  return (
    <WideShell 
      title="Community & Outreach" 
      subtitle="Screening activity across communities served by this PHC"
    >
      {renderContent()}
    </WideShell>
  )
}
