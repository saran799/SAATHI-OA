export const DISCLAIMER = 'This is a screening result, not a diagnosis. SAATHI supports community screening and does not diagnose osteoarthritis. Further clinical evaluation by a qualified professional is required for any diagnosis.'
export const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'mni', native: 'মণিপুরী', english: 'Meitei / Manipuri' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
]
export const JOINT_LABEL: Record<string, string> = { knee: 'Knee', hip: 'Hip', hand: 'Hand', spine: 'Spine', shoulder: 'Shoulder' }
export const SIDE_LABEL: Record<string, string> = { left: 'Left', right: 'Right', both: 'Both' }
export function jointName(joint: string, side: string) {
  return side === 'both' ? `Both ${JOINT_LABEL[joint]?.toLowerCase() || joint}s` : `${SIDE_LABEL[side] || side} ${JOINT_LABEL[joint]?.toLowerCase() || joint}`
}
export function jointNameTranslated(joint: string, side: string, t: (k: string, p?: any) => string) {
  const jLabel = t(`screening.joint.joints.${joint}.label`, {}) !== `screening.joint.joints.${joint}.label` ? t(`screening.joint.joints.${joint}.label`) : JOINT_LABEL[joint] || joint
  const sLabel = t(`screening.joint.${side}`) !== `screening.joint.${side}` ? t(`screening.joint.${side}`) : SIDE_LABEL[side] || side
  if (side === 'both') return `${t('common.appName') === 'SAATHI' ? 'Both' : ''} ${jLabel}`.trim() || `Both ${jLabel.toLowerCase()}s`
  return `${sLabel} ${jLabel.toLowerCase()}`
}
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
export function addDays(iso: string, days: number) {
  const d = new Date(iso); d.setDate(d.getDate() + days); return d.toISOString()
}
export function uid(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}` }
