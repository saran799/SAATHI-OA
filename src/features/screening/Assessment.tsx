import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, CheckCircle, VideoOff } from 'lucide-react'
import { Frame, TopBar } from '../../components/layout/Shells'
import { Button, cx } from '../../components/ui'
import { useScreeningPatient } from './useGuard'
import { useT } from '../../i18n'
import { cameraService, type CameraState, type FacingMode } from '../../services/camera'
import { type TimestampedSample } from '../../services/movement'
import { useVoiceController } from '../../services/voiceController'
import { TEST_PROTOCOLS } from './testProtocols'
import type { TestResult } from '../../domain/types'

const ACTIVE_TESTS = TEST_PROTOCOLS.filter(t => t.implemented)

type PoseModule = typeof import('../../services/pose')

type TrackingStateType = 
  | 'Waiting...'
  | 'Tracking patient'
  | 'No person detected. Move into the camera frame.'
  | 'Move back so your full body is visible.'
  | 'Both knees must be visible. Adjust your position.'
  | 'Please make sure your feet are visible.'
  | 'The camera cannot clearly track your movement. Improve lighting and keep your body visible.'
  | 'Keep the phone steady.'

const RENDER_LANDMARKS = new Set([
  0, // nose/head
  11, 12, // shoulders
  13, 14, // elbows
  15, 16, 17, 18, 19, 20, 21, 22, // wrists and hands
  23, 24, // hips
  25, 26, // knees
  27, 28, // ankles
  29, 30, 31, 32 // feet
])

const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], // face
  [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], // left arm/shoulder
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], // right arm/shoulder
  [11, 23], [12, 24], [23, 24], // trunk
  [23, 25], [25, 27], [27, 29], [29, 31], [31, 27], // left leg
  [24, 26], [26, 28], [28, 30], [30, 32], [32, 28]  // right leg
]
const KNEE_CHAIN_LEFT = [[23, 25], [25, 27]]
const KNEE_CHAIN_RIGHT = [[24, 26], [26, 28]]
const KNEE_POINTS = new Set([23, 25, 27, 24, 26, 28])




type AssessmentPhase = 
  | 'setup'       // Camera turning on, waiting for patient
  | 'ready'       // Patient detected, ready for worker to tap START
  | 'intro'       // Temporarily showing "TEST X"
  | 'instruction' // Playing voice instruction
  | 'recording'   // MediaPipe loop actively collecting valid samples
  | 'validating'  // Checking if collected samples meet test completion criteria
  | 'test_result' // Displaying test result to worker
  | 'camera_error'
  | 'pose_error'

