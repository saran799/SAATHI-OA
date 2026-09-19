import type { MovementSummary } from '../domain/types'
import { calculateAngle, type PosePoint, type JointConfig } from './pose'

export interface TimestampedSample {
  t: number // seconds from start
  angle: number
  confidence: number
}

export interface MovementMetrics {
  samples: TimestampedSample[]
  minAngle: number
  maxAngle: number
  rangeOfMotionDeg: number
  repetitions: number
  smoothness: number
  avgConfidence: number
  stability: number
  durationSec: number
  performed: boolean
  // diagnostics
  validSampleCount: number
}

/**
 * Analyze real movement from actual collected measurements
 * ROM = max - min from real readings, no hardcoded values
 * Rep detection: threshold, direction change, min excursion, hysteresis, min time between reps
 * Avoid double-counting jitter
 */
export function analyzeMovement(samples: TimestampedSample[], durationSec: number): MovementMetrics {
  if (samples.length === 0) {
    return {
      samples,
      minAngle: 0,
      maxAngle: 0,
      rangeOfMotionDeg: 0,
      repetitions: 0,
      smoothness: 0,
      avgConfidence: 0,
      stability: 0,
      durationSec,
      performed: false,
      validSampleCount: 0,
    }
  }

  // Filter low confidence samples for metrics but keep count
  const validSamples = samples.filter(s => s.confidence >= 0.3 && Number.isFinite(s.angle) && s.angle > 0)
  const angles = validSamples.map(s => s.angle)

  if (angles.length === 0) {
    return {
      samples,
      minAngle: 0,
      maxAngle: 0,
      rangeOfMotionDeg: 0,
      repetitions: 0,
      smoothness: 0,
      avgConfidence: 0,
      stability: 0,
      durationSec,
      performed: false,
      validSampleCount: 0,
    }
  }

  const minAngle = Math.min(...angles)
  const maxAngle = Math.max(...angles)
  const range = maxAngle - minAngle

  // Repetition detection with hysteresis & debounce per spec
  let reps = 0
  const minExcursion = Math.max(15, range * 0.3) // minimum movement to count
  const minTimeBetweenReps = 0.8 // seconds
  const hysteresis = Math.max(5, minExcursion * 0.25)

  // Smooth angles slightly for rep detection to reduce jitter (moving avg 3)
  const smoothed: { angle: number; t: number }[] = []
  for (let i = 0; i < validSamples.length; i++) {
    const window = validSamples.slice(Math.max(0, i - 2), i + 1)
    const avg = window.reduce((a, s) => a + s.angle, 0) / window.length
    smoothed.push({ angle: avg, t: validSamples[i].t })
  }

  let lastPeak = -Infinity
  let lastPeakTime = -Infinity
  let lastValley = Infinity
  let lastValleyTime = -Infinity
  let direction: 'up' | 'down' | null = null
  let candidatePeak = { angle: -Infinity, t: 0 }
  let candidateValley = { angle: Infinity, t: 0 }

  for (let i = 1; i < smoothed.length; i++) {
    const prev = smoothed[i - 1].angle
    const curr = smoothed[i].angle
    const currT = smoothed[i].t
    const diff = curr - prev

    if (Math.abs(diff) < 1.0) continue // ignore tiny jitter

    const newDir: 'up' | 'down' = diff > 0 ? 'up' : 'down'

    if (direction === null) {
      direction = newDir
      if (newDir === 'up') {
        candidateValley = { angle: prev, t: smoothed[i - 1].t }
      } else {
        candidatePeak = { angle: prev, t: smoothed[i - 1].t }
      }
      continue
    }

    if (newDir !== direction) {
      // Direction change — potential peak/valley
      if (direction === 'up') {
        // Was going up, now down → peak
        candidatePeak = { angle: prev, t: smoothed[i - 1].t }
        // Check if peak is sufficiently above last valley
        const excursion = candidatePeak.angle - lastValley
        const timeSinceLastRep = candidatePeak.t - lastPeakTime
        if (
          excursion >= minExcursion &&
          timeSinceLastRep >= minTimeBetweenReps &&
          candidatePeak.angle - lastValley >= hysteresis
        ) {
          // Valid peak, but we count rep on full cycle (peak->valley or valley->peak)
          // For simplicity, count when we have both peak and valley with enough excursion
          // We'll count when valley after peak is found
        }
      } else {
        // Was going down, now up → valley
        candidateValley = { angle: prev, t: smoothed[i - 1].t }
        // Check if we completed a cycle
        const excursionDown = candidatePeak.angle - candidateValley.angle
        // Count rep if we had a peak then valley with sufficient excursion
        if (
          lastPeak !== -Infinity &&
          excursionDown >= minExcursion &&
          candidateValley.t - lastPeakTime >= minTimeBetweenReps * 0.5
        ) {
          // Ensure not double counting small jitter
          if (candidatePeak.angle - candidateValley.angle >= hysteresis) {
            reps++
            lastPeakTime = candidatePeak.t
            lastValley = candidateValley.angle
            lastValleyTime = candidateValley.t
            // Reset peak to avoid double count
            lastPeak = -Infinity
          }
        }
        // Also check opposite direction for counting
        const excursionFromValley = candidatePeak.angle - candidateValley.angle
        if (
          candidatePeak.angle !== -Infinity &&
          excursionFromValley >= minExcursion &&
          candidatePeak.t - lastValleyTime >= minTimeBetweenReps * 0.5
        ) {
          // Alternative counting: valley->peak
          // Already handled above, but keep logic symmetric
        }
      }
      direction = newDir
    }

    // Update candidate peak/valley tracking
    if (direction === 'up') {
      if (curr > candidatePeak.angle) {
        candidatePeak = { angle: curr, t: currT }
      }
      // Update last valley if this is lowest
      if (candidateValley.angle < lastValley) {
        // keep
      }
    } else {
      if (curr < candidateValley.angle) {
        candidateValley = { angle: curr, t: currT }
      }
      if (curr > lastPeak) {
        lastPeak = curr
        // Don't update time yet, wait for direction change
      }
    }

    // Track peaks for future
    if (direction === 'up' && curr > lastPeak) {
      lastPeak = curr
    }
    if (direction === 'down' && curr < lastValley) {
      lastValley = curr
    }
  }

  // Fallback simple peak counting if hysteresis method found 0 but clear movement exists
  // Use more robust peak detection as secondary
  if (reps === 0 && range >= 20) {
    let simpleReps = 0
    let lastPeakSimple = -Infinity
    let lastPeakTimeSimple = -Infinity
    for (let i = 1; i < smoothed.length - 1; i++) {
      const prev = smoothed[i - 1].angle
      const curr = smoothed[i].angle
      const next = smoothed[i + 1].angle
      const t = smoothed[i].t
      if (curr > prev && curr > next) {
        // Peak
        if (curr - minAngle >= minExcursion && t - lastPeakTimeSimple >= minTimeBetweenReps) {
          if (curr - lastPeakSimple >= hysteresis) {
            simpleReps++
            lastPeakSimple = curr
            lastPeakTimeSimple = t
          }
        }
      }
    }
    reps = simpleReps
  }

  // Smoothness via jitter (second derivative) — lower jitter = higher smoothness
  let jitter = 0
  for (let i = 2; i < angles.length; i++) {
    jitter += Math.abs(angles[i] - 2 * angles[i - 1] + angles[i - 2])
  }
  const avgJitter = jitter / (angles.length || 1)
  const smoothness = Math.max(0, Math.min(1, 1 - avgJitter / 5))

  // Stability: variance of angle differences — lower avg diff = more stable
  const diffs = angles.slice(1).map((a, i) => Math.abs(a - angles[i]))
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / (diffs.length || 1)
  const stability = Math.max(0, Math.min(1, 1 - avgDiff / 20))

  const avgConfidence = validSamples.reduce((a, s) => a + s.confidence, 0) / (validSamples.length || 1)

  // Performed if sufficient real data per spec: range>10, samples>10, confidence>0.3
  const performed = range > 10 && validSamples.length > 10 && avgConfidence > 0.3 && durationSec >= 3

  return {
    samples,
    minAngle,
    maxAngle,
    rangeOfMotionDeg: Math.round(range), // REAL ROM = max - min, no fake
    repetitions: reps, // REAL reps, no timer heuristic
    smoothness: Number(smoothness.toFixed(2)),
    avgConfidence: Number(avgConfidence.toFixed(2)),
    stability: Number(stability.toFixed(2)),
    durationSec,
    performed,
    validSampleCount: validSamples.length,
  }
}

