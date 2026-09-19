import { useNavigate } from 'react-router-dom'
import { Dumbbell, Accessibility, Apple, AlertTriangle, MessageSquare, Printer, Share2, Home, CheckCircle2, Cross, Users } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Avatar, Button, cx } from '../../components/ui'
import { useScreeningPatient } from './useGuard'
import { RISK_META } from '../../domain/risk'
import { useApp } from '../../store/appStore'
import { fmtDate } from '../../domain/copy'
import { useSession } from '../../store/sessionStore'
import { useT } from '../../i18n'
import { VoiceButton } from '../../components/Voice'

export default function Guidance() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const rec = useApp(s => s.records.find(r => r.id === session.recordId))
  const reset = useSession(s => s.reset)
  const { t } = useT()
  if (!patient || !session.result || !session.joint) return null
  const r = session.result; const m = RISK_META[r.band]
  const chip = { success: 'bg-mint text-primary-dark', warning: 'bg-info-tint text-info', error: 'bg-error-tint text-error-text' }[m.tone]
  const dot = { success: 'bg-primary', warning: 'bg-info', error: 'bg-error' }[m.tone]

  const jointLabel = (() => {
    const j = t(`screening.joint.joints.${session.joint}.label`)
    const s = t(`screening.joint.${session.side}`)
    return session.side === 'both' ? j : `${s} ${j.toLowerCase()}`
  })()

  const supporting = t(`screening.guidance.supporting.${r.band}`) as any
  const g = Array.isArray(supporting) ? supporting : [t('screening.guidance.lifestyle.title'), t('screening.guidance.weight.title'), t('screening.guidance.whenPHC.title')]

  const rows = [
    { icon: Dumbbell, t: t('screening.guidance.exercises.title'), b: t('screening.guidance.exercises.desc'), tag: t('screening.guidance.exercises.tag'), tagCls: 'bg-mint text-primary-dark', to: '/screening/exercises' },
    { icon: Accessibility, t: t('screening.guidance.lifestyle.title'), b: g[0], tag: t('screening.guidance.lifestyle.tag'), tagCls: 'bg-info-tint text-info' },
    { icon: Apple, t: t('screening.guidance.weight.title'), b: g[1] ?? t('screening.guidance.weight.title'), tag: t('screening.guidance.weight.tag'), tagCls: 'bg-tint text-ink' },
    { icon: AlertTriangle, t: t('screening.guidance.whenPHC.title'), b: g[g.length - 1], tag: t('screening.guidance.whenPHC.tag'), tagCls: 'bg-error-tint text-error-text' },
  ]

  const voiceText = `${t('screening.guidance.personalised')}. ${t(`screening.result.riskMeta.${r.band}.label`)}. ${t(`screening.result.riskMeta.${r.band}.action`)}. ${g.join(' ')}`

  return (
    <FlowShell title="" barTitle={t('screening.guidance.barTitle')} back="/screening/result"
      pill={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center gap-1.5"><CheckCircle2 size={13} aria-hidden />{t('screening.guidance.ready')}</span>}
      footer={<div className="space-y-2">
        <Button full icon={Share2} onClick={async () => { const text = `SAATHI screening — ${patient.name}: ${t(`screening.result.riskMeta.${r.band}.label`)}. ${t(`screening.result.riskMeta.${r.band}.action`)} (${t('common.disclaimerShort')})`; if (navigator.share) { try { await navigator.share({ title: 'SAATHI guidance', text }) } catch { } } else { await navigator.clipboard?.writeText(text); alert('Summary copied to clipboard.') } }}>{t('screening.guidance.share')}</Button>
        <Button full variant="secondary" size="md" icon={Home} onClick={() => { reset(); nav('/dashboard') }}>{t('screening.guidance.backHome')}</Button>
      </div>}>
      <div className="-mt-6 rounded-[14px] bg-tint p-3 flex items-center gap-3">
        <Avatar name={patient.name} size={44} />
        <div className="flex-1 min-w-0"><p className="text-[15px] font-bold truncate break-words">{patient.name} <span className="font-medium text-secondary">{patient.age}{patient.sex[0]}</span></p><p className="text-[12px] text-secondary truncate break-words">ID: {patient.id} · {jointLabel}</p></div>
        <span className={cx('h-7 px-2.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 shrink-0 break-words', chip)}><span className={cx('h-1.5 w-1.5 rounded-full', dot)} aria-hidden />{t(`screening.result.riskMeta.${r.band}.short`)} risk</span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div><h1 className="text-[23px] font-bold tracking-tight leading-tight break-words">{t('screening.guidance.personalised')}</h1><p className="text-[14px] text-secondary mt-1 leading-snug break-words">{t('screening.guidance.actionable', { band: t(`screening.result.riskMeta.${r.band}.label`).toLowerCase() })}</p></div>
        <span className="h-11 w-11 rounded-full bg-tint text-primary flex items-center justify-center shrink-0" aria-hidden><Cross size={20} /></span>
      </div>

      <div className="mt-3">
        <VoiceButton text={voiceText} />
      </div>

      <div className="card mt-4 p-3 flex gap-3">
        <span className="h-[76px] w-[76px] rounded-[12px] bg-mint-soft flex items-center justify-center shrink-0 text-primary" aria-hidden><Users size={34} /></span>
        <div className="min-w-0"><p className="text-[11px] font-bold tracking-wider text-primary uppercase inline-flex items-center gap-1 break-words"><CheckCircle2 size={12} aria-hidden />{t('screening.guidance.targetJoint', { joint: jointLabel })}</p><p className="text-[15px] font-bold mt-0.5 leading-snug break-words">{t('screening.guidance.recommendedAction')}</p><p className="text-[13px] text-secondary leading-snug mt-0.5 break-words">{t(`screening.result.riskMeta.${r.band}.action`)}</p></div>
      </div>

      <div className="mt-3 space-y-3">
        {rows.map(row => (
          <button key={row.t} type="button" onClick={() => row.to ? nav(row.to) : undefined} className={cx('w-full card p-3 flex items-start gap-3 text-left', row.to && 'hover:bg-tint/40 transition-colors')}>
            <span className="h-12 w-12 rounded-[12px] bg-tint text-primary flex items-center justify-center shrink-0" aria-hidden><row.icon size={22} /></span>
            <span className="flex-1 min-w-0"><span className="flex items-start gap-2"><span className="text-[16px] font-bold leading-tight break-words">{row.t}</span><span className={cx('ml-auto mt-0.5 h-6 px-2 rounded-full text-[11px] font-semibold whitespace-nowrap inline-flex items-center shrink-0 break-words', row.tagCls)}>{row.tag}</span></span><span className="block text-[13px] text-secondary mt-1 leading-snug break-words">{row.b}</span></span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-[16px] bg-primary text-white p-4 flex gap-3">
        <span className="h-9 w-9 rounded-full bg-primary-mid flex items-center justify-center shrink-0" aria-hidden><MessageSquare size={18} /></span>
        <div><p className="text-[11px] font-bold tracking-wider uppercase text-white/90 break-words">{t('screening.guidance.chwNoteTitle')}</p><p className="text-[14px] mt-1 leading-snug break-words">{t('screening.guidance.chwNoteBody', { name: patient.name.split(' ')[0] })}</p></div>
      </div>

      <div className="card mt-4 p-3">
        <p className="text-[11px] font-bold tracking-wider text-secondary uppercase mb-2 break-words">{t('screening.guidance.followUp')}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 rounded-[12px] bg-mint text-primary-dark px-3 flex items-center gap-2 text-[13px] font-bold break-words"><CheckCircle2 size={16} aria-hidden />{rec ? fmtDate(rec.followUpDate) : `${m.followUpDays} days`}</div>
          <button type="button" onClick={() => nav(`/records/${session.recordId}`)} className="h-12 rounded-[12px] bg-tint text-ink px-3 flex items-center gap-2 text-[13px] font-bold break-words"><Printer size={16} aria-hidden />{t('screening.guidance.print')}</button>
        </div>
      </div>
    </FlowShell>
  )
}
