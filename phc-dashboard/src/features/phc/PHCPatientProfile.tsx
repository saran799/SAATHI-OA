import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { WideShell } from '../../components/layout/WideShell'
import { usePHC } from '../../store/phcStore'
import { Activity, ArrowLeft, Check, FileText, TrendingUp, TrendingDown, Minus, UserX } from 'lucide-react'
import { LoadingState, EmptyState, cx } from '../../components/ui'

export default function PHCPatientProfile() {
  const { id } = useParams()
  const nav = useNavigate()
  const { patients, screenings, loading, fetchPatients, fetchScreenings } = usePHC()
  
  useEffect(() => {
    if (patients.length === 0) fetchPatients()
    if (screenings.length === 0) fetchScreenings()
  }, [patients.length, screenings.length, fetchPatients, fetchScreenings])

  const p = patients.find(x => x.id === id)

  if (loading.patients && !p) {
    return <WideShell><div className="flex h-64 items-center justify-center"><LoadingState /></div></WideShell>
  }
  if (!p) {
    return <WideShell><EmptyState icon={UserX} title="Patient Not Found" body="This patient does not exist or has been removed." /></WideShell>
  }

  const hist = screenings.filter(r => r.patientId === p.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const bmi = p.heightCm && p.weightKg ? (p.weightKg / Math.pow(p.heightCm / 100, 2)).toFixed(1) : null

  const getPhcColors = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash % 40) + 150; 
    return { bg: `hsl(${hue}, 70%, 94%)`, text: `hsl(${hue}, 90%, 25%)` };
  };
  const phcColors = getPhcColors(p.phc || 'Default');

  const groupedHist: Record<string, typeof hist> = {};
  hist.forEach(r => {
    const key = `${r.joint}-${r.side}`;
    if (!groupedHist[key]) groupedHist[key] = [];
    groupedHist[key].push(r);
  });

  const getProgress = (recList: typeof hist) => {
    if (recList.length < 2) return null;
    const latest = recList[0];
    const previous = recList[1];
    
    const latestScore = latest.movement?.performed ? latest.movement.rangeOfMotionDeg : null;
    const prevScore = previous.movement?.performed ? previous.movement.rangeOfMotionDeg : null;
    
    if (latestScore && prevScore) {
      const diff = latestScore - prevScore;
      if (diff >= 5) return { text: `Improved ROM by ${diff}°`, positive: true, icon: TrendingUp };
      if (diff <= -5) return { text: `Decreased ROM by ${Math.abs(diff)}°`, positive: false, icon: TrendingDown };
      return { text: 'Stable range of motion', positive: true, icon: Minus };
    }
    
    const riskScores = { low: 1, moderate: 2, higher: 3 };
    const latestRisk = riskScores[(latest.result?.band as keyof typeof riskScores) || 'low'] || 1;
    const prevRisk = riskScores[(previous.result?.band as keyof typeof riskScores) || 'low'] || 1;
    if (latestRisk < prevRisk) return { text: 'Risk level decreased', positive: true, icon: TrendingUp };
    if (latestRisk > prevRisk) return { text: 'Risk level increased', positive: false, icon: TrendingDown };
    return { text: 'Stable condition', positive: true, icon: Minus };
  };

  return (
    <WideShell>
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => nav('/patients')} className="flex items-center gap-2 text-[14px] font-semibold text-secondary hover:text-ink transition-colors">
          <ArrowLeft size={18} /> Back to Registry
        </button>
      </div>

      <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-[24px]">
            {p.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] font-bold text-ink leading-tight">{p.name}</h1>
            <p className="text-[14px] text-secondary mt-1">{p.age} yrs · {p.sex} · ID: {p.id.split('-')[0]}</p>
          </div>
        </div>

        <h2 className="text-[13px] font-bold text-secondary uppercase tracking-wider mb-4">Patient Data</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
          <div><div className="text-[12px] text-secondary mb-1">Village</div><div className="text-[15px] font-medium text-ink">{p.village || '—'}</div></div>
          <div><div className="text-[12px] text-secondary mb-1">Phone</div><div className="text-[15px] font-medium text-ink">{p.phone || '—'}</div></div>
          <div><div className="text-[12px] text-secondary mb-1">Health ID</div><div className="text-[15px] font-medium text-ink">{p.healthId || '—'}</div></div>
          <div><div className="text-[12px] text-secondary mb-1">Occupation</div><div className="text-[15px] font-medium text-ink">{p.occupation || '—'}</div></div>
          
          <div><div className="text-[12px] text-secondary mb-1">PHC</div>
               <div className="inline-flex px-2.5 py-0.5 rounded-md font-bold text-[13px]" style={{ backgroundColor: phcColors.bg, color: phcColors.text }}>{p.phc || '—'}</div>
          </div>
          <div><div className="text-[12px] text-secondary mb-1">Height / Weight</div><div className="text-[15px] font-medium text-ink">{p.heightCm ? `${p.heightCm} cm` : '—'} / {p.weightKg ? `${p.weightKg} kg` : '—'} {bmi ? `(BMI: ${bmi})` : ''}</div></div>
          <div><div className="text-[12px] text-secondary mb-1">Prior Injury</div><div className="text-[15px] font-medium text-ink">{p.priorInjury ? <Check size={20} className="text-primary" /> : <span className="text-secondary">—</span>}</div></div>
          <div><div className="text-[12px] text-secondary mb-1">Family History</div><div className="text-[15px] font-medium text-ink">{p.familyHistory ? <Check size={20} className="text-primary" /> : <span className="text-secondary">—</span>}</div></div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-[16px] font-bold text-ink mb-4">Progress & Improvements</h2>
        {Object.entries(groupedHist).filter(([_, recs]) => recs.length >= 2).length === 0 ? (
          <div className="bg-white rounded-[16px] border border-border p-4 text-sm text-secondary">Not enough data to show progress. Complete more screenings.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(groupedHist)
              .filter(([_, recs]) => recs.length >= 2)
              .map(([key, recs]) => {
                const prog = getProgress(recs);
                if (!prog) return null;
                const Icon = prog.icon;
                return (
                  <div key={key} className="bg-white rounded-[16px] border border-border p-4 flex items-center gap-4">
                    <div className={cx("h-12 w-12 rounded-[12px] flex items-center justify-center shrink-0", prog.positive ? "bg-mint text-primary-dark" : "bg-error-tint text-error-text")}>
                      <Icon size={24} aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] text-ink capitalize">{recs[0].joint} ({recs[0].side})</p>
                      <p className={cx("text-[13px] font-medium mt-0.5", prog.positive ? "text-primary" : "text-error-text")}>{prog.text}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-[16px] font-bold text-ink mb-4">Screening History</h2>
        {hist.length === 0 ? (
          <div className="bg-white rounded-[16px] border border-border p-4 text-sm text-secondary">No screenings recorded for this patient.</div>
        ) : (
          <div className="space-y-3">
            {hist.map(r => (
              <div key={r.id} onClick={() => nav(`/reports/${r.id}`)} className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-border p-4 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-[10px] bg-tint flex items-center justify-center text-primary shrink-0">
                    <FileText size={18} aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-ink text-[15px] capitalize">{r.joint} ({r.side})</p>
                    <p className="text-[13px] text-secondary">{new Date(r.createdAt).toLocaleDateString()} · Follow up: {r.followUpDate ? new Date(r.followUpDate).toLocaleDateString() : 'None'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cx(
                    "px-3 py-1 rounded-full text-[12px] font-semibold",
                    r.result?.band === 'higher' ? 'bg-error-tint text-error-text' :
                    r.result?.band === 'moderate' ? 'bg-warning-tint text-warning-text' : 'bg-mint text-primary-dark'
                  )}>
                    {r.result?.band || 'low'}
                  </span>
                  <Activity size={18} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WideShell>
  )
}
