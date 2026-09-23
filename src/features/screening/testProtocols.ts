import type { TestDefinition } from '../../domain/types'

export const TEST_PROTOCOLS: TestDefinition[] = [
  {
    id: 'rom',
    implemented: false,
    title: 'Joint Movement',
    preparationInstruction: 'Please ask the patient to sit on the chair and face the camera.',
    voiceInstruction: 'Please ask the patient to slowly bend the affected joint as far as comfortable and then slowly straighten it. Continue the movement naturally.',
    requiredLandmarks: [24, 26, 28], // Default to right leg if not overridden by joint config
    recordingMode: 'continuous',
    timeoutSec: 30,
    completionCriteria: (samples: any[]) => {
      if (samples.length < 30) return false
      // Simple criteria: at least 1 rep or enough varied movement
      const valid = samples.filter(s => s.valid)
      if (valid.length < 30) return false
      
      const maxAngle = Math.max(...valid.map(s => s.angle))
      const minAngle = Math.min(...valid.map(s => s.angle))
      
      // NOTE: minimumMovementVariationForCapture is NOT a clinical threshold for OA.
      // It is solely an engineering threshold to confirm the camera successfully captured sufficient variation
      // in the landmark angles to constitute "a movement" rather than just static noise.
      const minimumMovementVariationForCapture = 20;
      return (maxAngle - minAngle) >= minimumMovementVariationForCapture
    },
    extractMetrics: (samples: any[]) => {
      const valid = samples.filter(s => s.valid)
      const maxAngle = valid.length > 0 ? Math.max(...valid.map(s => s.angle)) : 0
      const minAngle = valid.length > 0 ? Math.min(...valid.map(s => s.angle)) : 0
      const firstT = valid[0]?.t || 0
      const lastT = valid[valid.length - 1]?.t || 0
      return { 
        rangeOfMotionDeg: maxAngle - minAngle, 
        durationSec: (lastT - firstT) / 1000, 
        performed: valid.length >= 30 
      }
    },
    validationCriteria: (result: any) => {
      return result.status === 'VALID'
    },
    retryConditions: (result: any) => {
      return result.status === 'INSUFFICIENT' || result.status === 'INVALID'
    },
    workerResultFormatter: (result: any) => {
      return {
        movement: result.measurements?.performed ? 'Detected' : 'Not detected',
        quality: result.quality
      }
    },
    technicalResultFormatter: (result: any) => {
      return {
        ...result.technicalDetails
      }
    }
  },
  {
    /*
     * RESEARCH & RATIONALE for Functional Test (OARSI Recommended: 30s Chair Stand Test)
     * The 30s Chair Stand Test is highly recommended by OARSI for hip/knee OA to assess lower body strength.
     * Feasibility: Safe, requires only a standard chair, easily understood, and feasible to track with
     * smartphone computer vision (tracking vertical displacement of hip/shoulder landmarks).
     */
    id: 'functional',
    implemented: false,
    title: 'Functional Movement',
    preparationInstruction: 'Please ask the patient to prepare for a functional movement test.',
    voiceInstruction: 'Please ask the patient to stand up from the chair and sit back down as many times as possible for 30 seconds.',
    requiredLandmarks: [],
    recordingMode: 'event',
    timeoutSec: 30,
    completionCriteria: (samples: any[]) => {
      const valid = samples.filter(s => s.valid && s.landmarks)
      if (valid.length < 10) return false
      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      // Run the test for a full 30 seconds.
      return (lastT - firstT) >= 30000
    }, 
    extractMetrics: (samples: any[]) => {
      const valid = samples.filter(s => s.valid && s.landmarks)
      if (valid.length === 0) return { performed: false, repetitions: 0, durationSec: 0 }
      
      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      
      let reps = 0
      
      type ChairStandState = 'READY' | 'SITTING' | 'RISING' | 'STANDING' | 'LOWERING';
      let state: ChairStandState = 'READY'
      
      let initialTorsoHeightSum = 0
      let initialFramesCount = 0
      
      // Calculate person-scale normalization factor from initial frames
      for (let i = 0; i < Math.min(30, valid.length); i++) {
        const lms = valid[i].landmarks
        if (!lms || !lms[11] || !lms[12] || !lms[23] || !lms[24]) continue
        const shoulderY = (lms[11].y + lms[12].y) / 2
        const hipY = (lms[23].y + lms[24].y) / 2
        const torso = hipY - shoulderY
        if (torso > 0.05) {
          initialTorsoHeightSum += torso
          initialFramesCount++
        }
      }
      
      const bodyScale = initialFramesCount > 0 ? (initialTorsoHeightSum / initialFramesCount) : 0.2
      
      let min_y = 1
      let max_y = 0
      let consecutiveFrames = 0
      let candidateState: ChairStandState = state
      
      valid.forEach(s => {
         const lms = s.landmarks
         if (!lms || !lms[11] || !lms[12] || !lms[23] || !lms[24]) return
         
         const shoulderY = (lms[11].y + lms[12].y) / 2
         const hipY = (lms[23].y + lms[24].y) / 2
         const centerY = (shoulderY + hipY) / 2
         
         if (state === 'READY') {
             state = 'SITTING' // assume test starts sitting
             max_y = centerY
             min_y = centerY
         }
         
         if (state === 'SITTING') {
             if (centerY > max_y) max_y = centerY
             
             // Rising threshold: move up (Y decreases) by 20% of torso height
             if (max_y - centerY > 0.2 * bodyScale) {
                 candidateState = 'RISING'
             } else {
                 candidateState = 'SITTING'
             }
         } 
         else if (state === 'RISING') {
             // Standing entry: move up by 45% of torso height
             if (max_y - centerY > 0.45 * bodyScale) {
                 candidateState = 'STANDING'
                 min_y = centerY
             } else if (centerY > max_y - 0.1 * bodyScale) {
                 // Aborted rise, fell back down
                 candidateState = 'SITTING'
             }
         }
         else if (state === 'STANDING') {
             if (centerY < min_y) min_y = centerY
             
             // Lowering threshold: move down (Y increases) by 20% of torso height
             if (centerY - min_y > 0.2 * bodyScale) {
                 candidateState = 'LOWERING'
             } else {
                 candidateState = 'STANDING'
             }
         }
         else if (state === 'LOWERING') {
             // Sitting entry: move down by 45% of torso height
             if (centerY - min_y > 0.45 * bodyScale) {
                 candidateState = 'SITTING'
                 max_y = centerY
                 reps++ // SITTING -> STANDING -> SITTING = 1 cycle completed
             } else if (centerY < min_y + 0.1 * bodyScale) {
                 // Aborted lower, stood back up
                 candidateState = 'STANDING'
             }
         }
         
         // Temporal confirmation logic (require 3 consecutive frames of candidate state)
         if (candidateState !== state) {
             consecutiveFrames++
             if (consecutiveFrames >= 3) {
                 state = candidateState
                 consecutiveFrames = 0
             }
         } else {
             consecutiveFrames = 0
         }
      })
      
      return { repetitions: reps, durationSec: (lastT - firstT)/1000, performed: true, note: 'Camera-derived estimate' }
    },
    validationCriteria: (result: any) => {
      return result?.measurements?.performed === true
    },
    retryConditions: (result: any) => {
      return result?.status === 'INSUFFICIENT'
    },
    workerResultFormatter: (result: any) => ({ 
      movement: result?.measurements?.performed ? 'Detected' : 'Not detected',
      repetitions: result?.measurements?.repetitions,
      quality: result?.quality || 'Unknown' 
    }),
    technicalResultFormatter: (result: any) => ({
      ...result?.technicalDetails
    })
  },
  {
    /*
     * RESEARCH & RATIONALE for Gait Test (OARSI Recommended: 40m Fast-Paced Walk or 10m Walk Test)
     * A short walking test is a core performance measure. A 10m walk test (or similar short distance)
     * is more feasible for community settings/PHCs where space is limited, compared to 40m or 6-minute walk.
     * Feasibility: Can track asymmetric step lengths or velocity via MediaPipe if patient walks perpendicular to camera.
     */
    id: 'gait',
    implemented: true,
    title: 'Gait',
    preparationInstruction: 'Please ask the patient to stand at the end of the walkway sideways to the camera.',
    voiceInstruction: 'Please ask the patient to walk across the camera view normally.',
    requiredLandmarks: [],
    recordingMode: 'continuous',
    timeoutSec: 15,
    completionCriteria: (samples: any[]) => {
      const valid = samples.filter(s => s.valid && s.landmarks)
      if (valid.length < 10) return false
      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      
      const getAngle = (h: any, k: any, a: any) => {
          const dx1 = h.x - k.x, dy1 = h.y - k.y
          const dx2 = a.x - k.x, dy2 = a.y - k.y
          let angle = Math.atan2(dy1, dx1) - Math.atan2(dy2, dx2)
          angle = angle * 180 / Math.PI
          if (angle < 0) angle += 360
          return angle <= 180 ? angle : 360 - angle
      }

      let leftCycles = 0
      let rightCycles = 0
      let stateL = 'ext'
      let stateR = 'ext'

      valid.forEach(s => {
          const lms = s.landmarks
          if (!lms) return
          if (lms[23] && lms[25] && lms[27]) {
              const ang = getAngle(lms[23], lms[25], lms[27])
              if (stateL === 'ext' && ang < 150) stateL = 'flex'
              else if (stateL === 'flex' && ang > 165) { stateL = 'ext'; leftCycles++ }
          }
          if (lms[24] && lms[26] && lms[28]) {
              const ang = getAngle(lms[24], lms[26], lms[28])
              if (stateR === 'ext' && ang < 150) stateR = 'flex'
              else if (stateR === 'flex' && ang > 165) { stateR = 'ext'; rightCycles++ }
          }
      })
      
      // Early completion: if we captured at least 2 valid cycles per leg
      if (leftCycles >= 2 && rightCycles >= 2) return true
      
      return (lastT - firstT) >= 15000
    }, 
    extractMetrics: (samples: any[]) => {
      const valid = samples.filter(s => s.valid && s.landmarks)
      if (valid.length === 0) return { performed: false, validCycles: 0 }
      
      const getAngle = (h: any, k: any, a: any) => {
          const dx1 = h.x - k.x, dy1 = h.y - k.y
          const dx2 = a.x - k.x, dy2 = a.y - k.y
          let angle = Math.atan2(dy1, dx1) - Math.atan2(dy2, dx2)
          angle = angle * 180 / Math.PI
          if (angle < 0) angle += 360
          return angle <= 180 ? angle : 360 - angle
      }

      let leftCycles = 0
      let rightCycles = 0
      let stateL = 'ext'
      let stateR = 'ext'
      
      let minFlexL = 180
      let minFlexR = 180

      valid.forEach(s => {
          const lms = s.landmarks
          if (!lms) return
          if (lms[23] && lms[25] && lms[27]) {
              const ang = getAngle(lms[23], lms[25], lms[27])
              if (ang < minFlexL) minFlexL = ang
              if (stateL === 'ext' && ang < 150) stateL = 'flex'
              else if (stateL === 'flex' && ang > 165) { stateL = 'ext'; leftCycles++ }
          }
          if (lms[24] && lms[26] && lms[28]) {
              const ang = getAngle(lms[24], lms[26], lms[28])
              if (ang < minFlexR) minFlexR = ang
              if (stateR === 'ext' && ang < 150) stateR = 'flex'
              else if (stateR === 'flex' && ang > 165) { stateR = 'ext'; rightCycles++ }
          }
      })

      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      const totalCycles = Math.min(leftCycles, rightCycles)
      
      return { 
          validCycles: totalCycles,
          peakKneeFlexionLeft: minFlexL < 180 ? minFlexL.toFixed(1) : null,
          peakKneeFlexionRight: minFlexR < 180 ? minFlexR.toFixed(1) : null,
          durationSec: (lastT - firstT)/1000, 
          performed: totalCycles >= 2
      }
    },
    validationCriteria: (result: any) => {
      return result?.measurements?.performed === true
    },
    retryConditions: (result: any) => {
      return result?.status === 'INSUFFICIENT'
    },
    workerResultFormatter: (result: any) => ({
      movement: result?.measurements?.performed ? 'Detected' : 'Not detected',
      validCycles: result?.measurements?.validCycles,
      peakFlexionL: result?.measurements?.peakKneeFlexionLeft ? `${result.measurements.peakKneeFlexionLeft}°` : 'N/A',
      peakFlexionR: result?.measurements?.peakKneeFlexionRight ? `${result.measurements.peakKneeFlexionRight}°` : 'N/A',
      quality: result?.quality || 'Unknown' 
    }),
    technicalResultFormatter: (result: any) => ({
      ...result?.technicalDetails
    })
  },
  {
    id: 'posture',
    implemented: true,
    title: 'Posture',
    preparationInstruction: 'Please ask the patient to stand naturally facing the camera.',
    voiceInstruction: 'Please ask the patient to stand still for 5 seconds.',
    requiredLandmarks: [],
    recordingMode: 'continuous',
    timeoutSec: 5,
    completionCriteria: (samples: any[]) => {
      const valid = samples.filter(s => s.valid && s.landmarks)
      if (valid.length < 10) return false
      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      return (lastT - firstT) >= 5000
    }, 
    extractMetrics: (samples: any[]) => {
      const valid = samples.filter(s => s.valid && s.landmarks)
      // Enforce minimum valid data ratio: 5 seconds should have ~150 frames, we need at least 60 valid frames
      if (valid.length < 60) return { performed: false, leftKneeAngle: null, rightKneeAngle: null }
      
      const getAngle = (h: any, k: any, a: any) => {
          const dx1 = h.x - k.x, dy1 = h.y - k.y
          const dx2 = a.x - k.x, dy2 = a.y - k.y
          let angle = Math.atan2(dy1, dx1) - Math.atan2(dy2, dx2)
          angle = angle * 180 / Math.PI
          if (angle < 0) angle += 360
          return angle <= 180 ? angle : 360 - angle
      }

      let sumL = 0, countL = 0
      let sumR = 0, countR = 0
      
      valid.forEach(s => {
          const lms = s.landmarks
          if (!lms) return
          if (lms[23] && lms[25] && lms[27]) {
              sumL += getAngle(lms[23], lms[25], lms[27])
              countL++
          }
          if (lms[24] && lms[26] && lms[28]) {
              sumR += getAngle(lms[24], lms[26], lms[28])
              countR++
          }
      })
      
      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      
      const leftKneeAngle = countL > 30 ? (sumL / countL) : null
      const rightKneeAngle = countR > 30 ? (sumR / countR) : null
      
      let diff = null
      if (leftKneeAngle !== null && rightKneeAngle !== null) {
          diff = Math.abs(leftKneeAngle - rightKneeAngle)
      }

      return { 
          leftKneeAngle: leftKneeAngle ? leftKneeAngle.toFixed(1) : null,
          rightKneeAngle: rightKneeAngle ? rightKneeAngle.toFixed(1) : null,
          leftRightDifference: diff ? diff.toFixed(1) : null,
          durationSec: (lastT - firstT)/1000,
          performed: leftKneeAngle !== null || rightKneeAngle !== null
      }
    },
    validationCriteria: (result: any) => {
      return result?.measurements?.performed === true
    },
    retryConditions: (result: any) => {
      return result?.status === 'INSUFFICIENT'
    },
    workerResultFormatter: (result: any) => ({
      movement: result?.measurements?.performed ? 'Captured' : 'Insufficient data',
      leftKneeAngle: result?.measurements?.leftKneeAngle ? `${result.measurements.leftKneeAngle}°` : 'Unavailable',
      rightKneeAngle: result?.measurements?.rightKneeAngle ? `${result.measurements.rightKneeAngle}°` : 'Unavailable',
      symmetryDifference: result?.measurements?.leftRightDifference ? `${result.measurements.leftRightDifference}°` : 'Unavailable',
      quality: result?.quality || 'Unknown' 
    }),
    technicalResultFormatter: (result: any) => ({
      ...result?.technicalDetails
    })
  }
]
