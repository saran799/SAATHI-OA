export const DISCLAIMER = 'This is a screening result, not a diagnosis. SAATHI supports community screening and does not diagnose osteoarthritis. Further clinical evaluation by a qualified professional is required for any diagnosis.'
export const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
]
export const JOINT_LABEL: Record<string, string> = { knee: 'Knee', hip: 'Hip', hand: 'Hand', spine: 'Spine' }
export const SIDE_LABEL: Record<string, string> = { left: 'Left', right: 'Right', both: 'Both' }
export function jointName(joint: string, side: string) {
  return side === 'both' ? `Both ${JOINT_LABEL[joint].toLowerCase()}s` : `${SIDE_LABEL[side]} ${JOINT_LABEL[joint].toLowerCase()}`
}
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
export function addDays(iso: string, days: number) {
  const d = new Date(iso); d.setDate(d.getDate() + days); return d.toISOString()
}
export function uid(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}` }
