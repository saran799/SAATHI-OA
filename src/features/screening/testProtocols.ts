import type { TestDefinition, TestResult } from '../../domain/types'

export const TEST_PROTOCOLS: TestDefinition[] = [
  {
    id: 'rom',
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
      // If we see at least 20 degrees of movement, consider it sufficient
      return (maxAngle - minAngle) >= 20
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
    id: 'functional',
    title: 'Functional Movement',
    preparationInstruction: 'Please ask the patient to prepare for a functional movement test.',
    voiceInstruction: 'Please ask the patient to stand up from the chair and sit back down.',
    requiredLandmarks: [],
    recordingMode: 'event',
    timeoutSec: 30,
    completionCriteria: () => false, // Not implemented
    validationCriteria: () => false,
    retryConditions: () => false,
    workerResultFormatter: () => ({ status: 'Not implemented' }),
    technicalResultFormatter: () => ({})
  },
  {
    id: 'gait',
    title: 'Gait',
    preparationInstruction: 'Please ask the patient to stand at the end of the walkway facing the camera.',
    voiceInstruction: 'Please ask the patient to walk toward the camera normally.',
    requiredLandmarks: [],
    recordingMode: 'continuous',
    timeoutSec: 30,
    completionCriteria: () => false, // Not implemented
    validationCriteria: () => false,
    retryConditions: () => false,
    workerResultFormatter: () => ({ status: 'Not implemented' }),
    technicalResultFormatter: () => ({})
  },
  {
    id: 'posture',
    title: 'Posture',
    preparationInstruction: 'Please ask the patient to stand naturally facing the camera.',
    voiceInstruction: 'Please ask the patient to stand still for 5 seconds.',
    requiredLandmarks: [],
    recordingMode: 'continuous',
    timeoutSec: 10,
    completionCriteria: () => false, // Not implemented
    validationCriteria: () => false,
    retryConditions: () => false,
    workerResultFormatter: () => ({ status: 'Not implemented' }),
    technicalResultFormatter: () => ({})
  }
]
