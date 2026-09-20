import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Square } from 'lucide-react'
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

// For genuine voice resolution: try exact BCP, then regional variants, then base language
// DO NOT fallback to different language (e.g., as -> bn is NOT allowed, mni -> en NOT allowed)
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
  bcp: string // resolved BCP that will be used for utterance.lang
  requestedBcp: string // original requested BCP
  lang: SupportedLang
  fallbackUsed: string | null // e.g., "ta used for ta-IN" if base fallback within same language
  status: 'available' | 'unavailable' | 'unsupported'
  audioAvailable: boolean
  audioSource?: string
  reason?: string
}

export interface SpeakOptions {
  language: SupportedLang
  text: string
  optionalAudioSource?: string // /public/audio/{lang}/... if available
}

// ============================================================================
// VoiceEngine - low-level abstraction
// ============================================================================
export function useVoiceEngine() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [supported, setSupported] = useState(false)
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [speaking, setSpeaking] = useState(false)

  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load voices
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
        if (vs.length > 0) {
          setVoices(vs)
        }
      } catch {}
    }

    loadVoices()
    // Voices may load async - wait for voiceschanged
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
      // Also try polling briefly for browsers that don't fire event reliably
      const interval = setInterval(loadVoices, 500)
      setTimeout(() => clearInterval(interval), 3000)
    }

    return () => {
      try {
        window.speechSynthesis.cancel()
      } catch {}
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const isSupported = useCallback(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }, [])

  const getAvailableVoice = useCallback((lang: SupportedLang): VoiceResolution => {
    const requestedBcp = LANG_TO_BCP[lang] || 'en-IN'
    const variants = LANG_VARIANTS[lang] || [requestedBcp]

    if (!supported || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return {
        found: false,
        isGenuine: false,
        voice: null,
        bcp: requestedBcp,
        requestedBcp,
        lang,
        fallbackUsed: null,
        status: 'unsupported',
        audioAvailable: false,
        reason: 'SpeechSynthesis not supported',
      }
    }

    if (voices.length === 0) {
      return {
        found: false,
        isGenuine: false,
        voice: null,
        bcp: requestedBcp,
        requestedBcp,
        lang,
        fallbackUsed: null,
        status: 'unavailable',
        audioAvailable: false,
        reason: 'No voices loaded yet',
      }
    }

    // Try exact match first, then variants in order (same language only)
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      // Exact match
      let v = voices.find(vo => vo.lang === variant)
      if (v) {
        return {
          found: true,
          isGenuine: true,
          voice: v,
          bcp: v.lang, // use actual voice lang as resolved BCP
          requestedBcp,
          lang,
          fallbackUsed: i === 0 ? null : `${v.lang} used for ${requestedBcp}`,
          status: 'available',
          audioAvailable: false,
        }
      }
      // Case-insensitive exact
      v = voices.find(vo => vo.lang.toLowerCase() === variant.toLowerCase())
      if (v) {
        return {
          found: true,
          isGenuine: true,
          voice: v,
          bcp: v.lang,
          requestedBcp,
          lang,
          fallbackUsed: i === 0 ? null : `${v.lang} used for ${requestedBcp}`,
          status: 'available',
          audioAvailable: false,
        }
      }
    }

    // Try base language prefix match within same language only
    // e.g., for ta-IN, try any voice starting with ta-
    const base = lang
    for (const variant of variants) {
      const prefix = variant.split('-')[0].toLowerCase()
      if (prefix !== base) continue // ensure same base language
      const v = voices.find(vo => vo.lang.toLowerCase().startsWith(prefix.toLowerCase() + '-') || vo.lang.toLowerCase() === prefix.toLowerCase())
      if (v) {
        return {
          found: true,
          isGenuine: true,
          voice: v,
          bcp: v.lang,
          requestedBcp,
          lang,
          fallbackUsed: `${v.lang} used for ${requestedBcp}`,
          status: 'available',
          audioAvailable: false,
        }
      }
    }

    // No genuine voice found - DO NOT fallback to English for non-English
    return {
      found: false,
      isGenuine: false,
      voice: null,
      bcp: requestedBcp,
      requestedBcp,
      lang,
      fallbackUsed: null,
      status: 'unavailable',
      audioAvailable: false,
      reason: `No genuine ${lang} voice found on this device`,
    }
  }, [voices, supported])

  const getVoiceStatus = useCallback(() => status, [status])

  const stop = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    } catch {}
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } catch {}
      audioRef.current = null
    }
    setSpeaking(false)
    setStatus('idle')
    utterRef.current = null
  }, [])

  const pause = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
        setStatus('paused')
        return
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.pause()
        setStatus('paused')
      }
    } catch {}
  }, [])

  const resume = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {})
        setStatus('speaking')
        return
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.resume()
        setStatus('speaking')
      }
    } catch {}
  }, [])

  const speak = useCallback(async (opts: SpeakOptions): Promise<VoiceResolution> => {
    const { language, text, optionalAudioSource } = opts

    if (!text || !text.trim()) {
      return {
        found: false,
        isGenuine: false,
        voice: null,
        bcp: LANG_TO_BCP[language] || 'en-IN',
        requestedBcp: LANG_TO_BCP[language] || 'en-IN',
        lang: language,
        fallbackUsed: null,
        status: 'unavailable',
        audioAvailable: false,
        reason: 'Empty text',
      }
    }

    // Safety: cancel previous before starting - exactly ONE utterance
    stop()

    // If optionalAudioSource provided, try native audio first
    if (optionalAudioSource) {
      try {
        const audio = new Audio(optionalAudioSource)
        audioRef.current = audio
        setStatus('speaking')
        setSpeaking(true)

        const result = await new Promise<VoiceResolution>((resolve) => {
          audio.onended = () => {
            setSpeaking(false)
            setStatus('idle')
            audioRef.current = null
            resolve({
              found: true,
              isGenuine: true,
              voice: null,
              bcp: LANG_TO_BCP[language],
              requestedBcp: LANG_TO_BCP[language],
              lang: language,
              fallbackUsed: null,
              status: 'available',
              audioAvailable: true,
              audioSource: optionalAudioSource,
            })
          }
          audio.onerror = () => {
            setSpeaking(false)
            setStatus('idle')
            audioRef.current = null
            // Audio failed, will fallback to TTS below
            resolve({
              found: false,
              isGenuine: false,
              voice: null,
              bcp: LANG_TO_BCP[language],
              requestedBcp: LANG_TO_BCP[language],
              lang: language,
              fallbackUsed: null,
              status: 'unavailable',
              audioAvailable: false,
              reason: 'Audio file not available',
              audioSource: optionalAudioSource,
            })
          }
          audio.play().catch(() => {
            setSpeaking(false)
            setStatus('idle')
            audioRef.current = null
            resolve({
              found: false,
              isGenuine: false,
              voice: null,
              bcp: LANG_TO_BCP[language],
              requestedBcp: LANG_TO_BCP[language],
              lang: language,
              fallbackUsed: null,
              status: 'unavailable',
              audioAvailable: false,
              reason: 'Audio play failed',
              audioSource: optionalAudioSource,
            })
          })
        })

        if (result.audioAvailable && result.found) {
          return result
        }
        // If audio not available, continue to TTS
      } catch {
        // Audio failed, continue to TTS
      }
    }

    // TTS path - find genuine voice, DO NOT fallback to English
    const resolution = getAvailableVoice(language)

    if (!resolution.found || !resolution.voice) {
      setStatus('unavailable')
      setSpeaking(false)
      return resolution
    }

    try {
      const utter = new SpeechSynthesisUtterance(text.trim())
      // MUST be actual visible instruction text, NEVER patient name, etc.
      utter.text = text.trim()
      utter.lang = resolution.bcp // resolved genuine language, not just assigned
      utter.voice = resolution.voice
      utter.rate = 0.9
      utter.volume = 1

      // Development-only diagnostics (no patient info)
      if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
        console.debug('[VoiceEngine DEV]', {
          language,
          voiceText: text.trim().substring(0, 100) + (text.trim().length > 100 ? '...' : ''),
          selectedVoiceName: resolution.voice.name,
          selectedVoiceLang: resolution.voice.lang,
          utteranceLang: utter.lang,
          resolution,
        })
      }

      utter.onstart = () => {
        setSpeaking(true)
        setStatus('speaking')
      }
      utter.onend = () => {
        setSpeaking(false)
        setStatus('idle')
        utterRef.current = null
      }
      utter.onerror = (e) => {
        console.warn('Speech synthesis error', e)
        setSpeaking(false)
        setStatus('idle')
        utterRef.current = null
      }

      utterRef.current = utter
      window.speechSynthesis.speak(utter)
      return resolution
    } catch (e) {
      console.warn('Speech synthesis failed', e)
      setSpeaking(false)
      setStatus('unavailable')
      return {
        ...resolution,
        found: false,
        status: 'unavailable',
        reason: 'Speech synthesis failed',
      }
    }
  }, [getAvailableVoice, stop])

  return {
    voices,
    supported,
    speaking,
    status,
    speak,
    stop,
    pause,
    resume,
    isSupported,
    getAvailableVoice,
    getVoiceStatus,
  }
}

