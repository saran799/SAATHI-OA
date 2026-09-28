import { useEffect } from 'react'
import { WideShell } from '../../components/layout/WideShell'
import { usePHC } from '../../store/phcStore'
import { User, Search, Filter } from 'lucide-react'
import { EmptyState, LoadingState } from '../../components/ui'

export default function PHCWorkers() {
  const { workers, loading, fetchWorkers } = usePHC()

  useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  return (
    <WideShell title="Field Workers" subtitle={`Active Community Health Workers: ${workers.length}`}>
      <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border overflow-hidden flex flex-col">
        {/* Controls Bar Stub */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F7FAFA]/50">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input 
              type="text" 
              placeholder="Search by worker name..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-border rounded-[10px] text-[13px] font-medium text-ink hover:bg-gray-50 transition-colors">
               <Filter size={16} /> Filters
             </button>
          </div>
        </div>

        {loading.workers ? (
           <LoadingState />
        ) : workers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F7FAFA] text-[12px] text-secondary font-medium uppercase tracking-wider border-b border-border">
                  <th className="px-5 py-3.5">Worker Name</th>
                  <th className="px-5 py-3.5">Username</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Total Screenings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {workers.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-tint flex items-center justify-center text-primary font-bold text-[13px]">
                           {w.name.charAt(0)}
                        </div>
                        <div className="font-semibold text-ink text-[14px]">{w.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[14px] text-secondary font-medium">{w.username}</td>
                    <td className="px-5 py-4 text-[14px] text-secondary">{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-[14px] text-ink font-semibold text-right">{w._count?.records || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            icon={User} 
            title="No workers found" 
            body="Registered community health workers will appear here." 
          />
        )}
      </div>
    </WideShell>
  )
}
