import { create } from 'zustand'
import type { Answers, Joint, MovementSummary, RiskResult, Side, TestResult } from '../domain/types'

interface Session {
  patientId: string | null
  joint: Joint | null
  side: Side
  answers: Answers
  movement: MovementSummary | null
  tests: TestResult[]
  sensorSkipped: boolean
  result: RiskResult | null
  recordId: string | null
  start: (patientId: string) => void
  setJoint: (j: Joint, side: Side) => void
  answer: (id: string, v: number) => void
  setMovement: (m: MovementSummary | null, skipped?: boolean) => void
  setTestResult: (t: TestResult) => void
  setResult: (r: RiskResult, recordId: string) => void
  reset: () => void
}

const empty = { patientId: null, joint: null, side: 'right' as Side, answers: {}, movement: null, tests: [], sensorSkipped: false, result: null, recordId: null }

export const useSession = create<Session>()((set) => ({
  ...empty,
  start: (patientId) => set({ ...empty, patientId }),
  setJoint: (joint, side) => set({ joint, side }),
  answer: (id, v) => set(s => ({ answers: { ...s.answers, [id]: v } })),
  setMovement: (movement, sensorSkipped = false) => set({ movement, sensorSkipped }),
  setTestResult: (t) => set(s => ({ tests: [...s.tests.filter(x => x.testId !== t.testId), t] })),
  setResult: (result, recordId) => set({ result, recordId }),
  reset: () => set({ ...empty }),
}))
