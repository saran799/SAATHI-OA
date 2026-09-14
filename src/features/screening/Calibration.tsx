import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, Callout, ProgressBar, cx } from '../../components/ui'
import { sensor } from '../../services/sensor'
import { useScreeningPatient, TOTAL_STEPS } from './useGuard'

const STEPS = ['Prepare', 'Position', 'Calibrate', 'Ready']

export default function Calibration() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const [step, setStep] = useState(0)
  const [pct, setPct] = useState(0)
  const [failed, setFailed] = useState(false)
  const cancel = useRef<() => void>(null)
  const calibrate = (fail = false) => { setFailed(false); setPct(0); setStep(2); cancel.current = sensor.calibrate(setPct, ok => ok ? setStep(3) : setFailed(true), { fail }) }
  useEffect(() => () => cancel.current?.(), [])
  if (!patient) return null

  const copy = [
    { t: 'Prepare', b: `Ask ${patient.name} to sit comfortably with the sensor strapped on. The patient should relax the joint.` },
    { t: 'Position', b: 'Place the joint in its resting position — straight and still. The sensor must not move for a few seconds.' },
    { t: 'Calibrating…', b: 'Hold still. SAATHI is setting the starting position of the sensor.' },
    { t: 'Ready', b: 'Setup complete. You can now start the movement assessment.' },
  ][step]

  const footer = step === 0 ? <Button full onClick={() => setStep(1)}>Patient is seated</Button>
    : step === 1 ? <Button full onClick={() => calibrate()}>Start calibration</Button>
    : step === 2 && failed ? <div className="space-y-2"><Button full onClick={() => calibrate()}>Retry calibration</Button><button className="w-full h-11 text-[14px] font-semibold text-primary" onClick={() => { session.setMovement(null, true); nav('/screening/analysis') }}>Continue without sensor</button></div>
    : step === 2 ? <Button full loading disabled>Calibrating…</Button>
    : <Button full onClick={() => nav('/screening/assessment')}>Start movement assessment</Button>

  return (
    <FlowShell title="Sensor Setup" subtitle="A short 4-step setup before recording." step={5} total={TOTAL_STEPS} stepLabel="Calibration" barTitle="Movement Assessment" back="/screening/sensor" footer={footer}
      pill={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">Triage active</span>}>
      <div className="grid grid-cols-4 gap-2" aria-label="Setup stages">
        {STEPS.map((t, i) => <div key={t} className={cx('rounded-[12px] px-2 py-2.5 text-center', i === step ? 'bg-primary text-white' : i < step ? 'bg-mint text-primary-dark' : 'bg-tint text-secondary')}><p className="text-[12px] font-bold">{i + 1}. {t}</p></div>)}
      </div>
      <div key={step} className="card p-5 mt-4 fade-in">
        <h2 className="text-[20px] font-bold">{copy.t}</h2>
        <p className="text-[15px] text-secondary leading-relaxed mt-2">{copy.b}</p>

      {step === 2 && !failed && <div className="mt-6">
        <div className="flex justify-between text-sm mb-2"><span className="font-semibold">Hold still…</span><span className="text-secondary">{pct}%</span></div>
        <ProgressBar value={pct} label="Calibration progress" />
      </div>}
      {step === 3 && <div className="mt-6 flex flex-col items-center text-center fade-in">
        <span className="h-20 w-20 rounded-full bg-mint text-primary-dark flex items-center justify-center"><CheckCircle2 size={40} aria-hidden /></span>
        <p className="mt-3 font-bold text-primary-dark">Sensor calibrated</p>
      </div>}
      </div>

      {step === 2 && failed && <div className="mt-4"><Callout tone="error" title="Calibration failed">The sensor moved during setup. Ask the patient to keep the joint completely still, then retry.</Callout></div>}

      {step === 1 && <button onClick={() => calibrate(true)} className="mt-6 w-full text-xs text-muted underline h-9">Demo: simulate calibration failure</button>}
    </FlowShell>
  )
}
