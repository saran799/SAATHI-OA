import { useNavigate, useParams } from 'react-router-dom'
import { Activity, ChevronRight, FileText, Phone, MapPin } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Avatar, Button, Card, Chip, Row, SectionTitle } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { useSession } from '../../store/sessionStore'
import { RISK_META } from '../../domain/risk'
import { fmtDate } from '../../domain/copy'
import { useT } from '../../i18n'

export default function PatientProfile() {
  const { id } = useParams()
  const nav = useNavigate()
  const { patients, records } = useApp()
  const start = useSession(s => s.start)
  const { t } = useT()
  const p = patients.find(x => x.id === id)
  if (!p) return <FlowShell title={t('patients.profile.notFound')} back="/patients"><p className="text-secondary break-words">{t('patients.profile.notExist')}</p><Button className="mt-4" onClick={() => nav('/patients')}>{t('patients.profile.backToPatients')}</Button></FlowShell>
  const hist = records.filter(r => r.patientId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const bmi = p.heightCm && p.weightKg ? (p.weightKg / Math.pow(p.heightCm / 100, 2)).toFixed(1) : null

  const jointLabel = (joint: string, side: string) => {
    const j = t(`screening.joint.joints.${joint}.label`)
    const s = t(`screening.joint.${side}`)
    return side === 'both' ? j : `${s} ${j.toLowerCase()}`
  }

  return (
    <FlowShell title={t('patients.profile.title')} barTitle={t('patients.search.title')} back="/patients"
      footer={<Button full icon={Activity} onClick={() => { start(p.id); nav('/screening/joint') }}>{t('patients.profile.startScreening')}</Button>}>
      <Card className="p-4 flex items-center gap-4">
        <Avatar name={p.name} size={56} />
        <div className="min-w-0">
          <p className="text-lg font-semibold leading-tight break-words">{p.name}</p>
          <p className="text-sm text-secondary mt-0.5 break-words">{p.age} years · {p.sex} · ID {p.id}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[13px] text-secondary">
            <span className="inline-flex items-center gap-1 break-words"><MapPin size={14} aria-hidden />{p.village}</span>
            {p.phone && <span className="inline-flex items-center gap-1 break-words"><Phone size={14} aria-hidden />{p.phone}</span>}
          </div>
        </div>
      </Card>

      <div className="mt-6"><SectionTitle>{t('patients.profile.healthBg')}</SectionTitle>
        <Card className="px-4 py-1.5">
          <Row label={t('patients.profile.phc')} value={p.phc} />
          {bmi && <Row label={t('patients.profile.heightWeight')} value={`${p.heightCm} cm · ${p.weightKg} kg (${t('patients.profile.bmi', { bmi })})`} />}
          <Row label={t('patients.profile.occupation')} value={p.occupation} />
          <Row label={t('patients.profile.prevInjury')} value={p.priorInjury ? t('common.yes') : t('common.no')} />
          <Row label={t('patients.profile.familyHistory')} value={p.familyHistory ? t('common.yes') : t('common.no')} />
          {p.healthId && <Row label={t('patients.profile.healthId')} value={p.healthId} />}
        </Card>
      </div>

      <div className="mt-6"><SectionTitle>{t('patients.profile.screeningHistory')}</SectionTitle>
        {hist.length === 0 ? <Card className="p-4 text-sm text-secondary break-words">{t('patients.profile.noScreenings')}</Card> : (
          <div className="space-y-2.5">{hist.map(r => (
            <Card key={r.id} className="p-3.5 flex items-center gap-3" onClick={() => nav(`/records/${r.id}`)}>
              <span className="h-10 w-10 rounded-[10px] bg-tint flex items-center justify-center text-primary"><FileText size={18} aria-hidden /></span>
              <div className="flex-1 min-w-0"><p className="font-medium text-[15px] break-words">{jointLabel(r.joint, r.side)}</p><p className="text-[13px] text-secondary break-words">{fmtDate(r.createdAt)} · Follow-up {fmtDate(r.followUpDate)}</p></div>
              <Chip tone={RISK_META[r.result.band].tone} dot>{t(`screening.result.riskMeta.${r.result.band}.short`)}</Chip>
              <ChevronRight size={18} className="text-secondary shrink-0" aria-hidden />
            </Card>))}</div>
        )}
      </div>
    </FlowShell>
  )
}
