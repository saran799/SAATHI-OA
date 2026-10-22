import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Bluetooth } from 'lucide-react'
import { FlowShell } from '../../components/layout/Shells'
import { Button, Callout, cx } from '../../components/ui'
import { sensor, BLE_DEVICE_NAME } from '../../services/sensor'
import { useScreeningPatient, TOTAL_STEPS } from './useGuard'
import { useT } from '../../i18n'

export default function Calibration() {
  const nav = useNavigate()
  const { t } = useT()
  const { patient, session } = useScreeningPatient(true)
  const [step, setStep] = useState(0)
  const [verifying, setVerifying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [packetCount, setPacketCount] = useState(0)
  const [latestPacket, setLatestPacket] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const cancel = useRef<(() => void) | null>(null)

  useEffect(() => () => cancel.current?.(), [])
  if (!patient) return null

  const checkReadiness = () => {
    setFailed(false)
    setVerifying(true)
    setProgress(0)
    setPacketCount(0)
    setLatestPacket(null)
    setErrorMessage(null)
    setStep(2)

    cancel.current?.()

    // Listen for live packets during calibration
    let count = 0
    const unsubPackets = sensor.onNotification((reading) => {
      count++
      setPacketCount(count)
      setLatestPacket(reading.raw)
    })

    const cancelCalibrate = sensor.calibrate(
      (pct) => setProgress(pct),
      (ok) => {
        unsubPackets()
        setVerifying(false)
        if (ok) {
          setStep(3)
        } else {
          setFailed(true)
          const info = sensor.getErrorInfo()
          setErrorMessage(info?.diagnosticTip || 'No MPU6050 telemetry received. Verify that the ESP32-C3 is transmitting.')
        }
      }
    )

    cancel.current = () => {
      unsubPackets()
      cancelCalibrate()
    }
  }

  const STAGES = [
    'Patient Seated',
    'Band Position',
    'Readiness Check',
    'Verified Ready'
  ]

  const copy = [
    {
      t: 'Ensure Patient is Seated Comfortably',
      b: `${patient.name} should be seated upright with both feet flat on the floor before positioning the sensor.`
    },
    {
      t: 'Attach the SAATHI Band',
      b: `Place the ${BLE_DEVICE_NAME} securely around the limb near the ${session.joint || 'target'} joint. Make sure the sensor band is snug and powered on.`
    },
    {
      t: 'Baseline Readiness Check',
      b: `Verifying connection with ${BLE_DEVICE_NAME}. Ensuring live BLE telemetry channels are active.`
    },
    {
      t: 'Baseline Readiness Confirmed',
      b: `Communication with ${BLE_DEVICE_NAME} is active. Ready to begin the real-time movement assessment.`
    },
  ][step]

  const footer = step === 0 ? (
    <Button full onClick={() => setStep(1)}>{t('screening.calibration.patientSeated')}</Button>
  ) : step === 1 ? (
    <Button full onClick={checkReadiness}>Verify Sensor Readiness</Button>
  ) : step === 2 && failed ? (
    <div className="space-y-2">
      <Button full onClick={checkReadiness}>{t('screening.calibration.retry')}</Button>
      <button
        className="w-full h-11 text-[14px] font-semibold text-primary"
        onClick={() => {
          session.setMovement(null, true)
          nav('/screening/analysis')
        }}
      >
        {t('screening.calibration.continueWithout')}
      </button>
    </div>
  ) : step === 2 && verifying ? (
    <Button full loading disabled>Verifying Connection…</Button>
  ) : (
    <Button full onClick={() => nav('/screening/assessment')}>
      {t('screening.calibration.startMovement')}
    </Button>
  )

  return (
    <FlowShell
      title="Sensor Setup & Verification"
      subtitle="Verify band placement and baseline BLE readiness"
      step={5}
      total={TOTAL_STEPS}
      stepLabel="Step 5 of 7"
      barTitle="Band Verification"
      back="/screening/sensor"
      footer={footer}
      pill={
        <span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">
          {t('screening.calibration.triageActive')}
        </span>
      }
    >
      <div className="grid grid-cols-4 gap-2" aria-label="Setup stages">
        {STAGES.map((label, i) => (
          <div
            key={label}
            className={cx(
              'rounded-[12px] px-2 py-2.5 text-center',
              i === step ? 'bg-primary text-white' : i < step ? 'bg-mint text-primary-dark' : 'bg-tint text-secondary'
            )}
          >
            <p className="text-[11px] font-bold leading-tight">{i + 1}. {label}</p>
          </div>
        ))}
      </div>

      <div key={step} className="card p-5 mt-4 fade-in">
        <h2 className="text-[20px] font-bold">{copy.t}</h2>
        <p className="text-[14px] text-secondary leading-relaxed mt-2">{copy.b}</p>

        {step === 2 && verifying && (
          <div className="mt-6 flex flex-col items-center p-4 bg-tint rounded-[14px]">
            <Bluetooth size={32} className="text-primary pulse-dot mb-3" />
            <p className="text-[15px] font-bold text-ink">Verifying MPU6050 Telemetry Stream…</p>
            <p className="text-[12px] text-secondary mt-1">Sampling live BLE notification packets from {BLE_DEVICE_NAME}</p>

            <div className="w-full bg-border rounded-full h-2.5 mt-4 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between w-full text-[12px] px-1">
              <span className="text-secondary">Progress: <strong className="text-ink">{progress}%</strong></span>
              <span className="text-secondary">Packets Received: <strong className="text-primary font-mono">{packetCount}</strong></span>
            </div>

            {latestPacket ? (
              <div className="mt-3 px-3 py-1.5 rounded-lg bg-mint/50 border border-mint text-primary-dark font-mono text-[12px] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary pulse-dot" />
                <span>Live Packet: <strong>{latestPacket}</strong></span>
              </div>
            ) : (
              <p className="mt-3 text-[11px] text-muted italic">Waiting for initial notification from ESP32-C3...</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 flex flex-col items-center text-center fade-in p-4 bg-mint/20 rounded-[14px]">
            <span className="h-16 w-16 rounded-full bg-mint text-primary-dark flex items-center justify-center">
              <CheckCircle2 size={36} aria-hidden />
            </span>
            <p className="mt-3 font-bold text-primary-dark text-[16px]">Sensor Calibrated & Ready</p>
            <p className="text-[12px] text-secondary mt-1 max-w-[280px]">
              BLE telemetry channel verified. Received live MPU6050 packets ({packetCount} sampled). Ready for real movement assessment.
            </p>
            {latestPacket && (
              <span className="mt-2 text-[11px] font-mono bg-mint-soft text-primary-dark px-2 py-0.5 rounded">
                Verified stream: {latestPacket}
              </span>
            )}
          </div>
        )}
      </div>

      {step === 2 && failed && (
        <div className="mt-4">
          <Callout tone="error" title="Sensor Telemetry Verification Failed">
            <div className="space-y-2 text-[13px]">
              <p>{errorMessage || `Could not verify live telemetry packets from ${BLE_DEVICE_NAME}.`}</p>
              <p className="text-[12px] text-secondary">
                Ensure the band is powered on, MPU6050 sensor wires are firmly connected, and the band is within Bluetooth range.
              </p>
            </div>
          </Callout>
        </div>
      )}
    </FlowShell>
  )
}
