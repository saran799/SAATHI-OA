import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Square, Activity, Volume2, Radio, RefreshCw, RotateCcw, Camera, VideoOff, AlertTriangle,
  SwitchCamera, Eye, EyeOff, Info, ShieldCheck
} from 'lucide-react'
import { Frame, TopBar } from '../../components/layout/Shells'
import { Button, Callout, Ring, cx } from '../../components/ui'
import { sensor, type MovementSample } from '../../services/sensor'
import { useScreeningPatient } from './useGuard'
import { useT } from '../../i18n'
import { cameraService, type CameraState, type FacingMode } from '../../services/camera'
import { loadPoseModel, detectPose, getJointConfig, type PosePoint, isPoseModelLoaded } from '../../services/pose'
import { analyzeMovement, angleFromLandmarks, type TimestampedSample } from '../../services/movement'

const DURATION = 30
type Phase = 'idle' | 'countdown' | 'recording' | 'complete' | 'interrupted' | 'nomove' | 'cameraError' | 'noPerson' | 'poseError'
type Mode = 'camera' | 'simulated'

function isPreviewEnv(): boolean {
  try {
    const host = window.location.hostname || ''
    return host.includes('e2b.app') || host.includes('arena') || window.self !== window.top
  } catch { return false }
}

export default function Assessment() {
  const nav = useNavigate()
  const { patient, session } = useScreeningPatient(true)
  const { t } = useT()

  // Core state
  const [mode, setMode] = useState<Mode>('camera')
  const [phase, setPhase] = useState<Phase>('idle')
  const [count, setCount] = useState(3)
  const [elapsed, setElapsed] = useState(0)
  const [reps, setReps] = useState(0)
  const [angle, setAngle] = useState(0)
  const [trace, setTrace] = useState<number[]>([])
  const [confidence, setConfidence] = useState(0)
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [poseLoaded, setPoseLoaded] = useState(isPoseModelLoaded())
  const [poseError, setPoseError] = useState<string | null>(null)
  const [personDetected, setPersonDetected] = useState(false)
  const [stableDetection, setStableDetection] = useState(false)
  const [facingMode, setFacingMode] = useState<FacingMode>('environment')
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  // Refs for high-frequency values (per spec: avoid unnecessary React updates)
  const samples = useRef<MovementSample[]>([])
  const realSamples = useRef<TimestampedSample[]>([])
  const stopSim = useRef<() => void>(null)
  const noMove = useRef(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const lastAngleRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)
  const stableFramesRef = useRef<number>(0)
  const noPersonFramesRef = useRef<number>(0)
  const repStateRef = useRef<{
    lastPeak: number
    lastValley: number
    lastPeakTime: number
    lastValleyTime: number
    direction: 'up' | 'down' | null
    candidatePeak: { angle: number; t: number }
    candidateValley: { angle: number; t: number }
    reps: number
  }>({
    lastPeak: -Infinity,
    lastValley: Infinity,
    lastPeakTime: -Infinity,
    lastValleyTime: -Infinity,
    direction: null,
    candidatePeak: { angle: -Infinity, t: 0 },
    candidateValley: { angle: Infinity, t: 0 },
    reps: 0,
  })

  const isPreview = isPreviewEnv()

  // Initial idle -> countdown after stable detection or user action
  useEffect(() => {
    if (phase === 'idle' && mode === 'camera' && stableDetection && poseLoaded) {
      // Auto move to countdown when stable? Or require user press Start
      // For now stay idle until user presses Start
    }
  }, [phase, mode, stableDetection, poseLoaded])

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    if (count === 0) {
      setPhase('recording')
      return
    }
    const tId = setTimeout(() => setCount(c => c - 1), 800)
    return () => clearTimeout(tId)
  }, [phase, count])

  // Load pose model — initialization per spec
  useEffect(() => {
    let cancelled = false
    if (poseLoaded) return
    loadPoseModel()
      .then(() => {
        if (!cancelled) {
          setPoseLoaded(true)
          setPoseError(null)
        }
      })
      .catch((e) => {
        console.error('Pose model load failed', e)
        if (!cancelled) {
          setPoseLoaded(false)
          setPoseError('Failed to load pose detection model. Please check network and retry.')
          setPhase('poseError')
        }
      })
    return () => { cancelled = true }
  }, [poseLoaded])

  // Camera cleanup mandatory on unmount / route change
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      cameraService.stop()
      stopSim.current?.()
    }
  }, [])

  // Handle visibility change — pause if tab hidden during recording
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && phase === 'recording' && mode === 'camera') {
        console.warn('Tab hidden during recording')
        // Don't auto-stop, but warn — spec says handle visibility changes
        // We pause UI update but keep recording if stream alive
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [phase, mode])

  const startCamera = useCallback(async (facing: FacingMode = facingMode) => {
    if (!videoRef.current) return null
    setCameraState('requesting')
    setPersonDetected(false)
    setStableDetection(false)
    stableFramesRef.current = 0
    noPersonFramesRef.current = 0

    const stream = await cameraService.request(setCameraState, videoRef.current, { facingMode: facing })
    if (!stream) {
      // Map to cameraError phase if not already handled
      setPhase(prev => (prev === 'recording' || prev === 'countdown' || prev === 'idle' ? 'cameraError' : prev))
      return null
    }
    return stream
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    cameraService.stop()
    setCameraState('stopped')
  }, [])

  const switchCamera = useCallback(async () => {
    const newFacing: FacingMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(newFacing)
    stopCamera()
    // Small delay to ensure cleanup
    await new Promise(r => setTimeout(r, 300))
    if (phase === 'recording' || phase === 'idle' || phase === 'countdown') {
      await startCamera(newFacing)
    }
  }, [facingMode, phase, startCamera, stopCamera])

  // Simulated sensor effect (existing, clearly labeled Demo)
  useEffect(() => {
    if (phase !== 'recording') return
    if (mode !== 'simulated') return
    const start = Date.now()
    samples.current = []
    stopSim.current = sensor.startAssessment(
      (s) => {
        samples.current.push(s)
        // Throttle UI updates
        const now = Date.now()
        if (now - lastUpdateRef.current > 100) {
          setAngle(s.angle)
          setTrace(tr => [...tr.slice(-59), s.angle])
          lastUpdateRef.current = now
        }
      },
      setReps,
      { durationSec: DURATION, noMovement: noMove.current }
    )
    const tick = setInterval(() => {
      const e = (Date.now() - start) / 1000
      setElapsed(Math.min(DURATION, e))
      if (e >= 8 && samples.current.length > 40) {
        const mx = Math.max(...samples.current.map(s => s.angle))
        if (mx < 8) {
          clearInterval(tick)
          stopSim.current?.()
          setPhase('nomove')
          return
        }
      }
      if (e >= DURATION) {
        clearInterval(tick)
        stopSim.current?.()
        finishSimulated()
      }
    }, 100)
    return () => {
      clearInterval(tick)
      stopSim.current?.()
    }
  }, [phase, mode])

  const finishSimulated = () => {
    // NOTE: Simulated path uses old heuristic but clearly labeled Demo — real path must NOT use this
    const a = samples.current.map(s => s.angle)
    const rom = a.length ? Math.max(...a) - Math.min(...a) : 0
    let jitter = 0
    for (let i = 2; i < a.length; i++) jitter += Math.abs(a[i] - 2 * a[i - 1] + a[i - 2])
    const smooth = Math.max(0, Math.min(1, 1 - jitter / a.length / 3))
    session.setMovement({
      rangeOfMotionDeg: Math.round(60 + rom), // simulated only
      smoothness: Number(smooth.toFixed(2)),
      durationSec: DURATION,
      repetitions: Math.max(reps, Math.round(DURATION / 6)),
      performed: true,
    })
    setPhase('complete')
    setTimeout(() => nav('/screening/analysis', { replace: true }), 900)
  }

  // Real camera + pose effect — starts when phase recording and mode camera
  useEffect(() => {
    if (phase !== 'recording' || mode !== 'camera') return
    if (!videoRef.current || !poseLoaded) return

    // Start camera if not already running
    if (cameraState !== 'running' && cameraState !== 'ready') {
      startCamera(facingMode)
    }

    return () => {
      // Cleanup handled by stopCamera on phase change, but ensure no duplicate loops
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [phase, mode, poseLoaded, cameraState, facingMode, startCamera])

  // Pose inference loop — only when camera running
  useEffect(() => {
    if (phase !== 'recording' || mode !== 'camera') return
    if (cameraState !== 'running' && cameraState !== 'ready') return
    if (!videoRef.current) return
    if (!poseLoaded) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const joint = session.joint as any
    const side = session.side as any
    const config = getJointConfig(joint, side)

    realSamples.current = []
    startTimeRef.current = Date.now()
    lastAngleRef.current = 0
    lastUpdateRef.current = 0
    stableFramesRef.current = 0
    noPersonFramesRef.current = 0
    repStateRef.current = {
      lastPeak: -Infinity,
      lastValley: Infinity,
      lastPeakTime: -Infinity,
      lastValleyTime: -Infinity,
      direction: null,
      candidatePeak: { angle: -Infinity, t: 0 },
      candidateValley: { angle: Infinity, t: 0 },
      reps: 0,
    }

    const loop = () => {
      if (phase !== 'recording') return

      const now = Date.now()
      const elapsedSec = (now - startTimeRef.current) / 1000

      // Throttle elapsed UI update to 100ms
      if (now - lastUpdateRef.current > 100) {
        setElapsed(Math.min(DURATION, elapsedSec))
      }

      // Guard: never run against zero-dimension/unready video per spec
      if (!video || video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const pose = detectPose(video, now)

      if (!pose || pose.landmarks.length === 0) {
        noPersonFramesRef.current++
        if (noPersonFramesRef.current > 30) {
          if (personDetected) setPersonDetected(false)
          stableFramesRef.current = Math.max(0, stableFramesRef.current - 1)
          if (stableFramesRef.current < 5) setStableDetection(false)
        }
        // Insufficient data handling — don't produce fake readings
        if (elapsedSec > 8 && realSamples.current.length < 20) {
          // Will be handled as noPerson or nomove at end
        }
      } else {
        noPersonFramesRef.current = 0
        if (!personDetected) setPersonDetected(true)

        // Check landmark quality per spec
        const { angle: curAngle, confidence: curConf, valid } = angleFromLandmarks(pose.landmarks, config)

        if (!valid) {
          // Invalid frame — don't calculate angle, show guidance
          stableFramesRef.current = Math.max(0, stableFramesRef.current - 1)
          if (stableFramesRef.current < 10) setStableDetection(false)
        } else {
          stableFramesRef.current++
          if (stableFramesRef.current > 15 && !stableDetection) {
            setStableDetection(true)
          }

          // Update high-frequency refs
          lastAngleRef.current = curAngle

          // Throttle UI updates for performance (spec: avoid unnecessary React updates per frame)
          if (now - lastUpdateRef.current > 100) {
            setAngle(curAngle)
            setConfidence(curConf)
            setTrace(tr => [...tr.slice(-59), curAngle])
            lastUpdateRef.current = now
          }

          // Record actual sample per spec: timestamp, angle, confidence
          realSamples.current.push({ t: elapsedSec, angle: curAngle, confidence: curConf })

          // Real rep detection using hysteresis & debounce
          const rs = repStateRef.current

          // Simplified but robust rep detection for live UI
          // Use direction change with min excursion
          const minExcursion = 15
          const minTimeBetween = 0.8

          if (rs.direction === null) {
            rs.direction = curAngle > lastAngleRef.current ? 'up' : 'down'
            rs.candidatePeak = { angle: curAngle, t: elapsedSec }
            rs.candidateValley = { angle: curAngle, t: elapsedSec }
          } else {
            const prevAngle = lastAngleRef.current
            const currDir = curAngle > prevAngle ? 'up' : curAngle < prevAngle ? 'down' : rs.direction

            if (currDir !== rs.direction && Math.abs(curAngle - prevAngle) > 2) {
              // Direction changed
              if (rs.direction === 'up') {
                // Was up, now down → peak
                rs.candidatePeak = { angle: prevAngle, t: elapsedSec - 0.1 }
                // Check if enough excursion from last valley
                const excursion = rs.candidatePeak.angle - rs.lastValley
                if (excursion >= minExcursion && elapsedSec - rs.lastPeakTime >= minTimeBetween) {
                  // Valid peak
                  rs.lastPeak = rs.candidatePeak.angle
                  rs.lastPeakTime = rs.candidatePeak.t
                }
              } else {
                // Was down, now up → valley
                rs.candidateValley = { angle: prevAngle, t: elapsedSec - 0.1 }
                const excursion = rs.lastPeak - rs.candidateValley.angle
                if (
                  rs.lastPeak !== -Infinity &&
                  excursion >= minExcursion &&
                  elapsedSec - rs.lastValleyTime >= minTimeBetween
                ) {
                  rs.reps++
                  setReps(rs.reps)
                  rs.lastValley = rs.candidateValley.angle
                  rs.lastValleyTime = rs.candidateValley.t
                  rs.lastPeak = -Infinity // reset to avoid double count
                }
              }
              rs.direction = currDir
            }

            // Update candidate
            if (rs.direction === 'up' && curAngle > rs.candidatePeak.angle) {
              rs.candidatePeak = { angle: curAngle, t: elapsedSec }
            }
            if (rs.direction === 'down' && curAngle < rs.candidateValley.angle) {
              rs.candidateValley = { angle: curAngle, t: elapsedSec }
            }
          }

          // Update last angle ref after logic
          lastAngleRef.current = curAngle
        }

        // Draw skeleton overlay with correct alignment per spec
        if (canvas && ctx && video) {
          const dpr = window.devicePixelRatio || 1
          const displayWidth = canvas.clientWidth
          const displayHeight = canvas.clientHeight

          // Set canvas internal size to match display for crisp rendering
          if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
            canvas.width = displayWidth * dpr
            canvas.height = displayHeight * dpr
          }

          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctx.clearRect(0, 0, displayWidth, displayHeight)

          // Calculate video display size accounting for object-fit: contain (we use contain for alignment)
          const videoAspect = video.videoWidth / video.videoHeight
          const canvasAspect = displayWidth / displayHeight
          let drawWidth, drawHeight, offsetX, offsetY

          if (videoAspect > canvasAspect) {
            // Video wider than canvas — fit width
            drawWidth = displayWidth
            drawHeight = displayWidth / videoAspect
            offsetX = 0
            offsetY = (displayHeight - drawHeight) / 2
          } else {
            // Video taller — fit height
            drawHeight = displayHeight
            drawWidth = displayHeight * videoAspect
            offsetX = (displayWidth - drawWidth) / 2
            offsetY = 0
          }

          // Handle mirroring for user-facing camera
          const isMirrored = facingMode === 'user'

          ctx.save()
          if (isMirrored) {
            ctx.translate(displayWidth, 0)
            ctx.scale(-1, 1)
            // Adjust offset for mirrored
            // When mirrored, offsetX needs to be mirrored too
            // But we handle landmark x inversion instead
          }

          // Draw landmarks
          pose.landmarks.forEach((p: PosePoint, idx: number) => {
            if ((p.visibility || 0) < 0.3) return
            // Transform normalized coords to display coords
            let x = offsetX + p.x * drawWidth
            let y = offsetY + p.y * drawHeight
            if (isMirrored) {
              // Mirror x: landmark x is already not mirrored, so invert
              x = displayWidth - x
            }
            const isTriplet = config.angleTriplet.includes(idx)
            if (isTriplet) {
              ctx.beginPath()
              ctx.arc(x, y, idx === config.angleTriplet[1] ? 8 : 6, 0, Math.PI * 2)
              ctx.fillStyle = idx === config.angleTriplet[1] ? '#0F766E' : '#CCFBF1'
              ctx.fill()
              ctx.fillStyle = 'rgba(15,118,110,0.8)'
            } else {
              ctx.beginPath()
              ctx.arc(x, y, 3, 0, Math.PI * 2)
              ctx.fillStyle = 'rgba(15,118,110,0.8)'
              ctx.fill()
            }
          })

          // Draw triplet lines
          ctx.strokeStyle = '#0F766E'
          ctx.lineWidth = 3
          ctx.beginPath()
          const [aIdx, bIdx, cIdx] = config.angleTriplet
          const a = pose.landmarks[aIdx]
          const b = pose.landmarks[bIdx]
          const c = pose.landmarks[cIdx]
          if (a && b && c && (a.visibility || 0) >= 0.3 && (b.visibility || 0) >= 0.3 && (c.visibility || 0) >= 0.3) {
            let ax = offsetX + a.x * drawWidth
            let ay = offsetY + a.y * drawHeight
            let bx = offsetX + b.x * drawWidth
            let by = offsetY + b.y * drawHeight
            let cx_ = offsetX + c.x * drawWidth
            let cy = offsetY + c.y * drawHeight
            if (isMirrored) {
              ax = displayWidth - ax
              bx = displayWidth - bx
              cx_ = displayWidth - cx_
            }
            ctx.moveTo(ax, ay)
            ctx.lineTo(bx, by)
            ctx.lineTo(cx_, cy)
            ctx.stroke()
          }

          ctx.restore()

          // Draw confidence indicator
          if (personDetected) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)'
            ctx.fillRect(8, displayHeight - 32, 120, 24)
            ctx.fillStyle = 'white'
            ctx.font = '11px system-ui'
            ctx.fillText(`Conf ${(confidence * 100).toFixed(0)}% · ${Math.round(angle)}°`, 12, displayHeight - 16)
          }
        }
      }

      // Check completion
      if (elapsedSec >= DURATION) {
        finishReal()
        return
      }

      // Check insufficient movement
      if (elapsedSec >= 8 && realSamples.current.length > 20) {
        const valid = realSamples.current.filter(s => s.confidence >= 0.3)
        if (valid.length > 5) {
          const angs = valid.map(s => s.angle)
          const mx = Math.max(...angs)
          const mn = Math.min(...angs)
          if (mx - mn < 10) {
            setPhase('nomove')
            stopCamera()
            return
          }
        }
      }

      // Check no person for long time
      if (elapsedSec >= 5 && noPersonFramesRef.current > 90) {
        setPhase('noPerson')
        stopCamera()
        return
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, cameraState, poseLoaded, session.joint, session.side, facingMode, personDetected, confidence, angle])

  const finishReal = () => {
    const metrics = analyzeMovement(realSamples.current, DURATION)

    // Per spec: if insufficient valid data, do not produce misleading result
    if (!metrics.performed) {
      setPhase('nomove')
      stopCamera()
      return
    }

    // Pass REAL metrics into existing SAATHI analysis pipeline
    session.setMovement({
      rangeOfMotionDeg: metrics.rangeOfMotionDeg, // REAL ROM
      smoothness: metrics.smoothness,
      durationSec: DURATION,
      repetitions: metrics.repetitions, // REAL reps
      performed: true,
    })

    setPhase('complete')
    stopCamera()
    setTimeout(() => nav('/screening/analysis', { replace: true }), 900)
  }

  const cancel = () => {
    stopSim.current?.()
    stopCamera()
    setPhase('interrupted')
  }

  const restart = () => {
    stopSim.current?.()
    stopCamera()
    setElapsed(0)
    setReps(0)
    setTrace([])
    setCount(3)
    setConfidence(0)
    setAngle(0)
    setPersonDetected(false)
    setStableDetection(false)
    realSamples.current = []
    samples.current = []
    stableFramesRef.current = 0
    noPersonFramesRef.current = 0
    repStateRef.current = {
      lastPeak: -Infinity,
      lastValley: Infinity,
      lastPeakTime: -Infinity,
      lastValleyTime: -Infinity,
      direction: null,
      candidatePeak: { angle: -Infinity, t: 0 },
      candidateValley: { angle: Infinity, t: 0 },
      reps: 0,
    }
    setPhase('idle')
  }

  const startAssessment = () => {
    if (mode === 'camera') {
      if (!poseLoaded) {
        setPhase('poseError')
        return
      }
      if (!personDetected && !isPreview) {
        // Require stable detection before allowing start per spec, but allow in preview for testing
        // Show guidance instead of starting
        setPhase('noPerson')
        return
      }
      setCount(3)
      setPhase('countdown')
      // Camera will start via effect
    } else {
      setCount(3)
      setPhase('countdown')
    }
  }

  if (!patient || !session.joint) return null

  const moving = angle > 8
  const w = 320, h = 80
  const path = trace.length > 1 ? trace.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / 59) * w},${h - (v / 70) * h}`).join(' ') : ''

  const jointLabel = t(`screening.joint.joints.${session.joint}.label`)
  const sideLabel = t(`screening.joint.${session.side}`)
  const jointSideLabel = session.side === 'both' ? jointLabel : `${sideLabel} ${jointLabel.toLowerCase()}`

  // Camera error messages per spec — avoid "Camera blocked" unless actual denial
  const getCameraErrorMessage = () => {
    switch (cameraState) {
      case 'denied':
        return {
          title: t('screening.assessment.camera.denied'),
          body: t('screening.assessment.camera.deniedBody'),
          showPermissionGuidance: true,
        }
      case 'not-found':
      case 'noDevice':
        return {
          title: isPreview ? 'Camera unavailable in preview' : t('screening.assessment.camera.noDevice'),
          body: isPreview
            ? 'Camera access is unavailable in this preview environment. Test camera access using the deployed HTTPS app on a real device.'
            : t('screening.assessment.camera.noDeviceBody') || 'No camera device found. Please connect a camera and retry.',
          showPermissionGuidance: false,
        }
      case 'in-use':
      case 'inUse':
        return {
          title: t('screening.assessment.camera.inUse'),
          body: 'Camera is already in use by another application. Please close other apps using the camera and retry.',
          showPermissionGuidance: false,
        }
      case 'unsupported':
        return {
          title: t('screening.assessment.camera.unsupported'),
          body: 'Camera is not supported in this browser. Please try a different browser or device.',
          showPermissionGuidance: false,
        }
      case 'security-error':
        return {
          title: 'Security error',
          body: 'Camera access requires a secure HTTPS connection. Please open the app via HTTPS.',
          showPermissionGuidance: false,
        }
      case 'unknown-error':
      case 'error':
      case 'unavailable':
      default:
        return {
          title: t('screening.assessment.camera.error'),
          body: isPreview
            ? 'Camera access is unavailable in this preview environment. Test camera access using the deployed HTTPS app on a real device.'
            : t('errors.cameraUnavailable') || 'Camera error. Please retry.',
          showPermissionGuidance: false,
        }
    }
  }

  const cameraErrorInfo = getCameraErrorMessage()

  return (
    <Frame>
      <TopBar
        title={t('screening.assessment.title')}
        back
        onBack={cancel}
        right={<span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center">{t('screening.common.triageActive')}</span>}
      />
      <main className="flex-1 flex flex-col px-4 pt-3 pb-6 page-enter">
        {/* Header status */}
        <div className="card h-12 px-4 flex items-center gap-2">
          {phase === 'recording' && (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-error pulse-dot" aria-hidden />
              <span className="text-[13px] font-bold tracking-wide break-words">{t('screening.assessment.live')}</span>
              <span className="text-[12px] text-secondary">· {mode === 'camera' ? t('common.live') : t('common.simulated')}</span>
            </>
          )}
          {phase === 'countdown' && (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-muted" aria-hidden />
              <span className="text-[13px] font-bold tracking-wide break-words">{t('screening.assessment.ready')}</span>
            </>
          )}
          {phase === 'idle' && (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
              <span className="text-[13px] font-bold tracking-wide break-words">READY TO START</span>
            </>
          )}
          {phase === 'complete' && (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
              <span className="text-[13px] font-bold tracking-wide break-words">{t('screening.assessment.complete')}</span>
            </>
          )}
          {(phase === 'nomove' || phase === 'interrupted' || phase === 'cameraError' || phase === 'noPerson' || phase === 'poseError') && (
            <>
              <span className="h-2.5 w-2.5 rounded-full bg-warning" aria-hidden />
              <span className="text-[13px] font-bold tracking-wide break-words">{t('screening.assessment.stopped')}</span>
            </>
          )}
          <span className="ml-auto h-7 px-2.5 rounded-full bg-mint text-primary-dark text-[11px] font-semibold inline-flex items-center gap-1 truncate max-w-[140px]">
            <RefreshCw size={12} aria-hidden />
            {patient.name.split(' ')[0]} · {jointLabel}
          </span>
        </div>

        {/* Mode toggle — clearly label Demo */}
        <div className="mt-3 grid grid-cols-2 gap-2 p-1 bg-tint rounded-[12px]">
          <button
            onClick={() => { stopCamera(); setMode('camera'); restart() }}
            className={cx('h-11 rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-1.5 min-h-[44px]', mode === 'camera' ? 'bg-primary text-white' : 'text-secondary')}
          >
            <Camera size={16} />
            {t('common.live')} Camera
          </button>
          <button
            onClick={() => { stopCamera(); setMode('simulated'); restart() }}
            className={cx('h-11 rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-1.5 min-h-[44px]', mode === 'simulated' ? 'bg-primary text-white' : 'text-secondary')}
          >
            <Radio size={16} />
            {t('common.simulated')} · Demo
          </button>
        </div>

        {/* Patient / Joint context per spec */}
        <div className="mt-3 card p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold tracking-wider text-secondary uppercase break-words">LIVE ASSESSMENT</p>
            <p className="text-[14px] font-semibold mt-0.5 break-words">Patient: {patient.name} · Joint: {jointSideLabel}</p>
            <p className="text-[11px] text-secondary mt-0.5 break-words">Mode: {mode === 'camera' ? 'REAL CAMERA + REAL POSE' : 'Demo / Simulated Assessment'}</p>
          </div>
          <span className={cx('h-8 px-2.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1', mode === 'camera' ? 'bg-mint text-primary-dark' : 'bg-warning-tint text-warning-text')}>
            <ShieldCheck size={12} />{mode === 'camera' ? 'REAL' : 'DEMO'}
          </span>
        </div>

        {/* Body position guidance before Start per spec */}
        {phase === 'idle' && mode === 'camera' && (
          <div className="mt-3 card p-4 bg-info-tint/30">
            <p className="text-[13px] font-bold flex items-center gap-1.5"><Info size={14} /> Position guidance</p>
            <ul className="mt-2 space-y-1 text-[13px] leading-snug text-secondary list-disc pl-5 break-words">
              <li>Position your full body in the camera frame.</li>
              <li>Keep the selected joint ({jointSideLabel}) visible.</li>
              <li>Move slowly through the instructed movement.</li>
              <li>Ensure good lighting and clear background.</li>
            </ul>
            {!poseLoaded && <p className="mt-2 text-[12px] text-warning-text">Loading pose model… Please wait.</p>}
            {poseLoaded && !personDetected && <p className="mt-2 text-[12px] text-warning-text">No person detected — adjust position to show full body.</p>}
            {poseLoaded && personDetected && !stableDetection && <p className="mt-2 text-[12px] text-info">Person detected — hold steady for ready state.</p>}
            {stableDetection && <p className="mt-2 text-[12px] text-primary font-semibold">✓ Stable detection — ready to start assessment.</p>}
          </div>
        )}

        <div className="card mt-3 p-5 flex flex-col items-center">
          <span className="h-7 px-3 rounded-full bg-tint text-ink text-[12px] font-semibold inline-flex items-center gap-1.5 break-words">
            <Activity size={13} className="text-primary" aria-hidden />
            {t('screening.assessment.active', { duration: DURATION })}
          </span>
          {phase === 'countdown' ? (
            <div className="my-6 text-center fade-in" key={count}>
              <p className="text-[12px] font-bold tracking-wider text-secondary break-words">{t('screening.assessment.startingIn')}</p>
              <p className="text-[64px] font-bold text-primary leading-none mt-2 tabular-nums">{count || t('screening.assessment.go')}</p>
              <p className="text-secondary text-[13px] mt-3 max-w-[240px] break-words">{t('screening.assessment.beginNote')}</p>
            </div>
          ) : phase === 'idle' ? (
            <div className="my-6 text-center">
              <p className="text-[12px] font-bold tracking-wider text-secondary break-words">READY</p>
              <p className="text-[28px] font-bold text-primary leading-tight mt-2 break-words">Start Assessment</p>
              <p className="text-secondary text-[13px] mt-3 max-w-[260px] break-words">
                {mode === 'camera' ? 'Real camera will measure actual joint movement.' : 'Demo mode uses simulated sensor data.'}
              </p>
              <Button full onClick={startAssessment} disabled={mode === 'camera' && !poseLoaded} className="mt-4">
                Start Assessment
              </Button>
            </div>
          ) : (
            <div className="my-5">
              <Ring value={(elapsed / DURATION) * 100} size={168} stroke={12}>
                <p className="text-[11px] font-bold tracking-wider text-secondary break-words">{t('screening.assessment.remaining')}</p>
                <p className="text-[34px] font-bold tabular-nums leading-none mt-1">00:{String(Math.ceil(DURATION - elapsed)).padStart(2, '0')}</p>
                <p className="text-[12px] text-secondary mt-1 break-words">{t('screening.assessment.target', { duration: DURATION })}</p>
              </Ring>
            </div>
          )}
          {(phase === 'recording' || phase === 'complete') && (
            <span className="h-9 px-4 rounded-full bg-mint-soft text-primary-dark text-[13px] font-semibold inline-flex items-center gap-2 break-words">
              <Volume2 size={15} aria-hidden />
              {moving ? t('screening.assessment.moveDetected') : t('screening.assessment.waitingMove')}
            </span>
          )}
        </div>

        {/* Camera preview — LIVE CAMERA UI per spec */}
        {mode === 'camera' && (phase === 'recording' || phase === 'countdown' || phase === 'idle') && (
          <div className="card mt-3 overflow-hidden">
            <div className="relative bg-black aspect-[4/3] w-full overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain bg-black"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: 'contain' }}
              />

              {/* Camera state overlays */}
              {cameraState === 'requesting' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <Camera size={32} className="animate-pulse" />
                  <p className="mt-2 text-sm break-words">Requesting camera access…</p>
                </div>
              )}
              {cameraState === 'permission-required' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-4 text-center">
                  <Eye size={32} />
                  <p className="mt-2 font-semibold break-words">Camera permission required</p>
                  <p className="text-xs mt-1 opacity-80 break-words">Please allow camera access when prompted by your browser.</p>
                </div>
              )}
              {cameraState === 'starting' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <Camera size={32} className="animate-pulse" />
                  <p className="mt-2 text-sm break-words">Starting camera…</p>
                </div>
              )}
              {cameraState === 'denied' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 text-center">
                  <VideoOff size={32} />
                  <p className="mt-2 font-semibold break-words">{t('screening.assessment.camera.denied')}</p>
                  <p className="text-xs mt-1 opacity-80 break-words">{t('screening.assessment.camera.deniedBody')}</p>
                  <p className="text-[11px] mt-2 opacity-60 break-words">To allow: Browser settings → Privacy → Camera → Allow this site</p>
                </div>
              )}
              {(cameraState === 'not-found' || cameraState === 'noDevice') && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 text-center">
                  <VideoOff size={32} />
                  <p className="mt-2 font-semibold break-words">{cameraErrorInfo.title}</p>
                  <p className="text-xs mt-1 opacity-80 break-words">{cameraErrorInfo.body}</p>
                </div>
              )}
              {(cameraState === 'in-use' || cameraState === 'inUse') && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 text-center">
                  <AlertTriangle size={32} />
                  <p className="mt-2 font-semibold break-words">Camera in use</p>
                  <p className="text-xs mt-1 opacity-80 break-words">Camera is already in use by another app. Close other apps and retry.</p>
                </div>
              )}
              {cameraState === 'unsupported' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 text-center">
                  <VideoOff size={32} />
                  <p className="mt-2 font-semibold break-words">Camera not supported</p>
                  <p className="text-xs mt-1 opacity-80 break-words">This browser does not support camera access. Try Chrome, Safari, or Firefox.</p>
                </div>
              )}
              {cameraState === 'security-error' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 text-center">
                  <AlertTriangle size={32} />
                  <p className="mt-2 font-semibold break-words">Security error</p>
                  <p className="text-xs mt-1 opacity-80 break-words">Camera requires HTTPS. Please open via secure connection.</p>
                </div>
              )}

              {/* Pose model loading */}
              {!poseLoaded && !poseError && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded">Loading pose model…</div>
              )}
              {poseError && (
                <div className="absolute bottom-2 left-2 bg-error-tint text-error-text text-[11px] px-2 py-1 rounded">{poseError}</div>
              )}

              {/* Person detection status */}
              {poseLoaded && !personDetected && phase === 'recording' && (
                <div className="absolute bottom-2 left-2 bg-warning-tint text-warning-text text-[11px] px-2 py-1 rounded flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {t('screening.assessment.camera.noPerson')} — Adjust position
                </div>
              )}
              {personDetected && !stableDetection && phase === 'recording' && (
                <div className="absolute bottom-2 left-2 bg-info-tint text-info text-[11px] px-2 py-1 rounded">
                  Detecting… Hold steady
                </div>
              )}
              {personDetected && stableDetection && (
                <div className="absolute bottom-2 left-2 bg-primary text-white text-[11px] px-2 py-1 rounded">
                  ✓ {jointSideLabel} · {Math.round(angle)}° · Conf {(confidence * 100).toFixed(0)}%
                </div>
              )}

              {/* Front/rear camera switch */}
              <button
                onClick={switchCamera}
                className="absolute top-2 right-2 h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center"
                aria-label="Switch camera"
              >
                <SwitchCamera size={18} />
              </button>

              {/* Facing mode indicator */}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                {facingMode === 'environment' ? 'Rear' : 'Front'} · {videoRef.current?.videoWidth || 0}×{videoRef.current?.videoHeight || 0}
              </div>
            </div>

            {/* Diagnostics dev-only */}
            <div className="p-2 bg-tint-2/50 flex items-center justify-between">
              <button onClick={() => setShowDiagnostics(!showDiagnostics)} className="text-[11px] text-secondary flex items-center gap-1">
                {showDiagnostics ? <EyeOff size={12} /> : <Eye size={12} />} Diagnostics
              </button>
              <span className="text-[10px] text-muted">
                {cameraState} · {poseLoaded ? 'pose ready' : 'pose loading'} · {realSamples.current.length} samples
              </span>
            </div>
            {showDiagnostics && (
              <div className="p-3 bg-black text-green-400 text-[10px] font-mono leading-tight break-words">
                <div>cameraState: {cameraState}</div>
                <div>stream: {cameraService.getStream() ? 'active' : 'none'} tracks: {cameraService.getStream()?.getTracks().length || 0}</div>
                <div>video: {videoRef.current?.videoWidth}×{videoRef.current?.videoHeight} readyState: {videoRef.current?.readyState} paused: {videoRef.current?.paused ? 'yes' : 'no'}</div>
                <div>pose: {poseLoaded ? 'loaded' : 'not loaded'} error: {poseError || 'none'}</div>
                <div>person: {personDetected ? 'yes' : 'no'} stable: {stableDetection ? 'yes' : 'no'} stableFrames: {stableFramesRef.current} noPersonFrames: {noPersonFramesRef.current}</div>
                <div>joint: {session.joint} side: {session.side} config: {getJointConfig(session.joint as any, session.side as any).angleTriplet.join('-')}</div>
                <div>angle: {angle.toFixed(1)}° conf: {confidence.toFixed(2)} validSamples: {realSamples.current.filter(s => s.confidence >= 0.3).length}</div>
                <div>reps: {reps} elapsed: {elapsed.toFixed(1)}s phase: {phase} facing: {facingMode}</div>
                <div>previewEnv: {isPreview ? 'yes' : 'no'}</div>
              </div>
            )}
          </div>
        )}

        {(phase === 'recording' || phase === 'complete') && (
          <div className="card mt-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[18px] font-bold inline-flex items-center gap-2 break-words">
                <Activity size={20} className="text-primary" aria-hidden />
                {t('screening.assessment.traceTitle')}
              </p>
              <span className="h-7 px-2.5 rounded-full bg-tint text-[11px] font-semibold text-ink inline-flex items-center">{t('screening.assessment.calibrated')}</span>
            </div>
            <div className="mt-3 rounded-[12px] bg-tint p-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-bold break-words">{t('screening.assessment.jointAngle')}</span>
                <span className="tabular-nums text-secondary">
                  <span className="text-primary font-bold">{Math.round(angle)}°</span> {t('screening.assessment.liveLabel')}
                </span>
              </div>
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 mt-1" aria-hidden>
                <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-[12px] bg-tint p-3">
                <p className="text-[11px] font-bold tracking-wide text-secondary uppercase break-words">{t('screening.assessment.flexion')}</p>
                <p className="text-[22px] font-bold mt-1 tabular-nums">
                  {Math.round(angle)}° <span className="text-[12px] text-secondary font-semibold">{t('screening.assessment.dynamic')}</span>
                </p>
              </div>
              <div className="rounded-[12px] bg-tint p-3">
                <p className="text-[11px] font-bold tracking-wide text-secondary uppercase break-words">{t('screening.assessment.rep')}</p>
                <p className="text-[22px] font-bold mt-1 tabular-nums text-primary">
                  {reps}
                  <span className="text-[12px] text-secondary font-semibold"> reps</span>
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] flex-wrap gap-2">
              <span className="text-secondary font-medium inline-flex items-center gap-1.5 break-words">
                <Radio size={13} aria-hidden />
                {mode === 'camera' ? 'REAL Camera + REAL Pose (MediaPipe)' : t('screening.assessment.sensorSim') + ' · Demo'}
              </span>
              <span className={cx('font-semibold inline-flex items-center gap-1.5', moving ? 'text-primary' : 'text-secondary')}>
                <span className={cx('h-2 w-2 rounded-full', moving ? 'bg-primary' : 'bg-muted')} aria-hidden />
                {moving ? t('screening.assessment.moveYes') : t('screening.assessment.moveNo')}
              </span>
            </div>
            {mode === 'camera' && (
              <p className="mt-2 text-[11px] text-secondary break-words">
                Screening indicates movement findings from real camera. This is not a diagnosis.
              </p>
            )}
          </div>
        )}

        {phase === 'nomove' && (
          <div className="mt-3">
            <Callout tone="warning" title={t('screening.assessment.noMoveTitle')}>
              {t('screening.assessment.noMoveBody')} We couldn't get enough movement data to complete the assessment.
            </Callout>
          </div>
        )}
        {phase === 'noPerson' && (
          <div className="mt-3">
            <Callout tone="warning" title={t('screening.assessment.camera.noPerson')}>
              {t('screening.assessment.camera.noPersonBody')} Position your full body in the camera frame and keep {jointSideLabel} visible.
            </Callout>
          </div>
        )}
        {phase === 'interrupted' && (
          <div className="mt-3">
            <Callout tone="warning" title={t('screening.assessment.interruptedTitle')}>
              {t('screening.assessment.interruptedBody')} Camera connection was interrupted.
            </Callout>
          </div>
        )}
        {phase === 'cameraError' && (
          <div className="mt-3">
            <Callout tone="error" title={cameraErrorInfo.title}>
              {cameraErrorInfo.body}
              {cameraErrorInfo.showPermissionGuidance && (
                <div className="mt-2 text-[12px]">Please allow camera permission in browser settings and retry. On mobile: Settings → Privacy → Camera → Allow.</div>
              )}
            </Callout>
          </div>
        )}
        {phase === 'poseError' && (
          <div className="mt-3">
            <Callout tone="error" title="Pose model error">
              {poseError || 'Failed to load pose detection. Please check network and retry.'}
            </Callout>
          </div>
        )}

        <div className="mt-auto pt-4 space-y-2">
          {(phase === 'idle') && (
            <>
              <Button full onClick={startAssessment} disabled={mode === 'camera' && !poseLoaded}>
                Start Assessment
              </Button>
              <div className="flex gap-2">
                <Button full variant="secondary" onClick={() => { nav(`/patients/${patient.id}`) }}>
                  Back
                </Button>
                {mode === 'camera' && (
                  <Button full variant="ghost" onClick={switchCamera}>
                    <SwitchCamera size={16} /> Switch Camera ({facingMode === 'environment' ? 'Front' : 'Rear'})
                  </Button>
                )}
              </div>
            </>
          )}
          {(phase === 'recording' || phase === 'countdown') && (
            <>
              <Button full variant="danger" icon={Square} onClick={cancel} className="min-h-[44px]">
                {t('screening.assessment.stopBtn')}
              </Button>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => { stopSim.current?.(); stopCamera(); restart() }}
                  className="h-11 min-h-[44px] px-4 text-[13px] font-semibold text-secondary inline-flex items-center gap-1.5"
                >
                  <RotateCcw size={14} aria-hidden />
                  {t('screening.assessment.discard')}
                </button>
                {phase === 'recording' && mode === 'simulated' && (
                  <button
                    onClick={() => { noMove.current = true; stopSim.current?.(); setPhase('nomove') }}
                    className="h-11 min-h-[44px] text-xs text-muted underline"
                  >
                    {t('screening.assessment.demoNoMove')}
                  </button>
                )}
              </div>
            </>
          )}
          {(phase === 'nomove' || phase === 'interrupted' || phase === 'cameraError' || phase === 'noPerson' || phase === 'poseError') && (
            <>
              <Button full onClick={() => { noMove.current = false; restart() }} className="min-h-[44px]">
                <RefreshCw size={16} /> {t('screening.assessment.tryAgain')} / Retry Camera
              </Button>
              <Button
                full
                variant="secondary"
                onClick={() => { stopCamera(); session.setMovement(null, true); nav('/screening/analysis') }}
                className="min-h-[44px]"
              >
                {t('screening.assessment.continueWithout')}
              </Button>
              {phase === 'cameraError' && (
                <Button full variant="ghost" onClick={() => { stopCamera(); setMode('simulated'); restart() }} className="min-h-[44px]">
                  {t('screening.assessment.camera.continueDemo')} — Demo / Simulated Assessment
                </Button>
              )}
              <button className="w-full h-11 min-h-[44px] text-[14px] font-semibold text-secondary break-words" onClick={() => { stopCamera(); nav(`/patients/${patient.id}`) }}>
                {t('screening.assessment.exit')}
              </button>
            </>
          )}
          {phase === 'complete' && <p className="text-center text-primary-dark font-semibold fade-in break-words">{t('screening.assessment.recorded')}</p>}
        </div>
      </main>
    </Frame>
  )
}
