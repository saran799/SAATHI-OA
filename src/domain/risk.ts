/**
 * OA Risk Screening Engine — ML-based
 *
 * Uses a Multi-Layer Perceptron (MLP) whose weights were LEARNED via
 * gradient descent (backpropagation) on 9,000 synthetic patient records
 * generated from OA clinical literature patterns.
 *
 * Architecture: 13 inputs -> 32 (ReLU) -> 16 (ReLU) -> 3 (Softmax)
 * Trained accuracy: ~94% on held-out test set
 *
 * To retrain: `node scripts/train_model.cjs`
 * NOT medically validated — for demonstration/screening only.
 */
import { QUESTIONS } from './questions'
import type { Answers, CameraRom, MovementSummary, Patient, RiskBand, RiskResult } from './types'
import modelWeights from './model_weights.json'

export const RISK_META: Record<RiskBand, { label: string; short: string; summary: string; tone: 'success' | 'warning' | 'error'; followUpDays: number }> = {
  low: { label: 'Low screening risk', short: 'Low', summary: 'Screening does not indicate a need for further evaluation at this time.', tone: 'success', followUpDays: 180 },
  moderate: { label: 'Moderate screening risk', short: 'Moderate', summary: 'Further clinical evaluation may be appropriate.', tone: 'warning', followUpDays: 60 },
  higher: { label: 'Higher screening risk', short: 'Higher', summary: 'Further clinical evaluation recommended.', tone: 'error', followUpDays: 14 },
}

// ── ML Inference Engine (loads learned weights from model_weights.json) ──

type LayerWeights = { w: number[][]; b: number[] }

class TrainedMLP {
  private layers: LayerWeights[]

  constructor(weights: LayerWeights[]) {
    this.layers = weights
  }

  private relu(x: number) { return Math.max(0, x) }

  private softmax(arr: number[]) {
    const max = Math.max(...arr)
    const exps = arr.map(x => Math.exp(x - max))
    const sum = exps.reduce((a, b) => a + b, 0)
    return exps.map(x => x / sum)
  }

  predict(features: number[]): { probs: number[]; classIndex: number } {
    let a = features
    for (let l = 0; l < this.layers.length; l++) {
      const layer = this.layers[l]
      const isOutput = l === this.layers.length - 1
      const cols = layer.b.length

      const z = new Array(cols)
      for (let j = 0; j < cols; j++) {
        let sum = layer.b[j]
        for (let i = 0; i < a.length; i++) {
          sum += a[i] * layer.w[i][j]
        }
        z[j] = sum
      }

      a = isOutput ? this.softmax(z) : z.map(v => this.relu(v))
    }

    let classIndex = 0
    for (let i = 1; i < a.length; i++) {
      if (a[i] > a[classIndex]) classIndex = i
    }

    return { probs: a, classIndex }
  }
}

const mlModel = new TrainedMLP(modelWeights as LayerWeights[])

// ── Feature Extraction & Risk Estimation ──

