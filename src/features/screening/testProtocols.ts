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
      
      for (let i = 0; i < Math.min(30, valid.length); i++) {
        const lms = valid[i].landmarks
        if (!lms || !lms[11] || !lms[12] || !lms[23] || !lms[24]) continue
        const shoulderY = (lms[11].y + lms[12].y) / 2
        const hipY = (lms[23].y + lms[24].y) / 2
        const torso = hipY - shoulderY
        if (torso > 0.01) {
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
         if (!lms || !lms[23] || !lms[24]) return
         
         const hipY = (lms[23].y + lms[24].y) / 2
         
         if (state === 'READY') {
             state = 'SITTING'
             max_y = hipY
             min_y = hipY
         }
         
         if (state === 'SITTING') {
             if (hipY > max_y) max_y = hipY
             
             if (max_y - hipY > 0.25 * bodyScale) {
                 candidateState = 'RISING'
             } else {
                 candidateState = 'SITTING'
             }
         } 
         else if (state === 'RISING') {
             if (max_y - hipY > 0.55 * bodyScale) {
                 candidateState = 'STANDING'
                 min_y = hipY
             } else if (hipY > max_y - 0.15 * bodyScale) {
                 candidateState = 'SITTING'
             }
         }
         else if (state === 'STANDING') {
             if (hipY < min_y) min_y = hipY
             
             if (hipY - min_y > 0.25 * bodyScale) {
                 candidateState = 'LOWERING'
             } else {
                 candidateState = 'STANDING'
             }
         }
         else if (state === 'LOWERING') {
             if (hipY - min_y > 0.55 * bodyScale) {
                 candidateState = 'SITTING'
                 max_y = hipY
                 reps++ 
             } else if (hipY < min_y + 0.15 * bodyScale) {
                 candidateState = 'STANDING'
             }
         }
         
         if (candidateState !== state) {
             consecutiveFrames++
             if (consecutiveFrames >= 4) {
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
    implemented: false,
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

      const isVis = (lm: any) => (lm.visibility || 0) > 0.3

      valid.forEach(s => {
          const lms = s.landmarks
          if (!lms) return
          if (lms[23] && lms[25] && lms[27] && isVis(lms[23]) && isVis(lms[25]) && isVis(lms[27])) {
              const ang = getAngle(lms[23], lms[25], lms[27])
              if (stateL === 'ext' && ang < 150) stateL = 'flex'
              else if (stateL === 'flex' && ang > 165) { stateL = 'ext'; leftCycles++ }
          }
          if (lms[24] && lms[26] && lms[28] && isVis(lms[24]) && isVis(lms[26]) && isVis(lms[28])) {
              const ang = getAngle(lms[24], lms[26], lms[28])
              if (stateR === 'ext' && ang < 150) stateR = 'flex'
              else if (stateR === 'flex' && ang > 165) { stateR = 'ext'; rightCycles++ }
          }
      })
      
      const totalCycles = leftCycles + rightCycles
      // Early completion: if we captured at least 2 valid strides across either leg
      if (totalCycles >= 2) return true
      
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

      const isVis = (lm: any) => (lm.visibility || 0) > 0.3

      valid.forEach(s => {
          const lms = s.landmarks
          if (!lms) return
          if (lms[23] && lms[25] && lms[27] && isVis(lms[23]) && isVis(lms[25]) && isVis(lms[27])) {
              const ang = getAngle(lms[23], lms[25], lms[27])
              if (ang < minFlexL) minFlexL = ang
              if (stateL === 'ext' && ang < 150) stateL = 'flex'
              else if (stateL === 'flex' && ang > 165) { stateL = 'ext'; leftCycles++ }
          }
          if (lms[24] && lms[26] && lms[28] && isVis(lms[24]) && isVis(lms[26]) && isVis(lms[28])) {
              const ang = getAngle(lms[24], lms[26], lms[28])
              if (ang < minFlexR) minFlexR = ang
              if (stateR === 'ext' && ang < 150) stateR = 'flex'
              else if (stateR === 'flex' && ang > 165) { stateR = 'ext'; rightCycles++ }
          }
      })

      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      const totalCycles = leftCycles + rightCycles
      
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
      
      const firstT = valid.length > 0 ? valid[0].t : 0
      const lastT = valid.length > 0 ? valid[valid.length - 1].t : 0
      const durationSec = valid.length > 0 ? (lastT - firstT) / 1000 : 0
      
      // If we don't have at least some basic number of frames, it's totally invalid.
      // 15 frames is extremely lenient (1.5 seconds at a very low 10 FPS).
      if (valid.length < 15) {
        return { performed: false, leftKneeAngle: null, rightKneeAngle: null }
      }
      
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
      let anglesL: number[] = []
      let anglesR: number[] = []
      
      const isVis = (lm: any) => (lm.visibility || 0) > 0.3

      valid.forEach(s => {
          const lms = s.landmarks
          if (!lms) return
          if (lms[23] && lms[25] && lms[27] && isVis(lms[23]) && isVis(lms[25]) && isVis(lms[27])) {
              const ang = getAngle(lms[23], lms[25], lms[27])
              if (isFinite(ang) && !isNaN(ang)) {
                  sumL += ang
                  anglesL.push(ang)
                  countL++
              }
          }
          if (lms[24] && lms[26] && lms[28] && isVis(lms[24]) && isVis(lms[26]) && isVis(lms[28])) {
              const ang = getAngle(lms[24], lms[26], lms[28])
              if (isFinite(ang) && !isNaN(ang)) {
                  sumR += ang
                  anglesR.push(ang)
                  countR++
              }
          }
      })
      
      const calcVariance = (angles: number[], mean: number) => {
          if (angles.length === 0) return 0
          const sumSq = angles.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0)
          return sumSq / angles.length
      }

      const meanL = countL > 0 ? (sumL / countL) : null
      const meanR = countR > 0 ? (sumR / countR) : null
      
      const varL = countL > 1 ? calcVariance(anglesL, meanL!) : 0
      const varR = countR > 1 ? calcVariance(anglesR, meanR!) : 0
      
      // Ensure the posture was relatively stable (variance < 150 is approx std dev < 12 degrees)
      const isStableL = countL > 0 && varL < 150
      const isStableR = countR > 0 && varR < 150

      let diff = null
      if (meanL !== null && meanR !== null) {
          diff = Math.abs(meanL - meanR)
      }

      const performed = isStableL || isStableR

      let rejectionReason = 'Sufficient data'
      if (!performed) {
          if (countL === 0 && countR === 0) rejectionReason = 'Insufficient reliable knee landmarks'
          else if (!isStableL && !isStableR) rejectionReason = 'Pose was unstable (variance too high)'
          else rejectionReason = 'Unknown failure'
      }

      console.log('POSTURE DEBUG', {
        durationSec,
        realSamples: samples.length,
        validSamples: valid.length,
        validLeftKneeAngleFrames: countL,
        validRightKneeAngleFrames: countR,
        leftAngleSamplesLength: anglesL.length,
        rightAngleSamplesLength: anglesR.length,
        leftMeanAngle: meanL,
        rightMeanAngle: meanR,
        leftVariance: varL,
        rightVariance: varR,
        leftStdDev: meanL !== null ? Math.sqrt(varL) : 0,
        rightStdDev: meanR !== null ? Math.sqrt(varR) : 0,
        validFrameRatio: valid.length / Math.max(1, samples.length),
        status: performed ? 'SUFFICIENT' : 'INSUFFICIENT',
        performed,
        rejectionReason
      })

      return { 
          leftKneeAngle: meanL !== null ? meanL.toFixed(1) : null,
          rightKneeAngle: meanR !== null ? meanR.toFixed(1) : null,
          leftRightDifference: diff !== null ? diff.toFixed(1) : null,
          durationSec,
          performed
      }
    },
    validationCriteria: (result: any) => {
      return result?.measurements?.performed === true
    },
    retryConditions: (result: any) => {
      return result?.status === 'INSUFFICIENT'
    },
    workerResultFormatter: (result: any) => ({
      postureData: result?.measurements?.performed ? 'Sufficient' : 'Insufficient data',
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
