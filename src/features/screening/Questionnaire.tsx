import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ClipboardCheck, Info, TrendingUp, Check } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, cx } from '../../components/ui'
import { QUESTIONS } from '../../domain/questions'
import { useScreeningPatient, TOTAL_STEPS } from './useGuard'
import { useT } from '../../i18n'

export default function Questionnaire() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const { t, tObj } = useT()
  const [i, setI] = useState(() => { const idx = QUESTIONS.findIndex(q => session.answers[q.id] === undefined); return idx === -1 ? 0 : idx })
  if (!patient || !session.joint) return null
  const baseQ = QUESTIONS[i]
  const transQ = tObj<any>(`screening.questions.questions.${baseQ.id}`)
  const qText = transQ?.text || baseQ.text
  const qHelper = transQ?.helper || baseQ.helper
  const qOptions = transQ?.options || baseQ.options
  // const qFactor = transQ?.factor || baseQ.factorLabel - kept for future use
  const val = session.answers[baseQ.id]
  const answered = val !== undefined
  const last = i === QUESTIONS.length - 1
  const done = Object.keys(session.answers).length
  const pct = Math.round((done / QUESTIONS.length) * 100)
  const compact = qOptions.every((o: any) => o.label.length <= 12)
  const cols = compact ? (qOptions.length <= 2 ? 'grid-cols-2' : qOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-2') : 'grid-cols-1'

  const jointLabel = (() => {
    const j = t(`screening.joint.joints.${session.joint}.label`)
    const s = t(`screening.joint.${session.side}`)
    return session.side === 'both' ? j : `${s} ${j.toLowerCase()}`
  })()

  return (
    <FlowShell title="" step={2} total={TOTAL_STEPS} stepLabel={t('screening.questions.done', { pct })} barTitle={t('screening.questions.barTitle')} back="/screening/joint" onBack={i > 0 ? () => setI(i - 1) : undefined}
      footer={<div className="grid grid-cols-[1fr_2fr] gap-3">
        <Button variant="secondary" onClick={() => i > 0 ? setI(i - 1) : nav('/screening/joint')}><ArrowLeft size={18} aria-hidden />{t('screening.questions.back')}</Button>
        <Button disabled={!answered} onClick={() => last ? nav('/screening/instructions') : setI(i + 1)}>{last ? t('screening.questions.nextSensor') : t('screening.questions.nextQuestion')} <ArrowRight size={18} aria-hidden /></Button>
      </div>}>
      <div className="-mt-6 mb-4 h-11 rounded-[12px] bg-tint px-3 flex items-center gap-2 text-[13px]">
        <ClipboardCheck size={16} className="text-primary" aria-hidden /><span className="font-semibold">{t('screening.questions.triageProtocol')}</span><span className="text-secondary">· {jointLabel}</span>
        <span className="ml-auto h-6 px-2 rounded-full bg-surface text-[11px] font-semibold text-secondary inline-flex items-center">{t('screening.questions.qOf', { current: i + 1, total: QUESTIONS.length })}</span>
      </div>

      <div key={baseQ.id} className="card p-4 fade-in">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[17px] font-bold leading-snug break-words">{i + 1}. {qText}</h2>
          {answered && <span className="h-7 px-2.5 rounded-full bg-info-tint text-info text-[12px] font-bold whitespace-nowrap shrink-0 inline-flex items-center break-words">{qOptions.find((o: any) => o.value === val)?.label}</span>}
        </div>
        {qHelper && <p className="text-[13px] text-secondary mt-1 break-words">{qHelper}</p>}
        <div role="radiogroup" aria-label={qText} className={cx('mt-4 grid gap-2', cols)}>
          {qOptions.map((o: any) => {
            const sel = val === o.value
            return <button key={o.label} type="button" role="radio" aria-checked={sel} onClick={() => session.answer(baseQ.id, o.value)}
              className={cx('min-h-[50px] px-3 rounded-[12px] text-[14px] font-semibold transition-colors leading-tight inline-flex items-center gap-2 break-words', compact ? 'justify-center text-center' : 'justify-start text-left px-4', sel ? 'bg-primary text-white shadow-[var(--shadow-btn)]' : 'bg-tint text-ink hover:bg-tint-2')}>{sel && <Check size={16} strokeWidth={3} aria-hidden />}{o.label}</button>
          })}
        </div>
        {i === 2 && <div className="mt-3 rounded-[12px] bg-tint p-3 text-[12px] text-ink flex gap-2 break-words"><Info size={15} className="text-primary shrink-0 mt-0.5" aria-hidden /><span>{t('screening.questions.screeningNote')}</span></div>}
      </div>

      <div className="mt-4 rounded-[16px] bg-mint-soft border border-mint p-3 flex items-center gap-3">
        <span className="h-10 w-10 rounded-[12px] bg-mint text-primary-dark flex items-center justify-center shrink-0" aria-hidden><TrendingUp size={20} /></span>
        <div className="min-w-0"><p className="text-[13px] font-bold text-primary-dark break-words">{t('screening.common.screeningProgress')}</p><p className="text-[12px] text-secondary break-words">{t('screening.questions.progressNote', { done, total: QUESTIONS.length })}</p></div>
      </div>
    </FlowShell>
  )
}