export function estimateRisk(patient: Patient, answers: Answers, movement: MovementSummary | null, cameraRom: CameraRom | null = null): RiskResult {
  const factors: { label: string; weight: number }[] = []

  // Extract & normalize questionnaire features (0–1)
  const qNorm: number[] = QUESTIONS.map(q => {
    const v = answers[q.id] ?? 0
    const maxVal = Math.max(...q.options.map(o => o.value))
    if (v >= 2) factors.push({ label: q.factorLabel, weight: v })
    return maxVal > 0 ? v / maxVal : 0
  })

  // Extract hardware sensor feature (0–1)
  let hwVal = 0
  if (movement?.hardwareData?.StepHistory && Array.isArray(movement.hardwareData.StepHistory)) {
    const history: string[] = movement.hardwareData.StepHistory
    if (history.length > 0) {
      let sum = 0
      for (const step of history) {
        if (step === 'HIGH') sum += 1.0
        else if (step === 'MID') sum += 0.5
      }
      hwVal = sum / history.length
      factors.push({ label: 'Hardware Sensor Analysis', weight: hwVal * 3 })
    }
  } else if (movement?.hardwareData?.RiskLevel) {
    const level = movement.hardwareData.RiskLevel
    hwVal = level === 'HIGH' ? 1.0 : level === 'MID' ? 0.5 : 0.0
    factors.push({ label: 'Hardware Sensor Risk', weight: hwVal * 3 })
  }

  // Extract movement features — camera (MediaPipe pose) ROM is preferred, fused with sensor if both exist
  const sensorOk = !!movement?.performed
  const camOk = !!cameraRom && cameraRom.rangeOfMotionDeg > 0
  let romDeg: number | null = null
  let smoothness = 0.5
  let romSource: 'camera' | 'sensor' | 'fused' | 'none' = 'none'
  if (camOk && sensorOk) {
    romDeg = 0.6 * cameraRom!.rangeOfMotionDeg + 0.4 * movement!.rangeOfMotionDeg
    smoothness = 0.6 * cameraRom!.smoothness + 0.4 * movement!.smoothness
    romSource = 'fused'
  } else if (camOk) {
    romDeg = cameraRom!.rangeOfMotionDeg; smoothness = cameraRom!.smoothness; romSource = 'camera'
  } else if (sensorOk) {
    romDeg = movement!.rangeOfMotionDeg; smoothness = movement!.smoothness; romSource = 'sensor'
  }
  const romNorm = romDeg !== null ? Math.max(0, Math.min(1, (romDeg - 20) / 130)) : 0.5
  if (romDeg !== null && romDeg < 90) factors.push({ label: `Reduced range of motion (${Math.round(romDeg)}°)`, weight: (90 - romDeg) / 20 })
  if (romDeg !== null && smoothness < 0.5) factors.push({ label: 'Uneven movement pattern', weight: (1 - smoothness) * 3 })

  // Build 13-feature vector (must match training order exactly)
  const features: number[] = [
    Math.min(1, Math.max(0, (patient.age - 30) / 50)),              // 0: age
    patient.sex === 'Female' ? 1.0 : 0.0,                           // 1: sex
    patient.weightKg && patient.heightCm                             // 2: BMI
      ? Math.max(0, Math.min(1, ((patient.weightKg / ((patient.heightCm / 100) ** 2)) - 18) / 22))
      : 0.3,
    patient.priorInjury ? 1.0 : 0.0,                                // 3: prior injury
    patient.familyHistory ? 1.0 : 0.0,                               // 4: family history
    qNorm[0] ?? 0,                                                   // 5: pain_activity
    qNorm[1] ?? 0,                                                   // 6: pain_rest
    qNorm[2] ?? 0,                                                   // 7: stiffness
    qNorm[3] ?? 0,                                                   // 8: limitation
    qNorm[4] ?? 0,                                                   // 9: function
    romNorm,                                                         // 10: ROM
    smoothness,                                                      // 11: smoothness
    hwVal,                                                           // 12: hardware
  ]

  // Run ML inference
  const { probs, classIndex } = mlModel.predict(features)

  const bands: RiskBand[] = ['low', 'moderate', 'higher']
  const band = bands[classIndex]
  const score = Math.round((probs[1] * 50) + (probs[2] * 100))

  const top = factors.sort((a, b) => b.weight - a.weight).slice(0, 4).map(f => f.label)

  const recommendedAction =
    band === 'higher' ? 'Refer to the PHC medical officer for clinical evaluation within 2 weeks.'
    : band === 'moderate' ? 'Advise a PHC visit for clinical evaluation. Begin gentle joint exercises.'
    : 'Share joint-care advice and re-screen in 6 months or if symptoms change.'

  return {
    band, score, factors: top.length ? top : ['No major contributing factors reported'], recommendedAction,
    model: {
      type: 'mlp',
      architecture: '13 → 32 → 16 → 3 (ReLU, Softmax)',
      probs: { low: probs[0], moderate: probs[1], higher: probs[2] },
      confidence: probs[classIndex],
      romSource,
      romDeg: romDeg !== null ? Math.round(romDeg) : null,
    },
  }
}
