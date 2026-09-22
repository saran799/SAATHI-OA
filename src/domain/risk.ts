/**
 * DEMO screening engine. NOT medically validated.
 * Produces a screening risk band for demonstration only.
 * Replace `estimateRisk` with a validated model/API later — the UI only depends on RiskResult.
 */
import { QUESTIONS } from './questions'
import type { Answers, TestResult, Patient, RiskBand, RiskResult } from './types'

export const RISK_META: Record<RiskBand, { label: string; short: string; summary: string; tone: 'success' | 'warning' | 'error'; followUpDays: number }> = {
  low: { label: 'Low screening indication', short: 'Low', summary: 'Screening does not indicate a need for further evaluation at this time.', tone: 'success', followUpDays: 180 },
  moderate: { label: 'Moderate screening indication', short: 'Moderate', summary: 'Further clinical evaluation may be appropriate.', tone: 'warning', followUpDays: 60 },
  higher: { label: 'Higher screening indication', short: 'Higher', summary: 'Further clinical evaluation recommended.', tone: 'error', followUpDays: 14 },
  insufficient: { label: 'Insufficient Assessment', short: 'Insufficient', summary: 'Not enough data was provided to perform a screening evaluation.', tone: 'warning', followUpDays: 7 },
}

export function estimateRisk(patient: Patient, answers: Answers, tests: TestResult[]): RiskResult {
  let score = 0
  const factors: { label: string; weight: number }[] = []

  for (const q of QUESTIONS) {
    const v = answers[q.id] ?? 0
    score += v
    if (v >= 2) factors.push({ label: q.factorLabel, weight: v })
  }

  if (patient.age >= 60) { score += 2; factors.push({ label: 'Age 60 or above', weight: 2 }) }
  else if (patient.age >= 45) { score += 1; factors.push({ label: 'Age 45 or above', weight: 1 }) }

  if (patient.priorInjury) { score += 1; factors.push({ label: 'Previous joint injury', weight: 1 }) }
  if (patient.familyHistory) { score += 1; factors.push({ label: 'Family history of joint problems', weight: 1 }) }

  if (patient.heightCm && patient.weightKg) {
    const bmi = patient.weightKg / Math.pow(patient.heightCm / 100, 2)
    if (bmi >= 30) { score += 2; factors.push({ label: 'Higher body weight', weight: 2 }) }
    else if (bmi >= 25) { score += 1 }
  }

  let validTestsCount = 0
  for (const test of tests) {
    if (test.status === 'VALID' && test.measurements) {
      validTestsCount++
      if (test.testId === 'rom') {
        const rom = test.measurements.rangeOfMotionDeg || 0
        if (rom > 0 && rom < 100) { score += 3; factors.push({ label: 'Reduced range of movement', weight: 3 }) }
        else if (rom > 0 && rom < 120) { score += 1; factors.push({ label: 'Slightly reduced range of movement', weight: 1 }) }
      }
    }
  }

  // If no answers and no valid tests, we don't have enough evidence
  const answerCount = Object.keys(answers).length
  if (answerCount < 2 && validTestsCount === 0) {
    return { band: 'insufficient', score: 0, factors: ['Not enough valid data collected'], recommendedAction: 'Please complete more of the assessment or refer to a medical officer.' }
  }

  const band: RiskBand = score >= 14 ? 'higher' : score >= 7 ? 'moderate' : 'low'
  const top = factors.sort((a, b) => b.weight - a.weight).slice(0, 4).map(f => f.label)

  const recommendedAction =
    band === 'higher' ? 'Refer to the PHC medical officer for clinical evaluation within 2 weeks.'
    : band === 'moderate' ? 'Advise a PHC visit for clinical evaluation. Begin gentle joint exercises.'
    : 'Share joint-care advice and re-screen in 6 months or if symptoms change.'

  return { band, score, factors: top.length ? top : ['No major contributing factors reported'], recommendedAction }
}
