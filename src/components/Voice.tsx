import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useT } from '../i18n'

type LangMap = Record<string, string>

const LANG_TO_BCP: LangMap = {
  en: 'en-IN',
  hi: 'hi-IN',
  as: 'as-IN',
  bn: 'bn-IN',
  mni: 'mni-IN', // Meitei/Manipuri - may not have native voice, fallback handled
  ta: 'ta-IN',
}

const FALLBACK_BCP: LangMap = {
  mni: 'en-IN', // Meitei often not available, fallback to English
  as: 'bn-IN', // Assamese fallback to Bengali if Assamese voice missing
}

export function useVoice() {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
    setSupported(isSupported)

    if (!isSupported) return

    const loadVoices = () => {
      try {
        const vs = window.speechSynthesis.getVoices()
        if (vs.length > 0) setVoices(vs)
      } catch {}
    }

    loadVoices()
    // Voices may load async
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    // Cleanup: cancel any speech when unmounting (stop when leaving screen)
    return () => {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
  }, [])

  const findVoice = useCallback((bcp: string, langCode: string): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null

    // Try exact match
    let v = voices.find(vo => vo.lang === bcp)
    if (v) return v

    // Try language prefix (e.g., 'hi' matches 'hi-IN')
    const prefix = bcp.split('-')[0]
    v = voices.find(vo => vo.lang.toLowerCase().startsWith(prefix.toLowerCase()))
    if (v) return v

    // Try fallback map
    const fallbackBcp = FALLBACK_BCP[langCode]
    if (fallbackBcp) {
      v = voices.find(vo => vo.lang === fallbackBcp)
      if (v) return v
      const fbPrefix = fallbackBcp.split('-')[0]
      v = voices.find(vo => vo.lang.toLowerCase().startsWith(fbPrefix.toLowerCase()))
      if (v) return v
    }

    // Last resort: en-IN or any en
    if (langCode !== 'en') {
      v = voices.find(vo => vo.lang === 'en-IN') || voices.find(vo => vo.lang.toLowerCase().startsWith('en'))
      if (v) return v
    }

    return null
  }, [voices])

  const speak = useCallback((text: string, langCode?: string) => {
    if (!supported) return
    if (!text || !text.trim()) return

    try {
      // Prevent overlapping utterances: cancel previous before starting
      window.speechSynthesis.cancel()

      const utter = new SpeechSynthesisUtterance(text.trim())

      const code = langCode || 'en'
      const bcp = LANG_TO_BCP[code] || LANG_TO_BCP.en || 'en-IN'
      utter.lang = bcp
      utter.rate = 0.9
      utter.volume = 1

      const voice = findVoice(bcp, code)
      if (voice) {
        utter.voice = voice
        // Use voice's lang if it differs (more accurate)
        // But keep requested bcp as primary for TTS engine
      }

      utter.onstart = () => setSpeaking(true)
      utter.onend = () => {
        setSpeaking(false)
        utterRef.current = null
      }
      utter.onerror = () => {
        setSpeaking(false)
        utterRef.current = null
      }

      utterRef.current = utter
      window.speechSynthesis.speak(utter)
    } catch (e) {
      console.warn('Speech synthesis failed', e)
      setSpeaking(false)
    }
  }, [supported, findVoice])

  const stop = useCallback(() => {
    try {
      window.speechSynthesis.cancel()
    } catch {}
    setSpeaking(false)
    utterRef.current = null
  }, [])

  return { speaking, supported, speak, stop, voices }
}

export function VoiceButton({ text, className }: { text: string; className?: string }) {
  const { speaking, supported, speak, stop } = useVoice()
  const { lang, t } = useT()

  // Graceful fallback when SpeechSynthesis unavailable
  if (!supported) {
    return (
      <span
        className="inline-flex min-h-[44px] h-11 px-4 rounded-full bg-tint text-secondary text-[13px] font-medium items-center gap-1.5 break-words max-w-full"
        aria-live="polite"
      >
        {t('voice.notSupported')}
      </span>
    )
  }

  // Ensure text is not empty - if empty, don't render button to avoid confusion
  if (!text || !text.trim()) return null

  return (
    <button
      type="button"
      onClick={() => (speaking ? stop() : speak(text, lang))}
      aria-label={speaking ? t('voice.stop') : t('voice.listen')}
      aria-pressed={speaking}
      title={speaking ? t('voice.stop') : t('voice.listen')}
      className={`min-h-[44px] h-11 px-4 rounded-full bg-tint text-primary text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-tint-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none break-words max-w-full whitespace-normal text-left leading-tight ${className || ''}`}
    >
      {speaking ? <VolumeX size={16} aria-hidden className="shrink-0" /> : <Volume2 size={16} aria-hidden className="shrink-0" />}
      <span className="break-words">{speaking ? t('voice.stop') : t('voice.listen')}</span>
    </button>
  )
}
