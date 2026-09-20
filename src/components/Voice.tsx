import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react'
import { useT } from '../i18n'
import { cx } from './ui'

// ============================================================================
// Six-language support - NO silent English fallback
// ============================================================================
export type SupportedLang = 'en' | 'hi' | 'as' | 'bn' | 'mni' | 'ta'

const LANG_TO_BCP: Record<SupportedLang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  as: 'as-IN',
  bn: 'bn-IN',
  mni: 'mni-IN',
  ta: 'ta-IN',
}

const LANG_VARIANTS: Record<SupportedLang, string[]> = {
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
  hi: ['hi-IN', 'hi'],
  as: ['as-IN', 'as'],
  bn: ['bn-IN', 'bn-BD', 'bn'],
  mni: ['mni-IN', 'mni'],
  ta: ['ta-IN', 'ta-LK', 'ta'],
}

export type VoiceStatus = 'idle' | 'speaking' | 'paused' | 'unavailable' | 'unsupported'

export interface VoiceResolution {
  found: boolean
  isGenuine: boolean
  voice: SpeechSynthesisVoice | null
  bcp: string
  requestedBcp: string
  lang: SupportedLang
  fallbackUsed: string | null
  status: 'available' | 'unavailable' | 'unsupported'
  audioAvailable: boolean
  audioSource?: string
  reason?: string
}

export interface SpeakOptions {
  language: SupportedLang
  text: string
  optionalAudioSource?: string
}

