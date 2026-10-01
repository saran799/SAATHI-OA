export const DISCLAIMER = 'This is a screening result, not a diagnosis. SAATHI supports community screening and does not diagnose osteoarthritis. Further clinical evaluation by a qualified professional is required for any diagnosis.'
export const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese' },
]
export const OCCUPATIONS = ["Farm work", "Construction", "Domestic work", "Shop / Desk", "Weaving / Crafts", "Retired", "Other"]
export const JOINT_LABEL: Record<string, string> = { knee: 'Knee', hip: 'Hip', hand: 'Hand', spine: 'Spine' }
export const SIDE_LABEL: Record<string, string> = { left: 'Left', right: 'Right', both: 'Both' }
export function jointName(joint: string, side: string, t?: any) {
  if (t) {
    const jLabel = t(`screening.joints.${joint}.label`) || JOINT_LABEL[joint] || joint;
    const sLabel = t(`screening.joint.${side}`) || SIDE_LABEL[side] || side;
    return side === 'both' ? t('common.bothJoints', { joint: jLabel.toLowerCase() }) || `Both ${jLabel.toLowerCase()}s` : `${sLabel} ${jLabel.toLowerCase()}`;
  }
  return side === 'both' ? `Both ${JOINT_LABEL[joint].toLowerCase()}s` : `${SIDE_LABEL[side]} ${JOINT_LABEL[joint].toLowerCase()}`
}
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
export function addDays(iso: string, days: number) {
  const d = new Date(iso); d.setDate(d.getDate() + days); return d.toISOString()
}
export function uid(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}` }
export function translateFactor(f: string, t: any) {
  if (f.includes('Pain during activity')) return t('screening.result.factors.painActivity') || f;
  if (f.includes('Pain at rest')) return t('screening.result.factors.painRest') || f;
  if (f.includes('stiffness')) return t('screening.result.factors.stiffness') || f;
  if (f.includes('limitation')) return t('screening.result.factors.limitation') || f;
  if (f.includes('Difficulty with daily tasks')) return t('screening.result.factors.function') || f;
  if (f.includes('swelling')) return t('screening.result.factors.swelling') || f;
  if (f.includes('Grinding or clicking')) return t('screening.result.factors.crepitus') || f;
  if (f.includes('Long-standing')) return t('screening.result.factors.duration') || f;
  if (f.includes('Hardware Sensor Analysis') || f.includes('Hardware Sensor Risk')) return t('screening.result.factors.romReduced') || f;
  if (f.includes('No major contributing factors')) return t('screening.result.factors.noFactors') || f;
  return f;
}
