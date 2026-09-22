export type Sex = 'Female' | 'Male' | 'Other'
export type Joint = 'knee' | 'hip' | 'hand' | 'spine'
export type Side = 'left' | 'right' | 'both'
export type RiskBand = 'low' | 'moderate' | 'higher' | 'insufficient'
export type SyncState = 'local' | 'unsynced' | 'syncing' | 'synced' | 'error' | 'failed'

export interface Patient {
  id: string
  name: string
  age: number
  sex: Sex
  phone: string
  village: string
  phc: string
  healthId?: string
  heightCm?: number
  weightKg?: number
  occupation: string
  priorInjury: boolean
  familyHistory: boolean
  createdAt: string
}

export interface Answers { [questionId: string]: number }

export interface MovementSummary {
  rangeOfMotionDeg: number
  smoothness: number // 0-1
  durationSec: number
  repetitions: number
  performed: boolean
}

export type TestStatus = 'VALID' | 'INSUFFICIENT' | 'INVALID' | 'FAILED' | 'NOT_COMPLETED' | 'BLOCKED' | 'PARTIAL'

export interface TestResult {
  testId: string
  status: TestStatus
  completed: boolean
  quality: string
  measurements: any
  observations: string[]
  technicalDetails: any
  timestamp: number
}

export interface TestDefinition {
  id: string
  implemented: boolean
  title: string
  preparationInstruction: string
  voiceInstruction: string
  requiredLandmarks: number[]
  recordingMode: 'continuous' | 'event'
  completionCriteria: (samples: any[]) => boolean
  extractMetrics: (samples: any[]) => any
  timeoutSec: number
  validationCriteria: (result: any) => boolean
  retryConditions: (result: any) => boolean
  workerResultFormatter: (result: any) => any
  technicalResultFormatter: (result: any) => any
}

export interface ScreeningRecord {
  id: string
  patientId: string
  joint: Joint
  side: Side
  answers: Answers
  movement: MovementSummary | null
  tests: TestResult[]
  result: RiskResult
  createdAt: string
  workerName: string
  sync: SyncState
  followUpDate: string
}

export interface RiskResult {
  band: RiskBand
  score: number // internal only
  factors: string[]
  recommendedAction: string
}