export function toMovementSummary(metrics: MovementMetrics): MovementSummary {
  return {
    rangeOfMotionDeg: metrics.rangeOfMotionDeg,
    smoothness: metrics.smoothness,
    durationSec: metrics.durationSec,
    repetitions: metrics.repetitions,
    performed: metrics.performed,
  }
}

/**
 * Calculate angle from landmarks with quality checks per spec
 * - verify landmark exists
 * - verify coordinates finite
 * - verify confidence/visibility sufficient
 * - reject unusable frames
 */
export function angleFromLandmarks(
  landmarks: PosePoint[],
  config: JointConfig
): { angle: number; confidence: number; valid: boolean } {
  const [aIdx, bIdx, cIdx] = config.angleTriplet
  const a = landmarks[aIdx]
  const b = landmarks[bIdx]
  const c = landmarks[cIdx]

  if (!a || !b || !c) {
    return { angle: 0, confidence: 0, valid: false }
  }

  // Check finite coordinates
  if (
    !Number.isFinite(a.x) || !Number.isFinite(a.y) ||
    !Number.isFinite(b.x) || !Number.isFinite(b.y) ||
    !Number.isFinite(c.x) || !Number.isFinite(c.y)
  ) {
    return { angle: 0, confidence: 0, valid: false }
  }

  // Check visibility/confidence per spec
  const visA = a.visibility ?? 0
  const visB = b.visibility ?? 0
  const visC = c.visibility ?? 0

  // Require at least 0.3 visibility for each required landmark
  if (visA < 0.3 || visB < 0.3 || visC < 0.3) {
    const avgConf = (visA + visB + visC) / 3
    return { angle: 0, confidence: avgConf, valid: false }
  }

  const angle = calculateAngle(a, b, c)

  if (!Number.isFinite(angle) || angle <= 0 || angle > 180) {
    return { angle: 0, confidence: 0, valid: false }
  }

  const conf = (visA + visB + visC) / 3
  return { angle, confidence: conf, valid: true }
}
