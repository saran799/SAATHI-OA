/**
 * Simulated AI analysis pipeline. Replace `runAnalysis` with a backend call later.
 */
import { estimateRisk } from '../domain/risk'
import type { Answers, CameraRom, MovementSummary, Patient, RiskResult, TestResult } from '../domain/types'

/** Pull the MediaPipe ROM measurement out of the camera test results (if captured). */
export function cameraRomFromTests(tests: TestResult[] | undefined): CameraRom | null {
  const rom = tests?.find(t => t.testId === 'rom' && t.status === 'VALID')
  const m = rom?.measurements
  if (!m?.performed || !Number.isFinite(m.rangeOfMotionDeg)) return null
  return { rangeOfMotionDeg: m.rangeOfMotionDeg, smoothness: Number.isFinite(m.smoothness) ? m.smoothness : 0.5 }
}

export type AnalysisStep = 'patient' | 'symptoms' | 'movement' | 'risk'
export const ANALYSIS_STEPS: { id: AnalysisStep; label: string }[] = [
  { id: 'patient', label: 'Patient information' },
  { id: 'symptoms', label: 'Symptoms' },
  { id: 'movement', label: 'Movement assessment' },
  { id: 'risk', label: 'Estimating screening risk' },
]

export function runAnalysis(
  patient: Patient, answers: Answers, movement: MovementSummary | null,
  onStep: (done: AnalysisStep[]) => void,
  onComplete: (r: RiskResult) => void,
  onError: (msg: string) => void,
  opts?: { fail?: boolean; tests?: TestResult[] },
) {
  let cancelled = false
  const done: AnalysisStep[] = []
  const timers: number[] = []
  const schedule = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => { if (!cancelled) fn() }, ms))
  schedule(700, () => { done.push('patient'); onStep([...done]) })
  schedule(1400, () => { done.push('symptoms'); onStep([...done]) })
  schedule(2200, () => { done.push('movement'); onStep([...done]) })
  schedule(3400, () => {
    if (opts?.fail) { onError('Analysis could not be completed. Your screening data is saved.'); return }
    done.push('risk'); onStep([...done])
  })
  schedule(4200, () => onComplete(estimateRisk(patient, answers, movement, cameraRomFromTests(opts?.tests))))
  return () => { cancelled = true; timers.forEach(clearTimeout) }
}