// ============================================================================
// VoiceEngine
// ============================================================================
export function useVoiceEngine() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [supported, setSupported] = useState(false)
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [speaking, setSpeaking] = useState(false)

  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
    setSupported(isSupported)
    if (!isSupported) {
      setStatus('unsupported')
      return
    }
    const loadVoices = () => {
      try {
        const vs = window.speechSynthesis.getVoices()
        if (vs.length > 0) setVoices(vs)
      } catch {}
    }
    loadVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
      const interval = setInterval(loadVoices, 500)
      setTimeout(() => clearInterval(interval), 3000)
    }
    return () => {
      try { window.speechSynthesis.cancel() } catch {}
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const isSupported = useCallback(() => typeof window !== 'undefined' && 'speechSynthesis' in window, [])

  const getAvailableVoice = useCallback((lang: SupportedLang): VoiceResolution => {
    const requestedBcp = LANG_TO_BCP[lang] || 'en-IN'
    const variants = LANG_VARIANTS[lang] || [requestedBcp]

    if (!supported || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return {
        found: false, isGenuine: false, voice: null, bcp: requestedBcp, requestedBcp, lang,
        fallbackUsed: null, status: 'unsupported', audioAvailable: false, reason: 'SpeechSynthesis not supported',
      }
    }
    if (voices.length === 0) {
      return {
        found: false, isGenuine: false, voice: null, bcp: requestedBcp, requestedBcp, lang,
        fallbackUsed: null, status: 'unavailable', audioAvailable: false, reason: 'No voices loaded yet',
      }
    }
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      let v = voices.find(vo => vo.lang === variant)
      if (v) {
        return {
          found: true, isGenuine: true, voice: v, bcp: v.lang, requestedBcp, lang,
          fallbackUsed: i === 0 ? null : `${v.lang} used for ${requestedBcp}`, status: 'available', audioAvailable: false,
        }
      }
      v = voices.find(vo => vo.lang.toLowerCase() === variant.toLowerCase())
      if (v) {
        return {
          found: true, isGenuine: true, voice: v, bcp: v.lang, requestedBcp, lang,
          fallbackUsed: i === 0 ? null : `${v.lang} used for ${requestedBcp}`, status: 'available', audioAvailable: false,
        }
      }
    }
    const base = lang
    for (const variant of variants) {
      const prefix = variant.split('-')[0].toLowerCase()
      if (prefix !== base) continue
      const v = voices.find(vo => vo.lang.toLowerCase().startsWith(prefix + '-') || vo.lang.toLowerCase() === prefix)
      if (v) {
        return {
          found: true, isGenuine: true, voice: v, bcp: v.lang, requestedBcp, lang,
          fallbackUsed: `${v.lang} used for ${requestedBcp}`, status: 'available', audioAvailable: false,
        }
      }
    }
    return {
      found: false, isGenuine: false, voice: null, bcp: requestedBcp, requestedBcp, lang,
      fallbackUsed: null, status: 'unavailable', audioAvailable: false, reason: `No genuine ${lang} voice found`,
    }
  }, [voices, supported])

  const getVoiceStatus = useCallback(() => status, [status])

  const stop = useCallback(() => {
    try { if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel() } catch {}
    if (audioRef.current) {
      try { audioRef.current.pause(); audioRef.current.currentTime = 0 } catch {}
      audioRef.current = null
    }
    setSpeaking(false)
    setStatus('idle')
    utterRef.current = null
  }, [])

  const pause = useCallback(() => {
    try {
      if (audioRef.current) { audioRef.current.pause(); setStatus('paused'); return }
      if (typeof window !== 'undefined' && window.speechSynthesis) { window.speechSynthesis.pause(); setStatus('paused') }
    } catch {}
  }, [])

  const resume = useCallback(() => {
    try {
      if (audioRef.current) { audioRef.current.play().catch(() => {}); setStatus('speaking'); return }
      if (typeof window !== 'undefined' && window.speechSynthesis) { window.speechSynthesis.resume(); setStatus('speaking') }
    } catch {}
  }, [])

  const speak = useCallback(async (opts: SpeakOptions): Promise<VoiceResolution> => {
    const { language, text, optionalAudioSource } = opts
    if (!text || !text.trim()) {
      return {
        found: false, isGenuine: false, voice: null, bcp: LANG_TO_BCP[language] || 'en-IN',
        requestedBcp: LANG_TO_BCP[language] || 'en-IN', lang: language, fallbackUsed: null,
        status: 'unavailable', audioAvailable: false, reason: 'Empty text',
      }
    }
    stop()

    if (optionalAudioSource) {
      try {
        const audio = new Audio(optionalAudioSource)
        audioRef.current = audio
        setStatus('speaking')
        setSpeaking(true)
        const result = await new Promise<VoiceResolution>((resolve) => {
          audio.onended = () => {
            setSpeaking(false); setStatus('idle'); audioRef.current = null
            resolve({
              found: true, isGenuine: true, voice: null, bcp: LANG_TO_BCP[language],
              requestedBcp: LANG_TO_BCP[language], lang: language, fallbackUsed: null,
              status: 'available', audioAvailable: true, audioSource: optionalAudioSource,
            })
          }
          audio.onerror = () => {
            setSpeaking(false); setStatus('idle'); audioRef.current = null
            resolve({
              found: false, isGenuine: false, voice: null, bcp: LANG_TO_BCP[language],
              requestedBcp: LANG_TO_BCP[language], lang: language, fallbackUsed: null,
              status: 'unavailable', audioAvailable: false, reason: 'Audio file not available', audioSource: optionalAudioSource,
            })
          }
          audio.play().catch(() => {
            setSpeaking(false); setStatus('idle'); audioRef.current = null
            resolve({
              found: false, isGenuine: false, voice: null, bcp: LANG_TO_BCP[language],
              requestedBcp: LANG_TO_BCP[language], lang: language, fallbackUsed: null,
              status: 'unavailable', audioAvailable: false, reason: 'Audio play failed', audioSource: optionalAudioSource,
            })
          })
        })
        if (result.audioAvailable && result.found) return result
      } catch {}
    }

    const resolution = getAvailableVoice(language)
    if (!resolution.found || !resolution.voice) {
      setStatus('unavailable')
      setSpeaking(false)
      return resolution
    }
    try {
      const utter = new SpeechSynthesisUtterance(text.trim())
      utter.text = text.trim()
      utter.lang = resolution.bcp
      utter.voice = resolution.voice
      utter.rate = 0.9
      utter.volume = 1

      if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
        console.debug('[VoiceEngine DEV]', {
          language,
          voiceText: text.trim().substring(0, 120),
          selectedVoiceName: resolution.voice.name,
          selectedVoiceLang: resolution.voice.lang,
          utteranceLang: utter.lang,
          bcp: resolution.bcp,
          requestedBcp: resolution.requestedBcp,
        })
      }

      utter.onstart = () => { setSpeaking(true); setStatus('speaking') }
      utter.onend = () => { setSpeaking(false); setStatus('idle'); utterRef.current = null }
      utter.onerror = () => { setSpeaking(false); setStatus('idle'); utterRef.current = null }

      utterRef.current = utter
      window.speechSynthesis.speak(utter)
      return resolution
    } catch (e) {
      console.warn('Speech synthesis failed', e)
      setSpeaking(false)
      setStatus('unavailable')
      return { ...resolution, found: false, status: 'unavailable', reason: 'Speech synthesis failed' }
    }
  }, [getAvailableVoice, stop])

  return { voices, supported, speaking, status, speak, stop, pause, resume, isSupported, getAvailableVoice, getVoiceStatus }
}

