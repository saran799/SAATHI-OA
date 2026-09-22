import { FilesetResolver, PoseLandmarker, type PoseLandmarkerResult } from '@mediapipe/tasks-vision'

export interface PosePoint { x: number; y: number; z?: number; visibility?: number }
export interface PoseResult {
  landmarks: PosePoint[]
  worldLandmarks?: PosePoint[]
  confidence: number
}

export type JointType = 'knee' | 'hip' | 'hand' | 'spine' | 'shoulder'

export const POSE_CONNECTIONS = [
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Right Arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  // Left Arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  // Right Leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
  // Left Leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  // Face (basic outline to show person is detected)
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10]
]

export interface JointConfig {
  joint: JointType
  side: 'left' | 'right' | 'both'
  // landmark indices for angle calculation: [a, b, c] where b is vertex
  angleTriplet: [number, number, number]
  // required landmarks for visibility check
  required: number[]
  label: string
}

/**
 * MediaPipe Pose 33 landmarks:
 * 0 nose, 11 left shoulder, 12 right shoulder, 13 left elbow, 14 right elbow,
 * 15 left wrist, 16 right wrist, 23 left hip, 24 right hip,
 * 25 left knee, 26 right knee, 27 left ankle, 28 right ankle
 *
 * REQUIRED per spec:
 * KNEE: Hip → Knee → Ankle (angle at knee)
 * SHOULDER: Shoulder → Elbow → Wrist (angle at elbow)
 * HIP: Torso/proximal → Hip → Knee (angle at hip) — using shoulder as torso proxy
 */
export const JOINT_CONFIGS: Record<string, { left: JointConfig; right: JointConfig }> = {
  knee: {
    left: { joint: 'knee', side: 'left', angleTriplet: [23, 25, 27], required: [23, 25, 27], label: 'Left knee' },
    right: { joint: 'knee', side: 'right', angleTriplet: [24, 26, 28], required: [24, 26, 28], label: 'Right knee' },
  },
  hip: {
    left: { joint: 'hip', side: 'left', angleTriplet: [11, 23, 25], required: [11, 23, 25], label: 'Left hip' },
    right: { joint: 'hip', side: 'right', angleTriplet: [12, 24, 26], required: [12, 24, 26], label: 'Right hip' },
  },
  shoulder: {
    // Per spec: Shoulder → Elbow → Wrist, angle at elbow
    left: { joint: 'shoulder', side: 'left', angleTriplet: [11, 13, 15], required: [11, 13, 15], label: 'Left shoulder' },
    right: { joint: 'shoulder', side: 'right', angleTriplet: [12, 14, 16], required: [12, 14, 16], label: 'Right shoulder' },
  },
  hand: {
    // Hand open/close not directly angle, but use elbow-wrist for demo: Shoulder→Elbow→Wrist same as shoulder
    left: { joint: 'hand', side: 'left', angleTriplet: [11, 13, 15], required: [11, 13, 15], label: 'Left hand' },
    right: { joint: 'hand', side: 'right', angleTriplet: [12, 14, 16], required: [12, 14, 16], label: 'Right hand' },
  },
  spine: {
    // Spine: use shoulder-hip-knee for forward bend angle at hip
    left: { joint: 'spine', side: 'left', angleTriplet: [11, 23, 25], required: [11, 23, 25], label: 'Spine' },
    right: { joint: 'spine', side: 'right', angleTriplet: [12, 24, 26], required: [12, 24, 26], label: 'Spine' },
  },
}

export function getJointConfig(joint: JointType, side: 'left' | 'right' | 'both'): JointConfig {
  const sideKey = side === 'both' ? 'right' : side
  const jointKey = joint === 'spine' ? 'spine' : joint
  const cfg = JOINT_CONFIGS[jointKey] || JOINT_CONFIGS.knee
  return (cfg as any)[sideKey] || cfg.right
}

/**
 * Mathematically correct geometric angle calculation from real landmarks
 * BA = A - B, BC = C - B, angle = acos(dot(BA,BC)/(|BA|*|BC|))
 * Clamp cosine to [-1,1], reject degenerate vectors
 */
