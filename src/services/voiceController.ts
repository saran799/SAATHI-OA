import { useRef, useCallback, useEffect, useState } from 'react'
import { useVoiceEngine, type SupportedLang } from '../components/Voice'

export function useVoiceController(lang: SupportedLang = 'en') {
  const engine = useVoiceEngine()
  const currentInstructionRef = useRef<string | null>(null)
  const isPlayingRef = useRef(false)
  const [subtitle, setSubtitle] = useState<string | null>(null)
  
  const stop = useCallback(() => {
    engine.stop()
    currentInstructionRef.current = null
    isPlayingRef.current = false
    setSubtitle(null)
  }, [engine])

  const speak = useCallback((text: string) => {
    if (currentInstructionRef.current === text && isPlayingRef.current) return
    
    // Stop any existing speech first to prevent overlap
    engine.stop()
    
    currentInstructionRef.current = text
    isPlayingRef.current = true
    setSubtitle(text)
    
    // Ensure we use the bundled English fallback for instructions
    engine.speak({ language: lang, text })
  }, [engine, lang])

  const replay = useCallback(() => {
    if (currentInstructionRef.current) {
      const text = currentInstructionRef.current
      engine.stop()
      isPlayingRef.current = true
      setSubtitle(text)
      engine.speak({ language: lang, text })
    }
  }, [engine, lang])

  // Automatically clear subtitle when speech ends if we want to, but prompt says "subtitles remain visible"
  // so we won't clear it automatically unless explicitly stopped.
  
  useEffect(() => {
    // When the status from the engine becomes idle, we mark playing as false
    if (engine.status === 'idle') {
      isPlayingRef.current = false
    }
  }, [engine.status])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      engine.stop()
    }
  }, [engine])

  return {
    speak,
    stop,
    replay,
    subtitle,
    isSpeaking: engine.status === 'speaking',
    status: engine.status
  }
}