// ============================================================================
// Simplified Guided Instruction Player - field-worker friendly
// UX: One instruction at a time, Previous [Start/Stop] Next, Next/Previous auto-speak
// ============================================================================
export interface InstructionPlayerProps {
  steps: string[]
  language: SupportedLang
  audioSources?: string[]
  contentId?: string
  className?: string
  title?: string
  onStepChange?: (index: number) => void
}

export function useInstructionPlayer(props: { steps: string[]; language: SupportedLang; audioSources?: string[] }) {
  const { steps, language, audioSources } = props
  const voiceEngine = useVoiceEngine()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [voiceResolution, setVoiceResolution] = useState<VoiceResolution | null>(null)

  useEffect(() => { voiceEngine.stop() }, [language]) // eslint-disable-line
  useEffect(() => {
    voiceEngine.stop()
    setCurrentIndex(prev => Math.min(prev, Math.max(0, steps.length - 1)))
  }, [steps]) // eslint-disable-line
  useEffect(() => { return () => { voiceEngine.stop() } }, []) // eslint-disable-line

  // Speak current step - used by Start button
  const playCurrent = useCallback(async () => {
    const text = steps[currentIndex]
    if (!text) return
    const audioSource = audioSources?.[currentIndex]
    const resolution = await voiceEngine.speak({ language, text, optionalAudioSource: audioSource })
    setVoiceResolution(resolution)
    return resolution
  }, [steps, currentIndex, language, audioSources, voiceEngine])

  // Go to step and immediately speak (for Next/Previous)
  const goToStepAndSpeak = useCallback(async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= steps.length) return
    voiceEngine.stop()
    setCurrentIndex(newIndex)
    const text = steps[newIndex]
    const audioSource = audioSources?.[newIndex]
    // Small delay to ensure cancel completed, then speak
    await new Promise(r => setTimeout(r, 50))
    const resolution = await voiceEngine.speak({ language, text, optionalAudioSource: audioSource })
    setVoiceResolution(resolution)
    return resolution
  }, [steps, language, audioSources, voiceEngine])

  const next = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      goToStepAndSpeak(currentIndex + 1)
    }
  }, [currentIndex, steps.length, goToStepAndSpeak])

  const previous = useCallback(() => {
    if (currentIndex > 0) {
      goToStepAndSpeak(currentIndex - 1)
    }
  }, [currentIndex, goToStepAndSpeak])

  const stop = useCallback(() => { voiceEngine.stop() }, [voiceEngine])

  return {
    currentIndex,
    total: steps.length,
    currentText: steps[currentIndex] || '',
    speaking: voiceEngine.speaking,
    status: voiceEngine.status,
    voiceResolution,
    supported: voiceEngine.supported,
    voices: voiceEngine.voices,
    goToStepAndSpeak,
    next,
    previous,
    playCurrent,
    stop,
    isSupported: voiceEngine.isSupported,
    getAvailableVoice: voiceEngine.getAvailableVoice,
    getVoiceStatus: voiceEngine.getVoiceStatus,
  }
}

