/**
 * Simulated AI analysis pipeline. Replace `runAnalysis` with a backend call later.
 */
import { estimateRisk } from '../domain/risk'
import type { Answers, TestResult, Patient, RiskResult } from '../domain/types'

export type AnalysisStep = 'patient' | 'symptoms' | 'movement' | 'risk'
export const ANALYSIS_STEPS: { id: AnalysisStep; label: string }[] = [
  { id: 'patient', label: 'Patient information' },
  { id: 'symptoms', label: 'Symptoms' },
  { id: 'movement', label: 'Movement assessment' },
  { id: 'risk', label: 'Estimating screening risk' },
]

export function runAnalysis(
  patient: Patient, answers: Answers, tests: TestResult[],
  onStep: (done: AnalysisStep[]) => void,
  onComplete: (r: RiskResult) => void,
  onError: (msg: string) => void,
  opts?: { fail?: boolean },
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
  schedule(4200, () => onComplete(estimateRisk(patient, answers, tests)))
  return () => { cancelled = true; timers.forEach(clearTimeout) }
}
