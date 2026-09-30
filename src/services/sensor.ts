/**
 * Sensor adapter interface + simulated implementation.
 * Replace `SimulatedSensor` with a Web Bluetooth implementation later; UI only depends on the interface.
 */
export type SensorState = 'disconnected' | 'connecting' | 'connected' | 'ready' | 'calibrating' | 'calibrated' | 'error'

export interface MovementSample { t: number; angle: number }

export interface SensorAdapter {
  connect(onState: (s: SensorState) => void, opts?: { fail?: boolean }): () => void
  calibrate(onProgress: (pct: number) => void, onDone: (ok: boolean) => void, opts?: { fail?: boolean }): () => void
  startAssessment(onSample: (s: MovementSample) => void, onRep: (n: number) => void, onComplete?: (data: any) => void, opts?: { durationSec: number; noMovement?: boolean }): () => void
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

export const HARDWARE_API_URL = "https://purveyor-estate-laborious.ngrok-free.dev/status"

export class SimulatedSensor implements SensorAdapter {
  connect(onState: (s: SensorState) => void, _opts?: { fail?: boolean }) {
    let cancelled = false
    ;(async () => {
      onState('connecting')
      let attempts = 0
      while (attempts < 3) {
        if (cancelled) return
        try {
          // Attempt to fetch from the URL
          const res = await fetch(HARDWARE_API_URL, {
            headers: {
              "ngrok-skip-browser-warning": "69420",
              "Bypass-Tunnel-Reminder": "true"
            }
          })
          if (res.ok) {
            const data = await res.json()
            if (data && data.SensorConnected) {
              onState('connected')
              await wait(500)
              if (cancelled) return
              onState('ready')
              return
            } else {
              console.warn("Sensor found, but SensorConnected is false in JSON.")
            }
          }
        } catch (e) {
          console.warn("Connection attempt " + (attempts + 1) + " failed", e)
        }
        attempts++
        await wait(1000)
      }
      if (!cancelled) onState('error')
    })()
    return () => { cancelled = true }
  }

  calibrate(onProgress: (pct: number) => void, onDone: (ok: boolean) => void, opts?: { fail?: boolean }) {
    let pct = 0; const failAt = opts?.fail ? 55 : 101
    const id = setInterval(() => {
      pct += 4; onProgress(Math.min(pct, 100))
      if (pct >= failAt) { clearInterval(id); onDone(false); return }
      if (pct >= 100) { clearInterval(id); onDone(true) }
    }, 120)
    return () => clearInterval(id)
  }

  startAssessment(onSample: (s: MovementSample) => void, onRep: (n: number) => void, onComplete?: (data: any) => void, _opts?: { durationSec: number; noMovement?: boolean }) {
    const start = Date.now()
    let lastRep = 0
    let cancelled = false
    let currentAngle = 0
    let stepAnimationTimeout: any = null

    // Send continuous samples to UI to keep graph moving
    const id = setInterval(() => {
      const t = (Date.now() - start) / 1000
      // add a tiny bit of random jitter so it doesn't look completely dead
      const jitter = Math.random() * 2
      onSample({ t, angle: currentAngle + jitter })
    }, 100)

    // Poll the API for real data
    const pollId = setInterval(async () => {
      if (cancelled) return
      try {
        const res = await fetch(HARDWARE_API_URL, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Bypass-Tunnel-Reminder": "true"
          }
        })
        if (res.ok) {
          const data = await res.json()
          
          if (data.StepsTaken && data.StepsTaken > lastRep) {
            lastRep = data.StepsTaken
            onRep(lastRep)
            
            // Animate a "step" on the graph (spike to 60 degrees, then back down)
            currentAngle = 60
            if (stepAnimationTimeout) clearTimeout(stepAnimationTimeout)
            stepAnimationTimeout = setTimeout(() => { currentAngle = 0 }, 500)
          }
          
          if (data.TestCompleted === true || data.TestCompleted === "true") {
            if (onComplete) onComplete(data)
          }
        }
      } catch (e) {
        console.warn("Polling error", e)
      }
    }, 500)

    return () => {
      cancelled = true
      clearInterval(id)
      clearInterval(pollId)
      if (stepAnimationTimeout) clearTimeout(stepAnimationTimeout)
    }
  }
}

export const sensor: SensorAdapter = new SimulatedSensor()
