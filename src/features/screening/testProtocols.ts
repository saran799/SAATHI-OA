import type { TestDefinition } from '../../domain/types'

export const TEST_PROTOCOLS: TestDefinition[] = [
  {
    id: 'rom',
    implemented: true,
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
    implemented: true,
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
      
      let reps = 0
      let state = 'standing'
      let max_y = 0
      let min_y = 1
      valid.forEach(s => {
         const lms = s.landmarks
         if (!lms || !lms[11] || !lms[12]) return
         const shoulderY = (lms[11].y + lms[12].y) / 2
         if (state === 'standing') {
             if (shoulderY > min_y + 0.15) { // moved down significantly
                 state = 'sitting'
                 max_y = shoulderY
             } else if (shoulderY < min_y) {
                 min_y = shoulderY
             }
         } else {
             if (shoulderY < max_y - 0.15) { // moved up significantly
                 state = 'standing'
                 min_y = shoulderY
                 reps++
             } else if (shoulderY > max_y) {
                 max_y = shoulderY
             }
         }
      })
      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      return { repetitions: reps, durationSec: (lastT - firstT)/1000, performed: true }
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
    preparationInstruction: 'Please ask the patient to stand at the end of the walkway facing the camera.',
    voiceInstruction: 'Please ask the patient to walk toward the camera normally.',
    requiredLandmarks: [],
    recordingMode: 'continuous',
    timeoutSec: 10,
    completionCriteria: (samples: any[]) => {
      const valid = samples.filter(s => s.valid && s.landmarks)
      if (valid.length < 10) return false
      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      // Collect 10 seconds of gait data
      return (lastT - firstT) >= 10000
    }, 
    extractMetrics: (samples: any[]) => {
      const valid = samples.filter(s => s.valid && s.landmarks)
      if (valid.length === 0) return { performed: false }
      
      let stepEvents = 0
      let state = 'apart'
      let max_d = 0
      
      valid.forEach(s => {
         const lms = s.landmarks
         if (!lms || !lms[27] || !lms[28]) return
         const d = Math.abs(lms[27].x - lms[28].x) + Math.abs(lms[27].z - lms[28].z)
         if (state === 'apart') {
             if (d < max_d * 0.5 && max_d > 0.05) {
                 state = 'together'
             } else if (d > max_d) {
                 max_d = d
             }
         } else {
             if (d > 0.05) {
                 state = 'apart'
                 max_d = d
                 stepEvents++
             }
         }
      })
      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      return { stepEvents, durationSec: (lastT - firstT)/1000, performed: true, note: 'Camera-derived estimate' }
    },
    validationCriteria: (result: any) => {
      return result?.measurements?.performed === true
    },
    retryConditions: (result: any) => {
      return result?.status === 'INSUFFICIENT'
    },
    workerResultFormatter: (result: any) => ({
      movement: result?.measurements?.performed ? 'Detected' : 'Not detected',
      stepEvents: result?.measurements?.stepEvents,
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
      // Collect 5 seconds of stable posture data
      return (lastT - firstT) >= 5000
    }, 
    extractMetrics: (samples: any[]) => {
      const valid = samples.filter(s => s.valid && s.landmarks)
      if (valid.length === 0) return { performed: false }
      
      let shoulderTiltSum = 0
      let hipTiltSum = 0
      
      valid.forEach(s => {
          const lms = s.landmarks
          if (!lms || !lms[11] || !lms[12] || !lms[23] || !lms[24]) return
          // angle of shoulder line (11-12) vs horizontal
          const dxS = lms[12].x - lms[11].x
          const dyS = lms[12].y - lms[11].y
          shoulderTiltSum += Math.abs(Math.atan2(dyS, dxS))
          
          const dxH = lms[24].x - lms[23].x
          const dyH = lms[24].y - lms[23].y
          hipTiltSum += Math.abs(Math.atan2(dyH, dxH))
      })
      const firstT = valid[0].t
      const lastT = valid[valid.length - 1].t
      return { 
          shoulderAlignment: (shoulderTiltSum / valid.length).toFixed(2), 
          hipAlignment: (hipTiltSum / valid.length).toFixed(2),
          durationSec: (lastT - firstT)/1000,
          performed: true 
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
      quality: result?.quality || 'Unknown' 
    }),
    technicalResultFormatter: (result: any) => ({
      ...result?.technicalDetails
    })
  }
]
