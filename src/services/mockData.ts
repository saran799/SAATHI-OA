import type { Patient, ScreeningRecord } from '../domain/types'
import { addDays } from '../domain/copy'

const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString() }

export const SEED_PATIENTS: Patient[] = [
  { id: 'P-4K2M9A', name: 'Anita Sharma', age: 58, sex: 'Female', phone: '98400 12345', village: 'Thirumangalam', phc: 'Thirumangalam PHC', healthId: '91-2233-4455-6677', heightCm: 156, weightKg: 68, occupation: 'Farm work', priorInjury: false, familyHistory: true, createdAt: daysAgo(40) },
  { id: 'P-7H3QZT', name: 'Ravi Kumar', age: 64, sex: 'Male', phone: '98430 55678', village: 'Melur', phc: 'Melur PHC', heightCm: 168, weightKg: 82, occupation: 'Construction', priorInjury: true, familyHistory: false, createdAt: daysAgo(21) },
  { id: 'P-2B8XNC', name: 'Meena Devi', age: 47, sex: 'Female', phone: '98941 78901', village: 'Alanganallur', phc: 'Alanganallur PHC', heightCm: 152, weightKg: 55, occupation: 'Household work', priorInjury: false, familyHistory: false, createdAt: daysAgo(9) },
]

export const SEED_RECORDS: ScreeningRecord[] = [
  { id: 'S-A1B2C3', patientId: 'P-4K2M9A', joint: 'knee', side: 'right', createdAt: daysAgo(38), workerName: 'Priya Rajan', sync: 'synced', followUpDate: addDays(daysAgo(38), 60),
    answers: { pain_activity: 2, pain_rest: 1, stiffness: 2, limitation: 2, function: 2, swelling: 0, crepitus: 1, duration: 1 },
    movement: { rangeOfMotionDeg: 112, smoothness: 0.72, durationSec: 30, repetitions: 5, performed: true }, tests: [],
    result: { band: 'moderate', score: 11, factors: ['Pain during activity', 'Reported joint stiffness', 'Movement limitation', 'Slightly reduced range of movement'], recommendedAction: 'Advise a PHC visit for clinical evaluation. Begin gentle joint exercises.' } },
  { id: 'S-D4E5F6', patientId: 'P-7H3QZT', joint: 'knee', side: 'both', createdAt: daysAgo(20), workerName: 'Priya Rajan', sync: 'synced', followUpDate: addDays(daysAgo(20), 14),
    answers: { pain_activity: 3, pain_rest: 2, stiffness: 3, limitation: 3, function: 2, swelling: 1, crepitus: 2, duration: 2 },
    movement: { rangeOfMotionDeg: 94, smoothness: 0.51, durationSec: 30, repetitions: 4, performed: true }, tests: [],
    result: { band: 'higher', score: 21, factors: ['Reduced range of movement', 'Pain during activity', 'Reported joint stiffness', 'Movement limitation'], recommendedAction: 'Refer to the PHC medical officer for clinical evaluation within 2 weeks.' } },
  { id: 'S-G7H8I9', patientId: 'P-2B8XNC', joint: 'hand', side: 'right', createdAt: daysAgo(8), workerName: 'Priya Rajan', sync: 'unsynced', followUpDate: addDays(daysAgo(8), 180),
    answers: { pain_activity: 1, pain_rest: 0, stiffness: 0, limitation: 0, function: 0, swelling: 0, crepitus: 1, duration: 0 },
    movement: null, tests: [],
    result: { band: 'low', score: 4, factors: ['Age 45 or above'], recommendedAction: 'Share joint-care advice and re-screen in 6 months or if symptoms change.' } },
]
