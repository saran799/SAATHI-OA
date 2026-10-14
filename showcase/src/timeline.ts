/** Film timeline (seconds). Every module reads chapter times from here. */
export const T = {
  intro: 0,
  problem: 9,
  asha: 17,
  app: 26,
  camera: 38,     // OpenCV / MediaPipe joint-movement (ROM) test
  posture: 50,    // camera posture test
  strap: 57,      // sensor pod strapped below the knee, on the tibia
  shock: 67,      // tibial shock: walking test + anatomy view
  lab: 79,        // validation vs shoe-cushioning lab method + novelty
  result: 93,
  nutrition: 101, // care + nutrition plan by risk band
  sync: 111,
  arch: 116,
  impact: 132,
  end: 142,
  total: 150,
} as const

export const CHAPTERS = [
  { name: 'Hills', t: T.intro },
  { name: 'The problem', t: T.problem },
  { name: 'ASHA arrives', t: T.asha },
  { name: 'App', t: T.app },
  { name: 'Camera ROM', t: T.camera },
  { name: 'Posture', t: T.posture },
  { name: 'Strap pod', t: T.strap },
  { name: 'Tibial shock', t: T.shock },
  { name: 'Lab-validated', t: T.lab },
  { name: 'Result', t: T.result },
  { name: 'Nutrition', t: T.nutrition },
  { name: 'Sync', t: T.sync },
  { name: 'Architecture', t: T.arch },
  { name: 'Impact', t: T.impact },
  { name: 'SAATHI', t: T.end },
]

/** Kamala's walking test (tibial shock): heel-strike times. */
export const STEPS_T = [68.4, 69.3, 70.2, 71.1, 72.0]
