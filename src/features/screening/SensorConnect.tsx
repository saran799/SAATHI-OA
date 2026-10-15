import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bluetooth, Radio, ArrowRight, RefreshCw, Info, CheckCircle2, AlertTriangle } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, Callout, cx } from '../../components/ui'
import { sensor, type SensorState, type ConnectionStage, type BleErrorInfo, BLE_DEVICE_NAME } from '../../services/sensor'
import { useScreeningPatient, TOTAL_STEPS } from './useGuard'
import { jointName } from '../../domain/copy'
import { useT } from '../../i18n'

const stageLabels: Record<ConnectionStage, string> = {
  idle: 'Ready to pair',
  checking_support: 'Checking Bluetooth support…',
  requesting_device: 'Select "Saathi-Band" from Bluetooth chooser…',
  connecting_gatt: 'Connecting GATT server (Attempting link)…',
  discovering_service: 'Resolving primary service…',
  discovering_characteristic: 'Resolving telemetry characteristic…',
  subscribing_notifications: 'Subscribing to BLE notifications…',
  ready: 'Connected & Streaming telemetry',
  disconnected: 'Sensor disconnected',
  error: 'Connection error',
}

export default function SensorConnect() {
  const nav = useNavigate()
  const { t } = useT()
  const { patient, session } = useScreeningPatient(true)

  const [state, setState] = useState<SensorState>(() => sensor.getState())
  const [stage, setStage] = useState<ConnectionStage>(() => sensor.getStage())
  const [errorInfo, setErrorInfo] = useState<BleErrorInfo | null>(() => sensor.getErrorInfo())
  const cancel = useRef<(() => void) | null>(null)

  useEffect(() => {
    const unsubStage = (sensor as any).onStageChange?.((st: ConnectionStage) => {
      setStage(st)
    })
    return () => {
      unsubStage?.()
      cancel.current?.()
    }
  }, [])

  const handleConnect = () => {
    setErrorInfo(null)
    cancel.current?.()
    cancel.current = sensor.connect((s) => {
      setState(s)
      setStage(sensor.getStage())
      if (s === 'error') {
        setErrorInfo(sensor.getErrorInfo())
      } else {
        setErrorInfo(null)
      }
    })
  }

  const handleDisconnect = () => {
    cancel.current?.()
    sensor.disconnect()
    setState('disconnected')
    setStage('disconnected')
    setErrorInfo(null)
  }

  if (!patient || !session.joint) return null

  const busy = state === 'connecting' || state === 'connected'
  const ready = state === 'ready'

  const tone =
    state === 'error'
      ? 'bg-error-tint text-error-text'
      : ready
      ? 'bg-mint text-primary-dark'
      : busy
      ? 'bg-info-tint text-info'
      : 'bg-tint text-secondary'

  return (
    <FlowShell
      title=""
      step={4}
      total={TOTAL_STEPS}
      stepLabel={ready ? t('screening.sensor.paired') : busy ? t('screening.sensor.pairingProg') : t('screening.sensor.pairing')}
      back="/screening/instructions"
      footer={
        ready ? (
          <Button full onClick={() => nav('/screening/calibration')}>
            {t('screening.sensor.nextSetup')} <ArrowRight size={18} aria-hidden />
          </Button>
        ) : state === 'error' ? (
          <div className="space-y-2">
            <Button full onClick={handleConnect}>
              <RefreshCw size={18} aria-hidden />
              {t('screening.sensor.retry')}
            </Button>
            <button
              className="w-full h-11 text-[14px] font-semibold text-primary"
              onClick={() => {
                session.setMovement(null, true)
                nav('/screening/analysis')
              }}
            >
              {t('screening.sensor.continueWithout')}
            </button>
          </div>
        ) : (
          <Button full loading={busy} onClick={handleConnect} disabled={busy}>
            {busy ? (stageLabels[stage] || t('screening.sensor.connecting')) : t('screening.sensor.connectBtn')}
          </Button>
        )
      }
    >
      <div className="-mt-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight flex items-center gap-2">
            <Radio size={22} className="text-primary" aria-hidden />
            {t('screening.sensor.title')}
          </h1>
          <p className="text-[14px] text-secondary mt-1 leading-snug">
            {t('screening.sensor.instruction')}
          </p>
        </div>
        <span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-bold whitespace-nowrap shrink-0 inline-flex items-center mt-1">
          Web Bluetooth
        </span>
      </div>

      <div className="card mt-4 p-6 flex flex-col items-center">
        <div className="relative h-[200px] w-[200px] flex items-center justify-center" aria-hidden>
          <span className={cx('absolute inset-0 rounded-full', ready ? 'bg-mint-soft' : 'bg-tint', busy && 'halo')} />
          <span className={cx('absolute inset-[26px] rounded-full', ready ? 'bg-primary-light' : 'bg-tint-2/70')} />
          <span className="absolute top-[14px] left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-primary" />
          <span
            className={cx(
              'relative h-[92px] w-[92px] rounded-full flex items-center justify-center text-white',
              state === 'error' ? 'bg-error' : 'bg-primary'
            )}
          >
            <Bluetooth size={38} className={cx(busy && 'pulse-dot')} />
          </span>
        </div>

        <span className={cx('mt-5 h-9 px-4 rounded-full inline-flex items-center gap-2 text-[14px] font-bold', tone)} aria-live="polite">
          <span className={cx('h-2 w-2 rounded-full', state === 'error' ? 'bg-error' : 'bg-primary')} />
          {ready ? t('screening.sensor.bluetoothActive') : state === 'connecting' ? stageLabels[stage] : state === 'error' ? 'Connection Failed' : 'Ready to Connect'}
        </span>
        <p className="text-[13px] text-secondary mt-2 text-center max-w-[320px]">
          {ready
            ? 'Saathi-Band is paired and receiving live BLE notifications.'
            : busy
            ? stageLabels[stage]
            : state === 'error'
            ? 'Check details below and tap Retry.'
            : 'Click Connect below to pair with your Saathi-Band over Web Bluetooth.'}
        </p>
      </div>

      <div className="card mt-4 p-4">
        <div className="flex items-start gap-3">
          <span className="h-12 w-12 rounded-[12px] bg-mint text-primary-dark flex items-center justify-center shrink-0" aria-hidden>
            <Bluetooth size={24} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold leading-tight truncate">
              {BLE_DEVICE_NAME}
            </p>
            <p className="text-[12px] text-secondary mt-0.5">
              Joint: <span className="font-semibold text-ink">{jointName(session.joint, session.side, t)}</span> ·{' '}
              {ready ? 'Connected & Ready' : busy ? stageLabels[stage] : state === 'error' ? 'Connection Error' : 'Disconnected'}
            </p>
          </div>
          {ready && (
            <span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-bold inline-flex items-center gap-1 shrink-0">
              <CheckCircle2 size={12} aria-hidden />
              Active
            </span>
          )}
        </div>

        <ol className="mt-4 space-y-1.5" aria-label="Connection steps">
          {(['connecting', 'connected', 'ready'] as SensorState[]).map((s, i) => {
            const order = ['disconnected', 'connecting', 'connected', 'ready']
            const cur = order.indexOf(state)
            const idx = order.indexOf(s)
            const done = state !== 'error' && (cur > idx || (state === 'ready' && s === 'ready'))
            const active = state === s && !done
            return (
              <li
                key={s}
                className={cx(
                  'h-10 px-3 rounded-[10px] flex items-center gap-2 text-[13px]',
                  done ? 'bg-mint-soft text-primary-dark font-semibold' : active ? 'bg-tint font-semibold' : 'text-secondary'
                )}
              >
                <span
                  className={cx(
                    'h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold',
                    done ? 'bg-primary text-white' : active ? 'bg-primary text-white' : 'bg-tint-2 text-secondary'
                  )}
                >
                  {done ? '✓' : i + 1}
                </span>
                {[t('screening.sensor.steps.0'), t('screening.sensor.steps.1'), t('screening.sensor.steps.2')][i]}
              </li>
            )
          })}
        </ol>

        {ready && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[12px] text-secondary">Paired to ESP32-C3</span>
            <button
              onClick={handleDisconnect}
              className="text-[12px] font-semibold text-error hover:underline"
            >
              Disconnect Band
            </button>
          </div>
        )}
      </div>

      {state === 'error' && errorInfo ? (
        <div className="mt-4">
          <Callout tone="error" title={`Connection Failed: ${errorInfo.errorName}`}>
            <div className="space-y-2 text-[13px]">
              <div>
                <span className="font-semibold text-error-text">Failed at stage: </span>
                <span className="font-mono text-[12px] bg-error-tint px-1.5 py-0.5 rounded text-error-text">
                  {errorInfo.stage}
                </span>
              </div>
              <p className="text-secondary leading-snug">{errorInfo.message}</p>
              <div className="p-3 rounded-[10px] bg-white border border-error/20 flex items-start gap-2 text-ink">
                <AlertTriangle size={16} className="text-error shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[12px]">Actionable Troubleshooting:</p>
                  <p className="text-[12px] text-secondary mt-0.5 leading-snug">{errorInfo.diagnosticTip}</p>
                </div>
              </div>
            </div>
          </Callout>
        </div>
      ) : (
        <div className="mt-4 rounded-[14px] bg-tint p-3 flex gap-3">
          <span className="h-9 w-9 rounded-full bg-surface text-primary flex items-center justify-center shrink-0" aria-hidden>
            <Info size={18} />
          </span>
          <div>
            <p className="text-[13px] font-bold">{t('screening.sensor.ledCheck')}</p>
            <p className="text-[12px] text-secondary leading-snug">{t('screening.sensor.ledDesc')}</p>
          </div>
        </div>
      )}
    </FlowShell>
  )
}
