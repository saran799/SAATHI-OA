import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ClipboardCheck, Info, TrendingUp, Check } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, cx } from '../../components/ui'
import { QUESTIONS } from '../../domain/questions'
import { useScreeningPatient, TOTAL_STEPS } from './useGuard'
import { jointName } from '../../domain/copy'

export default function Questionnaire() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const [i, setI] = useState(() => { const idx = QUESTIONS.findIndex(q => session.answers[q.id] === undefined); return idx === -1 ? 0 : idx })
  if (!patient || !session.joint) return null
  const q = QUESTIONS[i]
  const val = session.answers[q.id]
  const answered = val !== undefined
  const last = i === QUESTIONS.length - 1
  const done = Object.keys(session.answers).length
  const pct = Math.round((done / QUESTIONS.length) * 100)
  const compact = q.options.every(o => o.label.length <= 12)
  const cols = compact ? (q.options.length <= 2 ? 'grid-cols-2' : q.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2') : 'grid-cols-1'

  return (
    <FlowShell title="" step={2} total={TOTAL_STEPS} stepLabel={`${pct}% done`} barTitle="Symptom Assessment" back="/screening/joint" onBack={i > 0 ? () => setI(i - 1) : undefined}
      footer={<div className="grid grid-cols-[1fr_2fr] gap-3">
        <Button variant="secondary" onClick={() => i > 0 ? setI(i - 1) : nav('/screening/joint')}><ArrowLeft size={18} aria-hidden />Back</Button>
        <Button disabled={!answered} onClick={() => last ? nav('/screening/instructions') : setI(i + 1)}>{last ? 'Next: Connect Sensor' : 'Next Question'} <ArrowRight size={18} aria-hidden /></Button>
      </div>}>
      <div className="-mt-6 mb-4 h-11 rounded-[12px] bg-tint px-3 flex items-center gap-2 text-[13px]">
        <ClipboardCheck size={16} className="text-primary" aria-hidden /><span className="font-semibold">Triage protocol</span><span className="text-secondary">· {jointName(session.joint, session.side)}</span>
        <span className="ml-auto h-6 px-2 rounded-full bg-surface text-[11px] font-semibold text-secondary inline-flex items-center">Q {i + 1} / {QUESTIONS.length}</span>
      </div>

      <div key={q.id} className="card p-4 fade-in">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[17px] font-bold leading-snug">{i + 1}. {q.text}</h2>
          {answered && <span className="h-7 px-2.5 rounded-full bg-info-tint text-info text-[12px] font-bold whitespace-nowrap shrink-0 inline-flex items-center">{q.options.find(o => o.value === val)?.label}</span>}
        </div>
        {q.helper && <p className="text-[13px] text-secondary mt-1">{q.helper}</p>}
        <div role="radiogroup" aria-label={q.text} className={cx('mt-4 grid gap-2', cols)}>
          {q.options.map(o => {
            const sel = val === o.value
            return <button key={o.label} type="button" role="radio" aria-checked={sel} onClick={() => session.answer(q.id, o.value)}
              className={cx('min-h-[50px] px-3 rounded-[12px] text-[14px] font-semibold transition-colors leading-tight inline-flex items-center gap-2', compact ? 'justify-center text-center' : 'justify-start text-left px-4', sel ? 'bg-primary text-white shadow-[var(--shadow-btn)]' : 'bg-tint text-ink hover:bg-tint-2')}>{sel && <Check size={16} strokeWidth={3} aria-hidden />}{o.label}</button>
          })}
        </div>
        {i === 2 && <div className="mt-3 rounded-[12px] bg-tint p-3 text-[12px] text-ink flex gap-2"><Info size={15} className="text-primary shrink-0 mt-0.5" aria-hidden /><span><span className="font-semibold">Screening note:</span> stiffness lasting more than 30 minutes is one of the factors used in risk estimation.</span></div>}
      </div>

      <div className="mt-4 rounded-[16px] bg-mint-soft border border-mint p-3 flex items-center gap-3">
        <span className="h-10 w-10 rounded-[12px] bg-mint text-primary-dark flex items-center justify-center shrink-0" aria-hidden><TrendingUp size={20} /></span>
        <div className="min-w-0"><p className="text-[13px] font-bold text-primary-dark">Screening progress</p><p className="text-[12px] text-secondary truncate">{done} of {QUESTIONS.length} answered · risk is estimated after the movement test</p></div>
      </div>
    </FlowShell>
  )
}
