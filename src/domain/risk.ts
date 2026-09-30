/**
 * DEMO screening engine. NOT medically validated.
 * Produces a screening risk band for demonstration only.
 * Replace `estimateRisk` with a validated model/API later — the UI only depends on RiskResult.
 */
import { QUESTIONS } from './questions'
import type { Answers, MovementSummary, Patient, RiskBand, RiskResult } from './types'

export const RISK_META: Record<RiskBand, { label: string; short: string; summary: string; tone: 'success' | 'warning' | 'error'; followUpDays: number }> = {
  low: { label: 'Low screening risk', short: 'Low', summary: 'Screening does not indicate a need for further evaluation at this time.', tone: 'success', followUpDays: 180 },
  moderate: { label: 'Moderate screening risk', short: 'Moderate', summary: 'Further clinical evaluation may be appropriate.', tone: 'warning', followUpDays: 60 },
  higher: { label: 'Higher screening risk', short: 'Higher', summary: 'Further clinical evaluation recommended.', tone: 'error', followUpDays: 14 },
}

export function estimateRisk(_patient: Patient, answers: Answers, movement: MovementSummary | null): RiskResult {
  const factors: { label: string; weight: number }[] = []

  // 1. Calculate Questions %
  let questionScore = 0
  let maxQuestionScore = 0
  for (const q of QUESTIONS) {
    const v = answers[q.id] ?? 0
    questionScore += v
    
    // Calculate max score dynamically based on the options array
    const maxVal = Math.max(...q.options.map(o => o.value))
    maxQuestionScore += maxVal

    if (v >= 2) factors.push({ label: q.factorLabel, weight: v })
  }
  
  // Calculate raw question percentage (0 - 100)
  const questionPct = maxQuestionScore > 0 ? (questionScore / maxQuestionScore) * 100 : 0

  // 2. Calculate Hardware %
  let hardwarePct = 0
  if (movement?.hardwareData?.StepHistory && Array.isArray(movement.hardwareData.StepHistory)) {
    const history: string[] = movement.hardwareData.StepHistory
    if (history.length > 0) {
      let sum = 0
      for (const step of history) {
        if (step === 'HIGH') sum += 100
        else if (step === 'MID') sum += 50
        else if (step === 'LOW') sum += 0
      }
      hardwarePct = sum / history.length
      factors.push({ label: 'Hardware Sensor Analysis', weight: hardwarePct >= 66 ? 3 : hardwarePct >= 33 ? 2 : 1 })
    }
  } else if (movement?.hardwareData?.RiskLevel) {
     // Fallback if there's no StepHistory but a single RiskLevel exists
     const level = movement.hardwareData.RiskLevel
     if (level === 'HIGH') hardwarePct = 100
     else if (level === 'MID') hardwarePct = 50
     else hardwarePct = 0
     factors.push({ label: 'Hardware Sensor Risk', weight: hardwarePct >= 66 ? 3 : hardwarePct >= 33 ? 2 : 1 })
  }

  // 3. Combined Final % (80% Questions, 20% Hardware)
  const finalPercentage = (questionPct * 0.8) + (hardwarePct * 0.2)

  // 4. Determine Risk Band
  let band: RiskBand = 'low'
  if (finalPercentage >= 66.6) band = 'higher'
  else if (finalPercentage >= 33.3) band = 'moderate'
  else band = 'low'

  const top = factors.sort((a, b) => b.weight - a.weight).slice(0, 4).map(f => f.label)

  const recommendedAction =
    band === 'higher' ? 'Refer to the PHC medical officer for clinical evaluation within 2 weeks.'
    : band === 'moderate' ? 'Advise a PHC visit for clinical evaluation. Begin gentle joint exercises.'
    : 'Share joint-care advice and re-screen in 6 months or if symptoms change.'

  return { band, score: Math.round(finalPercentage), factors: top.length ? top : ['No major contributing factors reported'], recommendedAction }
}
