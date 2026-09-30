import type { SupportedLang } from '../components/Voice'

const LANG_TO_BCP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  as: 'as-IN',
  bn: 'bn-IN',
  mni: 'mni-IN',
  ta: 'ta-IN',
}

export type PlaybackStatus = 'idle' | 'speaking' | 'paused' | 'unavailable'

export class VoiceManager {
  private globalAudio: HTMLAudioElement | null = null;
  private audioUnlocked: boolean = false;
  private audioCache: Map<string, string> = new Map();
  private queue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  
  public status: PlaybackStatus = 'idle';
  private statusListeners: Array<(s: PlaybackStatus) => void> = [];
  
  public onStatusChange(fn: (s: PlaybackStatus) => void) {
    this.statusListeners.push(fn);
    return () => {
       this.statusListeners = this.statusListeners.filter(l => l !== fn);
    };
  }
  
  private setStatus(s: PlaybackStatus) {
    this.status = s;
    this.statusListeners.forEach(l => l(s));
  }
  
  public unlockAudio() {
    if (this.audioUnlocked || typeof window === 'undefined') return;
    try {
      this.globalAudio = new Audio();
      this.globalAudio.volume = 1;
      this.globalAudio.muted = false;
      (this.globalAudio as any).playsInline = true;
      this.globalAudio.preload = 'auto';
      // Tiny silent MP3 to unlock the audio context
      this.globalAudio.src = 'data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
      const playPromise = this.globalAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => { 
          this.audioUnlocked = true; 
        }).catch(() => {
          // If it fails, we will just try again later
        });
      } else {
        this.audioUnlocked = true;
      }
    } catch (e) {
      console.warn("Audio unlock failed", e);
    }
  }

  public speak(text: string, language: SupportedLang, staticAudioSrc?: string): Promise<boolean> {
     this.unlockAudio();

     return new Promise((resolve) => {
         this.queue.push(async () => {
             const success = await this._play(text, language, staticAudioSrc);
             resolve(success);
         });
         if (!this.isProcessingQueue) {
             this.processQueue();
         }
     });
  }

  private async processQueue() {
     this.isProcessingQueue = true;
     while (this.queue.length > 0) {
         const task = this.queue.shift();
         if (task) {
             await task();
         }
     }
     this.isProcessingQueue = false;
  }
  
  public stop() {
     this.queue = [];
     if (this.globalAudio) {
        try { 
          this.globalAudio.pause(); 
          this.globalAudio.currentTime = 0; 
        } catch (e) {}
     }
     if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
     }
     this.setStatus('idle');
  }

  private async _play(text: string, language: SupportedLang, staticAudioSrc?: string): Promise<boolean> {
      if (!text || !text.trim()) return false;
      const bcp = LANG_TO_BCP[language] || 'en-IN';
      
      this.setStatus('speaking');

      // 1. Try static audio if provided
      if (staticAudioSrc) {
         const success = await this.playAudioElement(staticAudioSrc);
         if (success) { this.setStatus('idle'); return true; }
      }

      // 2. Try Cache
      const cacheKey = `${language}:${text}`;
      if (this.audioCache.has(cacheKey)) {
         const success = await this.playAudioElement(this.audioCache.get(cacheKey)!);
         if (success) { this.setStatus('idle'); return true; }
      }

      // 3. Try Cloud TTS
      if (typeof window !== 'undefined' && navigator.onLine) {
          try {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
              const res = await fetch(`${API_URL}/api/tts`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: text.trim(), language: bcp })
              });
              
              if (res.ok) {
                  const contentType = res.headers.get('Content-Type');
                  if (contentType && contentType.includes('audio/')) {
                      const blob = await res.blob();
                      if (blob.size > 0) {
                          const url = URL.createObjectURL(blob);
                          this.audioCache.set(cacheKey, url);
                          const success = await this.playAudioElement(url);
                          if (success) {
                              this.setStatus('idle');
                              return true;
                          }
                      }
                  }
              }
          } catch (e) {
              console.warn("Cloud TTS failed", e);
          }
      }

      // 4. Try SpeechSynthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
         const success = await this.playSpeechSynthesis(text, bcp, language);
         if (success) { this.setStatus('idle'); return true; }
      }
      
      // 5. Fail
      this.setStatus('unavailable');
      return false;
  }
  
  private playAudioElement(src: string): Promise<boolean> {
      return new Promise((resolve) => {
         if (!this.globalAudio) {
             this.globalAudio = new Audio();
             this.globalAudio.volume = 1;
             this.globalAudio.muted = false;
             (this.globalAudio as any).playsInline = true;
         }
         
         const audio = this.globalAudio;
         audio.src = src;
         
         const cleanup = () => {
             audio.onended = null;
             audio.onerror = null;
         }
         
         audio.onended = () => {
             cleanup();
             resolve(true);
         };
         
         audio.onerror = () => {
             cleanup();
             resolve(false);
         };
         
         const playPromise = audio.play();
         if (playPromise !== undefined) {
             playPromise.catch((e) => {
                 console.warn("Audio element play failed:", e);
                 cleanup();
                 resolve(false);
             });
         }
      });
  }

  private playSpeechSynthesis(text: string, bcp: string, lang: SupportedLang): Promise<boolean> {
      return new Promise((resolve) => {
          if (!window.speechSynthesis) {
             return resolve(false);
          }
          const voices = window.speechSynthesis.getVoices();
          if (voices.length === 0) return resolve(false);

          const variants = (lang === 'en') ? ['en-IN', 'en-US', 'en-GB', 'en'] : 
                           (lang === 'hi') ? ['hi-IN', 'hi'] :
                           (lang === 'ta') ? ['ta-IN', 'ta-LK', 'ta'] :
                           (lang === 'as') ? ['as-IN', 'as'] :
                           (lang === 'bn') ? ['bn-IN', 'bn-BD', 'bn'] : [bcp];
                           
          let voice: SpeechSynthesisVoice | null = null;
          for (let v of variants) {
              voice = voices.find(x => x.lang === v || x.lang.toLowerCase() === v.toLowerCase()) || null;
              if (voice) break;
          }
          if (!voice) {
              const prefix = lang.toLowerCase();
              voice = voices.find(x => x.lang.toLowerCase().startsWith(prefix)) || null;
          }
          
          if (!voice) {
             return resolve(false); 
          }

          const utter = new SpeechSynthesisUtterance(text);
          utter.voice = voice;
          utter.lang = voice.lang;
          utter.volume = 1;
          
          utter.onend = () => resolve(true);
          utter.onerror = () => resolve(false);
          
          window.speechSynthesis.speak(utter);
      });
  }
}

export const voiceManager = new VoiceManager();
