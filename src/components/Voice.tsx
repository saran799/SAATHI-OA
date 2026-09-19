import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useT } from '../i18n'

export function useVoice() {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    setSupported('speechSynthesis' in window)
    return () => { window.speechSynthesis?.cancel() }
  }, [])

  const speak = (text: string, lang?: string) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    // Map our lang codes to BCP-47
    const map: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', as: 'as-IN', bn: 'bn-IN', mni: 'en-IN', ta: 'ta-IN' }
    utter.lang = lang ? (map[lang] || lang) : 'en-IN'
    utter.rate = 0.9
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    utterRef.current = utter
    window.speechSynthesis.speak(utter)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  return { speaking, supported, speak, stop }
}

export function VoiceButton({ text }: { text: string }) {
  const { speaking, supported, speak, stop } = useVoice()
  const { lang, t } = useT()

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={() => speaking ? stop() : speak(text, lang)}
      className="h-10 px-3 rounded-full bg-tint text-primary text-[13px] font-semibold inline-flex items-center gap-1.5"
      aria-label={speaking ? t('voice.stop') : t('voice.listen')}
    >
      {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
      {speaking ? t('voice.stop') : t('voice.listen')}
    </button>
  )
}
