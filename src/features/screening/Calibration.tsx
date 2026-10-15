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
  const cancel = useRef<(() => void) | null>(null)

  useEffect(() => () => cancel.current?.(), [])
  if (!patient) return null

  const checkReadiness = () => {
    setFailed(false)
    setVerifying(true)
    setStep(2)

    // Verify actual BLE connection to Saathi-Band
    const state = sensor.getState()
    if (state === 'ready') {
      setTimeout(() => {
        setVerifying(false)
        setStep(3)
      }, 600)
    } else {
      // Try to re-verify readiness
      cancel.current = sensor.connect((newState) => {
        if (newState === 'ready') {
          setVerifying(false)
          setStep(3)
        } else if (newState === 'error' || newState === 'disconnected') {
          setVerifying(false)
          setFailed(true)
        }
      })
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
            <p className="text-[14px] font-semibold text-ink">Verifying BLE connection…</p>
            <p className="text-[12px] text-secondary mt-1">Checking GATT notification readiness with {BLE_DEVICE_NAME}</p>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 flex flex-col items-center text-center fade-in p-4 bg-mint/20 rounded-[14px]">
            <span className="h-16 w-16 rounded-full bg-mint text-primary-dark flex items-center justify-center">
              <CheckCircle2 size={36} aria-hidden />
            </span>
            <p className="mt-3 font-bold text-primary-dark text-[16px]">Sensor Ready for Assessment</p>
            <p className="text-[12px] text-secondary mt-1 max-w-[280px]">
              BLE telemetry channel verified. Ready to record genuine movement and risk notifications.
            </p>
          </div>
        )}
      </div>

      {step === 2 && failed && (
        <div className="mt-4">
          <Callout tone="error" title="Sensor Not Ready">
            Could not verify connection with {BLE_DEVICE_NAME}. Ensure the band is paired and within Bluetooth range.
          </Callout>
        </div>
      )}
    </FlowShell>
  )
}
