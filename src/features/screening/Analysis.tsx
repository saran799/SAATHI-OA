import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Minus, Activity, FlaskConical, ShieldCheck } from 'lucide-react'
import { Frame, TopBar } from '../../components/layout/Shells'
import { Button, Callout, Ring, cx } from '../../components/ui'
import { ANALYSIS_STEPS, runAnalysis, type AnalysisStep } from '../../services/analysis'
import { useScreeningPatient } from './useGuard'
import { useApp } from '../../store/appStore'
import { RISK_META } from '../../domain/risk'
import { addDays, uid } from '../../domain/copy'

export default function Analysis() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const { addRecord, workerName } = useApp()
  const [done, setDone] = useState<AnalysisStep[]>([])
  const [error, setError] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)
  const cancel = useRef<() => void>(null)

  const run = (fail = false) => {
    if (!patient) return
    setError(null); setDone([]); setFinishing(false)
    cancel.current = runAnalysis(patient, session.answers, session.movement, setDone, r => {
      setFinishing(true)
      const now = new Date().toISOString()
      const rec = { id: uid('S'), patientId: patient.id, joint: session.joint!, side: session.side, answers: session.answers, movement: session.movement, result: r, createdAt: now, workerName, sync: 'unsynced' as const, followUpDate: addDays(now, RISK_META[r.band].followUpDays) }
      addRecord(rec); session.setResult(r, rec.id)
      setTimeout(() => nav('/screening/result', { replace: true }), 900)
    }, setError, { fail })
  }
  useEffect(() => { run(); return () => cancel.current?.() }, []) // eslint-disable-line
  if (!patient) return null

  const pct = error ? Math.round((done.length / ANALYSIS_STEPS.length) * 100) : finishing ? 100 : Math.min(96, Math.round(((done.length + 0.5) / ANALYSIS_STEPS.length) * 100))
  const current = error ? 'Analysis stopped' : finishing ? 'Preparing screening result…' : ANALYSIS_STEPS.find(s => !done.includes(s.id))?.label ?? 'Finalising'
  const sub: Record<string, string> = { patient: 'Age, background and reported history', symptoms: 'Pain, stiffness and daily-function answers', movement: session.movement ? 'Range of movement and smoothness' : 'Skipped — symptoms only', risk: 'Combining factors into a screening risk band' }
  return (
    <Frame>
      <TopBar title="Movement Assessment" back={`/patients/${patient.id}`} right={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">Triage active</span>} />
      <main className="flex-1 flex flex-col px-4 pt-5 pb-8 page-enter">
        <div className="flex flex-col items-center text-center">
          <span className="h-7 px-3 rounded-full bg-mint-soft text-primary-dark text-[11px] font-bold tracking-wider inline-flex items-center gap-1.5 uppercase"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />Screening engine · demo</span>
          <h1 className="text-[26px] font-bold tracking-tight mt-3" aria-live="polite">{error ? 'Analysis could not finish' : finishing ? 'Preparing result…' : 'Analysing Data…'}</h1>
          <p className="text-secondary text-[15px] mt-1 max-w-[280px]">{error ? 'Your screening data is saved on this device.' : 'Please wait while the screening model processes the results.'}</p>
          <div className="mt-5 relative">
            <span className={cx('absolute -inset-4 rounded-full bg-mint/40', !error && 'halo')} aria-hidden />
            <Ring value={pct} size={168} stroke={12}>
              <Activity size={24} className="text-primary" aria-hidden />
              <p className="text-[30px] font-bold tabular-nums leading-none mt-1">{pct}%</p>
              <p className="text-[11px] font-bold tracking-wider text-primary mt-1 uppercase">Analysing</p>
            </Ring>
          </div>
        </div>

        <div className="card mt-6 p-3 flex items-center gap-3">
          <span className="h-11 w-11 rounded-[12px] bg-mint text-primary-dark flex items-center justify-center shrink-0" aria-hidden><FlaskConical size={22} /></span>
          <div className="flex-1 min-w-0"><p className="text-[11px] font-bold tracking-wider text-secondary uppercase">Current routine</p><p className="text-[15px] font-bold truncate">{current}</p></div>
          {!error && <span className="h-7 px-2.5 rounded-full bg-tint text-primary text-[11px] font-semibold inline-flex items-center gap-1 shrink-0"><span className="spin inline-block h-3 w-3 rounded-full border-2 border-primary border-t-transparent" aria-hidden />Live</span>}
        </div>

        <div className="card mt-3 p-4">
          <div className="flex items-center justify-between mb-3"><p className="text-[12px] font-bold tracking-wider uppercase">Screening pipeline</p><span className="text-[12px] font-semibold text-secondary">Step {Math.min(done.length + 1, ANALYSIS_STEPS.length)} of {ANALYSIS_STEPS.length}</span></div>
          <ul className="space-y-1" aria-live="polite">
            {ANALYSIS_STEPS.map((st, i) => {
              const isDone = done.includes(st.id)
              const active = !isDone && !error && (i === 0 || done.includes(ANALYSIS_STEPS[i - 1].id))
              const skipped = st.id === 'movement' && !session.movement
              return (
                <li key={st.id} className={cx('flex items-start gap-3 px-3 py-2.5 rounded-[12px] transition-colors', active && 'bg-tint')}>
                  <span className={cx('h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', isDone ? 'bg-mint text-primary-dark' : active ? 'bg-primary text-white' : 'bg-tint text-muted')} aria-hidden>
                    {isDone ? (skipped ? <Minus size={15} strokeWidth={3} /> : <Check size={15} strokeWidth={3} />) : active ? <span className="spin inline-block h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent" /> : <span className="h-2 w-2 rounded-full bg-muted" />}
                  </span>
                  <span className="flex-1 min-w-0"><span className={cx('block text-[15px] font-bold', !isDone && !active && 'text-secondary')}>{st.label}</span><span className="block text-[12px] text-secondary">{sub[st.id]}</span></span>
                  <span className={cx('text-[12px] font-semibold shrink-0', isDone ? 'text-primary' : active ? 'text-primary' : 'text-muted')}>{isDone ? (skipped ? 'Skipped' : 'Completed') : active ? 'Active' : 'Pending'}</span>
                </li>
              )
            })}
          </ul>
        </div>

        {error && <div className="mt-4 space-y-2">
          <Callout tone="error" title="Analysis failed">{error}</Callout>
          <Button full onClick={() => run()}>Retry analysis</Button>
          <Button full variant="secondary" onClick={() => nav(`/patients/${patient.id}`)}>Back to patient</Button>
        </div>}
        {!error && !finishing && <button onClick={() => { cancel.current?.(); run(true) }} className="mt-4 w-full text-xs text-muted underline h-9">Demo: simulate analysis failure</button>}
        <p className="mt-4 text-[12px] text-secondary text-center inline-flex w-full items-center justify-center gap-1.5"><ShieldCheck size={13} className="text-primary" aria-hidden />Processed on-device (demo) · Screening risk estimation only, not a diagnosis.</p>
      </main>
    </Frame>
  )
}
