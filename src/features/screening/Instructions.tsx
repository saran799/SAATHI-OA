import { useNavigate } from 'react-router-dom'
import { ArrowRight, Timer, User, Footprints, Hand, ShieldCheck } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, cx } from '../../components/ui'
import { useScreeningPatient, TOTAL_STEPS } from './useGuard'
import { useT } from '../../i18n'

export default function Instructions() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const { t } = useT()
  if (!patient || !session.joint) return null
  const jointKey = session.joint
  const jointLabel = t(`screening.joint.joints.${jointKey}.label`)
  const jointLower = jointLabel.toLowerCase()
  const sideLabel = session.side === 'both' ? t('screening.instructions.sensorSide', { side: t('screening.joint.both') }) : t(`screening.joint.${session.side}`)
  const moveText = t(`screening.instructions.moves.${jointKey}`)

  const steps = [
    { icon: Hand, t: t('screening.instructions.steps.attach.t'), b: t('screening.instructions.steps.attach.b', { joint: jointLower, side: sideLabel }) },
    { icon: Footprints, t: session.joint === 'hand' ? t('screening.instructions.steps.seatHand.t') : t('screening.instructions.steps.seat.t'), b: session.joint === 'hand' ? t('screening.instructions.steps.seatHand.b') : t('screening.instructions.steps.seat.b') },
    { icon: User, t: t('screening.instructions.steps.explain.t'), b: t('screening.instructions.steps.explain.b', { name: patient.name, move: moveText }) },
  ]
  const tabsRaw = t('screening.instructions.stages') as any
  const tabs = Array.isArray(tabsRaw) ? tabsRaw : [['1. Wear', 'Strap'], ['2. Calib', 'Stand'], ['3. Test', 'Flex'], ['4. Done', 'Report']]

  return (
    <FlowShell title="" step={3} total={TOTAL_STEPS} stepLabel={t('screening.common.stepOf', { current: 3, total: TOTAL_STEPS })} barTitle={t('screening.instructions.barTitle')} back="/screening/questions"
      pill={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">{t('screening.common.triageActive')}</span>}
      footer={<div>
        <Button full onClick={() => nav('/screening/sensor')}>{t('screening.instructions.startAssessment')} <ArrowRight size={18} aria-hidden /></Button>
        <button type="button" onClick={() => { session.setMovement(null, true); nav('/screening/analysis') }} className="w-full h-10 mt-1 text-[13px] font-semibold text-secondary break-words">{t('screening.instructions.skip')}</button>
      </div>}>
      <div className="-mt-6 flex items-start justify-between gap-3 flex-wrap">
        <div><h1 className="text-[22px] font-bold tracking-tight leading-tight break-words">{t('screening.instructions.title', { joint: jointLabel })}</h1><p className="text-[14px] text-secondary mt-1 break-words">{t('screening.instructions.subtitle')}</p></div>
        <span className="h-9 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 mt-1"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden />{t('screening.common.pairReady')}</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2" aria-label="Assessment stages">
        {tabs.map((pair: any, i: number) => {
          const a = Array.isArray(pair) ? pair[0] : pair
          const b = Array.isArray(pair) ? pair[1] : ''
          return <div key={String(a)+i} className={cx('rounded-[12px] px-2 py-2.5 text-center break-words', i === 0 ? 'bg-primary text-white' : 'bg-tint text-secondary')}><p className="text-[12px] font-bold whitespace-nowrap break-words">{a}</p><p className={cx('text-[11px] break-words', i === 0 ? 'text-white/85' : '')}>{b}</p></div>
        })}
      </div>

      <div className="card mt-4 p-4">
        <div className="flex items-center gap-2 flex-wrap"><span className="h-7 px-2.5 rounded-full bg-tint text-primary text-[11px] font-bold inline-flex items-center break-words">{t('screening.instructions.placement')}</span><span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-bold inline-flex items-center break-words">{t('screening.instructions.sensorSide', { side: session.side === 'both' ? t('screening.joint.both') : sideLabel })}</span></div>
        <div className="mt-3 rounded-[14px] bg-tint p-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="space-y-3">
            <div className="card rounded-[10px] p-2.5"><p className="text-[12px] font-bold flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden />{t('screening.instructions.upperStrap')}</p><p className="text-[11px] text-secondary break-words">{t('common.appName') === 'SAATHI' ? `Above the ${jointLower}` : jointLower}</p></div>
            <div className="card rounded-[10px] p-2.5"><p className="text-[12px] font-bold flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden />{t('screening.instructions.lowerStrap')}</p><p className="text-[11px] text-secondary break-words">{t('common.appName') === 'SAATHI' ? `Below the ${jointLower}` : jointLower}</p></div>
          </div>
          <svg width="56" height="150" viewBox="0 0 56 150" fill="none" aria-hidden>
            <path d="M22 4c-4 30-4 60 0 70s6 40 0 72" stroke="#B9C7D6" strokeWidth="14" strokeLinecap="round" /><path d="M34 4c4 30 4 60 0 70s-6 40 0 72" stroke="#B9C7D6" strokeWidth="14" strokeLinecap="round" />
            <rect x="12" y="30" width="32" height="24" rx="6" fill="#0F766E" /><rect x="12" y="98" width="32" height="24" rx="6" fill="#0F766E" />
            <circle cx="28" cy="75" r="8" stroke="#0F766E" strokeWidth="3" strokeDasharray="4 3" />
          </svg>
          <div className="card rounded-[10px] p-2.5"><p className="text-[12px] font-bold break-words">{t('screening.instructions.jointCentre', { joint: jointLabel })}</p><p className="text-[11px] text-secondary break-words">{t('screening.instructions.jointLine')}</p></div>
        </div>
      </div>

      <div className="card mt-4 divide-y divide-tint">
        {steps.map((s, i) => (
          <div key={s.t} className="p-4 flex gap-3">
            <span className={cx('h-8 w-8 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0', i === 0 ? 'bg-mint text-primary-dark' : 'bg-tint text-ink')} aria-hidden>{i + 1}</span>
            <div className="flex-1 min-w-0"><p className="text-[15px] font-bold leading-snug break-words">{s.t}</p><p className="text-[13px] text-secondary mt-0.5 leading-snug break-words">{s.b}</p></div>
            <s.icon size={18} className="text-primary shrink-0 mt-1" aria-hidden />
          </div>
        ))}
        <div className="px-4 py-2.5 flex items-center gap-2 text-[12px] font-semibold text-primary-dark bg-mint-soft rounded-b-[16px] break-words"><ShieldCheck size={14} aria-hidden />{t('screening.instructions.nextNote')}<span className="ml-auto h-2 w-2 rounded-full bg-primary" aria-hidden /></div>
      </div>

      <p className="mt-3 text-center text-[12px] text-secondary font-medium inline-flex w-full items-center justify-center gap-1.5 break-words"><Timer size={13} aria-hidden />{t('screening.instructions.setupTime')}</p>
    </FlowShell>
  )
}