export default function Assessment() {
  const nav = useNavigate()
  const { session } = useScreeningPatient(true)
  const { t } = useT()


  // Multi-test workflow state
  const [currentTestIndex, setCurrentTestIndex] = useState(0)
  const currentTest = ACTIVE_TESTS[currentTestIndex]
  const [phase, setPhase] = useState<AssessmentPhase>('setup')
  
  // Voice & camera services
  const voice = useVoiceController('en')
  const [cameraState, setCameraState] = useState<CameraState>('idle')
  const [facingMode] = useState<FacingMode>('environment')
  const [poseLoaded, setPoseLoaded] = useState(false)
  const [personDetected, setPersonDetected] = useState(false)
  
  const [trackingState, setTrackingState] = useState<TrackingStateType>('Waiting...')

  // Measurement state
  const [elapsed, setElapsed] = useState(0)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  // Refs for tracking loop execution without re-renders
  const poseModuleRef = useRef<PoseModule | null>(null)
  
  // Temporal Stabilization queue
  const smoothedLandmarksRef = useRef<any[] | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const realSamples = useRef<TimestampedSample[]>([])
  const startTimeRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)
  const lastPoseTimeRef = useRef<number>(-1)
  const errorActiveSinceRef = useRef<number>(0)
  const lastErrorSpokenRef = useRef<string>('')

  const stopCamera = useCallback(async () => {
    try { await cameraService.stop() } catch {}
    setCameraState('idle')
  }, [])

  const startCamera = useCallback(async (facing: FacingMode) => {
    setCameraState('starting')
    try {
      if (videoRef.current) {
        const stream = await cameraService.request(setCameraState, videoRef.current, { facingMode: facing })
        setCameraState(stream ? 'running' : 'error')
      }
    } catch (e) {
      console.error(e)
      setCameraState('error')
      setPhase('camera_error')
    }
  }, [])

  // 1. Initial mounting: Start camera and load pose module
  useEffect(() => {
    startCamera(facingMode)
    let mounted = true
    if (!poseModuleRef.current) {
      import('../../services/pose').then(mod => {
        if (!mounted) return
        poseModuleRef.current = mod
        mod.loadPoseModel().then(success => {
          if (mounted) {
            setPoseLoaded(!!success)
            if (!success) setPhase('pose_error')
          }
        })
      }).catch(() => {
        if (mounted) setPhase('pose_error')
      })
    }
    return () => {
      mounted = false
      stopCamera()
    }
  }, [facingMode, startCamera, stopCamera])

  // 2. Main Pose Inference Loop
  useEffect(() => {
    if (phase === 'camera_error' || phase === 'pose_error') return
    if (cameraState !== 'running' && cameraState !== 'ready') return
    if (!videoRef.current || !poseLoaded || !poseModuleRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const poseMod = poseModuleRef.current

    const loop = () => {
      if (phase === 'test_result') return

      const now = Date.now()
      const elapsedSec = (now - startTimeRef.current) / 1000

      if (phase === 'recording') {
        if (now - lastUpdateRef.current > 100) {
          setElapsed(elapsedSec)
          lastUpdateRef.current = now
        }
        
        if (currentTest) {
          const isComplete = currentTest.completionCriteria(realSamples.current)
          if (isComplete || elapsedSec >= currentTest.timeoutSec) {
            setPhase('validating')
            return
          }
        }
      }

      if (!video || video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      let poseNow = performance.now()
      if (poseNow <= lastPoseTimeRef.current) {
        poseNow = lastPoseTimeRef.current + 1
      }
      lastPoseTimeRef.current = poseNow

      try {
        const poseOut = poseMod.detectPose(video, poseNow)
        const res = poseOut.result
        const hasPerson = !!(res?.landmarks && res.landmarks.length > 0)
        
        let currentTrackingState: TrackingStateType = 'No person detected. Move into the camera frame.'

        if (hasPerson) {
          const rawLms = res.landmarks
          const alpha = 0.4
          let smoothedLms = rawLms

          if (!smoothedLandmarksRef.current || smoothedLandmarksRef.current.length !== rawLms.length) {
            smoothedLandmarksRef.current = [...rawLms]
          } else {
            const smoothed = smoothedLandmarksRef.current
            for (let i = 0; i < rawLms.length; i++) {
              const raw = rawLms[i]
              const prev = smoothed[i]
              if (!prev || (raw.visibility || 0) < 0.1 || (prev.visibility || 0) < 0.1) {
                smoothed[i] = { ...raw }
                continue
              }
              const dx = raw.x - prev.x
              const dy = raw.y - prev.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist > 0.15) {
                smoothed[i] = { ...raw }
              } else {
                smoothed[i] = {
                  ...raw,
                  x: prev.x + alpha * dx,
                  y: prev.y + alpha * dy,
                  z: prev.z !== undefined && raw.z !== undefined ? prev.z + alpha * (raw.z - prev.z) : raw.z
                }
              }
            }
            smoothedLms = smoothed
          }

          const lHip = smoothedLms[23]
          const rHip = smoothedLms[24]
          const lKnee = smoothedLms[25]
          const rKnee = smoothedLms[26]
          const lAnkle = smoothedLms[27]
          const rAnkle = smoothedLms[28]
          
          const hipVisible = (lHip?.visibility || 0) > 0.3 && (rHip?.visibility || 0) > 0.3
          const kneeVisible = (lKnee?.visibility || 0) > 0.3 && (rKnee?.visibility || 0) > 0.3
          const ankleVisible = (lAnkle?.visibility || 0) > 0.3 && (rAnkle?.visibility || 0) > 0.3
          
          let cameraMoving = false
          // Check for significant movement across frames using the ankle (more stable than head for standing tests)
          if (rawLms[27] && smoothedLandmarksRef.current[27]) {
             const dx = rawLms[27].x - smoothedLandmarksRef.current[27].x
             const dy = rawLms[27].y - smoothedLandmarksRef.current[27].y
             if (Math.sqrt(dx*dx + dy*dy) > 0.08) cameraMoving = true
          }

          if (!hipVisible) {
             currentTrackingState = 'Move back so your full body is visible.'
          } else if (!kneeVisible) {
             currentTrackingState = 'Both knees must be visible. Adjust your position.'
          } else if (!ankleVisible) {
             currentTrackingState = 'Please make sure your feet are visible.'
          } else if (cameraMoving) {
             currentTrackingState = 'Keep the phone steady.'
          } else {
             currentTrackingState = 'Tracking patient'
          }

          if (phase === 'recording') {
            realSamples.current.push({
              t: now,
              angle: 0,
              confidence: 1,
              valid: true,
              landmarks: smoothedLms
            })
          }
          
          // Render tracking points on canvas
          if (ctx && canvas && video) {
            const dpr = window.devicePixelRatio || 1
            const displayWidth = canvas.clientWidth
            const displayHeight = canvas.clientHeight

            if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
              canvas.width = displayWidth * dpr
              canvas.height = displayHeight * dpr
            }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, displayWidth, displayHeight)

            // Correct coordinate transformation for object-fit: cover
            // The video is scaled to cover the container while preserving aspect ratio.
            const scale = Math.max(displayWidth / video.videoWidth, displayHeight / video.videoHeight)
            const drawWidth = video.videoWidth * scale
            const drawHeight = video.videoHeight * scale
            const offsetX = (displayWidth - drawWidth) / 2
            const offsetY = (displayHeight - drawHeight) / 2

            // Note: We DO NOT perform mirroring in JavaScript.
            // The canvas element shares the exact same CSS `scale-x-[-1]` transform as the video,
            // so any pixels drawn here will be automatically mirrored by the browser rendering engine,
            // keeping them perfectly aligned with the raw video frames fed to MediaPipe.

            // Draw subtle whole-body skeleton
            ctx.lineWidth = 1
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
            POSE_CONNECTIONS.forEach(([i, j]) => {
                const p1 = smoothedLms[i]
                const p2 = smoothedLms[j]
                if (p1 && p2 && (p1.visibility || 0) > 0.3 && (p2.visibility || 0) > 0.3) {
                    ctx.beginPath()
                    ctx.moveTo(offsetX + p1.x * drawWidth, offsetY + p1.y * drawHeight)
                    ctx.lineTo(offsetX + p2.x * drawWidth, offsetY + p2.y * drawHeight)
                    ctx.stroke()
                }
            })

            // Draw highlighted knee chains
            ctx.lineWidth = 3
            ctx.strokeStyle = '#0F766E'
            ;[...KNEE_CHAIN_LEFT, ...KNEE_CHAIN_RIGHT].forEach(([i, j]) => {
                const p1 = smoothedLms[i]
                const p2 = smoothedLms[j]
                if (p1 && p2 && (p1.visibility || 0) > 0.3 && (p2.visibility || 0) > 0.3) {
                    ctx.beginPath()
                    ctx.moveTo(offsetX + p1.x * drawWidth, offsetY + p1.y * drawHeight)
                    ctx.lineTo(offsetX + p2.x * drawWidth, offsetY + p2.y * drawHeight)
                    ctx.stroke()
                }
            })

            smoothedLms.forEach((p: any, idx: number) => {
              if (!RENDER_LANDMARKS.has(idx)) return
              if ((p.visibility || 0) < 0.3) return
              if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return

              const x = offsetX + p.x * drawWidth
              const y = offsetY + p.y * drawHeight
              
              const isKneeChain = KNEE_POINTS.has(idx)
              
              ctx.beginPath()
              if (isKneeChain) {
                ctx.arc(x, y, 4, 0, 2 * Math.PI)
                ctx.fillStyle = '#CCFBF1' // mint-100
                ctx.lineWidth = 2
                ctx.strokeStyle = '#0F766E' // teal-700
              } else {
                ctx.arc(x, y, 2, 0, 2 * Math.PI)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
                ctx.lineWidth = 1
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
              }
              
              ctx.fill()
              ctx.stroke()
            })
          }
        } else {
          smoothedLandmarksRef.current = null
          if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        }

        // Update UI throttled
        if (now - lastUpdateRef.current > 500) {
          setPersonDetected(hasPerson)
          setTrackingState(currentTrackingState)
          lastUpdateRef.current = now
        }
      } catch (e) {
        console.error('Inference error', e)
      }
      
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase, cameraState, poseLoaded, session.joint, session.side, currentTest])

  // 3. State Machine Orchestration
  useEffect(() => {
    const errorStates = [
      'No person detected. Move into the camera frame.',
      'Move back so your full body is visible.',
      'Both knees must be visible. Adjust your position.',
      'Please make sure your feet are visible.',
      'The camera cannot clearly track your movement. Improve lighting and keep your body visible.',
      'Keep the phone steady.'
    ]
    
    if (errorStates.includes(trackingState)) {
       if (errorActiveSinceRef.current === 0) {
           errorActiveSinceRef.current = Date.now()
       } else if (Date.now() - errorActiveSinceRef.current > 3000) {
           if (lastErrorSpokenRef.current !== trackingState) {
               voice.speak(trackingState)
               lastErrorSpokenRef.current = trackingState
           }
       }
    } else {
       errorActiveSinceRef.current = 0
       lastErrorSpokenRef.current = ''
    }
  }, [trackingState, voice])

  useEffect(() => {
    // Setup -> Ready
    if (phase === 'setup' && personDetected) {
      voice.speak("Patient detected. The patient is ready. Please tap Start Assessment.")
      setPhase('ready')
    }

    // Ready -> Setup (if patient leaves before starting)
    if (phase === 'ready' && !personDetected) {
      setPhase('setup')
    }

    // Validation -> Result
    if (phase === 'validating') {
      if (!currentTest) return
      const isComplete = currentTest.completionCriteria(realSamples.current)
      const metrics = currentTest.extractMetrics ? currentTest.extractMetrics(realSamples.current) : {}

      const result: TestResult = {
        testId: currentTest.id,
        status: isComplete ? 'VALID' : 'INSUFFICIENT',
        completed: isComplete,
        quality: isComplete ? 'Good' : 'Low',
        measurements: metrics,
        observations: [],
        technicalDetails: {
          samplesCount: realSamples.current.length,
          validSamples: realSamples.current.filter(s => s.valid).length
        },
        timestamp: Date.now()
      }

      setTestResult(result)
      session.setTestResult(result)
      setPhase('test_result')

      if (isComplete) {
        voice.speak(`Test ${currentTestIndex + 1} completed.`)
      } else {
        voice.speak("Assessment could not be completed. Please try again.")
      }
    }
  }, [phase, personDetected, currentTestIndex, currentTest, voice, session])

  // Actions
  const handleStartRecording = () => {
    if (phase !== 'ready') return
    setPhase('intro')
    // Show intro overlay for 2 seconds, then switch to instruction
    setTimeout(() => {
      setPhase('instruction')
      if (currentTest) {
        voice.speak(currentTest.voiceInstruction)
      }
    }, 2000)
  }

  // When instruction finishes, automatically transition to recording
  useEffect(() => {
    if (phase === 'instruction' && !voice.isSpeaking) {
      startTimeRef.current = Date.now()
      realSamples.current = []
      setPhase('recording')
    }
  }, [phase, voice.isSpeaking])

  const handleRetry = () => {
    setPhase('setup')
    setTestResult(null)
  }

  const handleNextTest = () => {
    const nextIndex = currentTestIndex + 1
    if (nextIndex < ACTIVE_TESTS.length) {
      // Advance to next test
      setCurrentTestIndex(nextIndex)
      setPhase('setup')
      setTestResult(null)
    } else {
      // All tests complete -> Go to Analysis to generate risk and record
      nav('/screening/analysis')
    }
  }

  // View UI blocks
  const renderHeader = () => (
    <>
      <TopBar 
        title={currentTest?.title || 'Assessment'} 
        onBack={() => nav(-1)}
        right={
          <span className="h-8 px-3 rounded-full bg-mint text-primary-dark text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-sm">
            <CheckCircle size={14} />{t('screening.common.triageActive')}
          </span>
        }
      />
      <div className="px-4 py-3 flex items-center justify-between bg-surface border-b border-border/50">
        <h2 className="font-semibold text-primary">{currentTest?.title}</h2>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-medium text-secondary">
            TEST {currentTestIndex + 1} OF {ACTIVE_TESTS.length}
          </span>
          <span className={cx(
            "text-[10px] font-bold tracking-wider uppercase mt-0.5",
            trackingState === 'Tracking patient' ? "text-mint-dark" : "text-warning"
          )}>
            {trackingState}
          </span>
        </div>
      </div>
    </>
  )

  const renderVideoLayer = () => (
    <div className="relative aspect-[3/4] bg-surface-sunken w-full overflow-hidden rounded-[20px] shadow-sm mb-4">
      {cameraState === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <VideoOff size={48} className="text-error mb-4" />
          <h2 className="text-lg font-bold text-ink">Camera Error</h2>
          <p className="text-secondary text-sm">Please check permissions.</p>
        </div>
      ) : (
        <video 
          ref={videoRef} 
          playsInline 
          muted 
          className={cx("absolute inset-0 w-full h-full object-cover transition-opacity duration-300", facingMode === 'user' ? 'scale-x-[-1]' : '', poseLoaded ? 'opacity-100' : 'opacity-0')}
        />
      )}
      <canvas 
        ref={canvasRef} 
        width={720} height={1280} 
        className={cx("absolute inset-0 w-full h-full object-cover z-10 pointer-events-none", facingMode === 'user' ? 'scale-x-[-1]' : '')} 
      />

      {/* Intro Overlay */}
      {phase === 'intro' && (
        <div className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center z-30 animate-in fade-in zoom-in duration-300">
          <p className="text-white text-xl font-bold">TEST {currentTestIndex + 1}</p>
          <h1 className="text-white text-3xl font-extrabold mt-2">{currentTest?.title}</h1>
        </div>
      )}
      
      {/* Test Completion Overlay */}
      {phase === 'test_result' && testResult?.status === 'VALID' && currentTestIndex < ACTIVE_TESTS.length - 1 && (
        <div className="absolute inset-0 bg-mint/90 flex flex-col items-center justify-center z-30 animate-in fade-in duration-300">
          <CheckCircle size={48} className="text-primary-dark mb-4" />
          <p className="text-primary-dark text-xl font-bold">TEST {currentTestIndex + 1} COMPLETE</p>
          <h1 className="text-primary-dark text-lg font-semibold mt-2">MOVE TO TEST {currentTestIndex + 2}</h1>
        </div>
      )}
    </div>
  )

  const renderSubtitles = () => {
    if (!voice.subtitle) return null
    return (
      <div className="bg-ink/90 backdrop-blur text-white p-4 rounded-[16px] text-center text-lg font-semibold shadow-lg mb-4">
        {voice.subtitle}
      </div>
    )
  }

  const renderWorkerUI = () => {
    if (phase === 'setup' || phase === 'ready') {
      return (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-lg font-semibold text-ink">
            {phase === 'setup' ? currentTest?.preparationInstruction : "Patient detected. Ready."}
          </p>
          {phase === 'ready' && (
            <Button full onClick={handleStartRecording} className="min-h-[54px] text-lg font-bold">
              START ASSESSMENT
            </Button>
          )}
        </div>
      )
    }

    if (phase === 'instruction' || phase === 'recording' || phase === 'validating') {
      return (
        <div className="flex flex-col gap-4 items-center">
          {phase === 'recording' && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-error animate-pulse" />
              <span className="text-error font-bold tracking-widest uppercase">Recording</span>
            </div>
          )}
          <p className="text-secondary font-medium">
            Test progress: {elapsed.toFixed(1)}s / {currentTest?.timeoutSec}s
          </p>
        </div>
      )
    }

    if (phase === 'test_result' && testResult) {
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border/70 rounded-[16px] p-4">
            <h3 className="font-bold text-ink mb-2">TEST {currentTestIndex + 1} — {currentTest?.title}</h3>
            
            <div className="flex items-center gap-2 mb-4">
              {testResult.status === 'VALID' ? (
                <><CheckCircle size={18} className="text-mint-dark" /><span className="text-mint-dark font-bold">✓ Completed</span></>
              ) : (
                <><ShieldCheck size={18} className="text-error" /><span className="text-error font-bold">Insufficient Data</span></>
              )}
            </div>
            
            {Object.entries(currentTest?.workerResultFormatter(testResult) || {}).map(([key, val]) => (
              <p key={key} className="text-sm font-semibold text-secondary capitalize">
                {key}: <span className="text-ink">{String(val)}</span>
              </p>
            ))}
            
            {/* Technical Details Toggle */}
            <div className="mt-4 pt-4 border-t border-border">
              <button 
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="text-primary text-sm font-bold w-full text-left focus-visible:outline-none"
              >
                {showTechnicalDetails ? '[-] HIDE TECHNICAL DETAILS' : '[+] VIEW TECHNICAL DETAILS'}
              </button>
              
              {showTechnicalDetails && (
                <div className="mt-2 text-xs font-mono text-secondary bg-surface-sunken p-3 rounded-[8px] break-all">
                  <p>Status: {testResult.status}</p>
                  <p>Valid Samples: {testResult.technicalDetails?.validSamples}</p>
                  {Object.entries(testResult.measurements || {}).map(([k, v]) => (
                    <p key={k}>{k}: {typeof v === 'number' ? v.toFixed(2) : String(v)}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {testResult.status === 'VALID' ? (
            <Button full onClick={handleNextTest} className="min-h-[54px] text-lg font-bold">
              {currentTestIndex < ACTIVE_TESTS.length - 1 ? 'NEXT TEST' : 'FINISH SCREENING'}
            </Button>
          ) : (
            <Button full onClick={handleRetry} className="min-h-[54px] text-lg font-bold">
              RETRY TEST
            </Button>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <Frame>
      {renderHeader()}
      <main className="flex-1 flex flex-col p-4 pb-8 overflow-y-auto w-full max-w-[500px] mx-auto">
        <div className="text-xs font-bold text-muted mb-2 tracking-widest uppercase">
          TEST {currentTestIndex + 1} OF {ACTIVE_TESTS.length}
        </div>
        
        {renderVideoLayer()}
        {renderSubtitles()}
        {renderWorkerUI()}
      </main>
    </Frame>
  )
}
