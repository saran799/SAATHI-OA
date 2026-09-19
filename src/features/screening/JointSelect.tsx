import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Settings2, Lightbulb, Hand, MapPin, Activity } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, Segmented, cx } from '../../components/ui'
import { JOINTS } from '../../domain/questions'
import type { Joint, Side } from '../../domain/types'
import { useScreeningPatient, TOTAL_STEPS } from './useGuard'
import { useT } from '../../i18n'

const META: Record<Joint, { icon: typeof Hand }> = {
  knee: { icon: Lightbulb },
  hip: { icon: MapPin },
  hand: { icon: Hand },
  spine: { icon: Activity },
}

export default function JointSelect() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient()
  const { t } = useT()
  const [joint, setJoint] = useState<Joint | null>(session.joint)
  const [side, setSide] = useState<Side>(session.side)
  if (!patient) return null

  const getJointName = (j: string, s: string) => {
    const jl = t(`screening.joint.joints.${j}.label`)
    const sl = t(`screening.joint.${s}`)
    return s === 'both' ? `${jl}` : `${sl} ${jl.toLowerCase()}`
  }

  return (
    <FlowShell title={t('screening.joint.title')} subtitle={t('screening.joint.subtitle', { name: patient.name })} step={1} total={TOTAL_STEPS} stepLabel={t('screening.common.stepOf', { current: 1, total: TOTAL_STEPS })} back={`/patients/${patient.id}`}
      footer={<Button full disabled={!joint} onClick={() => { session.setJoint(joint!, side); nav('/screening/questions') }}>{t('screening.joint.next')} <ArrowRight size={18} aria-hidden /></Button>}>
      <div role="radiogroup" aria-label="Joint" className="space-y-3">
        {JOINTS.map(j => {
          const sel = joint === j.id; const m = META[j.id]; const Icon = m.icon
          const jLabel = t(`screening.joint.joints.${j.id}.label`)
          const jHint = t(`screening.joint.joints.${j.id}.hint`)
          const jDesc = t(`screening.joint.joints.${j.id}.desc`)
          return (
            <button key={j.id} type="button" role="radio" aria-checked={sel} onClick={() => setJoint(j.id)}
              className={cx('w-full text-left rounded-[18px] border-2 transition-colors overflow-hidden', sel ? 'border-primary bg-mint-soft' : 'border-transparent card')}>
              <div className="p-4 flex items-start gap-3">
                <span className={cx('h-12 w-12 rounded-[12px] flex items-center justify-center shrink-0', sel ? 'bg-primary text-white' : 'bg-tint text-primary')} aria-hidden><Icon size={24} /></span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 flex-wrap"><span className="text-[20px] font-bold leading-tight break-words">{jLabel}</span>{j.id === 'knee' && <span className="h-6 px-2 rounded-full bg-primary-light text-primary text-[11px] font-semibold inline-flex items-center break-words">{jHint}</span>}</span>
                  <span className="block text-[14px] text-secondary mt-1 leading-snug break-words">{jDesc}</span>
                </span>
                <span className={cx('h-7 w-7 rounded-full flex items-center justify-center shrink-0', sel ? 'bg-primary text-white' : 'bg-tint')} aria-hidden>{sel && <Check size={16} strokeWidth={3} />}</span>
              </div>
              <div className={cx('px-4 py-2 text-[12px] font-semibold flex items-center gap-1.5 border-t break-words', sel ? 'border-mint text-primary' : 'border-tint text-secondary')}><Activity size={13} aria-hidden />{t('screening.common.movementTestAvailable')}{sel && <span className="ml-auto uppercase tracking-wide">{t('common.selected') || 'Selected'}</span>}</div>
            </button>
          )
        })}
      </div>

      <div className="mt-5">
        <p className="text-[15px] font-bold mb-2 break-words">{t('screening.joint.whichSide')}</p>
        <Segmented label="Side" options={[{ value: 'left', label: t('screening.joint.left') }, { value: 'right', label: t('screening.joint.right') }, { value: 'both', label: t('screening.joint.both') }]} value={side} onChange={setSide} />
      </div>

      <div className="mt-4 rounded-[14px] bg-tint p-3 flex items-center gap-3">
        <Settings2 size={18} className="text-primary shrink-0" aria-hidden />
        <div><p className="text-[11px] font-semibold text-secondary uppercase tracking-wide break-words">{t('screening.joint.activeConfig')}</p><p className="text-[14px] font-bold break-words">{joint ? t('screening.joint.selected', { joint: getJointName(joint, side) }) : t('screening.joint.noJoint')}</p></div>
      </div>
    </FlowShell>
  )
}
