import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileText, CheckCircle2, IdCard, ShieldAlert, Info, Ruler, Footprints, Activity, Frown } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, cx } from '../../components/ui'
import { useScreeningPatient } from './useGuard'
import { RISK_META } from '../../domain/risk'
import { RiskBandIndicator } from './RiskBand'
import { useT } from '../../i18n'

const factorIcon = (f: string) => /range|limitation/i.test(f) ? Ruler : /gait|uneven|pattern/i.test(f) ? Footprints : /pain/i.test(f) ? Frown : Activity

export default function Result() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const { t } = useT()
  if (!patient || !session.result || !session.joint) { if (patient && !session.result) nav(`/patients/${patient.id}`, { replace: true }); return null }
  const r = session.result; const m = RISK_META[r.band]
  const chip = { success: 'bg-mint text-primary-dark', warning: 'bg-info-tint text-info', error: 'bg-error-tint text-error-text' }[m.tone]
  const jointLabel = t(`screening.joint.joints.${session.joint}.label`)
  const jointSideLabel = (() => {
    const j = t(`screening.joint.joints.${session.joint}.label`)
    const s = t(`screening.joint.${session.side}`)
    return session.side === 'both' ? j : `${s} ${j.toLowerCase()}`
  })()

  return (
    <FlowShell title="" barTitle={t('screening.result.barTitle')} back={`/patients/${patient.id}`}
      pill={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">{t('screening.common.triageActive')}</span>}
      footer={<div className="space-y-2"><Button full onClick={() => nav('/screening/guidance')}>{t('screening.result.nextSteps')} <ArrowRight size={18} aria-hidden /></Button><Button full variant="secondary" size="md" icon={FileText} onClick={() => nav(`/records/${session.recordId}`)}>{t('screening.result.viewReport')}</Button></div>}>
      <div className="-mt-6">
        <span className="h-7 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center gap-1.5"><CheckCircle2 size={13} aria-hidden />{t('screening.result.finalised')}</span>
        <h1 className="text-[22px] font-bold tracking-tight leading-tight mt-2 break-words">{t('screening.result.complete', { joint: jointSideLabel })}</h1>
        <p className="text-[14px] text-secondary mt-0.5 break-words">{session.movement ? t('screening.result.symptomsAndSensor') : t('screening.result.symptomsOnly')}</p>
      </div>

      <div className="mt-4 rounded-[14px] bg-tint p-3 flex items-center gap-3">
        <span className="h-10 w-10 rounded-[10px] bg-surface text-primary flex items-center justify-center shrink-0" aria-hidden><IdCard size={20} /></span>
        <div className="flex-1 min-w-0"><p className="text-[15px] font-bold truncate break-words">{patient.name} ({patient.age}{patient.sex[0]})</p><p className="text-[12px] text-secondary">ID: {patient.id}</p></div>
        <span className="h-7 px-2.5 rounded-full bg-surface text-[11px] font-semibold text-ink inline-flex items-center shrink-0 break-words">{patient.phc}</span>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="h-1.5 w-full bg-[linear-gradient(90deg,#CCFBF1_0%,#6ED9CC_50%,#FFDAD6_100%)]" aria-hidden />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-[11px] font-bold tracking-wider text-secondary uppercase break-words">{t('screening.result.screeningResult')}</p><h2 className="text-[21px] font-bold leading-tight mt-1 break-words">{t('screening.result.screeningRisk', { joint: jointLabel })}</h2></div>
            <span className={cx('h-10 px-3 rounded-full text-[13px] font-bold inline-flex items-center gap-1.5 shrink-0 break-words', chip)}><ShieldAlert size={15} aria-hidden />{t(`screening.result.riskMeta.${r.band}.short`)} risk</span>
          </div>
          <div className="mt-4 rounded-[14px] bg-tint p-4 flex items-center justify-between gap-3">
            <div className="min-w-0"><p className="text-[12px] font-semibold text-secondary break-words">{t('screening.result.bandLabel')}</p><p className="text-[22px] font-bold leading-tight break-words">{t(`screening.result.riskMeta.${r.band}.label`)}</p></div>
            <span className="h-9 px-2.5 rounded-[10px] bg-mint text-primary-dark text-[12px] font-bold inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap"><Activity size={14} aria-hidden />{t('common.demo')}</span>
          </div>
          <div className="mt-4"><RiskBandIndicator band={r.band} /></div>
          <div className="mt-4 rounded-[12px] bg-tint p-3 text-[13px] leading-snug flex gap-2 break-words"><Info size={16} className="text-primary shrink-0 mt-0.5" aria-hidden /><span>{t(`screening.result.riskMeta.${r.band}.summary`)}</span></div>
        </div>
      </div>

      <div className="card mt-4 p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="text-[18px] font-bold break-words">{t('screening.result.contributing')}</h3><span className="text-[12px] text-secondary font-medium break-words">{t('screening.result.noted', { count: r.factors.length })}</span></div>
        <ul className="space-y-2">
          {r.factors.map(f => { const Icon = factorIcon(f); return (
            <li key={f} className="rounded-[12px] bg-tint p-3 flex items-center gap-3"><span className="h-9 w-9 rounded-full bg-mint text-primary-dark flex items-center justify-center shrink-0" aria-hidden><Icon size={17} /></span><span className="text-[14px] font-semibold flex-1 break-words">{f}</span></li>) })}
        </ul>
        {session.movement?.performed && <p className="text-[12px] text-secondary mt-3 break-words">{t('screening.result.sensorEstimate', { rom: session.movement.rangeOfMotionDeg, pattern: session.movement.smoothness >= 0.6 ? t('screening.result.even') : t('screening.result.uneven') })}</p>}
      </div>

      <div className="card mt-4 p-4 border-2 border-mint">
        <p className="text-[11px] font-bold tracking-wider text-secondary uppercase break-words">{t('screening.result.nextAction')}</p>
        <p className="text-[16px] font-bold text-primary-dark mt-1 leading-snug break-words">{t(`screening.result.riskMeta.${r.band}.action`)}</p>
      </div>

      <div className="mt-4 rounded-[16px] bg-info-tint p-4 flex gap-3">
        <ShieldAlert size={20} className="text-info shrink-0 mt-0.5" aria-hidden />
        <div><p className="text-[12px] font-bold tracking-wider text-info uppercase break-words">{t('screening.result.clinicalNotice')}</p><p className="text-[13px] leading-relaxed mt-1 break-words"><span className="font-semibold">{t('screening.result.important')}</span> {t('screening.result.disclaimer')}</p></div>
      </div>
    </FlowShell>
  )
}
