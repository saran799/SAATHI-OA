export type Sex = 'Female' | 'Male' | 'Other'
export type Joint = 'knee' | 'hip' | 'hand' | 'spine'
export type Side = 'left' | 'right' | 'both'
export type RiskBand = 'low' | 'moderate' | 'higher'
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

export interface ScreeningRecord {
  id: string
  patientId: string
  joint: Joint
  side: Side
  answers: Answers
  movement: MovementSummary | null
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
