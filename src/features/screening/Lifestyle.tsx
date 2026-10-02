import { useNavigate } from 'react-router-dom'
import { FileText, Accessibility } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, Card } from '../../components/ui'
import { useScreeningPatient } from './useGuard'
import { useT } from '../../i18n'
import { SUPPORTING_GUIDANCE } from '../../domain/guidance'

export default function Lifestyle() {
  const nav = useNavigate()
  const { t } = useT()
  const { patient, session } = useScreeningPatient(true)
  if (!patient || !session.result || !session.joint) return null
  
  const g = SUPPORTING_GUIDANCE(t)[session.result.band]

  return (
    <FlowShell title={t('screening.guidance.lifestyleCare')} subtitle={t('screening.guidance.essential')} barTitle={t('screening.guidance.lifestyleCare')} back="/screening/guidance"
      footer={<Button full icon={FileText} onClick={() => nav(`/records/${session.recordId}`)}>{t('screening.exercises.viewReport', { defaultValue: 'View Screening Report' })}</Button>}>
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-[16px] bg-info-tint text-info flex items-center justify-center shrink-0">
            <Accessibility size={28} />
          </div>
          <div>
            <h2 className="text-[18px] font-bold leading-snug">{t('screening.guidance.lifestyleCare')}</h2>
            <p className="text-[14px] text-secondary mt-1">{t('screening.guidance.essential')}</p>
          </div>
        </div>
        <div className="mt-2 text-[15px] leading-relaxed text-ink font-medium">
          {g[0]}
        </div>
      </Card>
    </FlowShell>
  )
}
