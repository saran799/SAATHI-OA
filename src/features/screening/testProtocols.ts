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
    completionCriteria: (_samples: any[]) => {
      // Stub: Wait for 30s or explicit 0 reps completion
      return false
    }, 
    validationCriteria: (result: any) => {
      // Must have detected stand/sit transitions
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
    preparationInstruction: 'Please ask the patient to stand at the end of the walkway facing the camera.',
    voiceInstruction: 'Please ask the patient to walk toward the camera normally.',
    requiredLandmarks: [],
    recordingMode: 'continuous',
    timeoutSec: 30,
    completionCriteria: (_samples: any[]) => {
      // Stub: Distance covered or steps counted
      return false
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
  },
  {
    id: 'posture',
    implemented: false,
    title: 'Posture',
    preparationInstruction: 'Please ask the patient to stand naturally facing the camera.',
    voiceInstruction: 'Please ask the patient to stand still for 5 seconds.',
    requiredLandmarks: [],
    recordingMode: 'continuous',
    timeoutSec: 10,
    completionCriteria: (_samples: any[]) => {
      // Stub: 10s held successfully
      return false
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
