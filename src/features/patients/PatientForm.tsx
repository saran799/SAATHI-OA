import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Field, Input, Select, Segmented, IconTile, cx } from '../../components/ui'
import { ClipboardList, ArrowRight, Zap, History, Check, X } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { useApp } from '../../store/appStore'
import type { Patient, Sex } from '../../domain/types'
import { uid } from '../../domain/copy'

const STEPS = ['Identity', 'Location', 'Health']

export default function PatientForm() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const addPatient = useApp(s => s.addPatient)
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ name: sp.get('name') ?? '', age: '', sex: 'Female' as Sex, phone: '', village: '', phc: '', healthId: '', heightCm: '', weightKg: '', occupation: 'Farm work', priorInjury: false, familyHistory: false })
  const [err, setErr] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof f, v: string | boolean) => setF(s => ({ ...s, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (f.name.trim().length < 2) e.name = 'Enter the patient’s full name.'
      const age = Number(f.age); if (!f.age || age < 1 || age > 120) e.age = 'Enter an age between 1 and 120.'
      if (f.phone && !/^\d{10}$/.test(f.phone.replace(/\s/g, ''))) e.phone = 'Enter a 10-digit mobile number.'
    }
    if (step === 1) { if (!f.village.trim()) e.village = 'Enter the village or area.' }
    if (step === 2) {
      if (f.heightCm && (Number(f.heightCm) < 80 || Number(f.heightCm) > 230)) e.heightCm = 'Height should be 80–230 cm.'
      if (f.weightKg && (Number(f.weightKg) < 20 || Number(f.weightKg) > 250)) e.weightKg = 'Weight should be 20–250 kg.'
    }
    setErr(e); return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validate()) return
    if (step < 2) { setStep(step + 1); window.scrollTo(0, 0); return }
    setSaving(true)
    const p: Patient = { id: uid('P'), name: f.name.trim(), age: Number(f.age), sex: f.sex, phone: f.phone.trim(), village: f.village.trim(), phc: f.phc.trim() || `${f.village.trim()} PHC`, healthId: f.healthId.trim() || undefined,
      heightCm: f.heightCm ? Number(f.heightCm) : undefined, weightKg: f.weightKg ? Number(f.weightKg) : undefined, occupation: f.occupation, priorInjury: f.priorInjury, familyHistory: f.familyHistory, createdAt: new Date().toISOString() }
    setTimeout(() => { addPatient(p); nav(`/patients/${p.id}`, { replace: true }) }, 500)
  }

  return (
    <FlowShell title="" step={step + 1} total={3} stepLabel={['Demographics & Intake', 'Location', 'Health background'][step]} back="/patients"
      onBack={step > 0 ? () => setStep(step - 1) : undefined}
      footer={<div><Button full onClick={next} loading={saving}>{step < 2 ? `Next: ${STEPS[step + 1]}` : 'Save patient'} <ArrowRight size={18} aria-hidden /></Button><p className="text-center text-[11px] text-secondary mt-2 font-medium">Stored locally on this device</p></div>}>
      <div className="-mt-6 mb-5 rounded-[14px] bg-tint p-3 flex items-center gap-3">
        <IconTile icon={ClipboardList} tone="mint" size={40} iconSize={20} />
        <div className="flex-1 min-w-0"><p className="text-[14px] font-bold">Frontline Triage Intake</p><p className="text-[12px] text-secondary">New patient · will get an ID on save</p></div>
        <span className="h-7 px-2.5 rounded-full bg-surface text-primary text-[11px] font-bold inline-flex items-center gap-1"><Zap size={12} aria-hidden />Ready</span>
      </div>
      <form className="space-y-5" onSubmit={e => { e.preventDefault(); next() }} noValidate>
        {step === 0 && <>
          <Field label="Full Name" error={err.name} htmlFor="name"><Input id="name" value={f.name} onChange={e => set('name', e.target.value)} autoFocus error={!!err.name} placeholder="e.g. Ramesh Kumar" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Age (Yrs)" error={err.age} htmlFor="age"><Input id="age" inputMode="numeric" value={f.age} onChange={e => set('age', e.target.value.replace(/\D/g, '').slice(0, 3))} error={!!err.age} /></Field>
            <Field label="Mobile number" optional error={err.phone} htmlFor="phone"><Input id="phone" inputMode="tel" value={f.phone} onChange={e => set('phone', e.target.value)} error={!!err.phone} placeholder="98765 43210" /></Field>
          </div>
          <Field label="Gender"><Segmented label="Gender" options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} value={f.sex} onChange={v => set('sex', v)} /></Field>
        </>}
        {step === 1 && <>
          <Field label="Village / Area" error={err.village} htmlFor="village"><Input id="village" value={f.village} onChange={e => set('village', e.target.value)} autoFocus error={!!err.village} placeholder="e.g. Rampur, Sector 4" /></Field>
          <Field label="Nearest PHC" optional htmlFor="phc"><Input id="phc" value={f.phc} onChange={e => set('phc', e.target.value)} /></Field>
          <Field label="ABHA / Health ID" optional helper="14-digit number if available" htmlFor="hid"><Input id="hid" inputMode="numeric" value={f.healthId} onChange={e => set('healthId', e.target.value)} /></Field>
        </>}
        {step === 2 && <>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Height (cm)" optional error={err.heightCm} htmlFor="h"><Input id="h" inputMode="numeric" value={f.heightCm} onChange={e => set('heightCm', e.target.value.replace(/\D/g, ''))} error={!!err.heightCm} /></Field>
            <Field label="Weight (kg)" optional error={err.weightKg} htmlFor="w"><Input id="w" inputMode="decimal" value={f.weightKg} onChange={e => set('weightKg', e.target.value.replace(/[^\d.]/g, ''))} error={!!err.weightKg} /></Field>
          </div>
          <Field label="Occupation & Physical Load" helper="Helps understand joint load" htmlFor="occ">
            <Select id="occ" value={f.occupation} onChange={e => set('occupation', e.target.value)}>
              {['Farm work', 'Construction', 'Household work', 'Shop / desk work', 'Weaving / craft', 'Retired', 'Other'].map(o => <option key={o}>{o}</option>)}
            </Select>
          </Field>
          <YesNo label="Previous Joint Issues" hint="Self-reported" value={f.priorInjury} onChange={v => set('priorInjury', v)} />
          <YesNo label="Family history of joint problems" hint="Parents / siblings" value={f.familyHistory} onChange={v => set('familyHistory', v)} />
        </>}
      </form>
    </FlowShell>
  )
}

function YesNo({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="rounded-[16px] bg-tint p-3">
      <div className="flex items-center justify-between mb-2.5"><span className="inline-flex items-center gap-2 text-[15px] font-bold"><History size={16} className="text-primary" aria-hidden />{label}</span><span className="text-[12px] text-secondary font-medium">{hint}</span></div>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-1 p-1 bg-surface rounded-[14px]">
        {[true, false].map(v => (
          <button key={String(v)} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
            className={cx('h-11 rounded-[11px] text-[15px] font-semibold inline-flex items-center justify-center gap-1.5', value === v ? 'bg-primary text-white' : 'text-ink')}>
            {v ? <Check size={16} aria-hidden /> : <X size={16} aria-hidden />}{v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}
