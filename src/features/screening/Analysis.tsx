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
import { useT } from '../../i18n'

export default function Analysis() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const { addRecord, workerName } = useApp()
  const { t } = useT()
  const [done, setDone] = useState<AnalysisStep[]>([])
  const [error, setError] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)
  const cancel = useRef<() => void>(null)

  const run = (fail = false) => {
    if (!patient) return
    setError(null); setDone([]); setFinishing(false)
    cancel.current = runAnalysis(patient, session.answers, session.tests, setDone, r => {
      setFinishing(true)
      const now = new Date().toISOString()
      // Offline-first: save locally immediately, mark based on connectivity per spec
      // - If offline: local (saved locally, waiting for connection)
      // - If online: unsynced (online but not yet synced)
      // Never falsely claim synced
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
      const syncState = isOnline ? 'unsynced' as const : 'local' as const
      const rec = { id: uid('S'), patientId: patient.id, joint: session.joint!, side: session.side, answers: session.answers, movement: session.movement, tests: session.tests, result: r, createdAt: now, workerName, sync: syncState, followUpDate: addDays(now, RISK_META[r.band].followUpDays) }
      addRecord(rec); session.setResult(r, rec.id)
      setTimeout(() => nav('/screening/result', { replace: true }), 900)
    }, setError, { fail })
  }
  useEffect(() => { run(); return () => cancel.current?.() }, []) // eslint-disable-line
  if (!patient) return null

  const pct = error ? Math.round((done.length / ANALYSIS_STEPS.length) * 100) : finishing ? 100 : Math.min(96, Math.round(((done.length + 0.5) / ANALYSIS_STEPS.length) * 100))
  const currentKey = error ? 'screening.analysis.notFinish' : finishing ? 'screening.analysis.preparing' : `screening.analysis.${ANALYSIS_STEPS.find(s => !done.includes(s.id))?.id || 'finalising'}`
  const current = t(currentKey)
  const sub: Record<string, string> = {
    patient: t('screening.analysis.descs.patient'),
    symptoms: t('screening.analysis.descs.symptoms'),
    movement: session.tests.length > 0 ? t('screening.analysis.descs.movement') : t('screening.analysis.descs.movementSkipped'),
    risk: t('screening.analysis.descs.risk'),
  }
  return (
    <Frame>
      <TopBar title={t('screening.analysis.title')} back={`/patients/${patient.id}`} right={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">{t('screening.common.triageActive')}</span>} />
      <main className="flex-1 flex flex-col px-4 pt-5 pb-8 page-enter">
        <div className="flex flex-col items-center text-center">
          <span className="h-7 px-3 rounded-full bg-mint-soft text-primary-dark text-[11px] font-bold tracking-wider inline-flex items-center gap-1.5 uppercase"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />{t('screening.analysis.engineLabel')}</span>
          <h1 className="text-[26px] font-bold tracking-tight mt-3 break-words" aria-live="polite">{error ? t('screening.analysis.notFinish') : finishing ? t('screening.analysis.preparing') : t('screening.analysis.analysing')}</h1>
          <p className="text-secondary text-[15px] mt-1 max-w-[280px] break-words">{error ? t('screening.analysis.saved') : t('screening.analysis.wait')}</p>
          <div className="mt-5 relative">
            <span className={cx('absolute -inset-4 rounded-full bg-mint/40', !error && 'halo')} aria-hidden />
            <Ring value={pct} size={168} stroke={12}>
              <Activity size={24} className="text-primary" aria-hidden />
              <p className="text-[30px] font-bold tabular-nums leading-none mt-1">{pct}%</p>
              <p className="text-[11px] font-bold tracking-wider text-primary mt-1 uppercase break-words">{t('screening.analysis.analysing')}</p>
            </Ring>
          </div>
        </div>

        <div className="card mt-6 p-3 flex items-center gap-3">
          <span className="h-11 w-11 rounded-[12px] bg-mint text-primary-dark flex items-center justify-center shrink-0" aria-hidden><FlaskConical size={22} /></span>
          <div className="flex-1 min-w-0"><p className="text-[11px] font-bold tracking-wider text-secondary uppercase break-words">{t('screening.analysis.currentRoutine')}</p><p className="text-[15px] font-bold truncate break-words">{current}</p></div>
          {!error && <span className="h-7 px-2.5 rounded-full bg-tint text-primary text-[11px] font-semibold inline-flex items-center gap-1 shrink-0"><span className="spin inline-block h-3 w-3 rounded-full border-2 border-primary border-t-transparent" aria-hidden />{t('screening.analysis.live')}</span>}
        </div>

        <div className="card mt-3 p-4">
          <div className="flex items-center justify-between mb-3"><p className="text-[12px] font-bold tracking-wider uppercase break-words">{t('screening.analysis.pipeline')}</p><span className="text-[12px] font-semibold text-secondary break-words">{t('screening.analysis.stepOf', { current: Math.min(done.length + 1, ANALYSIS_STEPS.length), total: ANALYSIS_STEPS.length })}</span></div>
          <ul className="space-y-1" aria-live="polite">
            {ANALYSIS_STEPS.map((st, i) => {
              const isDone = done.includes(st.id)
              const active = !isDone && !error && (i === 0 || done.includes(ANALYSIS_STEPS[i - 1].id))
              const skipped = st.id === 'movement' && session.tests.length === 0
              return (
                <li key={st.id} className={cx('flex items-start gap-3 px-3 py-2.5 rounded-[12px] transition-colors', active && 'bg-tint')}>
                  <span className={cx('h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', isDone ? 'bg-mint text-primary-dark' : active ? 'bg-primary text-white' : 'bg-tint text-muted')} aria-hidden>
                    {isDone ? (skipped ? <Minus size={15} strokeWidth={3} /> : <Check size={15} strokeWidth={3} />) : active ? <span className="spin inline-block h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent" /> : <span className="h-2 w-2 rounded-full bg-muted" />}
                  </span>
                  <span className="flex-1 min-w-0"><span className={cx('block text-[15px] font-bold break-words', !isDone && !active && 'text-secondary')}>{t(`screening.analysis.${st.id}`)}</span><span className="block text-[12px] text-secondary break-words">{sub[st.id]}</span></span>
                  <span className={cx('text-[12px] font-semibold shrink-0 break-words', isDone ? 'text-primary' : active ? 'text-primary' : 'text-muted')}>{isDone ? (skipped ? t('screening.analysis.skipped') : t('screening.analysis.completed')) : active ? t('screening.analysis.active') : t('screening.analysis.pending')}</span>
                </li>
              )
            })}
          </ul>
        </div>

        {error && <div className="mt-4 space-y-2">
          <Callout tone="error" title={t('screening.analysis.failedTitle')}>{error}</Callout>
          <Button full onClick={() => run()}>{t('screening.analysis.retry')}</Button>
          <Button full variant="secondary" onClick={() => nav(`/patients/${patient.id}`)}>{t('screening.analysis.backToPatient')}</Button>
        </div>}
        {!error && !finishing && <button onClick={() => { cancel.current?.(); run(true) }} className="mt-4 w-full text-xs text-muted underline h-9 break-words">{t('screening.analysis.demoFail')}</button>}
        <p className="mt-4 text-[12px] text-secondary text-center inline-flex w-full items-center justify-center gap-1.5 break-words"><ShieldCheck size={13} className="text-primary" aria-hidden />{t('screening.analysis.onDevice')}</p>
      </main>
    </Frame>
  )
}
