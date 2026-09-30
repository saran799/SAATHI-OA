import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WideShell } from '../../components/layout/WideShell'
import { usePHC } from '../../store/phcStore'
import { ClipboardList, Search } from 'lucide-react'
import { EmptyState, LoadingState, cx } from '../../components/ui'

export default function PHCReports() {
  const { reports, loading, fetchReports } = usePHC()
  const nav = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchReports, searchTerm])

  return (
    <WideShell title="Reports" subtitle="Screening reports generated from SAATHI field assessments">
      <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border overflow-hidden flex flex-col">
        {/* Controls Bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F7FAFA]/50">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input 
              type="text" 
              placeholder="Search by patient name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {loading.reports ? (
           <LoadingState />
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#F7FAFA] text-[12px] text-secondary font-medium uppercase tracking-wider border-b border-border">
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Health ID</th>
                  <th className="px-5 py-3.5">Joint</th>
                  <th className="px-5 py-3.5">Indication</th>
                  <th className="px-5 py-3.5">Worker</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer" onClick={() => nav(`/reports/${r.id}`)}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink text-[14px]">{r.patient?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-5 py-4 text-[14px] text-secondary font-medium">{r.patient?.healthId || '-'}</td>
                    <td className="px-5 py-4 text-[14px] text-ink capitalize font-medium">{r.joint} ({r.side})</td>
                    <td className="px-5 py-4">
                      <span className={cx(
                        "px-2.5 py-1 rounded-[6px] text-[12px] font-semibold",
                        r.result?.band === 'higher' ? 'bg-error-tint text-error-text' :
                        r.result?.band === 'moderate' ? 'bg-warning-tint text-warning-text' :
                        r.result?.band === 'low' ? 'bg-tint text-primary' : 'bg-gray-100 text-gray-600'
                      )}>
                        {r.result?.band || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[14px] text-ink">{r.worker?.name || 'Unknown'}</td>
                    <td className="px-5 py-4 text-[14px] text-secondary font-medium">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                       <button className="text-[13px] font-semibold text-primary hover:text-primary-dark opacity-0 group-hover:opacity-100 transition-opacity">
                         View Report
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            icon={ClipboardList} 
            title="No screening reports available yet." 
            body={searchTerm ? "No reports match your search." : "Reports generated from the field will appear here."} 
          />
        )}
      </div>
    </WideShell>
  )
}
