import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Printer, Share2, Home, IdCard, Info, Ruler, Footprints, Activity, Frown, Sun, ClipboardCheck, Plus, Dumbbell, Cloud } from 'lucide-react'
import { AppShell } from '../../components/layout/Shells'
import { Button, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { useSession } from '../../store/sessionStore'
import { RISK_META } from '../../domain/risk'
import { QUESTIONS } from '../../domain/questions'
import { DISCLAIMER, fmtDate, jointName } from '../../domain/copy'
import { SUPPORTING_GUIDANCE } from '../../domain/guidance'
import { RiskBandIndicator } from '../screening/RiskBand'

function Section({ title, right, children, className }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cx('card p-4 mt-4', className)}><div className="flex items-center justify-between mb-3"><h2 className="text-[13px] font-bold tracking-wider uppercase">{title}</h2>{right}</div>{children}</section>
}
const Line = ({ k, v }: { k: string; v: React.ReactNode }) => <div className="flex justify-between gap-3 py-1.5 text-[14px] border-b border-tint last:border-0"><span className="text-secondary">{k}</span><span className="font-semibold text-right break-words">{v}</span></div>
const Finding = ({ icon: Icon, t, b, v }: { icon: typeof Ruler; t: string; b: string; v: React.ReactNode }) => (
  <div className="rounded-[12px] bg-tint p-3 flex items-center gap-3"><Icon size={18} className="text-primary shrink-0" aria-hidden /><div className="flex-1 min-w-0"><p className="text-[14px] font-bold leading-tight">{t}</p><p className="text-[12px] text-secondary">{b}</p></div><span className="text-[15px] font-bold shrink-0">{v}</span></div>
)

