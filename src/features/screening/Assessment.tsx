import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Square, Activity, Volume2, Radio, RefreshCw, RotateCcw } from 'lucide-react'
import { Frame, TopBar } from '../../components/layout/Shells'
import { Button, Callout, Ring, cx } from '../../components/ui'
import { sensor, type MovementSample } from '../../services/sensor'
import { useScreeningPatient } from './useGuard'
import { jointName } from '../../domain/copy'

const DURATION = 30
type Phase = 'countdown' | 'recording' | 'complete' | 'interrupted' | 'nomove'

export default function Assessment() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const [phase, setPhase] = useState<Phase>('countdown')
  const [count, setCount] = useState(3)
  const [elapsed, setElapsed] = useState(0)
  const [reps, setReps] = useState(0)
  const [angle, setAngle] = useState(0)
  const [trace, setTrace] = useState<number[]>([])
  const samples = useRef<MovementSample[]>([])
  const stop = useRef<() => void>(null)
  const noMove = useRef(false)

  useEffect(() => { if (phase !== 'countdown') return; if (count === 0) { setPhase('recording'); return } const t = setTimeout(() => setCount(c => c - 1), 800); return () => clearTimeout(t) }, [phase, count])

  useEffect(() => {
    if (phase !== 'recording') return
    const start = Date.now(); samples.current = []
    stop.current = sensor.startAssessment(s => { samples.current.push(s); setAngle(s.angle); setTrace(t => [...t.slice(-59), s.angle]) }, setReps, { durationSec: DURATION, noMovement: noMove.current })
    const tick = setInterval(() => {
      const e = (Date.now() - start) / 1000; setElapsed(Math.min(DURATION, e))
      if (e >= 8 && samples.current.length > 40) { const mx = Math.max(...samples.current.map(s => s.angle)); if (mx < 8) { clearInterval(tick); stop.current?.(); setPhase('nomove'); return } }
      if (e >= DURATION) { clearInterval(tick); stop.current?.(); finish() }
    }, 100)
    return () => { clearInterval(tick); stop.current?.() }
  }, [phase]) // eslint-disable-line

  const finish = () => {
    const a = samples.current.map(s => s.angle); const rom = Math.max(...a) - Math.min(...a)
    let jitter = 0; for (let i = 2; i < a.length; i++) jitter += Math.abs(a[i] - 2 * a[i - 1] + a[i - 2])
    const smooth = Math.max(0, Math.min(1, 1 - jitter / a.length / 3))
    // demo mapping: simulated peak 60° flexion → ~110–125° reported range
    session.setMovement({ rangeOfMotionDeg: Math.round(60 + rom), smoothness: Number(smooth.toFixed(2)), durationSec: DURATION, repetitions: Math.max(reps, Math.round(DURATION / 6)), performed: true })
    setPhase('complete'); setTimeout(() => nav('/screening/analysis', { replace: true }), 900)
  }
  const cancel = () => { stop.current?.(); setPhase('interrupted') }
  const restart = () => { setElapsed(0); setReps(0); setTrace([]); setCount(3); setPhase('countdown') }
  if (!patient || !session.joint) return null

  const moving = angle > 8
  const w = 320, h = 80
  const path = trace.length > 1 ? trace.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / 59) * w},${h - (v / 70) * h}`).join(' ') : ''

  return (
    <Frame>
      <TopBar title="Movement Assessment" back onBack={cancel} right={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">Triage active</span>} />
      <main className="flex-1 flex flex-col px-4 pt-3 pb-6 page-enter">
        <div className="card h-12 px-4 flex items-center gap-2">
          {phase === 'recording' && <><span className="h-2.5 w-2.5 rounded-full bg-error pulse-dot" aria-hidden /><span className="text-[13px] font-bold tracking-wide">LIVE RECORDING</span><span className="text-[12px] text-secondary">· simulated</span></>}
          {phase === 'countdown' && <><span className="h-2.5 w-2.5 rounded-full bg-muted" aria-hidden /><span className="text-[13px] font-bold tracking-wide">GET READY</span></>}
          {phase === 'complete' && <><span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden /><span className="text-[13px] font-bold tracking-wide">COMPLETE</span></>}
          {(phase === 'nomove' || phase === 'interrupted') && <><span className="h-2.5 w-2.5 rounded-full bg-warning" aria-hidden /><span className="text-[13px] font-bold tracking-wide">STOPPED</span></>}
          <span className="ml-auto h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-semibold inline-flex items-center gap-1 truncate"><RefreshCw size={12} aria-hidden />{patient.name.split(' ')[0]} · {jointName(session.joint, session.side)}</span>
        </div>

        <div className="card mt-3 p-5 flex flex-col items-center">
          <span className="h-7 px-3 rounded-full bg-tint text-ink text-[12px] font-semibold inline-flex items-center gap-1.5"><Activity size={13} className="text-primary" aria-hidden />Active: {DURATION}s slow movement, 5 repetitions</span>
          {phase === 'countdown' ? (
            <div className="my-6 text-center fade-in" key={count}><p className="text-[12px] font-bold tracking-wider text-secondary">STARTING IN</p><p className="text-[64px] font-bold text-primary leading-none mt-2 tabular-nums">{count || 'Go'}</p><p className="text-secondary text-[13px] mt-3 max-w-[240px]">Ask the patient to begin slow movements when you say "go".</p></div>
          ) : (
            <div className="my-5"><Ring value={(elapsed / DURATION) * 100} size={168} stroke={12}>
              <p className="text-[11px] font-bold tracking-wider text-secondary">REMAINING</p>
              <p className="text-[34px] font-bold tabular-nums leading-none mt-1">00:{String(Math.ceil(DURATION - elapsed)).padStart(2, '0')}</p>
              <p className="text-[12px] text-secondary mt-1">Target: 00:{DURATION}</p>
            </Ring></div>
          )}
          {(phase === 'recording' || phase === 'complete') && <span className="h-9 px-4 rounded-full bg-mint-soft text-primary-dark text-[13px] font-semibold inline-flex items-center gap-2"><Volume2 size={15} aria-hidden />{moving ? 'Movement detected — keep going steadily' : 'Waiting for movement…'}</span>}
        </div>

        {(phase === 'recording' || phase === 'complete') && (
          <div className="card mt-3 p-4">
            <div className="flex items-center justify-between"><p className="text-[18px] font-bold inline-flex items-center gap-2"><Activity size={20} className="text-primary" aria-hidden />Movement Trace</p><span className="h-7 px-2.5 rounded-full bg-tint text-[11px] font-semibold text-ink inline-flex items-center">Calibrated</span></div>
            <div className="mt-3 rounded-[12px] bg-tint p-3">
              <div className="flex items-center justify-between text-[13px]"><span className="font-bold">Joint angle</span><span className="tabular-nums text-secondary"><span className="text-primary font-bold">{Math.round(angle)}°</span> live</span></div>
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 mt-1" aria-hidden><path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /></svg>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-[12px] bg-tint p-3"><p className="text-[11px] font-bold tracking-wide text-secondary uppercase">Flexion</p><p className="text-[22px] font-bold mt-1 tabular-nums">{Math.round(angle)}° <span className="text-[12px] text-secondary font-semibold">dynamic</span></p></div>
              <div className="rounded-[12px] bg-tint p-3"><p className="text-[11px] font-bold tracking-wide text-secondary uppercase">Repetition</p><p className="text-[22px] font-bold mt-1 tabular-nums text-primary">{Math.min(reps + 1, 5)}<span className="text-[12px] text-secondary font-semibold"> of 5</span></p></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px]"><span className="text-secondary font-medium inline-flex items-center gap-1.5"><Radio size={13} aria-hidden />SAATHI sensor (simulated)</span><span className={cx('font-semibold inline-flex items-center gap-1.5', moving ? 'text-primary' : 'text-secondary')}><span className={cx('h-2 w-2 rounded-full', moving ? 'bg-primary' : 'bg-muted')} aria-hidden />{moving ? 'Movement detected' : 'No movement'}</span></div>
          </div>
        )}

        {phase === 'nomove' && <div className="mt-3"><Callout tone="warning" title="Movement not detected">The sensor did not detect joint movement. Check the strap is snug and ask the patient to move the joint slowly.</Callout></div>}
        {phase === 'interrupted' && <div className="mt-3"><Callout tone="warning" title="Assessment interrupted">The recording was stopped before completion. Nothing has been saved.</Callout></div>}

        <div className="mt-auto pt-4 space-y-2">
          {(phase === 'recording' || phase === 'countdown') && <>
            <Button full variant="danger" icon={Square} onClick={cancel}>Stop Recording</Button>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => { stop.current?.(); restart() }} className="h-10 text-[13px] font-semibold text-secondary inline-flex items-center gap-1.5"><RotateCcw size={14} aria-hidden />Discard &amp; restart test</button>
              {phase === 'recording' && <button onClick={() => { noMove.current = true; stop.current?.(); setPhase('nomove') }} className="h-10 text-xs text-muted underline">Demo: no movement</button>}
            </div>
          </>}
          {(phase === 'nomove' || phase === 'interrupted') && <>
            <Button full onClick={() => { noMove.current = false; restart() }}>Try again</Button>
            <Button full variant="secondary" onClick={() => { session.setMovement(null, true); nav('/screening/analysis') }}>Continue without movement data</Button>
            <button className="w-full h-11 text-[14px] font-semibold text-secondary" onClick={() => nav(`/patients/${patient.id}`)}>Exit screening</button>
          </>}
          {phase === 'complete' && <p className="text-center text-primary-dark font-semibold fade-in">Movement recorded. Preparing analysis…</p>}
        </div>
      </main>
    </Frame>
  )
}
