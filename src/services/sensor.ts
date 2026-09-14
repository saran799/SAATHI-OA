/**
 * Sensor adapter interface + simulated implementation.
 * Replace `SimulatedSensor` with a Web Bluetooth implementation later; UI only depends on the interface.
 */
export type SensorState = 'disconnected' | 'connecting' | 'connected' | 'ready' | 'calibrating' | 'calibrated' | 'error'

export interface MovementSample { t: number; angle: number }

export interface SensorAdapter {
  connect(onState: (s: SensorState) => void, opts?: { fail?: boolean }): () => void
  calibrate(onProgress: (pct: number) => void, onDone: (ok: boolean) => void, opts?: { fail?: boolean }): () => void
  startAssessment(onSample: (s: MovementSample) => void, onRep: (n: number) => void, opts?: { durationSec: number; noMovement?: boolean }): () => void
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

export class SimulatedSensor implements SensorAdapter {
  connect(onState: (s: SensorState) => void, opts?: { fail?: boolean }) {
    let cancelled = false
    ;(async () => {
      onState('connecting'); await wait(1600); if (cancelled) return
      if (opts?.fail) { onState('error'); return }
      onState('connected'); await wait(900); if (cancelled) return
      onState('ready')
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

  startAssessment(onSample: (s: MovementSample) => void, onRep: (n: number) => void, opts?: { durationSec: number; noMovement?: boolean }) {
    const start = Date.now(); const period = 6000; let lastRep = 0
    const id = setInterval(() => {
      const t = (Date.now() - start) / 1000
      const phase = ((Date.now() - start) % period) / period
      const base = opts?.noMovement ? 2 : 60 * (0.5 - 0.5 * Math.cos(phase * Math.PI * 2))
      const angle = Math.max(0, base + (Math.random() - 0.5) * 3)
      onSample({ t, angle })
      const rep = Math.floor((Date.now() - start) / period)
      if (rep > lastRep) { lastRep = rep; onRep(rep) }
    }, 100)
    return () => clearInterval(id)
  }
}

export const sensor: SensorAdapter = new SimulatedSensor()
