import { useNavigate, useParams } from 'react-router-dom'
import { Activity, ChevronRight, FileText, Phone, MapPin, Check, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Avatar, Button, Card, Chip, Row, SectionTitle, cx } from '../../components/ui'
import { useApp } from '../../store/appStore'
import { useSession } from '../../store/sessionStore'
import { RISK_META } from '../../domain/risk'
import { fmtDate, jointName, OCCUPATIONS } from '../../domain/copy'
import { useT } from '../../i18n'

export default function PatientProfile() {
  const { id } = useParams()
  const nav = useNavigate()
  const { t, tArray } = useT()
  const { patients, records } = useApp()
  const start = useSession(s => s.start)
  const p = patients.find(x => x.id === id)
  if (!p) return <FlowShell title={t('patients.profile.notFound')} back="/patients"><p className="text-secondary">{t('patients.profile.notExist')}</p><Button className="mt-4" onClick={() => nav('/patients')}>{t('patients.profile.backToPatients')}</Button></FlowShell>
  const hist = records.filter(r => r.patientId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const bmi = p.heightCm && p.weightKg ? (p.weightKg / Math.pow(p.heightCm / 100, 2)).toFixed(1) : null
  const occIdx = OCCUPATIONS.indexOf(p.occupation)
  const occTranslated = occIdx >= 0 ? tArray('patients.form.occupations')[occIdx] : p.occupation

  const getPhcColors = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash % 40) + 150; // Emerald/teal range
    return { bg: `hsl(${hue}, 70%, 94%)`, text: `hsl(${hue}, 90%, 25%)` };
  };
  const phcColors = getPhcColors(p.phc);

  const groupedHist: Record<string, typeof hist> = {};
  hist.forEach(r => {
    const key = `${r.joint}-${r.side}`;
    if (!groupedHist[key]) groupedHist[key] = [];
    groupedHist[key].push(r);
  });

  const getProgress = (records: typeof hist) => {
    if (records.length < 2) return null;
    const latest = records[0];
    const previous = records[1];
    
    const latestScore = latest.movement?.performed ? latest.movement.rangeOfMotionDeg : null;
    const prevScore = previous.movement?.performed ? previous.movement.rangeOfMotionDeg : null;
    
    if (latestScore && prevScore) {
      const diff = latestScore - prevScore;
      if (diff >= 5) return { text: `Improved ROM by ${diff}°`, positive: true, icon: TrendingUp };
      if (diff <= -5) return { text: `Decreased ROM by ${Math.abs(diff)}°`, positive: false, icon: TrendingDown };
      return { text: 'Stable range of motion', positive: true, icon: Minus };
    }
    
    const riskScores = { low: 1, moderate: 2, higher: 3 };
    const latestRisk = riskScores[latest.result.band];
    const prevRisk = riskScores[previous.result.band];
    if (latestRisk < prevRisk) return { text: 'Risk level decreased', positive: true, icon: TrendingUp };
    if (latestRisk > prevRisk) return { text: 'Risk level increased', positive: false, icon: TrendingDown };
    return { text: 'Stable condition', positive: true, icon: Minus };
  };

  return (
    <FlowShell title={t('patients.profile.title')} barTitle={t('patients.search.title')} back="/patients"
      footer={<Button full icon={Activity} onClick={() => { start(p.id); nav('/screening/joint') }}>{t('patients.profile.startScreening')}</Button>}>
      <Card className="p-4 flex items-center gap-4">
        <Avatar name={p.name} size={56} />
        <div className="min-w-0">
          <p className="text-lg font-semibold leading-tight break-words">{p.name}</p>
          <p className="text-sm text-secondary mt-0.5">{p.age} {t('patients.form.years') || 'years'} · {t(`patients.form.gender${p.sex}`) || p.sex} · {t('common.id') || 'ID'} {p.id}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[13px] text-secondary">
            <span className="inline-flex items-center gap-1"><MapPin size={14} aria-hidden />{p.village}</span>
            {p.phone && <span className="inline-flex items-center gap-1"><Phone size={14} aria-hidden />{p.phone}</span>}
          </div>
        </div>
      </Card>

      <div className="mt-6"><SectionTitle>{t('patients.profile.healthBg')}</SectionTitle>
        <Card className="px-4 py-1.5">
          <Row label={t('patients.profile.phc')} value={<span className="px-2.5 py-0.5 rounded-md font-bold text-[13px]" style={{ backgroundColor: phcColors.bg, color: phcColors.text }}>{p.phc}</span>} />
          {bmi && <Row label={t('patients.profile.heightWeight')} value={`${p.heightCm} cm · ${p.weightKg} kg (${t('patients.profile.bmi', { bmi })})`} />}
          <Row label={t('patients.profile.occupation')} value={occTranslated || p.occupation} />
          <Row label={t('patients.profile.prevInjury')} value={p.priorInjury ? <Check size={20} className="text-primary" /> : <span className="text-secondary">—</span>} />
          <Row label={t('patients.profile.familyHistory')} value={p.familyHistory ? <Check size={20} className="text-primary" /> : <span className="text-secondary">—</span>} />
          {p.healthId && <Row label={t('patients.profile.healthId')} value={p.healthId} />}
        </Card>
      </div>

      <div className="mt-6"><SectionTitle>Progress & Improvements</SectionTitle>
        {Object.entries(groupedHist).filter(([_, records]) => records.length >= 2).length === 0 ? (
          <Card className="p-4 text-sm text-secondary">Not enough data to show progress. Complete more screenings.</Card>
        ) : (
          <div className="space-y-2.5">
            {Object.entries(groupedHist)
              .filter(([_, records]) => records.length >= 2)
              .map(([key, records]) => {
                const prog = getProgress(records);
                if (!prog) return null;
                const Icon = prog.icon;
                return (
                  <Card key={key} className="p-3.5 flex items-center gap-3">
                    <span className={cx("h-10 w-10 rounded-[10px] flex items-center justify-center", prog.positive ? "bg-mint text-primary-dark" : "bg-error-tint text-error-text")}>
                      <Icon size={20} aria-hidden />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[15px]">{jointName(records[0].joint, records[0].side, t)}</p>
                      <p className={cx("text-[13px] font-medium", prog.positive ? "text-primary" : "text-error-text")}>{prog.text}</p>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      <div className="mt-6"><SectionTitle>{t('patients.profile.screeningHistory')}</SectionTitle>
        {hist.length === 0 ? <Card className="p-4 text-sm text-secondary">{t('patients.profile.noScreenings')}</Card> : (
          <div className="space-y-2.5">{hist.map(r => (
            <Card key={r.id} className="p-3.5 flex items-center gap-3" onClick={() => nav(`/records/${r.id}`)}>
              <span className="h-10 w-10 rounded-[10px] bg-tint flex items-center justify-center text-primary"><FileText size={18} aria-hidden /></span>
              <div className="flex-1 min-w-0"><p className="font-medium text-[15px]">{jointName(r.joint, r.side, t)}</p><p className="text-[13px] text-secondary">{fmtDate(r.createdAt)} · {t('screening.guidance.followUp')} {fmtDate(r.followUpDate)}</p></div>
              <Chip tone={RISK_META[r.result.band].tone} dot>{t(`screening.result.riskMeta.${r.result.band}.short`)}</Chip>
              <ChevronRight size={18} className="text-secondary" aria-hidden />
            </Card>))}</div>
        )}
      </div>
    </FlowShell>
  )
}
