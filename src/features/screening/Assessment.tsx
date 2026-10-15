import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Square, Activity, RotateCcw, ShieldAlert, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react'
import { Frame, TopBar } from '../../components/layout/Shells'
import { Button, Callout, Ring, cx } from '../../components/ui'
import { sensor, type BleReading, BLE_DEVICE_NAME } from '../../services/sensor'
import { useScreeningPatient } from './useGuard'
import { jointName } from '../../domain/copy'
import { useT } from '../../i18n'

const TARGET_DURATION = 30
type Phase = 'countdown' | 'recording' | 'complete' | 'interrupted'

export default function Assessment() {
  const nav = useNavigate()
  const { t } = useT()
  const { patient, session } = useScreeningPatient(true)

  const [phase, setPhase] = useState<Phase>('countdown')
  const [count, setCount] = useState(3)
  const [elapsed, setElapsed] = useState(0)

  // Real BLE state
  const [readings, setReadings] = useState<BleReading[]>([])
  const [latestReading, setLatestReading] = useState<BleReading | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(() => sensor.getState() === 'ready')
  const [disconnectedMidAssessment, setDisconnectedMidAssessment] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  const stopRef = useRef<(() => void) | null>(null)
  const unsubscribeBle = useRef<(() => void) | null>(null)

  // Countdown timer before recording begins
  useEffect(() => {
    if (phase !== 'countdown') return
    if (count === 0) {
      setPhase('recording')
      return
    }
    const t = setTimeout(() => setCount(c => c - 1), 800)
    return () => clearTimeout(t)
  }, [phase, count])

  // Watch for physical disconnection
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const state = sensor.getState()
      if (state === 'disconnected') {
        setIsConnected(false)
        if (phase === 'recording') {
          setDisconnectedMidAssessment(true)
        }
      } else if (state === 'ready') {
        setIsConnected(true)
      }
    }, 500)
    return () => clearInterval(checkInterval)
  }, [phase])

  // Recording phase
  useEffect(() => {
    if (phase !== 'recording') return

    const start = Date.now()
    setReadings([])
    setLatestReading(null)
    setDisconnectedMidAssessment(false)
    setIsConnected(sensor.getState() === 'ready')

    // Listen to real-time BLE notifications
    unsubscribeBle.current = sensor.onNotification((reading: BleReading) => {
      setLatestReading(reading)
      setReadings(prev => [...prev, reading])
      setIsConnected(true)
      setDisconnectedMidAssessment(false)
    })

    const timer = setInterval(() => {
      const e = (Date.now() - start) / 1000
      setElapsed(e)
    }, 200)

    return () => {
      clearInterval(timer)
      unsubscribeBle.current?.()
    }
  }, [phase])

  const finish = () => {
    unsubscribeBle.current?.()
    stopRef.current?.()

    if (readings.length === 0) {
      console.warn('Cannot complete assessment without valid sensor readings.')
      return
    }

    const activeCount = readings.filter(r => r.active).length

    // Determine predominant risk category from genuine readings
    let predominantRisk: 'LOW' | 'MID' | 'HIGH' = 'LOW'
    const highCount = readings.filter(r => r.riskCategory === 'HIGH').length
    const midCount = readings.filter(r => r.riskCategory === 'MID').length
    const lowCount = readings.filter(r => r.riskCategory === 'LOW').length

    if (highCount >= midCount && highCount >= lowCount && highCount > 0) {
      predominantRisk = 'HIGH'
    } else if (midCount >= lowCount && midCount > 0) {
      predominantRisk = 'MID'
    } else {
      predominantRisk = 'LOW'
    }

    const durationSec = Math.max(1, Math.round(elapsed))

    const hardwareData = {
      deviceName: BLE_DEVICE_NAME,
      connected: isConnected,
      RiskLevel: predominantRisk,
      StepHistory: readings.map(r => r.riskCategory),
      readingsCount: readings.length,
      activeCount,
      readings,
      rawReadings: readings.map(r => r.raw),
      latestNotification: latestReading?.raw || null,
      durationSec,
    }

    // Save genuine movement assessment summary (no fabricated joint angles)
    session.setMovement({
      rangeOfMotionDeg: 0, // Genuine: ESP32-C3 band does not measure joint angles
      smoothness: readings.length > 0 ? Number((activeCount / readings.length).toFixed(2)) : 0.5,
      durationSec,
      repetitions: activeCount, // Genuine: count of active movements detected
      performed: readings.length > 0,
      hardwareData
    })

    // Save test result into session
    session.setTestResult({
      testId: 'saathi_band',
      status: readings.length > 0 ? 'VALID' : 'PARTIAL',
      completed: readings.length > 0,
      quality: readings.length >= 5 ? 'GOOD' : 'FAIR',
      measurements: {
        deviceName: BLE_DEVICE_NAME,
        readingsCount: readings.length,
        activeCount,
        predominantRisk,
        durationSec
      },
      observations: [
        `Band Risk Indication: ${predominantRisk}`,
        `${activeCount} of ${readings.length} BLE notifications indicated active movement`
      ],
      technicalDetails: {
        rawReadings: readings.map(r => r.raw),
        latestReading: latestReading?.raw || null
      },
      timestamp: Date.now()
    })

    setPhase('complete')
    setTimeout(() => nav('/screening/analysis', { replace: true }), 900)
  }

  const handleStop = () => {
    unsubscribeBle.current?.()
    setPhase('interrupted')
  }

  const restart = () => {
    setElapsed(0)
    setReadings([])
    setLatestReading(null)
    setDisconnectedMidAssessment(false)
    setCount(3)
    setPhase('countdown')
  }

  const handleReconnect = () => {
    setReconnecting(true)
    sensor.connect((state) => {
      if (state === 'ready') {
        setIsConnected(true)
        setDisconnectedMidAssessment(false)
        setReconnecting(false)
      } else if (state === 'error') {
        setReconnecting(false)
      }
    })
  }

  if (!patient || !session.joint) return null

  // Active risk styling
  const currentRisk = latestReading?.riskCategory || null
  const riskBadgeClass =
    currentRisk === 'HIGH'
      ? 'bg-error-tint text-error-text border-error/20'
      : currentRisk === 'MID'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : currentRisk === 'LOW'
      ? 'bg-mint text-primary-dark border-mint'
      : 'bg-tint text-secondary border-border'

  const activeMovement = latestReading ? latestReading.active : false

  return (
    <Frame>
      <TopBar
        title={t('screening.assessment.title')}
        back
        onBack={handleStop}
        right={
          <span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">
            {t('screening.assessment.triageActive')}
          </span>
        }
      />
      <main className="flex-1 flex flex-col px-4 pt-3 pb-6 page-enter">
        {/* Top Header Card: Connection & Joint */}
        <div className="card h-12 px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cx(
                'h-2.5 w-2.5 rounded-full shrink-0',
                isConnected && phase === 'recording'
                  ? 'bg-primary pulse-dot'
                  : isConnected
                  ? 'bg-mint'
                  : 'bg-error'
              )}
              aria-hidden
            />
            <span className="text-[13px] font-bold tracking-wide truncate">
              {isConnected ? `${BLE_DEVICE_NAME} BLE Active` : `${BLE_DEVICE_NAME} Disconnected`}
            </span>
          </div>

          <span className="h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-semibold inline-flex items-center gap-1 shrink-0">
            {patient.name.split(' ')[0]} · {jointName(session.joint, session.side, t)}
          </span>
        </div>

        {/* Disconnection Warning if mid-assessment */}
        {disconnectedMidAssessment && (
          <div className="mt-3">
            <Callout tone="error" title="Sensor Disconnected Mid-Assessment">
              <div className="space-y-2 text-[13px]">
                <p>
                  Communication with {BLE_DEVICE_NAME} was interrupted. {readings.length} readings were captured before disconnect.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" loading={reconnecting} onClick={handleReconnect} icon={RefreshCw}>
                    Reconnect Band
                  </Button>
                  {readings.length > 0 && (
                    <button
                      onClick={finish}
                      className="h-9 px-3 rounded-[8px] bg-tint font-semibold text-ink text-[12px]"
                    >
                      Use Captured Data ({readings.length})
                    </button>
                  )}
                </div>
              </div>
            </Callout>
          </div>
        )}

        {/* Phase View */}
        {phase === 'countdown' ? (
          <div className="card mt-3 p-8 flex flex-col items-center text-center fade-in">
            <p className="text-[12px] font-bold tracking-wider text-secondary uppercase">
              {t('screening.assessment.startingIn')}
            </p>
            <p className="text-[68px] font-bold text-primary leading-none mt-3 tabular-nums">
              {count || t('screening.assessment.go')}
            </p>
            <p className="text-secondary text-[13px] mt-4 max-w-[260px]">
              {t('screening.assessment.instructionText')}
            </p>
          </div>
        ) : (
          <>
            {/* Live Timer and Risk Display */}
            <div className="card mt-3 p-5 flex flex-col items-center">
              <div className="my-2">
                <Ring value={Math.min(100, (elapsed / TARGET_DURATION) * 100)} size={160} stroke={12}>
                  <p className="text-[11px] font-bold tracking-wider text-secondary uppercase">Elapsed</p>
                  <p className="text-[32px] font-bold tabular-nums leading-none mt-1">
                    00:{String(Math.floor(elapsed)).padStart(2, '0')}
                  </p>
                  <p className="text-[11px] text-secondary mt-1">Target: {TARGET_DURATION}s</p>
                </Ring>
              </div>

              {/* Real-time Risk Category from Band */}
              <div className="w-full mt-4 pt-4 border-t border-border flex flex-col items-center">
                <span className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">
                  Live Sensor Risk Indication
                </span>
                {currentRisk ? (
                  <div className={cx('px-5 py-2.5 rounded-[12px] border flex items-center gap-2.5', riskBadgeClass)}>
                    <ShieldAlert size={20} />
                    <span className="text-[18px] font-bold tracking-wide">
                      {currentRisk === 'HIGH' ? 'HIGH RISK' : currentRisk === 'MID' ? 'MODERATE RISK (MID)' : 'LOW RISK'}
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-2 rounded-[10px] bg-tint text-secondary text-[13px] flex items-center gap-2">
                    <span className="spin h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent" />
                    <span>Awaiting BLE notifications from band…</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live BLE Telemetry Stream Card */}
            <div className="card mt-3 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[15px] font-bold inline-flex items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  Live BLE Notifications
                </p>
                <span className="h-6 px-2.5 rounded-full bg-tint text-ink text-[11px] font-semibold inline-flex items-center">
                  {readings.length} readings received
                </span>
              </div>

              {/* Activity indicator */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="rounded-[12px] bg-tint p-3">
                  <span className="text-[11px] font-bold text-secondary uppercase">Movement State</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={cx(
                        'h-3 w-3 rounded-full',
                        activeMovement ? 'bg-primary pulse-dot' : 'bg-muted'
                      )}
                    />
                    <span className="text-[15px] font-bold">
                      {activeMovement ? 'Active (1)' : 'Stationary (0)'}
                    </span>
                  </div>
                </div>

                <div className="rounded-[12px] bg-tint p-3">
                  <span className="text-[11px] font-bold text-secondary uppercase">Latest Notification</span>
                  <p className="text-[15px] font-mono font-bold mt-1 text-primary truncate">
                    {latestReading ? latestReading.raw : '—'}
                  </p>
                </div>
              </div>

              {/* Recent Notification Stream */}
              <div className="mt-2">
                <span className="text-[11px] font-bold text-secondary uppercase block mb-1.5">
                  Recent Stream:
                </span>
                {readings.length === 0 ? (
                  <p className="text-[12px] text-secondary italic py-2">
                    Perform knee/joint movement. The band will transmit notifications like 1,LOW or 1,MID.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1">
                    {readings.slice(-12).map((r, idx) => (
                      <span
                        key={idx}
                        className={cx(
                          'px-2 py-0.5 rounded-[6px] text-[11px] font-mono font-semibold',
                          r.riskCategory === 'HIGH'
                            ? 'bg-error-tint text-error-text'
                            : r.riskCategory === 'MID'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-mint text-primary-dark'
                        )}
                      >
                        {r.raw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {phase === 'interrupted' && (
          <div className="mt-3">
            <Callout tone="warning" title={t('screening.assessment.interrupted')}>
              {t('screening.assessment.interruptedCallout')}
            </Callout>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-4 space-y-2">
          {phase === 'recording' && (
            <>
              <Button
                full
                onClick={finish}
                disabled={readings.length === 0}
              >
                {readings.length === 0
                  ? 'Waiting for sensor telemetry…'
                  : `Complete Recording (${readings.length} readings)`}
                {readings.length > 0 && <ArrowRight size={18} aria-hidden />}
              </Button>
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={restart}
                  className="h-10 text-[13px] font-semibold text-secondary inline-flex items-center gap-1.5"
                >
                  <RotateCcw size={14} aria-hidden />
                  {t('screening.assessment.discardRestart')}
                </button>
                <button
                  onClick={handleStop}
                  className="h-10 text-[13px] font-semibold text-error inline-flex items-center gap-1.5"
                >
                  <Square size={14} aria-hidden />
                  {t('screening.assessment.stopRecording')}
                </button>
              </div>
            </>
          )}

          {phase === 'interrupted' && (
            <>
              <Button full onClick={restart}>
                {t('screening.assessment.tryAgain')}
              </Button>
              <Button
                full
                variant="secondary"
                onClick={() => {
                  session.setMovement(null, true)
                  nav('/screening/analysis')
                }}
              >
                {t('screening.assessment.continueWithout')}
              </Button>
            </>
          )}

          {phase === 'complete' && (
            <p className="text-center text-primary-dark font-semibold fade-in flex items-center justify-center gap-2">
              <CheckCircle2 size={18} />
              Sensor assessment recorded. Preparing analysis…
            </p>
          )}
        </div>
      </main>
    </Frame>
  )
}
