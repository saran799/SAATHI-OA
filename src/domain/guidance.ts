import type { RiskBand } from './types'

export interface Exercise {
  id: string; name: string; reps: string; duration: string; difficulty: 'Easy' | 'Moderate'
  steps: string[]; safety: string; joints: string[]
}

export const EXERCISES = (t: any): Exercise[] => [
  { id: 'quad', name: t('screening.exercises.list.quad.name'), reps: t('screening.exercises.list.quad.reps'), duration: t('screening.exercises.list.quad.duration'), difficulty: 'Easy', joints: ['knee', 'hip'],
    steps: [t('screening.exercises.list.quad.steps.0'), t('screening.exercises.list.quad.steps.1'), t('screening.exercises.list.quad.steps.2')],
    safety: t('screening.exercises.list.quad.safety') },
  { id: 'heel', name: t('screening.exercises.list.heel.name'), reps: t('screening.exercises.list.heel.reps'), duration: t('screening.exercises.list.heel.duration'), difficulty: 'Easy', joints: ['knee'],
    steps: [t('screening.exercises.list.heel.steps.0'), t('screening.exercises.list.heel.steps.1'), t('screening.exercises.list.heel.steps.2')],
    safety: t('screening.exercises.list.heel.safety') },
  { id: 'bridge', name: t('screening.exercises.list.bridge.name'), reps: t('screening.exercises.list.bridge.reps'), duration: t('screening.exercises.list.bridge.duration'), difficulty: 'Moderate', joints: ['hip', 'spine'],
    steps: [t('screening.exercises.list.bridge.steps.0'), t('screening.exercises.list.bridge.steps.1'), t('screening.exercises.list.bridge.steps.2')],
    safety: t('screening.exercises.list.bridge.safety') },
  { id: 'fist', name: t('screening.exercises.list.fist.name'), reps: t('screening.exercises.list.fist.reps'), duration: t('screening.exercises.list.fist.duration'), difficulty: 'Easy', joints: ['hand'],
    steps: [t('screening.exercises.list.fist.steps.0'), t('screening.exercises.list.fist.steps.1'), t('screening.exercises.list.fist.steps.2')],
    safety: t('screening.exercises.list.fist.safety') },
  { id: 'catcow', name: t('screening.exercises.list.catcow.name'), reps: t('screening.exercises.list.catcow.reps'), duration: t('screening.exercises.list.catcow.duration'), difficulty: 'Easy', joints: ['spine'],
    steps: [t('screening.exercises.list.catcow.steps.0'), t('screening.exercises.list.catcow.steps.1'), t('screening.exercises.list.catcow.steps.2')],
    safety: t('screening.exercises.list.catcow.safety') },
  { id: 'walk', name: t('screening.exercises.list.walk.name'), reps: t('screening.exercises.list.walk.reps'), duration: t('screening.exercises.list.walk.duration'), difficulty: 'Easy', joints: ['knee', 'hip', 'spine', 'hand'],
    steps: [t('screening.exercises.list.walk.steps.0'), t('screening.exercises.list.walk.steps.1'), t('screening.exercises.list.walk.steps.2')],
    safety: t('screening.exercises.list.walk.safety') },
]

export function exercisesFor(joint: string, band: RiskBand, t: any): Exercise[] {
  const list = EXERCISES(t).filter(e => e.joints.includes(joint))
  return band === 'higher' ? list.filter(e => e.difficulty === 'Easy') : list
}

export const SUPPORTING_GUIDANCE = (t: any): Record<RiskBand, string[]> => ({
  low: [t('screening.guidance.supporting.low.0'), t('screening.guidance.supporting.low.1'), t('screening.guidance.supporting.low.2')],
  moderate: [t('screening.guidance.supporting.moderate.0'), t('screening.guidance.supporting.moderate.1'), t('screening.guidance.supporting.moderate.2'), t('screening.guidance.supporting.moderate.3')],
  higher: [t('screening.guidance.supporting.higher.0'), t('screening.guidance.supporting.higher.1'), t('screening.guidance.supporting.higher.2'), t('screening.guidance.supporting.higher.3')],
})
