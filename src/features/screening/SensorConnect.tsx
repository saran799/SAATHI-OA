import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bluetooth, Radio, ArrowRight, RefreshCw, Info, CheckCircle2, BatteryMedium, SignalHigh, Plus } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, Callout, cx } from '../../components/ui'
import { sensor, type SensorState } from '../../services/sensor'
import { useScreeningPatient, TOTAL_STEPS } from './useGuard'
import { useT } from '../../i18n'

export default function SensorConnect() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const { t } = useT()
  const [state, setState] = useState<SensorState>('disconnected')
  const cancel = useRef<() => void>(null)
  const connect = () => { cancel.current?.(); cancel.current = sensor.connect(setState) }
  const simulateFailure = () => { cancel.current?.(); cancel.current = sensor.connect(setState, { fail: true }) }
  useEffect(() => { connect(); return () => cancel.current?.() }, []) // eslint-disable-line
  if (!patient || !session.joint) return null

  const jointLabel = t(`screening.joint.joints.${session.joint}.label`)
  const sideLabel = t(`screening.joint.${session.side}`)

  const UI: Record<SensorState, { label: string; help: string; tone: string }> = {
    disconnected: { label: t('screening.sensor.states.disconnected'), help: t('screening.sensor.helps.disconnected'), tone: 'bg-tint text-secondary' },
    connecting: { label: t('screening.sensor.states.connecting'), help: t('screening.sensor.helps.connecting'), tone: 'bg-info-tint text-info' },
    connected: { label: t('screening.sensor.states.connected'), help: t('screening.sensor.helps.connected'), tone: 'bg-primary-light text-primary' },
    ready: { label: t('screening.sensor.states.ready'), help: t('screening.sensor.helps.ready'), tone: 'bg-mint text-primary-dark' },
    calibrating: { label: t('screening.sensor.states.calibrating'), help: '', tone: '' },
    calibrated: { label: t('screening.sensor.states.calibrated'), help: '', tone: '' },
    error: { label: t('screening.sensor.states.error'), help: t('screening.sensor.helps.error'), tone: 'bg-error-tint text-error-text' },
  }

  const u = UI[state]
  const busy = state === 'connecting' || state === 'connected'
  const ready = state === 'ready'

  return (
    <FlowShell title="" step={4} total={TOTAL_STEPS} stepLabel={ready ? t('common.paired') : busy ? t('common.pairing') : t('screening.sensor.title')} back="/screening/instructions"
      footer={ready ? <Button full onClick={() => nav('/screening/calibration')}>{t('screening.sensor.nextSetup')} <ArrowRight size={18} aria-hidden /></Button>
        : state === 'error' ? <div className="space-y-2"><Button full onClick={connect}><RefreshCw size={18} aria-hidden />{t('screening.sensor.retry')}</Button><button className="w-full h-11 text-[14px] font-semibold text-primary break-words" onClick={() => { session.setMovement(null, true); nav('/screening/analysis') }}>{t('screening.sensor.continueWithout')}</button></div>
        : <Button full loading={busy} onClick={connect} disabled={busy}>{busy ? t('screening.sensor.connectingBtn') : t('screening.sensor.connect')}</Button>}>
      <div className="-mt-6 flex items-start justify-between gap-3">
        <div><h1 className="text-[22px] font-bold tracking-tight flex items-center gap-2 break-words"><Radio size={22} className="text-primary" aria-hidden />{t('screening.sensor.title')}</h1><p className="text-[14px] text-secondary mt-1 leading-snug break-words">{t('screening.sensor.subtitle')}</p></div>
        <span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-bold whitespace-nowrap shrink-0 inline-flex items-center mt-1">{t('common.simulated')}</span>
      </div>

      <div className="card mt-4 p-6 flex flex-col items-center">
        <div className="relative h-[200px] w-[200px] flex items-center justify-center" aria-hidden>
          <span className={cx('absolute inset-0 rounded-full', ready ? 'bg-mint-soft' : 'bg-tint', busy && 'halo')} />
          <span className={cx('absolute inset-[26px] rounded-full', ready ? 'bg-primary-light' : 'bg-tint-2/70')} />
          <span className="absolute top-[14px] left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-primary" />
          <span className={cx('relative h-[92px] w-[92px] rounded-full flex items-center justify-center text-white', state === 'error' ? 'bg-error' : 'bg-primary')}><Bluetooth size={38} className={cx(busy && 'pulse-dot')} /></span>
        </div>
        <span className={cx('mt-5 h-9 px-4 rounded-full inline-flex items-center gap-2 text-[14px] font-bold break-words', u.tone)} aria-live="polite">
          <span className={cx('h-2 w-2 rounded-full', state === 'error' ? 'bg-error' : 'bg-primary')} />{ready ? t('screening.sensor.readyPill') : u.label}
        </span>
        <p className="text-[13px] text-secondary mt-2 text-center break-words">{u.help}</p>
      </div>

      <div className="card mt-4 p-4">
        <div className="flex items-start gap-3">
          <span className="h-12 w-12 rounded-[12px] bg-mint text-primary-dark flex items-center justify-center shrink-0" aria-hidden><Plus size={24} /></span>
          <div className="flex-1 min-w-0"><p className="text-[18px] font-bold leading-tight truncate break-words">{t('screening.sensor.deviceTitle', { joint: jointLabel })} — {sideLabel}</p><p className="text-[12px] text-secondary mt-0.5 break-words">{t('screening.sensor.id', { id: 'SIM-8842' })} · {ready ? t('screening.sensor.found') : busy ? t('screening.sensor.searching') : state === 'error' ? t('screening.sensor.none') : t('screening.sensor.idle')}</p></div>
          <span className="h-7 px-2.5 rounded-full bg-tint text-primary text-[11px] font-bold inline-flex items-center gap-1 shrink-0"><CheckCircle2 size={12} aria-hidden />{t('common.demo')}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-[12px] bg-tint p-3"><div className="flex items-center justify-between text-[12px] font-semibold break-words"><span>{t('screening.sensor.signal')}</span><SignalHigh size={16} className="text-primary" aria-hidden /></div><p className="text-[18px] font-bold mt-1 break-words">{ready ? t('screening.sensor.strong') : busy ? t('screening.sensor.searching') : state === 'error' ? t('screening.sensor.none') : '—'}</p></div>
          <div className="rounded-[12px] bg-tint p-3"><div className="flex items-center justify-between text-[12px] font-semibold break-words"><span>{t('screening.sensor.battery')}</span><BatteryMedium size={16} className="text-primary" aria-hidden /></div><p className="text-[18px] font-bold mt-1 break-words">{ready || state === 'connected' ? t('screening.sensor.batteryValue') : '—'} {ready && <span className="text-[12px] text-primary font-semibold break-words">{t('screening.sensor.batteryLeft')}</span>}</p></div>
        </div>
        <ol className="mt-3 space-y-1.5" aria-label="Connection steps">
          {(['connecting', 'connected', 'ready'] as SensorState[]).map((s, i) => {
            const order = ['disconnected', 'connecting', 'connected', 'ready']; const cur = order.indexOf(state); const idx = order.indexOf(s)
            const done = state !== 'error' && (cur > idx || (state === 'ready' && s === 'ready')), active = state === s && !done
            return <li key={s} className={cx('h-10 px-3 rounded-[10px] flex items-center gap-2 text-[13px] break-words', done ? 'bg-mint-soft text-primary-dark font-semibold' : active ? 'bg-tint font-semibold' : 'text-secondary')}>
              <span className={cx('h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold', done ? 'bg-primary text-white' : active ? 'bg-primary text-white' : 'bg-tint-2 text-secondary')}>{done ? '✓' : i + 1}</span>
              {t(`screening.sensor.steps.${i}`)}
            </li>
          })}
        </ol>
      </div>

      {state === 'error' ? <div className="mt-4"><Callout tone="error" title={t('screening.sensor.notFoundTitle')}>{t('screening.sensor.notFoundBody')}</Callout></div>
        : <div className="mt-4 rounded-[14px] bg-tint p-3 flex gap-3"><span className="h-9 w-9 rounded-full bg-surface text-primary flex items-center justify-center shrink-0" aria-hidden><Info size={18} /></span><div><p className="text-[13px] font-bold break-words">{t('screening.sensor.ledTitle')}</p><p className="text-[12px] text-secondary leading-snug break-words">{t('screening.sensor.ledBody')}</p></div></div>}

      {state !== 'error' && <div className="mt-3 flex items-center justify-between"><span className="text-[12px] text-secondary font-medium break-words">{t('screening.sensor.wrongDevice')}</span><button onClick={simulateFailure} className="h-10 px-3 rounded-[10px] bg-tint text-primary text-[13px] font-semibold inline-flex items-center gap-1.5"><RefreshCw size={14} aria-hidden />{t('screening.sensor.refresh')}</button></div>}
    </FlowShell>
  )
}
