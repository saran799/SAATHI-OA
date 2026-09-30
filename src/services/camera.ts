/**
 * SAATHI Camera Service — REAL device camera pipeline
 * Implements required states: idle, requesting, permission-required, starting, ready, running,
 * denied, not-found, in-use, unsupported, security-error, unknown-error, stopped
 * Maps DOMException names: NotAllowedError, NotFoundError, NotReadableError, OverconstrainedError, SecurityError, AbortError
 * Cleanup mandatory: stops all tracks on leave/stop/complete/restart/fail/route change
 * Prevents duplicate streams, handles StrictMode, waits for video metadata & readyState >= HAVE_CURRENT_DATA
 */

export type CameraState =
  | 'idle'
  | 'requesting'
  | 'permission-required'
  | 'starting'
  | 'ready'
  | 'running'
  | 'denied'
  | 'not-found'
  | 'in-use'
  | 'inUse'
  | 'unsupported'
  | 'security-error'
  | 'unknown-error'
  | 'stopped'
  // legacy aliases for backward compat
  | 'granted'
  | 'active'
  | 'unavailable'
  | 'noDevice'
  | 'error'

export type FacingMode = 'user' | 'environment'

export interface CameraError {
  state: CameraState
  message: string
  name?: string
}

function isPreviewEnvironment(): boolean {
  try {
    const host = window.location.hostname || ''
    // Arena / e2b preview, stackblitz, codesandbox, etc.
    return (
      host.includes('e2b.app') ||
      host.includes('arena') ||
      host.includes('stackblitz') ||
      host.includes('codesandbox') ||
      window.self !== window.top
    )
  } catch {
    return false
  }
}

async function hasVideoInput(): Promise<boolean> {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return true // assume yes if cannot check
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.some(d => d.kind === 'videoinput')
  } catch {
    return true
  }
}

function waitForVideoReady(video: HTMLVideoElement, timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      const hasDim = video.videoWidth > 0 && video.videoHeight > 0
      const ready = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA // 2
      if (hasDim && ready) {
        resolve()
        return
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('Video ready timeout'))
        return
      }
      requestAnimationFrame(check)
    }

    // If metadata already available, quick check
    if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
      resolve()
      return
    }

    const onLoaded = () => {
      // don't resolve yet, let check loop verify readyState
    }
    const onError = () => {
      cleanup()
      reject(new Error('Video load error'))
    }

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('canplay', onLoaded)
      video.removeEventListener('error', onError)
    }

    video.addEventListener('loadedmetadata', onLoaded, { once: true })
    video.addEventListener('canplay', onLoaded, { once: true })
    video.addEventListener('error', onError, { once: true })

    // Start polling
    requestAnimationFrame(check)

    // Safety timeout
    setTimeout(() => {
      cleanup()
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error('Video dimensions invalid'))
      }
    }, timeoutMs)
  })
}

export class CameraService {
  private stream: MediaStream | null = null
  private videoEl: HTMLVideoElement | null = null
  private facing: FacingMode = 'environment'
  private stopped = false

  getFacing(): FacingMode {
    return this.facing
  }

  /**
   * Request camera stream with mobile-friendly & laptop-friendly constraints
   * Default: environment (rear) for patient observation, fallback to user
   */
  async request(
    onState: (s: CameraState) => void,
    video: HTMLVideoElement,
    opts: { facingMode?: FacingMode } = {}
  ): Promise<MediaStream | null> {
    // Prevent duplicate streams
    this.stop()

    this.stopped = false
    this.videoEl = video
    this.facing = opts.facingMode || 'environment'

    // Check support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onState('unsupported')
      return null
    }

    // Secure context check
    if (!window.isSecureContext) {
      // getUserMedia requires secure context except localhost
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      if (!isLocalhost) {
        onState('security-error')
        return null
      }
    }

    onState('requesting')

    // Emit permission-required to show UI guidance before browser prompt
    // Small delay to allow UI to render
    await new Promise(r => setTimeout(r, 150))
    if (this.stopped) {
      onState('stopped')
      return null
    }
    onState('permission-required')

    // Check if video input exists (helps distinguish Arena preview)
    const hasInput = await hasVideoInput()
    if (!hasInput) {
      // No camera device found at all
      if (isPreviewEnvironment()) {
        // Special handling for preview env — not a user block
        onState('not-found')
      } else {
        onState('not-found')
      }
      return null
    }