// ============================================================================
// Instruction Player - step-by-step
// ============================================================================
export interface InstructionPlayerProps {
  steps: string[] // discrete steps, MUST be visible instruction text
  language: SupportedLang
  audioSources?: string[] // optional parallel array for native audio
  contentId?: string // for audio path resolution e.g., "instructions" or "exercise-quad"
  className?: string
  onStepChange?: (index: number) => void
}

export function useInstructionPlayer(props: { steps: string[]; language: SupportedLang; audioSources?: string[] }) {
  const { steps, language, audioSources } = props
  const voiceEngine = useVoiceEngine()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [voiceResolution, setVoiceResolution] = useState<VoiceResolution | null>(null)

  // Cancel speech when language changes
  useEffect(() => {
    voiceEngine.stop()
    // Keep currentIndex but cancel speech
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  // Cancel speech when steps change (language switch causes steps to change)
  useEffect(() => {
    voiceEngine.stop()
    // Reset to first step if steps length changed drastically? Keep index within bounds
    setCurrentIndex(prev => Math.min(prev, Math.max(0, steps.length - 1)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps])

  // Cleanup on unmount - do not leave speech running after navigating away
  useEffect(() => {
    return () => {
      voiceEngine.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToStep = useCallback((index: number) => {
    if (index < 0 || index >= steps.length) return
    // Changing step automatically stops previous speech
    voiceEngine.stop()
    setCurrentIndex(index)
  }, [steps.length, voiceEngine])

  const next = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      goToStep(currentIndex + 1)
    }
  }, [currentIndex, steps.length, goToStep])

  const previous = useCallback(() => {
    if (currentIndex > 0) {
      goToStep(currentIndex - 1)
    }
  }, [currentIndex, goToStep])

  const play = useCallback(async () => {
    const text = steps[currentIndex]
    if (!text) return
    const audioSource = audioSources?.[currentIndex]
    const resolution = await voiceEngine.speak({
      language,
      text,
      optionalAudioSource: audioSource,
    })
    setVoiceResolution(resolution)
    return resolution
  }, [steps, currentIndex, language, audioSources, voiceEngine])

  const stop = useCallback(() => {
    voiceEngine.stop()
  }, [voiceEngine])

  const pause = useCallback(() => {
    voiceEngine.pause()
  }, [voiceEngine])

  const resume = useCallback(() => {
    voiceEngine.resume()
  }, [voiceEngine])

  return {
    currentIndex,
    total: steps.length,
    currentText: steps[currentIndex] || '',
    speaking: voiceEngine.speaking,
    status: voiceEngine.status,
    voiceResolution,
    supported: voiceEngine.supported,
    voices: voiceEngine.voices,
    goToStep,
    next,
    previous,
    play,
    stop,
    pause,
    resume,
    isSupported: voiceEngine.isSupported,
    getAvailableVoice: voiceEngine.getAvailableVoice,
    getVoiceStatus: voiceEngine.getVoiceStatus,
  }
}

export function InstructionPlayer({ steps, language, audioSources, className, onStepChange }: InstructionPlayerProps) {
  const { t } = useT()
  const player = useInstructionPlayer({ steps, language, audioSources })

  useEffect(() => {
    onStepChange?.(player.currentIndex)
  }, [player.currentIndex, onStepChange])

  if (!steps || steps.length === 0) return null

  const isFirst = player.currentIndex === 0
  const isLast = player.currentIndex === steps.length - 1
  const showUnavailable = player.status === 'unavailable' || (player.voiceResolution && !player.voiceResolution.found)

  return (
    <div className={cx('rounded-[14px] bg-tint p-3', className)}>
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-bold text-secondary break-words" aria-live="polite">
          {t('voice.stepOf', { current: player.currentIndex + 1, total: steps.length } as any)}
        </span>
        <span className="text-[11px] text-muted break-words">
          {player.voiceResolution?.found ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              {player.voiceResolution.voice?.name ? `${player.voiceResolution.voice.name} (${player.voiceResolution.bcp})` : player.voiceResolution.bcp}
            </span>
          ) : player.status === 'unsupported' ? (
            t('voice.notSupported')
          ) : showUnavailable ? (
            <span className="text-warning-text">{t('voice.unavailable')}</span>
          ) : (
            t('voice.genuineVoice')
          )}
        </span>
      </div>

      {/* Current step text - visible instruction */}
      <div className="rounded-[10px] bg-surface p-2.5 mb-3 min-h-[44px]">
        <p className="text-[14px] font-medium leading-snug break-words" aria-live="polite" aria-atomic="true">
          {player.currentText}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-3" aria-hidden>
        {steps.map((_, idx) => (
          <span
            key={idx}
            className={cx(
              'h-2 w-2 rounded-full transition-colors',
              idx === player.currentIndex ? 'bg-primary w-4' : idx < player.currentIndex ? 'bg-primary/60' : 'bg-border'
            )}
          />
        ))}
      </div>

      {/* Controls - compact, 44px touch targets, SAATHI design */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={player.previous}
          disabled={isFirst}
          aria-label={t('voice.previous')}
          aria-disabled={isFirst}
          className={cx(
            'min-h-[44px] h-11 rounded-[12px] text-[13px] font-semibold inline-flex items-center justify-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
            isFirst ? 'bg-tint-2 text-muted cursor-not-allowed' : 'bg-surface text-ink shadow-[var(--shadow-card)] hover:bg-tint-2'
          )}
        >
          <ChevronLeft size={16} aria-hidden />
          <span className="hidden sm:inline break-words">{t('voice.previous').split(' ')[0]}</span>
        </button>

        <button
          type="button"
          onClick={player.speaking ? player.stop : player.play}
          aria-label={player.speaking ? t('voice.stopInstruction') : t('voice.playInstruction')}
          aria-pressed={player.speaking}
          className={cx(
            'min-h-[44px] h-11 rounded-[12px] text-[13px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
            player.speaking ? 'bg-error text-white' : 'bg-primary text-white shadow-[var(--shadow-btn)]'
          )}
        >
          {player.speaking ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
          <span className="break-words">{player.speaking ? t('voice.stop') : t('voice.listen').split(' ')[0]}</span>
        </button>

        <button
          type="button"
          onClick={player.stop}
          aria-label={t('voice.stopInstruction')}
          className="min-h-[44px] h-11 rounded-[12px] bg-surface text-ink shadow-[var(--shadow-card)] text-[13px] font-semibold inline-flex items-center justify-center gap-1 hover:bg-tint-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <Square size={14} aria-hidden />
          <span className="break-words">Stop</span>
        </button>

        <button
          type="button"
          onClick={player.next}
          disabled={isLast}
          aria-label={t('voice.next')}
          aria-disabled={isLast}
          className={cx(
            'min-h-[44px] h-11 rounded-[12px] text-[13px] font-semibold inline-flex items-center justify-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
            isLast ? 'bg-tint-2 text-muted cursor-not-allowed' : 'bg-surface text-ink shadow-[var(--shadow-card)] hover:bg-tint-2'
          )}
        >
          <span className="hidden sm:inline break-words">{t('voice.next').split(' ')[0]}</span>
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>

      {/* Unavailable state - clear, not pretending English is native */}
      {showUnavailable && (
        <div className="mt-3 rounded-[10px] bg-warning-tint p-2.5">
          <p className="text-[12px] font-semibold text-warning-text break-words">
            {t('voice.unavailable')}
          </p>
          <p className="text-[11px] text-secondary mt-1 break-words">
            {t('voice.unavailableDetail', { language: t(`languages.${language}.native`) } as any)}
          </p>
          <p className="text-[10px] text-muted mt-1 break-words">
            Device voices: {player.voices.length} available. Genuine {language} voice not found. Audio pack: /public/audio/{language}/ required.
          </p>
        </div>
      )}

      {/* Supported check */}
      {player.status === 'unsupported' && (
        <div className="mt-2 text-[11px] text-secondary break-words" aria-live="polite">
          {t('voice.notSupported')}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Legacy VoiceButton - updated to NOT silently fallback to English
// ============================================================================
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
    if (engine.speaking) {
      engine.stop()
    } else {
      const res = await engine.speak({ language: targetLang, text })
      setResolution(res)
    }
  }

  if (!engine.supported) {
    return (
      <span
        className="inline-flex min-h-[44px] h-11 px-4 rounded-full bg-tint text-secondary text-[13px] font-medium items-center gap-1.5 break-words max-w-full"
        aria-live="polite"
      >
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
        title={engine.speaking ? t('voice.stop') : t('voice.listen')}
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

// ============================================================================
// Voice status documentation (for final report)
// ============================================================================
export const VOICE_SUPPORT_DOC = {
  en: {
    bcp: 'en-IN',
    variants: ['en-IN', 'en-US', 'en-GB', 'en'],
    expectedAvailability: 'High - available on most devices/browsers',
    requiresAudioPack: false,
    notes: 'English voices widely available. en-IN preferred for India.',
  },
  hi: {
    bcp: 'hi-IN',
    variants: ['hi-IN', 'hi'],
    expectedAvailability: 'Medium - available on Android Chrome, some desktops, not on iOS Safari',
    requiresAudioPack: true,
    notes: 'Hindi TTS available on many Android devices but not guaranteed. Needs bundled audio fallback for iOS.',
  },
  bn: {
    bcp: 'bn-IN',
    variants: ['bn-IN', 'bn-BD', 'bn'],
    expectedAvailability: 'Low-Medium - available on some Android, rare on desktop/iOS',
    requiresAudioPack: true,
    notes: 'Bengali voices limited. Requires audio pack for reliable support.',
  },
  ta: {
    bcp: 'ta-IN',
    variants: ['ta-IN', 'ta-LK', 'ta'],
    expectedAvailability: 'Low-Medium - available on some Android, rare on desktop/iOS',
    requiresAudioPack: true,
    notes: 'Tamil voices limited. Requires audio pack.',
  },
  as: {
    bcp: 'as-IN',
    variants: ['as-IN', 'as'],
    expectedAvailability: 'Very Low - almost never available in SpeechSynthesis',
    requiresAudioPack: true,
    notes: 'Assamese voice almost never provided by browsers. Requires bundled native audio: /public/audio/as/',
  },
  mni: {
    bcp: 'mni-IN',
    variants: ['mni-IN', 'mni'],
    expectedAvailability: 'Very Low - almost never available',
    requiresAudioPack: true,
    notes: 'Meitei/Manipuri voice almost never available. Requires bundled native audio: /public/audio/mni/',
  },
} as const