export function InstructionPlayer({ steps, language, audioSources, className, title, onStepChange }: InstructionPlayerProps) {
  const { t } = useT()
  const player = useInstructionPlayer({ steps, language, audioSources })

  useEffect(() => { onStepChange?.(player.currentIndex) }, [player.currentIndex, onStepChange])

  if (!steps || steps.length === 0) return null

  const isFirst = player.currentIndex === 0
  const isLast = player.currentIndex === steps.length - 1
  const showUnavailable = player.status === 'unavailable' || (player.voiceResolution && !player.voiceResolution.found)

  return (
    <div className={cx('card rounded-[16px] p-4 overflow-hidden', className)}>
      {title && (
        <p className="text-[11px] font-bold tracking-wider uppercase text-secondary mb-2 break-words">
          {title}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-bold text-secondary break-words" aria-live="polite">
          {t('voice.stepOf', { current: player.currentIndex + 1, total: steps.length } as any)}
        </span>
        <span className="text-[11px] text-muted break-words">
          {player.voiceResolution?.found ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              {player.voiceResolution.bcp}
            </span>
          ) : player.status === 'unsupported' ? (
            t('voice.notSupported')
          ) : showUnavailable ? (
            <span className="text-warning-text">{t('voice.unavailable')}</span>
          ) : null}
        </span>
      </div>

      {/* Instruction text - visually dominant, width 100%, natural height, break-words, text-center */}
      <div className="w-full min-h-[88px] flex items-center justify-center rounded-[12px] bg-tint p-4">
        <p
          className="w-full max-w-[32ch] text-[18px] font-semibold leading-snug break-words text-center"
          aria-live="polite"
          aria-atomic="true"
        >
          {player.currentText}
        </p>
      </div>

      {/* Subtle progress indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-3" aria-hidden>
        {steps.map((_, idx) => (
          <span
            key={idx}
            className={cx(
              'h-2 rounded-full transition-all',
              idx === player.currentIndex ? 'bg-primary w-6' : idx < player.currentIndex ? 'bg-primary/60 w-2' : 'bg-border w-2'
            )}
          />
        ))}
      </div>

      {/* Controls: Previous | Start/Stop | Next - ONE central control, 44px touch */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <button
          type="button"
          onClick={player.previous}
          disabled={isFirst}
          aria-label={t('voice.previous')}
          aria-disabled={isFirst}
          className={cx(
            'min-h-[44px] h-12 rounded-[12px] text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none px-2',
            isFirst ? 'bg-tint-2 text-muted cursor-not-allowed' : 'bg-tint text-ink hover:bg-tint-2 shadow-sm'
          )}
        >
          <ChevronLeft size={18} aria-hidden className="shrink-0" />
          <span className="break-words truncate max-w-[60px]">Prev</span>
        </button>

        <button
          type="button"
          onClick={player.speaking ? player.stop : player.playCurrent}
          aria-label={player.speaking ? t('voice.stopInstruction') : t('voice.playInstruction')}
          aria-pressed={player.speaking}
          className={cx(
            'min-h-[44px] h-12 rounded-[14px] text-[14px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none px-3',
            player.speaking ? 'bg-error text-white shadow-sm' : 'bg-primary text-white shadow-[var(--shadow-btn)]'
          )}
        >
          {player.speaking ? <VolumeX size={18} aria-hidden className="shrink-0" /> : <Volume2 size={18} aria-hidden className="shrink-0" />}
          <span className="break-words">{player.speaking ? t('voice.stop').split(' ')[0] : 'Start'}</span>
        </button>

        <button
          type="button"
          onClick={player.next}
          disabled={isLast}
          aria-label={t('voice.next')}
          aria-disabled={isLast}
          className={cx(
            'min-h-[44px] h-12 rounded-[12px] text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none px-2',
            isLast ? 'bg-tint-2 text-muted cursor-not-allowed' : 'bg-tint text-ink hover:bg-tint-2 shadow-sm'
          )}
        >
          <span className="break-words truncate max-w-[60px]">Next</span>
          <ChevronRight size={18} aria-hidden className="shrink-0" />
        </button>
      </div>

      {showUnavailable && (
        <div className="mt-3 rounded-[10px] bg-warning-tint p-2.5">
          <p className="text-[12px] font-semibold text-warning-text break-words">{t('voice.unavailable')}</p>
          <p className="text-[11px] text-secondary mt-1 break-words">{t('voice.unavailableDetail', { language: t(`languages.${language}.native`) } as any)}</p>
          <p className="text-[10px] text-muted mt-1 break-words">Voices: {player.voices.length} · No genuine {language} voice · Audio: /public/audio/{language}/</p>
        </div>
      )}
      {player.status === 'unsupported' && (
        <div className="mt-2 text-[11px] text-secondary break-words" aria-live="polite">{t('voice.notSupported')}</div>
      )}
    </div>
  )
}

// Legacy
export function useVoice() {
  const engine = useVoiceEngine()
  return {
    speaking: engine.speaking,
    supported: engine.supported,
    voices: engine.voices,
    speak: (text: string, langCode?: string) => {
      const lang = (langCode as SupportedLang) || 'en'
      return engine.speak({ language: lang, text })
    },
    stop: engine.stop,
    getAvailableVoice: engine.getAvailableVoice,
    status: engine.status,
  }
}

export function VoiceButton({ text, className, language }: { text: string; className?: string; language?: SupportedLang }) {
  const { lang: currentLang, t } = useT()
  const targetLang = (language || currentLang || 'en') as SupportedLang
  const engine = useVoiceEngine()
  const [resolution, setResolution] = useState<VoiceResolution | null>(null)

  const handlePlay = async () => {
    if (engine.speaking) engine.stop()
    else {
      const res = await engine.speak({ language: targetLang, text })
      setResolution(res)
    }
  }

  if (!engine.supported) {
    return (
      <span className="inline-flex min-h-[44px] h-11 px-4 rounded-full bg-tint text-secondary text-[13px] font-medium items-center gap-1.5 break-words max-w-full" aria-live="polite">
        {t('voice.notSupported')}
      </span>
    )
  }
  if (!text || !text.trim()) return null
  const isUnavailable = resolution && !resolution.found

  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <button
        type="button"
        onClick={handlePlay}
        aria-label={engine.speaking ? t('voice.stop') : t('voice.listen')}
        aria-pressed={engine.speaking}
        className="min-h-[44px] h-11 px-4 rounded-full bg-tint text-primary text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-tint-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none break-words max-w-full whitespace-normal text-left leading-tight"
      >
        {engine.speaking ? <VolumeX size={16} aria-hidden className="shrink-0" /> : <Volume2 size={16} aria-hidden className="shrink-0" />}
        <span className="break-words">{engine.speaking ? t('voice.stop') : t('voice.listen')}</span>
      </button>
      {isUnavailable && (
        <span className="text-[11px] text-warning-text break-words px-1">
          {t('voice.unavailable')} ({targetLang}: no genuine voice)
        </span>
      )}
    </div>
  )
}

export const VOICE_SUPPORT_DOC = {
  en: { bcp: 'en-IN', variants: ['en-IN', 'en-US', 'en-GB', 'en'], expectedAvailability: 'High', requiresAudioPack: false, notes: 'English widely available' },
  hi: { bcp: 'hi-IN', variants: ['hi-IN', 'hi'], expectedAvailability: 'Medium', requiresAudioPack: true, notes: 'hi-IN on Android, not iOS' },
  bn: { bcp: 'bn-IN', variants: ['bn-IN', 'bn-BD', 'bn'], expectedAvailability: 'Low-Medium', requiresAudioPack: true, notes: 'Limited' },
  ta: { bcp: 'ta-IN', variants: ['ta-IN', 'ta-LK', 'ta'], expectedAvailability: 'Low-Medium', requiresAudioPack: true, notes: 'Limited' },
  as: { bcp: 'as-IN', variants: ['as-IN', 'as'], expectedAvailability: 'Very Low', requiresAudioPack: true, notes: 'Almost never available' },
  mni: { bcp: 'mni-IN', variants: ['mni-IN', 'mni'], expectedAvailability: 'Very Low', requiresAudioPack: true, notes: 'Almost never available' },
} as const
