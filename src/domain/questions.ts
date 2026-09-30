import type { Joint } from './types'

export interface Option { label: string; value: number }
export interface Question {
  id: string
  text: string
  helper?: string
  options: Option[]
  factorLabel: string
}

const freq: Option[] = [
  { label: 'Never', value: 0 },
  { label: 'Sometimes', value: 1 },
  { label: 'Often', value: 2 },
  { label: 'Almost every day', value: 3 },
]

export const QUESTIONS: Question[] = [
  { id: 'pain_activity', text: 'Does the joint hurt during walking, climbing stairs or daily activity?', options: freq, factorLabel: 'Pain during activity' },
  { id: 'pain_rest', text: 'Does the joint hurt at rest or at night?', options: freq, factorLabel: 'Pain at rest or at night' },
  { id: 'stiffness', text: 'Is the joint stiff in the morning or after sitting for a while?', helper: 'Stiffness that eases within 30 minutes of moving is common.', options: [
    { label: 'No stiffness', value: 0 }, { label: 'Less than 30 minutes', value: 2 }, { label: 'More than 30 minutes', value: 3 },
  ], factorLabel: 'Reported joint stiffness' },
  { id: 'limitation', text: 'Is it difficult to fully bend or straighten the joint?', options: [
    { label: 'No difficulty', value: 0 }, { label: 'Slight difficulty', value: 1 }, { label: 'Moderate difficulty', value: 2 }, { label: 'Cannot fully move', value: 3 },
  ], factorLabel: 'Movement limitation' },
  { id: 'function', text: 'Is it hard to squat, sit on the floor, or get up from a chair?', options: [
    { label: 'Not hard', value: 0 }, { label: 'A little hard', value: 1 }, { label: 'Very hard', value: 2 }, { label: 'Cannot do it', value: 3 },
  ], factorLabel: 'Difficulty with daily tasks' },
  { id: 'swelling', text: 'Has the joint been swollen or felt warm?', options: [
    { label: 'No', value: 0 }, { label: 'Occasionally', value: 1 }, { label: 'Frequently', value: 2 },
  ], factorLabel: 'Joint swelling' },
  { id: 'crepitus', text: 'Does the joint make grinding or clicking sounds when moving?', options: [
    { label: 'No', value: 0 }, { label: 'Sometimes', value: 1 }, { label: 'Often', value: 2 },
  ], factorLabel: 'Grinding or clicking sounds' },
  { id: 'duration', text: 'How long have these problems been present?', options: [
    { label: 'Less than 3 months', value: 0 }, { label: '3 to 12 months', value: 1 }, { label: 'More than a year', value: 2 },
  ], factorLabel: 'Long-standing symptoms' },
]

export const JOINTS: { id: Joint; label: string; hint: string }[] = [
  { id: 'knee', label: 'Knee', hint: 'Most common' },
  { id: 'hip', label: 'Hip', hint: 'Groin or thigh pain' },
  { id: 'hand', label: 'Hand', hint: 'Fingers or thumb base' },
  { id: 'spine', label: 'Spine', hint: 'Neck or lower back' },
]
