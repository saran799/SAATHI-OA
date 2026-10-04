import { useMemo } from 'react'
import { AppShell } from '../../components/layout/Shells'
import { useApp } from '../../store/appStore'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Analytics() {
  const { records, patients } = useApp()
  const nav = useNavigate()

  const riskData = useMemo(() => {
    let low = 0, moderate = 0, higher = 0
    records.forEach(r => {
      if (r.result?.band === 'low') low++
      else if (r.result?.band === 'moderate') moderate++
      else if (r.result?.band === 'higher') higher++
    })
    return [
      { name: 'Low Risk', value: low, color: '#14b8a6' },
      { name: 'Moderate Risk', value: moderate, color: '#f59e0b' },
      { name: 'Higher Risk', value: higher, color: '#f43f5e' },
    ].filter(d => d.value > 0)
  }, [records])

  const timeData = useMemo(() => {
    const counts: Record<string, number> = {}
    records.forEach(r => {
      const d = new Date(r.createdAt)
      const month = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      counts[month] = (counts[month] || 0) + 1
    })
    return Object.entries(counts).map(([date, count]) => ({ date, count }))
  }, [records])

  const villageData = useMemo(() => {
    const stats: Record<string, { total: number, high: number }> = {}
    records.forEach(r => {
      const p = patients.find(p => p.id === r.patientId)
      if (p && p.village) {
        if (!stats[p.village]) stats[p.village] = { total: 0, high: 0 }
        stats[p.village].total++
        if (r.result?.band === 'higher') stats[p.village].high++
      }
    })
    return Object.entries(stats).map(([village, s]) => ({
      village,
      total: s.total,
      highRiskPct: Math.round((s.high / s.total) * 100)
    })).sort((a, b) => b.highRiskPct - a.highRiskPct)
  }, [records, patients])

  return (
    <AppShell>
      <div className="pt-6 pb-20 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => nav(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[26px] font-bold tracking-tight">Analytics Dashboard</h1>
        </div>

        {/* Risk Distribution */}
        <div className="card p-5">
          <h2 className="text-lg font-bold mb-4">Risk Distribution</h2>
          <div className="h-64">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted text-sm">No screening data available</div>
            )}
          </div>
        </div>

        {/* Screenings Over Time */}
        <div className="card p-5">
          <h2 className="text-lg font-bold mb-4">Screenings Over Time</h2>
          <div className="h-64">
             {timeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeData}>
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis allowDecimals={false} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="count" fill="#14b8a6" radius={[4,4,0,0]} name="Screenings" />
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-muted text-sm">No screening data available</div>
             )}
          </div>
        </div>

        {/* Village Heatmap/Table */}
        <div className="card p-5">
          <h2 className="text-lg font-bold mb-4">High Risk by Village</h2>
          {villageData.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">Village / Area</th>
                    <th className="p-3">Screenings</th>
                    <th className="p-3">Higher Risk %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {villageData.map(row => (
                    <tr key={row.village}>
                      <td className="p-3 font-medium">{row.village}</td>
                      <td className="p-3 text-slate-600">{row.total}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.highRiskPct > 50 ? 'bg-rose-100 text-rose-800' : row.highRiskPct > 20 ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
                          {row.highRiskPct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted text-sm text-center py-4">No location data available</div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
