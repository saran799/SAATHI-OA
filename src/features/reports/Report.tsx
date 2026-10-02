import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Printer, Share2, Home, IdCard, Info, Ruler, Footprints, Activity, Frown, Sun, ClipboardCheck, Plus, Dumbbell, Cloud } from 'lucide-react'
import { AppShell } from '../../components/layout/Shells'
import { Button, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { useSession } from '../../store/sessionStore'
import { RISK_META } from '../../domain/risk'
import { QUESTIONS } from '../../domain/questions'
import { fmtDate, jointName, OCCUPATIONS } from '../../domain/copy'

import { RiskBandIndicator } from '../screening/RiskBand'
import { useT } from '../../i18n'

function Section({ title, right, children, className }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={cx('card p-4 mt-4', className)}><div className="flex items-center justify-between mb-3"><h2 className="text-[13px] font-bold tracking-wider uppercase">{title}</h2>{right}</div>{children}</section>
}
const Line = ({ k, v }: { k: string; v: React.ReactNode }) => <div className="flex justify-between gap-3 py-1.5 text-[14px] border-b border-tint last:border-0"><span className="text-secondary">{k}</span><span className="font-semibold text-right break-words">{v}</span></div>
const Finding = ({ icon: Icon, t, b, v }: { icon: typeof Ruler; t: string; b: string; v: React.ReactNode }) => (
  <div className="rounded-[12px] bg-tint p-3 flex items-center gap-3"><Icon size={18} className="text-primary shrink-0" aria-hidden /><div className="flex-1 min-w-0"><p className="text-[14px] font-bold leading-tight">{t}</p><p className="text-[12px] text-secondary">{b}</p></div><span className="text-[15px] font-bold shrink-0">{v}</span></div>
)

export default function Report() {
  const { id } = useParams(); const nav = useNavigate()
  const { t, tArray } = useT()
  const { records, patients, workerName } = useApp()
  const session = useSession()
  const [generating, setGenerating] = useState(true)
  useEffect(() => { const t = setTimeout(() => setGenerating(false), 900); return () => clearTimeout(t) }, [id])
  const rec = records.find(r => r.id === id); const p = rec && patients.find(x => x.id === rec.patientId)
  if (!rec || !p) return <AppShell title={t('reports.title')} subtitle={t('reports.subtitle')} back="/records"><p className="text-secondary mt-6">{t('reports.notAvailable')}</p></AppShell>
  const m = RISK_META[rec.result.band]
  const fromFlow = session.recordId === rec.id
  const chip = { success: 'bg-mint text-primary-dark', warning: 'bg-mint text-primary-dark', error: 'bg-error-tint text-error-text' }[m.tone]
  const occIdx = OCCUPATIONS.indexOf(p.occupation)
  const occTranslated = occIdx >= 0 ? tArray('patients.form.occupations')[occIdx] : p.occupation
  const share = async () => {
    const text = `SAATHI screening summary — ${p.name}, ${jointName(rec.joint, rec.side, t)}: ${t(`screening.result.riskMeta.${rec.result.band}.label`)}. ${t(`screening.result.riskMeta.${rec.result.band}.summary`)} Screening result, not a diagnosis.`
    if (navigator.share) { try { await navigator.share({ title: 'SAATHI screening summary', text }) } catch { /* cancelled */ } }
    else { await navigator.clipboard?.writeText(text); alert('Summary copied to clipboard.') }
  }
  const ans = (qid: string) => { const q = QUESTIONS.find(x => x.id === qid)!; return q.options.find(o => o.value === rec.answers[qid])?.label ?? '—' }

  if (generating) return <AppShell title={t('reports.title')} subtitle={t('reports.subtitle')} back={fromFlow ? '/screening/result' : `/patients/${p.id}`}><div className="mt-24 flex flex-col items-center text-center"><span className="spin h-10 w-10 rounded-full border-[3px] border-primary border-t-transparent" aria-hidden /><p className="mt-4 font-semibold" aria-live="polite">{t('common.generatingReport')}</p></div></AppShell>

  const qrData = JSON.stringify({
    n: p.name,
    a: p.age,
    s: p.sex,
    j: rec.joint,
    sd: rec.side,
    d: rec.createdAt,
    rb: rec.result.band,
    w: workerName,
    phc: p.phc,
  })
  const qrUrl = `${window.location.origin}/patient-pdf?d=${btoa(unescape(encodeURIComponent(qrData)))}`

  return (
    <AppShell title={t('reports.title')} subtitle={t('reports.subtitle')} back={fromFlow ? '/screening/result' : `/patients/${p.id}`}>
      <article className="pt-4">
        <div className="card p-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold tracking-wider text-secondary uppercase inline-flex items-center gap-1.5"><IdCard size={13} className="text-primary" aria-hidden />{t('reports.screeningId', { id: rec.id })}</p>
            <p className="text-[20px] font-bold leading-tight mt-1 break-words">{p.name}</p>
            <p className="text-[13px] mt-0.5"><span className="text-secondary">{p.age} {(t(`patients.form.gender${p.sex}`) || p.sex)[0]}</span> • <span className="text-primary font-semibold">{jointName(rec.joint, rec.side, t)}</span> • <span className="text-secondary">{fmtDate(rec.createdAt)}</span></p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0"><span className="h-6 px-2 rounded-full bg-tint text-[11px] font-semibold text-secondary inline-flex items-center">{rec.workerName.split(' ')[0]}</span><span className="h-11 w-11 rounded-[12px] bg-tint text-primary flex items-center justify-center" aria-hidden><IdCard size={20} /></span></div>
        </div>

        <Section title={t('reports.outcome')} right={<span className={cx('h-7 px-2.5 rounded-full text-[12px] font-bold inline-flex items-center', chip)}>{t(`screening.result.riskMeta.${rec.result.band}.label`)}</span>}>
          <div className="rounded-[12px] bg-tint p-3 flex items-center gap-3">
            <span className={cx('h-[68px] w-[68px] rounded-full border-[6px] flex items-center justify-center text-[13px] font-bold shrink-0', { success: 'border-mint text-primary-dark', warning: 'border-primary text-primary', error: 'border-error text-error-text' }[m.tone])}>{t(`screening.result.riskMeta.${rec.result.band}.short`)}</span>
            <div className="min-w-0"><p className="text-[15px] font-bold leading-tight">{t('reports.riskBand')}</p><p className="text-[12px] text-secondary mt-0.5 leading-snug">{t(`screening.result.riskMeta.${rec.result.band}.summary`)}</p></div>
          </div>
          <div className="mt-3"><RiskBandIndicator band={rec.result.band} /></div>
          <div className="mt-3 rounded-[12px] bg-info-tint p-3 text-[13px] leading-snug flex gap-2"><Info size={16} className="text-info shrink-0 mt-0.5" aria-hidden /><span>{t('reports.recordOnly')}</span></div>
        </Section>

        <Section title={t('reports.findings')} right={<span className="text-[12px] font-semibold text-primary">{t('reports.checks', { count: rec.movement?.performed ? 5 : 3 })}</span>}>
          <div className="space-y-2">
            {rec.movement?.performed && <Finding icon={Ruler} t={t('reports.rom')} b={t('reports.romDesc')} v={`≈ ${rec.movement.rangeOfMotionDeg}°`} />}
            {rec.movement?.performed && <Finding icon={Footprints} t={t('reports.pattern')} b={t('reports.patternDesc', { reps: rec.movement.repetitions, sec: rec.movement.durationSec })} v={rec.movement.smoothness >= 0.6 ? t('reports.even') : <span className="h-6 px-2 rounded-full bg-info-tint text-info text-[11px] inline-flex items-center">{t('reports.uneven')}</span>} />}
            <Finding icon={Frown} t={t('reports.painActivity')} b={t('reports.reported')} v={t(`screening.questions.pain_activity.options.${rec.answers['pain_activity']}.label`) || ans('pain_activity')} />
            <Finding icon={Sun} t={t('reports.morningStiff')} b={t('reports.reported')} v={t(`screening.questions.stiffness.options.${rec.answers['stiffness']}.label`) || ans('stiffness')} />
            <Finding icon={Activity} t={t('reports.dailyTasks')} b={t('reports.reported')} v={t(`screening.questions.function.options.${rec.answers['function']}.label`) || ans('function')} />
          </div>
          {!rec.movement?.performed && <p className="text-[12px] text-secondary mt-2">{t('reports.notPerformed')}</p>}
          <details className="mt-3"><summary className="text-[13px] font-semibold text-primary cursor-pointer h-9 flex items-center">{t('reports.allSymptoms')}</summary>
            <div className="mt-1">{QUESTIONS.map(q => <Line key={q.id} k={t(`screening.questions.questions.${q.id}.factor`) || q.factorLabel} v={t(`screening.questions.questions.${q.id}.options.${rec.answers[q.id]}.label`) || ans(q.id)} />)}</div></details>
        </Section>

        <Section title={t('reports.patientInfo')}>
          <Line k={t('reports.patientId')} v={p.id} /><Line k={t('reports.village')} v={p.village} /><Line k={t('reports.phc')} v={p.phc} />
          {p.heightCm && p.weightKg && <Line k={t('reports.heightWeight')} v={`${p.heightCm} cm · ${p.weightKg} kg`} />}
          <Line k={t('reports.occupation')} v={occTranslated || p.occupation} /><Line k={t('reports.injuryFamily')} v={`${p.priorInjury ? t('common.yes') : t('common.no')} / ${p.familyHistory ? t('common.yes') : t('common.no')}`} />
        </Section>

        <Section title={t('reports.recommended')} right={<ClipboardCheck size={16} className="text-primary" aria-hidden />}>
          <div className="space-y-2">
            <div className="rounded-[12px] bg-tint p-3 flex gap-3"><Plus size={18} className="text-primary shrink-0 mt-0.5" aria-hidden /><div><p className="text-[14px] font-bold">{rec.result.band === 'low' ? t('reports.routine') : t('reports.referral')}</p><p className="text-[13px] text-secondary leading-snug">{t(`screening.result.riskMeta.${rec.result.band}.action`) || rec.result.recommendedAction}</p></div></div>
            <div className="rounded-[12px] bg-tint p-3 flex gap-3"><Dumbbell size={18} className="text-primary shrink-0 mt-0.5" aria-hidden /><div><p className="text-[14px] font-bold">{t('reports.homeExercise')}</p><p className="text-[13px] text-secondary leading-snug">{tArray(`screening.guidance.supporting.${rec.result.band}`).slice(0, 2).join(' ')}</p></div></div>
          </div>
        </Section>

        <Section title={t('reports.clinicalNote')}>
          <p className="text-[13px] leading-relaxed">{t('common.disclaimer')}</p>
          <p className="text-[12px] text-secondary mt-2">{t('reports.performedBy', { name: rec.workerName })}</p>
        </Section>

        <Section title={t('reports.followUp')} right={<span className="h-6 px-2 rounded-full bg-tint text-[11px] font-semibold text-secondary inline-flex items-center gap-1"><Cloud size={11} aria-hidden />{rec.sync === 'synced' ? t('reports.synced') : t('reports.onDevice')}</span>}>
          <Line k={t('reports.nextFollowUp')} v={fmtDate(rec.followUpDate)} />
          <Line k={t('reports.purpose')} v={rec.result.band === 'higher' ? t('reports.purposeHigh') : rec.result.band === 'moderate' ? t('reports.purposeModerate') : t('reports.purposeLow')} />
          <div className="mt-5 grid grid-cols-2 gap-6 text-[11px] text-secondary"><div className="border-t border-tint-2 pt-2">{t('reports.healthWorker', { name: workerName })}</div><div className="border-t border-tint-2 pt-2">{t('reports.medicalOfficer')}</div></div>
        </Section>

        <div className="mt-5 card p-4 flex flex-col items-center justify-center text-center no-print">
          <h3 className="text-[14px] font-bold mb-2">Scan to Download Report</h3>
          <p className="text-[12px] text-secondary mb-4">Patient can scan this code to save their screening summary</p>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`} alt="QR Code to Report" className="w-[150px] h-[150px] rounded-lg shadow-sm" />
        </div>

        <div className="mt-5 space-y-2 no-print">
          <Button full icon={Printer} onClick={() => window.print()}>{t('reports.downloadPDF')}</Button>
          <Button full variant="secondary" size="md" icon={Share2} onClick={share}>{t('reports.share')}</Button>
          {fromFlow && <Button full variant="ghost" size="md" icon={Home} onClick={() => { session.reset(); nav('/records') }}>{t('reports.finish')}</Button>}
        </div>
      </article>
    </AppShell>
  )
}
