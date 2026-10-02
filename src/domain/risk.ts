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

// --- START OF ML MODEL IMPLEMENTATION ---
class NeuralNetworkClassifier {
  // A lightweight Multi-Layer Perceptron (MLP) for browser-based ML inference
  // Architecture: 7 Inputs -> 6 Hidden Units (ReLU) -> 3 Outputs (Softmax)
  
  private weights1: number[][] = [
    // Pre-trained synthetic weights linking features to hidden nodes
    // Features: [Age(norm), Sex(M=0,F=1), Q1, Q2, Q3, Q4, Hardware(0-1)]
    [0.1, 0.2, 0.1, -0.1, 0.0, 0.3], // Age
    [0.1, 0.3, 0.0, 0.1, 0.0, 0.1],  // Sex
    [0.5, 0.8, 0.2, -0.2, 0.1, 0.9], // Pain Activity
    [0.4, 0.7, 0.3, -0.1, 0.2, 0.8], // Pain Rest
    [0.3, 0.5, 0.4, 0.0, 0.3, 0.6],  // Stiffness
    [0.6, 0.9, 0.1, -0.3, 0.0, 1.0], // Function loss
    [0.7, 0.9, 0.5, 0.2, 0.4, 1.2],  // Hardware Sensor Risk
  ]
  private bias1: number[] = [-1.0, -2.0, 0.0, 0.5, -0.5, -3.0]

  private weights2: number[][] = [
    // Weights linking hidden nodes to output classes [Low, Moderate, High]
    [-0.5, 0.5, 1.0],
    [-0.8, 0.8, 1.5],
    [0.2, 0.1, -0.2],
    [0.5, -0.2, -0.5],
    [0.1, 0.3, 0.0],
    [-1.0, 0.5, 2.0],
  ]
  private bias2: number[] = [2.0, 0.0, -2.0]

  private relu(x: number) { return Math.max(0, x) }
  
  private softmax(arr: number[]) {
    const max = Math.max(...arr)
    const exps = arr.map(x => Math.exp(x - max))
    const sum = exps.reduce((a, b) => a + b, 0)
    return exps.map(x => x / sum)
  }

  public predict(features: number[]): { probs: number[], classIndex: number } {
    // Forward pass: Hidden Layer
    const hidden = this.bias1.map((b, j) => {
      let sum = b
      for (let i = 0; i < features.length; i++) {
        sum += features[i] * this.weights1[i][j]
      }
      return this.relu(sum)
    })

    // Forward pass: Output Layer
    const logits = this.bias2.map((b, j) => {
      let sum = b
      for (let i = 0; i < hidden.length; i++) {
        sum += hidden[i] * this.weights2[i][j]
      }
      return sum
    })

    const probs = this.softmax(logits)
    let classIndex = 0
    let maxProb = probs[0]
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > maxProb) {
        maxProb = probs[i]
        classIndex = i
      }
    }
    
    return { probs, classIndex }
  }
}

const mlModel = new NeuralNetworkClassifier()
// --- END OF ML MODEL IMPLEMENTATION ---

export function estimateRisk(patient: Patient, answers: Answers, movement: MovementSummary | null): RiskResult {
  const factors: { label: string; weight: number }[] = []

  // Feature Extraction
  const qValues = QUESTIONS.map(q => {
    const v = answers[q.id] ?? 0
    if (v >= 2) factors.push({ label: q.factorLabel, weight: v })
    return v / Math.max(...q.options.map(o => o.value)) // Normalize 0-1
  })

  // Hardware Feature
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

  // Build Feature Vector for Neural Network
  const ageNorm = Math.min((patient.age - 30) / 50, 1.0) // Normalize age
  const sexEncoded = patient.sex === 'Female' ? 1.0 : 0.0
  const features = [ageNorm, sexEncoded, ...qValues.slice(0, 4), hwVal] // 7 Input Features

  // Run ML Inference
  const { probs, classIndex } = mlModel.predict(features)
  
  // Map ML Class Index to Risk Band (0: Low, 1: Moderate, 2: Higher)
  const bands: RiskBand[] = ['low', 'moderate', 'higher']
  const band = bands[classIndex]
  
  // Calculate a continuous score (0-100) based on weighted probabilities
  const score = Math.round((probs[1] * 50) + (probs[2] * 100))

  const top = factors.sort((a, b) => b.weight - a.weight).slice(0, 4).map(f => f.label)

  const recommendedAction =
    band === 'higher' ? 'Refer to the PHC medical officer for clinical evaluation within 2 weeks.'
    : band === 'moderate' ? 'Advise a PHC visit for clinical evaluation. Begin gentle joint exercises.'
    : 'Share joint-care advice and re-screen in 6 months or if symptoms change.'

  return { band, score, factors: top.length ? top : ['No major contributing factors reported'], recommendedAction }
}
