import { useEffect } from 'react'
import { WideShell } from '../../components/layout/WideShell'
import { usePHC } from '../../store/phcStore'
import { RefreshCw, Server, Database, CheckCircle2, Clock, Users } from 'lucide-react'
import { LoadingState, EmptyState, Callout } from '../../components/ui'

export default function PHCSync() {
  const { syncStatus, loading, error, fetchSyncStatus } = usePHC()

  useEffect(() => {
    fetchSyncStatus()
  }, [fetchSyncStatus])

  const renderContent = () => {
    if (loading.syncStatus && !syncStatus) {
      return (
        <div className="flex h-64 items-center justify-center bg-white rounded-[16px] border border-border">
          <LoadingState message="Checking connection and field status..." />
        </div>
      )
    }

    if (error && !syncStatus) {
       return (
         <div className="bg-white rounded-[16px] border border-border p-8">
           <EmptyState 
             icon={Server} 
             title="Connection Unavailable" 
             body="Could not connect to the SAATHI backend. Field status and sync information are currently unavailable."
             action={
               <button 
                 onClick={() => fetchSyncStatus()}
                 className="px-4 py-2 bg-tint text-primary font-semibold rounded-[10px] hover:bg-tint-2 transition-colors"
               >
                 Retry Connection
               </button>
             }
           />
         </div>
       )
    }

    if (!syncStatus) return null;

    const { status, dataFreshness, workerActivity } = syncStatus;

    return (
      <div className="space-y-6 max-w-[1000px]">
        {/* 1. API / Backend Connection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-mint flex items-center justify-center text-primary-dark shrink-0">
                <Server size={24} />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-ink">SAATHI Central Server</h2>
                <p className="text-[13px] text-secondary">Backend API Connection Status</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-success-tint border border-success/20 rounded-[8px] w-fit">
              <CheckCircle2 size={16} className="text-success-text" />
              <span className="text-[13px] font-semibold text-success-text">{status}</span>
            </div>
          </div>

          {/* 4. Data Freshness */}
          <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-ink">Data Freshness</h2>
                <p className="text-[13px] text-secondary">Total Records: {dataFreshness.totalScreenings} Screenings / {dataFreshness.totalPatients} Patients</p>
              </div>
            </div>
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-[13px] text-ink">
                 <Clock size={14} className="text-secondary" /> 
                 <strong>Latest Patient Received:</strong> {dataFreshness.latestPatientReceived ? new Date(dataFreshness.latestPatientReceived).toLocaleString() : 'N/A'}
               </div>
               <div className="flex items-center gap-2 text-[13px] text-ink">
                 <Clock size={14} className="text-secondary" /> 
                 <strong>Latest Screening Received:</strong> {dataFreshness.latestScreeningReceived ? new Date(dataFreshness.latestScreeningReceived).toLocaleString() : 'N/A'}
               </div>
            </div>
          </div>
        </div>

        {/* 5. Sync Limitation Disclaimer */}
        <Callout tone="info" title="Sync Visibility Limitation">
           Device-level pending synchronization is not currently exposed to the PHC dashboard. 
           The information below represents the <strong>latest data successfully received</strong> by the central database from each worker.
        </Callout>

        {/* 2 & 3. Field Worker Activity & Latest Received */}
        <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-[#F7FAFA]">
            <h2 className="text-[16px] font-bold text-ink flex items-center gap-2">
               <Users size={18} className="text-secondary" /> Field Worker Activity
            </h2>
            <p className="text-[13px] text-secondary mt-1">Activity based on successfully synchronized records</p>
          </div>
          
          {workerActivity && workerActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-white text-[12px] text-secondary font-medium uppercase tracking-wider border-b border-border">
                    <th className="px-5 py-3.5">Worker</th>
                    <th className="px-5 py-3.5 text-right">Patients Screened</th>
                    <th className="px-5 py-3.5 text-right">Total Screenings</th>
                    <th className="px-5 py-3.5">Last Activity Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {workerActivity.map((w: any) => (
                    <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink text-[14px]">{w.name}</div>
                        <div className="text-[12px] text-secondary">@{w.username}</div>
                      </td>
                      <td className="px-5 py-4 text-[14px] text-ink font-medium text-right">{w.patientsScreened}</td>
                      <td className="px-5 py-4 text-[14px] text-ink font-medium text-right">{w.totalScreenings}</td>
                      <td className="px-5 py-4 text-[14px] text-secondary font-medium">
                        {w.lastActivity ? (
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-success"></span>
                            {new Date(w.lastActivity).toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No activity yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <EmptyState 
               icon={Users} 
               title="No worker activity" 
               body="No records have been synchronized to the backend yet." 
               compact
             />
          )}
        </div>
      </div>
    )
  }

  return (
    <WideShell 
      title="Sync & Field Status" 
      subtitle="Monitor field activity and data synchronization"
      headerRight={
        <button 
          onClick={() => fetchSyncStatus()}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border text-ink font-medium text-[13px] rounded-full hover:bg-gray-50 transition-colors shadow-sm"
          disabled={loading.syncStatus}
        >
          <RefreshCw size={14} className={loading.syncStatus ? 'animate-spin text-secondary' : 'text-primary'} />
          Refresh
        </button>
      }
    >
      {renderContent()}
    </WideShell>
  )
}