export default function Report() {
  const { id } = useParams(); const nav = useNavigate()
  const { records, patients, workerName } = useApp()
  const session = useSession()
  const [generating, setGenerating] = useState(true)
  useEffect(() => { const t = setTimeout(() => setGenerating(false), 900); return () => clearTimeout(t) }, [id])
  const rec = records.find(r => r.id === id); const p = rec && patients.find(x => x.id === rec.patientId)
  if (!rec || !p) return <AppShell title="SAATHI" subtitle="Clinical Reports" back="/records"><p className="text-secondary mt-6">This report is not available on this device.</p></AppShell>
  const m = RISK_META[rec.result.band]
  const fromFlow = session.recordId === rec.id
  const chip = { success: 'bg-mint text-primary-dark', warning: 'bg-mint text-primary-dark', error: 'bg-error-tint text-error-text' }[m.tone]
  const share = async () => {
    const text = `SAATHI screening summary — ${p.name}, ${jointName(rec.joint, rec.side)}: ${m.label}. ${m.summary} Screening result, not a diagnosis.`
    if (navigator.share) { try { await navigator.share({ title: 'SAATHI screening summary', text }) } catch { /* cancelled */ } }
    else { await navigator.clipboard?.writeText(text); alert('Summary copied to clipboard.') }
  }
  const ans = (qid: string) => { const q = QUESTIONS.find(x => x.id === qid)!; return q.options.find(o => o.value === rec.answers[qid])?.label ?? '—' }

  if (generating) return <AppShell title="SAATHI" subtitle="Clinical Reports" back={fromFlow ? '/screening/result' : `/patients/${p.id}`}><div className="mt-24 flex flex-col items-center text-center"><span className="spin h-10 w-10 rounded-full border-[3px] border-primary border-t-transparent" aria-hidden /><p className="mt-4 font-semibold" aria-live="polite">Generating report…</p></div></AppShell>

  return (
    <AppShell title="SAATHI" subtitle="Clinical Reports" back={fromFlow ? '/screening/result' : `/patients/${p.id}`}>
      <article className="pt-4">
        <div className="card p-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold tracking-wider text-secondary uppercase inline-flex items-center gap-1.5"><IdCard size={13} className="text-primary" aria-hidden />Screening ID: {rec.id}</p>
            <p className="text-[20px] font-bold leading-tight mt-1 break-words">{p.name}</p>
            <p className="text-[13px] mt-0.5"><span className="text-secondary">{p.age} {p.sex[0]}</span> • <span className="text-primary font-semibold">{jointName(rec.joint, rec.side)}</span> • <span className="text-secondary">{fmtDate(rec.createdAt)}</span></p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0"><span className="h-6 px-2 rounded-full bg-tint text-[11px] font-semibold text-secondary inline-flex items-center">{rec.workerName.split(' ')[0]}</span><span className="h-11 w-11 rounded-[12px] bg-tint text-primary flex items-center justify-center" aria-hidden><IdCard size={20} /></span></div>
        </div>

        <Section title="Screening outcome" right={<span className={cx('h-7 px-2.5 rounded-full text-[12px] font-bold inline-flex items-center', chip)}>{m.label}</span>}>
          <div className="rounded-[12px] bg-tint p-3 flex items-center gap-3">
            <span className={cx('h-[68px] w-[68px] rounded-full border-[6px] flex items-center justify-center text-[13px] font-bold shrink-0', { success: 'border-mint text-primary-dark', warning: 'border-primary text-primary', error: 'border-error text-error-text' }[m.tone])}>{m.short}</span>
            <div className="min-w-0"><p className="text-[15px] font-bold leading-tight">Screening Risk Band</p><p className="text-[12px] text-secondary mt-0.5 leading-snug">{m.summary}</p></div>
          </div>
          <div className="mt-3"><RiskBandIndicator band={rec.result.band} /></div>
          <div className="mt-3 rounded-[12px] bg-info-tint p-3 text-[13px] leading-snug flex gap-2"><Info size={16} className="text-info shrink-0 mt-0.5" aria-hidden /><span><span className="font-bold">Screening record only:</span> this does not constitute a medical diagnosis. A qualified medical officer must conduct clinical confirmation.</span></div>
        </Section>

        <Section title="Key measured findings" right={<span className="text-[12px] font-semibold text-primary">{rec.movement?.performed ? 5 : 3} checks</span>}>
          <div className="space-y-2">
            {rec.movement?.performed && <Finding icon={Ruler} t="Range of movement" b="Sensor estimate" v={`≈ ${rec.movement.rangeOfMotionDeg}°`} />}
            {rec.movement?.performed && <Finding icon={Footprints} t="Movement pattern" b={`${rec.movement.repetitions} repetitions · ${rec.movement.durationSec} s`} v={rec.movement.smoothness >= 0.6 ? 'Even' : <span className="h-6 px-2 rounded-full bg-info-tint text-info text-[11px] inline-flex items-center">Uneven</span>} />}
            <Finding icon={Frown} t="Pain during activity" b="Reported" v={ans('pain_activity')} />
            <Finding icon={Sun} t="Morning stiffness" b="Reported" v={ans('stiffness')} />
            <Finding icon={Activity} t="Difficulty with daily tasks" b="Reported" v={ans('function')} />
          </div>
          {!rec.movement?.performed && <p className="text-[12px] text-secondary mt-2">Movement test not performed; result based on reported symptoms and background.</p>}
          <details className="mt-3"><summary className="text-[13px] font-semibold text-primary cursor-pointer h-9 flex items-center">All reported symptoms</summary>
            <div className="mt-1">{QUESTIONS.map(q => <Line key={q.id} k={q.factorLabel} v={ans(q.id)} />)}</div></details>
        </Section>

        <Section title="Patient information">
          <Line k="Patient ID" v={p.id} /><Line k="Village" v={p.village} /><Line k="Nearest PHC" v={p.phc} />
          {p.heightCm && p.weightKg && <Line k="Height / Weight" v={`${p.heightCm} cm · ${p.weightKg} kg`} />}
          <Line k="Daily activity" v={p.occupation} /><Line k="Previous injury / family history" v={`${p.priorInjury ? 'Yes' : 'No'} / ${p.familyHistory ? 'Yes' : 'No'}`} />
        </Section>

        <Section title="Recommended actions" right={<ClipboardCheck size={16} className="text-primary" aria-hidden />}>
          <div className="space-y-2">
            <div className="rounded-[12px] bg-tint p-3 flex gap-3"><Plus size={18} className="text-primary shrink-0 mt-0.5" aria-hidden /><div><p className="text-[14px] font-bold">{rec.result.band === 'low' ? 'Routine re-screening' : 'PHC clinical referral'}</p><p className="text-[13px] text-secondary leading-snug">{rec.result.recommendedAction}</p></div></div>
            <div className="rounded-[12px] bg-tint p-3 flex gap-3"><Dumbbell size={18} className="text-primary shrink-0 mt-0.5" aria-hidden /><div><p className="text-[14px] font-bold">Home exercise & joint care</p><p className="text-[13px] text-secondary leading-snug">{SUPPORTING_GUIDANCE[rec.result.band].slice(0, 2).join(' ')}</p></div></div>
          </div>
        </Section>

        <Section title="Clinical note">
          <p className="text-[13px] leading-relaxed">{DISCLAIMER}</p>
          <p className="text-[12px] text-secondary mt-2">Screening performed by {rec.workerName} (community health worker). Risk estimation uses a demonstration model that is not clinically validated.</p>
        </Section>

        <Section title="Follow-up" right={<span className="h-6 px-2 rounded-full bg-tint text-[11px] font-semibold text-secondary inline-flex items-center gap-1"><Cloud size={11} aria-hidden />{rec.sync === 'synced' ? 'Synced' : 'On device'}</span>}>
          <Line k="Next follow-up" v={fmtDate(rec.followUpDate)} />
          <Line k="Purpose" v={rec.result.band === 'higher' ? 'Confirm clinical evaluation at PHC' : rec.result.band === 'moderate' ? 'Review symptoms and PHC visit' : 'Routine re-screening'} />
          <div className="mt-5 grid grid-cols-2 gap-6 text-[11px] text-secondary"><div className="border-t border-tint-2 pt-2">Health worker: {workerName}</div><div className="border-t border-tint-2 pt-2">Medical officer (if reviewed)</div></div>
        </Section>

        <div className="mt-5 space-y-2 no-print">
          <Button full icon={Printer} onClick={() => window.print()}>Download PDF Report</Button>
          <Button full variant="secondary" size="md" icon={Share2} onClick={share}>Share via WhatsApp / SMS</Button>
          {fromFlow && <Button full variant="ghost" size="md" icon={Home} onClick={() => { session.reset(); nav('/records') }}>Finish and view records</Button>}
        </div>
      </article>
    </AppShell>
  )
}