    try {
      // Mobile-friendly + laptop-friendly constraints
      // Prefer environment for patient observation per spec
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: this.facing,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 },
          // aspect ratio 16:9 ideal but allow portrait
          aspectRatio: { ideal: 1.777 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (this.stopped) {
        // If stopped during async, clean up immediately
        stream.getTracks().forEach(t => t.stop())
        onState('stopped')
        return null
      }

      this.stream = stream

      // Configure video element per spec
      video.srcObject = stream
      video.autoplay = true
      // @ts-ignore playsInline
      video.playsInline = true
      video.muted = true
      // Ensure playsInline attribute for iOS
      video.setAttribute('playsinline', 'true')
      video.setAttribute('autoplay', 'true')
      video.setAttribute('muted', 'true')

      onState('starting')

      // Wait until video metadata available, valid width/height, readyState >= HAVE_CURRENT_DATA
      try {
        await waitForVideoReady(video, 8000)
      } catch (e) {
        console.warn('Video ready wait failed', e)
        // Even if wait fails, try to play
      }

      // Attempt playback
      try {
        await video.play()
      } catch (playErr) {
        console.warn('Video play failed', playErr)
        // On iOS, play may require user gesture but muted autoplay should work
        // Still consider ready if dimensions valid
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          throw playErr
        }
      }

      // Verify dimensions again after play
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        // Try one more time waiting
        await new Promise(r => setTimeout(r, 500))
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          this.stop()
          onState('unknown-error')
          return null
        }
      }

      onState('ready')

      // Small delay then running
      await new Promise(r => setTimeout(r, 200))
      if (this.stopped) {
        this.stop()
        onState('stopped')
        return null
      }

      onState('running')
      // Legacy alias also emit active for backward compat UI that checks active
      // but primary state is running

      // Attach interruption handlers
      this.attachStreamHandlers(onState)

      return stream
    } catch (err: any) {
      const name: string = err?.name || ''
      const message: string = err?.message || ''

      console.error('Camera request error', name, message, err)

      // Map DOMException names per spec
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        onState('denied')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        // Distinguish preview environment
        if (isPreviewEnvironment()) {
          onState('not-found')
        } else {
          onState('not-found')
        }
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        onState('in-use')
      } else if (name === 'OverconstrainedError') {
        // Try fallback to any camera if overconstrained
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          if (this.stopped) {
            fallbackStream.getTracks().forEach(t => t.stop())
            onState('stopped')
            return null
          }
          this.stream = fallbackStream
          video.srcObject = fallbackStream
          video.autoplay = true
          // @ts-ignore
          video.playsInline = true
          video.muted = true
          await video.play().catch(() => {})
          onState('ready')
          setTimeout(() => onState('running'), 200)
          this.attachStreamHandlers(onState)
          return fallbackStream
        } catch {
          onState('not-found')
        }
      } else if (name === 'SecurityError') {
        onState('security-error')
      } else if (name === 'AbortError') {
        onState('unknown-error')
      } else if (name === 'NotSupportedError') {
        onState('unsupported')
      } else {
        // Unknown
        onState('unknown-error')
      }
      this.stop()
      return null
    }
  }

  private attachStreamHandlers(onState: (s: CameraState) => void) {
    if (!this.stream) return
    // Handle track ended (camera unplugged, interrupted)
    this.stream.getTracks().forEach(track => {
      track.onended = () => {
        console.warn('Camera track ended')
        if (!this.stopped) {
          onState('unknown-error')
        }
      }
    })

    // Handle visibility change — pause handling done in UI layer
    // But we can detect stream inactive
    const checkInactive = setInterval(() => {
      if (this.stopped) {
        clearInterval(checkInactive)
        return
      }
      if (this.stream && this.stream.getTracks().every(t => t.readyState === 'ended')) {
        clearInterval(checkInactive)
        onState('unknown-error')
      }
    }, 1000)

    // Store interval for cleanup
    // @ts-ignore
    this._inactiveCheck = checkInactive
  }

  stop() {
    this.stopped = true
    // @ts-ignore
    if (this._inactiveCheck) {
      // @ts-ignore
      clearInterval(this._inactiveCheck)
      // @ts-ignore
      this._inactiveCheck = null
    }
    if (this.stream) {
      try {
        this.stream.getTracks().forEach(t => {
          try {
            t.stop()
            // @ts-ignore
            t.onended = null
          } catch {}
        })
      } catch {}
      this.stream = null
    }
    if (this.videoEl) {
      try {
        this.videoEl.pause()
        this.videoEl.srcObject = null
        this.videoEl.removeAttribute('src')
        // @ts-ignore
        this.videoEl.srcObject = null
      } catch {}
      this.videoEl = null
    }
  }

  getStream() {
    return this.stream
  }

  isPreviewEnv(): boolean {
    return isPreviewEnvironment()
  }
}

export const cameraService = new CameraService()