export function calculateAngle(a: PosePoint, b: PosePoint, c: PosePoint): number {
  // Validate finite coordinates
  if (
    !a || !b || !c ||
    !Number.isFinite(a.x) || !Number.isFinite(a.y) ||
    !Number.isFinite(b.x) || !Number.isFinite(b.y) ||
    !Number.isFinite(c.x) || !Number.isFinite(c.y)
  ) {
    return 0
  }

  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }

  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y)
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y)

  // Reject degenerate vectors (too small)
  if (magAB < 1e-6 || magCB < 1e-6) return 0

  const dot = ab.x * cb.x + ab.y * cb.y
  const denom = magAB * magCB
  if (denom < 1e-6) return 0

  let cos = dot / denom
  // Clamp to prevent numerical errors
  cos = Math.max(-1, Math.min(1, cos))

  const rad = Math.acos(cos)
  if (!Number.isFinite(rad)) return 0

  return (rad * 180) / Math.PI
}

export function estimateConfidence(landmarks: PosePoint[], required: number[]): number {
  if (!landmarks || landmarks.length === 0) return 0
  const vis = required.map(i => {
    const lm = landmarks[i]
    if (!lm) return 0
    if (!Number.isFinite(lm.x) || !Number.isFinite(lm.y)) return 0
    return lm.visibility ?? 0
  })
  const avg = vis.reduce((a, b) => a + b, 0) / (vis.length || 1)
  return Math.max(0, Math.min(1, avg))
}

let poseLandmarker: PoseLandmarker | null = null
let loadingPromise: Promise<PoseLandmarker> | null = null

/**
 * Pose initialization must:
 * 1. load model
 * 2. verify availability
 * 3. initialize detector
 * 4. attach to actual video (done by caller)
 * 5. wait for valid video dimensions (done by caller)
 * 6. begin inference
 * 7. cleanly dispose
 */
export async function loadPoseModel(): Promise<PoseLandmarker> {
  if (poseLandmarker) return poseLandmarker
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })
      poseLandmarker = landmarker
      return landmarker
    } catch (e) {
      console.error('Failed to load pose model', e)
      loadingPromise = null
      throw e
    }
  })()

  return loadingPromise
}

export interface PoseDiagnosticOutput {
  result: PoseResult | null
  diagError: string
  diagLandmarks: number
}

export function detectPose(video: HTMLVideoElement, timestamp: number): PoseDiagnosticOutput {
  if (!poseLandmarker) return { result: null, diagError: 'Model not loaded', diagLandmarks: 0 }

  // Guard: never run against zero-dimension/unready video per spec
  if (!video || video.videoWidth === 0 || video.videoHeight === 0) return { result: null, diagError: 'Video dimensions 0', diagLandmarks: 0 }
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return { result: null, diagError: 'Video readyState < 2', diagLandmarks: 0 }

  try {
    const result: PoseLandmarkerResult = poseLandmarker.detectForVideo(video, timestamp)
    if (!result.landmarks || result.landmarks.length === 0) return { result: null, diagError: 'No landmarks returned', diagLandmarks: 0 }
    
    const lm = result.landmarks[0]
    const points: PosePoint[] = lm.map((p: any) => ({
      x: p.x,
      y: p.y,
      z: p.z,
      visibility: p.visibility ?? 1,
    }))
    const avgVis = points.reduce((a, p) => a + (p.visibility || 0), 0) / (points.length || 1)
    
    return { result: { landmarks: points, confidence: avgVis }, diagError: '', diagLandmarks: points.length }
  } catch (e) {
    console.error('Pose detection error', e)
    return { result: null, diagError: e instanceof Error ? e.message : String(e), diagLandmarks: 0 }
  }
}

export function disposePoseModel() {
  if (poseLandmarker) {
    try {
      poseLandmarker.close()
    } catch {}
    poseLandmarker = null
    loadingPromise = null
  }
}

export function isPoseModelLoaded(): boolean {
  return poseLandmarker !== null
}
