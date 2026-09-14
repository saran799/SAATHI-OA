import type { RiskBand } from './types'

export interface Exercise {
  id: string; name: string; reps: string; duration: string; difficulty: 'Easy' | 'Moderate'
  steps: string[]; safety: string; joints: string[]
}

export const EXERCISES: Exercise[] = [
  { id: 'quad', name: 'Seated leg straightening', reps: '10 each leg', duration: '3 min', difficulty: 'Easy', joints: ['knee', 'hip'],
    steps: ['Sit upright on a chair with feet flat.', 'Slowly straighten one knee until the leg is level.', 'Hold for 5 seconds, then lower slowly.'],
    safety: 'Stop if pain increases. Do not lock the knee forcefully.' },
  { id: 'heel', name: 'Heel slides', reps: '10 each leg', duration: '3 min', difficulty: 'Easy', joints: ['knee'],
    steps: ['Lie on your back with legs straight.', 'Slide one heel toward your hip, bending the knee.', 'Slide back slowly.'],
    safety: 'Move only as far as comfortable.' },
  { id: 'bridge', name: 'Gentle hip bridge', reps: '8', duration: '2 min', difficulty: 'Moderate', joints: ['hip', 'spine'],
    steps: ['Lie on your back, knees bent, feet flat.', 'Lift hips a few inches off the floor.', 'Hold 3 seconds and lower.'],
    safety: 'Keep the movement small. Avoid if you have back pain today.' },
  { id: 'fist', name: 'Finger fist and open', reps: '10', duration: '2 min', difficulty: 'Easy', joints: ['hand'],
    steps: ['Open the hand wide, fingers spread.', 'Slowly close into a gentle fist.', 'Open again slowly.'],
    safety: 'Do not squeeze hard. Warm water helps if stiff.' },
  { id: 'catcow', name: 'Seated back stretch', reps: '8', duration: '2 min', difficulty: 'Easy', joints: ['spine'],
    steps: ['Sit on a chair, hands on knees.', 'Gently round the back, then gently arch.', 'Move slowly with your breath.'],
    safety: 'Keep movements small and pain free.' },
  { id: 'walk', name: 'Short daily walk', reps: '1', duration: '10–15 min', difficulty: 'Easy', joints: ['knee', 'hip', 'spine', 'hand'],
    steps: ['Walk on flat ground at a comfortable pace.', 'Wear supportive footwear.', 'Increase time gradually over weeks.'],
    safety: 'Avoid uneven ground and stairs if painful.' },
]

export function exercisesFor(joint: string, band: RiskBand): Exercise[] {
  const list = EXERCISES.filter(e => e.joints.includes(joint))
  return band === 'higher' ? list.filter(e => e.difficulty === 'Easy') : list
}

export const SUPPORTING_GUIDANCE: Record<RiskBand, string[]> = {
  low: ['Stay active with walking and gentle stretching.', 'Maintain a healthy body weight.', 'Return if pain, swelling or stiffness develops.'],
  moderate: ['Avoid deep squatting and prolonged floor sitting.', 'Use warm compress for stiffness, cold for swelling.', 'Wear supportive footwear on uneven ground.', 'Keep a simple pain diary to share at the PHC visit.'],
  higher: ['Limit activities that sharply increase pain.', 'Use a walking stick on the opposite side if unsteady.', 'Do not start new strenuous exercise before the clinical visit.', 'Seek care sooner if the joint becomes hot, red or suddenly swollen.'],
}
