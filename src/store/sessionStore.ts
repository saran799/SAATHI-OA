import { create } from 'zustand'
import type { Answers, Joint, MovementSummary, RiskResult, Side } from '../domain/types'

interface Session {
  patientId: string | null
  joint: Joint | null
  side: Side
  answers: Answers
  movement: MovementSummary | null
  sensorSkipped: boolean
  result: RiskResult | null
  recordId: string | null
  start: (patientId: string) => void
  setJoint: (j: Joint, side: Side) => void
  answer: (id: string, v: number) => void
  setMovement: (m: MovementSummary | null, skipped?: boolean) => void
  setResult: (r: RiskResult, recordId: string) => void
  reset: () => void
}

const empty = { patientId: null, joint: null, side: 'right' as Side, answers: {}, movement: null, sensorSkipped: false, result: null, recordId: null }

export const useSession = create<Session>()((set) => ({
  ...empty,
  start: (patientId) => set({ ...empty, patientId }),
  setJoint: (joint, side) => set({ joint, side }),
  answer: (id, v) => set(s => ({ answers: { ...s.answers, [id]: v } })),
  setMovement: (movement, sensorSkipped = false) => set({ movement, sensorSkipped }),
  setResult: (result, recordId) => set({ result, recordId }),
  reset: () => set({ ...empty }),
}))
