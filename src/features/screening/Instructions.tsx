import { useNavigate } from 'react-router-dom'
import { ArrowRight, Timer, User, Footprints, Hand, ShieldCheck } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, cx } from '../../components/ui'
import { useScreeningPatient, TOTAL_STEPS } from './useGuard'
import { JOINT_LABEL } from '../../domain/copy'

const MOVES: Record<string, string> = {
  knee: 'sit on a chair and slowly straighten and bend the knee, 5 times',
  hip: 'stand holding a chair and slowly lift the knee towards the chest, 5 times',
  hand: 'open the hand wide and slowly close it into a fist, 5 times',
  spine: 'sit upright and slowly bend forward then return, 5 times',
}

export default function Instructions() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  if (!patient || !session.joint) return null
  const joint = JOINT_LABEL[session.joint].toLowerCase()
  const steps = [
    { icon: Hand, t: 'Attach the strap as shown', b: `Strap the small sensor just below the ${joint} on the ${session.side === 'both' ? 'more painful' : session.side} side, with the light facing forward.` },
    { icon: Footprints, t: session.joint === 'hand' ? 'Seat the patient at a table' : 'Seat the patient on a firm chair', b: session.joint === 'hand' ? 'Forearm resting flat on the table, clear space around.' : 'Or standing next to one for support. Clear space around them.' },
    { icon: User, t: 'Explain the movement', b: `Ask ${patient.name} to ${MOVES[session.joint]}. Move slowly and stop if there is sharp pain.` },
  ]
  const tabs = [['1. Wear', 'Strap'], ['2. Calib', 'Stand'], ['3. Test', 'Flex'], ['4. Done', 'Report']]

  return (
    <FlowShell title="" step={3} total={TOTAL_STEPS} stepLabel="Placement" barTitle="Movement Assessment" back="/screening/questions"
      pill={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">Triage active</span>}
      footer={<div>
        <Button full onClick={() => nav('/screening/sensor')}>Start Assessment <ArrowRight size={18} aria-hidden /></Button>
        <button type="button" onClick={() => { session.setMovement(null, true); nav('/screening/analysis') }} className="w-full h-10 mt-1 text-[13px] font-semibold text-secondary">Patient cannot do the movement — skip this step</button>
      </div>}>
      <div className="-mt-6 flex items-start justify-between gap-3">
        <div><h1 className="text-[22px] font-bold tracking-tight leading-tight">{JOINT_LABEL[session.joint]} Assessment — Instructions</h1><p className="text-[14px] text-secondary mt-1">Follow placement guidelines before sensor setup</p></div>
        <span className="h-9 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 mt-1"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden />Pair ready</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2" aria-label="Assessment stages">
        {tabs.map(([a, b], i) => <div key={a} className={cx('rounded-[12px] px-2 py-2.5 text-center', i === 0 ? 'bg-primary text-white' : 'bg-tint text-secondary')}><p className="text-[12px] font-bold whitespace-nowrap">{a}</p><p className={cx('text-[11px]', i === 0 ? 'text-white/85' : '')}>{b}</p></div>)}
      </div>

      <div className="card mt-4 p-4">
        <div className="flex items-center gap-2 flex-wrap"><span className="h-7 px-2.5 rounded-full bg-tint text-primary text-[11px] font-bold inline-flex items-center">Placement guide</span><span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-bold inline-flex items-center">Sensor: {session.side === 'both' ? 'more painful side' : session.side}</span></div>
        <div className="mt-3 rounded-[14px] bg-tint p-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="space-y-3">
            <div className="card rounded-[10px] p-2.5"><p className="text-[12px] font-bold flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden />Upper strap</p><p className="text-[11px] text-secondary">Above the {joint}</p></div>
            <div className="card rounded-[10px] p-2.5"><p className="text-[12px] font-bold flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden />Lower strap</p><p className="text-[11px] text-secondary">Below the {joint}</p></div>
          </div>
          <svg width="56" height="150" viewBox="0 0 56 150" fill="none" aria-hidden>
            <path d="M22 4c-4 30-4 60 0 70s6 40 0 72" stroke="#B9C7D6" strokeWidth="14" strokeLinecap="round" /><path d="M34 4c4 30 4 60 0 70s-6 40 0 72" stroke="#B9C7D6" strokeWidth="14" strokeLinecap="round" />
            <rect x="12" y="30" width="32" height="24" rx="6" fill="#00685F" /><rect x="12" y="98" width="32" height="24" rx="6" fill="#00685F" />
            <circle cx="28" cy="75" r="8" stroke="#00685F" strokeWidth="3" strokeDasharray="4 3" />
          </svg>
          <div className="card rounded-[10px] p-2.5"><p className="text-[12px] font-bold">{JOINT_LABEL[session.joint]} centre</p><p className="text-[11px] text-secondary">Joint line</p></div>
        </div>
      </div>

      <div className="card mt-4 divide-y divide-tint">
        {steps.map((s, i) => (
          <div key={s.t} className="p-4 flex gap-3">
            <span className={cx('h-8 w-8 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0', i === 0 ? 'bg-mint text-primary-dark' : 'bg-tint text-ink')} aria-hidden>{i + 1}</span>
            <div className="flex-1 min-w-0"><p className="text-[15px] font-bold leading-snug">{s.t}</p><p className="text-[13px] text-secondary mt-0.5 leading-snug">{s.b}</p></div>
            <s.icon size={18} className="text-primary shrink-0 mt-1" aria-hidden />
          </div>
        ))}
        <div className="px-4 py-2.5 flex items-center gap-2 text-[12px] font-semibold text-primary-dark bg-mint-soft rounded-b-[16px]"><ShieldCheck size={14} aria-hidden />Next: the app connects to the sensor, then records about 30 seconds of movement.<span className="ml-auto h-2 w-2 rounded-full bg-primary" aria-hidden /></div>
      </div>

      <p className="mt-3 text-center text-[12px] text-secondary font-medium inline-flex w-full items-center justify-center gap-1.5"><Timer size={13} aria-hidden />Sensor setup takes about 3 seconds of quiet standing</p>
    </FlowShell>
  )
}
