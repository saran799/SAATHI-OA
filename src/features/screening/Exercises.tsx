import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Repeat, Timer, Gauge, ShieldAlert } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, Card, Chip, cx } from '../../components/ui'
import { useScreeningPatient } from './useGuard'
import { useT } from '../../i18n'
import { InstructionPlayer, type SupportedLang } from '../../components/Voice'
import { exercisesFor } from '../../domain/guidance'
import type { RiskBand } from '../../domain/types'

const Illustration = ({ id }: { id: string }) => {
  const paths: Record<string, string> = {
    quad: 'M20 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 16v14l12 2M20 30l-6 14M14 44h22',
    heel: 'M6 40h44M12 34a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM16 32h14l8-8 6 16',
    bridge: 'M6 40h44M10 32a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM14 30l14-8 10 2 4 16',
    fist: 'M18 36V18M24 34V14M30 34V16M36 36V20M18 36c0 6 4 8 9 8s9-2 9-8',
    catcow: 'M14 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM14 16c0 10 6 16 16 20l8 8M14 16l-4 12 6 16',
    walk: 'M24 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM24 14v12l-8 16M24 26l8 6 4 12M20 20l10 2',
  }
  return <svg width="72" height="72" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={paths[id]} /></svg>
}

function ExerciseCard({ e, open, onToggle, language }: { e: any; open: boolean; onToggle: () => void; language: SupportedLang }) {
  const { t } = useT()
  // Voice steps - discrete, visible instruction text, NO patient name
  // Each exercise has its own spoken instruction sequence
  const voiceSteps = Array.isArray(e.steps) ? e.steps : [e.steps]

  return (
    <Card className="overflow-hidden">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-label={`${e.name} - ${open ? 'collapse' : 'expand'}`} className="w-full text-left p-4 flex gap-4 items-center min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none">
        <span className="h-20 w-20 shrink-0 rounded-[12px] bg-mint-soft text-primary flex items-center justify-center"><Illustration id={e.id} /></span>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold text-[16px] leading-snug break-words">{e.name}</span>
          <span className="flex flex-wrap gap-1.5 mt-2">
            <Chip icon={Repeat}>{e.reps}</Chip><Chip icon={Timer}>{e.duration}</Chip><Chip icon={Gauge} tone={e.difficulty === t('screening.exercises.easy') ? 'success' : 'warning'}>{e.difficulty}</Chip>
          </span>
        </span>
        <ChevronDown size={20} className={cx('text-secondary transition-transform shrink-0', open && 'rotate-180')} aria-hidden />
      </button>
      {open && <div className="px-4 pb-4 fade-in space-y-3">
        <ol className="space-y-2 list-decimal pl-5 text-[15px] break-words">{e.steps.map((s: string) => <li key={s}>{s}</li>)}</ol>
        <div className="mt-3 rounded-[12px] bg-error-tint text-error-text p-3 text-sm flex gap-2 break-words"><ShieldAlert size={18} className="shrink-0" aria-hidden /><span><span className="font-semibold">{t('screening.exercises.safety')}</span>{e.safety}</span></div>
        {/* Per-exercise voice player - simplified: Previous [Start/Stop] Next, auto-speak on navigation */}
        <InstructionPlayer steps={voiceSteps} language={language} contentId={`exercise-${e.id}`} title={e.name} />
      </div>}
    </Card>
  )
}

export default function Exercises() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const [open, setOpen] = useState<string | null>(null)
  const { t, lang } = useT()
  if (!patient || !session.result || !session.joint) return null

  const joint = session.joint
  const band = session.result.band as RiskBand

  const filtered = exercisesFor(joint, band)
  const effective = filtered.length > 0 ? filtered : exercisesFor(joint, 'low')
  const listIds = effective.map(e => e.id)

  const list = listIds.map(id => ({
    id,
    name: t(`screening.exercises.list.${id}.name`),
    reps: t(`screening.exercises.list.${id}.reps`),
    duration: t(`screening.exercises.list.${id}.duration`),
    difficulty: t(`screening.exercises.list.${id}.difficulty`),
    steps: t(`screening.exercises.list.${id}.steps`) as any,
    safety: t(`screening.exercises.list.${id}.safety`),
  }))

  const jointLabel = t(`screening.joint.joints.${joint}.label`)
  const bandLabel = t(`screening.result.riskMeta.${band}.label`)

  return (
    <FlowShell title={t('screening.exercises.title')} subtitle={t('screening.exercises.subtitle')} barTitle={t('screening.exercises.barTitle')} back="/screening/guidance"
      pill={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">{t('common.daily15')}</span>}
      footer={<Button full icon={FileText} onClick={() => nav(`/records/${session.recordId}`)}>{t('screening.exercises.viewReport')}</Button>}>
      <div className="mb-3 flex flex-wrap gap-2 items-center">
        <span className="text-[11px] text-secondary break-words">Joint: {jointLabel} · {bandLabel} · {list.length} exercises · Voice: step-by-step per exercise</span>
      </div>
      <div className="space-y-3">{list.map(e => <ExerciseCard key={e.id} e={e} open={open === e.id} onToggle={() => setOpen(open === e.id ? null : e.id)} language={lang as SupportedLang} />)}</div>
      <p className="text-xs text-secondary mt-4 break-words">{t('screening.exercises.generalNote')}</p>
    </FlowShell>
  )
}
