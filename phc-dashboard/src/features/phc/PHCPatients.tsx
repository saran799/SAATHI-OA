import { useEffect } from 'react'
import { WideShell } from '../../components/layout/WideShell'
import { usePHC } from '../../store/phcStore'
import { Users, Search, Filter } from 'lucide-react'
import { EmptyState, LoadingState, cx } from '../../components/ui'
import { useNavigate } from 'react-router-dom'

export default function PHCPatients() {
  const { patients, loading, fetchPatients } = usePHC()
  const nav = useNavigate()

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return (
    <WideShell title="Patient Registry" subtitle={`Total registered patients: ${patients.length}`}>
      <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border overflow-hidden flex flex-col">
        {/* Controls Bar Stub */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F7FAFA]/50">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input 
              type="text" 
              placeholder="Search by name, phone or village..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-border rounded-[10px] text-[13px] font-medium text-ink hover:bg-gray-50 transition-colors">
               <Filter size={16} /> Filters
             </button>
          </div>
        </div>

        {loading.patients ? (
          <LoadingState />
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F7FAFA] text-[12px] text-secondary font-medium uppercase tracking-wider border-b border-border">
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Age / Sex</th>
                  <th className="px-5 py-3.5">Village</th>
                  <th className="px-5 py-3.5">Screening Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink text-[14px]">{p.name}</div>
                      <div className="text-[12px] text-secondary">{p.phone || 'No phone'}</div>
                    </td>
                    <td className="px-5 py-4 text-[14px] text-ink font-medium">{p.age} yrs / {p.sex}</td>
                    <td className="px-5 py-4 text-[14px] text-secondary">{p.village || '-'}</td>
                    <td className="px-5 py-4">
                       <span className={cx(
                         "px-2.5 py-1 rounded-[6px] text-[12px] font-semibold inline-flex items-center gap-1.5",
                         p._count?.records > 0 ? "bg-mint text-primary-dark" : "bg-gray-100 text-gray-600"
                       )}>
                         {p._count?.records > 0 ? `${p._count.records} Screenings` : 'Unscreened'}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <button onClick={() => nav(`/patients/${p.id}`)} className="text-[13px] font-semibold text-primary hover:text-primary-dark opacity-0 group-hover:opacity-100 transition-opacity">
                         View Profile
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            icon={Users} 
            title="No patients found" 
            body="Patient records synced from the field will appear here." 
          />
        )}
      </div>
    </WideShell>
  )
}
