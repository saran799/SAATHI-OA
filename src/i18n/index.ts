import { useApp } from '../store/appStore'
import en from './en'
import hi from './hi'
import as from './as'
import bn from './bn'
import mni from './mni'
import ta from './ta'

export type LangCode = 'en' | 'hi' | 'as' | 'bn' | 'mni' | 'ta'

type Dict = typeof en
const resources: Record<LangCode, Dict> = {
  en,
  hi: hi as unknown as Dict,
  as: as as unknown as Dict,
  bn: bn as unknown as Dict,
  mni: mni as unknown as Dict,
  ta: ta as unknown as Dict,
}

function getNested(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj)
}

function interpolate(str: string, params?: Record<string, any>): string {
  if (!params) return str
  let out = str
  for (const [k, v] of Object.entries(params)) {
    const val = v === undefined || v === null ? '' : String(v)
    out = out.split(`{{${k}}}`).join(val)
    out = out.split(`{{ ${k} }}`).join(val)
  }
  return out
}

export function translate(key: string, lang: LangCode, params?: Record<string, any>): string {
  const dict = resources[lang] || resources.en
  let value: any = getNested(dict, key)
  if (value === undefined) {
    value = getNested(resources.en, key)
  }
  if (value === undefined) return key
  if (typeof value === 'string') {
    return interpolate(value, params)
  }
  // If it's an array or object, return as JSON string fallback (should not happen for t)
  if (Array.isArray(value)) return value as any
  return typeof value === 'string' ? value : key
}

export function useT() {
  const lang = (useApp(s => s.language) as LangCode) || 'en'
  const safeLang: LangCode = (resources[lang] ? lang : 'en') as LangCode
  const t = (key: string, params?: Record<string, any>) => translate(key, safeLang, params)
  const tArray = (key: string): string[] => {
    const dict = resources[safeLang] || resources.en
    let value: any = getNested(dict, key)
    if (value === undefined) value = getNested(resources.en, key)
    return Array.isArray(value) ? value : []
  }
  const tObj = <T = any>(key: string): T => {
    const dict = resources[safeLang] || resources.en
    let value: any = getNested(dict, key)
    if (value === undefined) value = getNested(resources.en, key)
    return value as T
  }
  return { t, tArray, tObj, lang: safeLang }
}

export const LANGUAGES_META: { code: LangCode; native: string; english: string }[] = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'mni', native: 'মণিপুরী', english: 'Meitei / Manipuri' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
]

export function getLangName(code: string) {
  return LANGUAGES_META.find(l => l.code === code) || LANGUAGES_META[0]
}
