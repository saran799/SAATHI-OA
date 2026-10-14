import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildWorld } from './world'
import { person, resetPose, walkPose, sitPose, holdPhonePose, placeOnSeat, sensorDevice, scooter, type Rig } from './characters'
import { createPhone, kneeAngle, logoImg, markImg, screenAt, SCREENS } from './phone'
import { buildArchitecture } from './architecture'
import { buildImpact } from './impact'
import { Score } from './audio'
import { FONT, clamp, easeInOut, easeOut, lerp, roundRect, seg, smooth, splineAt, v3, win } from './util'
import logoUrl from '../../src/assets/saathi-logo.png'
import markUrl from '../../src/assets/saathi-mark.png'

/* =============================== timeline =============================== */
const TOTAL = 98
const CHAPTERS = [
  { name: 'Village', t: 0 }, { name: 'The problem', t: 8 }, { name: 'ASHA arrives', t: 16 }, { name: 'App prototype', t: 24 },
  { name: 'Sensor test', t: 44 }, { name: 'Result & sync', t: 56 }, { name: 'Architecture', t: 64 }, { name: 'Impact', t: 80 }, { name: 'SAATHI', t: 90 },
]
const chapterAt = (t: number) => { let i = 0; while (i < CHAPTERS.length - 1 && t >= CHAPTERS[i + 1].t) i++; return i }

/* =============================== renderer =============================== */
const glCanvas = document.getElementById('gl') as HTMLCanvasElement
const overlay = document.getElementById('overlay') as HTMLCanvasElement
const octx = overlay.getContext('2d')!
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, powerPreference: 'high-performance' })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.08
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.autoClear = false

const scene = new THREE.Scene()
const ui = new THREE.Scene()
ui.add(new THREE.AmbientLight('#ffffff', 1.4))
const uiSun = new THREE.DirectionalLight('#ffffff', 2.0); uiSun.position.set(2, 3, 5); ui.add(uiSun)
const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 2200)
ui.add(camera)

const world = buildWorld(scene)

/* =============================== cast =============================== */
const K = person({ skin: '#8D5A3B', top: '#2E7D32', saree: '#A3214F', border: '#F2B134', hair: '#D8D8D8', bun: true, stick: true })
const A = person({ skin: '#A0694A', top: '#6A1B4D', saree: '#EC5F9E', border: '#7B1E5B', hair: '#141414', bun: true })
scene.add(K.root, A.root)
const stick = K.root.userData.stick as THREE.Object3D
const scoot = scooter('#00A6A6'); scene.add(scoot)

// SAATHI knee sensor strapped below Kamala's right knee
const sensor = sensorDevice(); sensor.position.set(0, -0.11, 0.06); K.kneeL.add(sensor)
const strap = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.013, 6, 18), new THREE.MeshStandardMaterial({ color: '#2B2F36', roughness: 0.6 }))
strap.rotation.x = Math.PI / 2; strap.position.y = -0.11; K.kneeL.add(strap)

// villagers for life
interface Extra { rig: Rig; kind: 'idle' | 'run' | 'sit'; pos: THREE.Vector3; rot: number; ph: number; c?: THREE.Vector3; rad?: number; sp?: number }
const extras: Extra[] = [
  { rig: person({ skin: '#7A4B2E', top: '#FFFFFF', legs: '#F2EEE3', hair: '#222', turban: '#FF9933' }), kind: 'idle', pos: v3(-13.6, 0, 16.6), rot: 2.4, ph: 0 },
  { rig: person({ skin: '#8D5A3B', top: '#FFB703', saree: '#3A86FF', border: '#FFD166', hair: '#111', bun: true }), kind: 'idle', pos: v3(-1.7, 0, 1.7), rot: -2.5, ph: 1 },
  { rig: person({ skin: '#9A6646', top: '#E63946', legs: '#1D3557', hair: '#111', scale: 0.62 }), kind: 'run', pos: v3(), rot: 0, ph: 0, c: v3(-8, 0, 16), rad: 5.3, sp: 0.55 },
  { rig: person({ skin: '#8A5A3A', top: '#06D6A0', legs: '#5A189A', hair: '#111', scale: 0.58 }), kind: 'run', pos: v3(), rot: 0, ph: 2.2, c: v3(-8, 0, 16), rad: 5.6, sp: 0.55 },
  { rig: person({ skin: '#7A4B2E', top: '#FFFFFF', legs: '#FFFFFF', hair: '#BBB', turban: '#D7263D' }), kind: 'sit', pos: v3(-6.2, 0, 19.0), rot: 0.6, ph: 0 },
  { rig: person({ skin: '#946042', top: '#FF6B6B', saree: '#FFB703', border: '#D7263D', hair: '#111', bun: true }), kind: 'idle', pos: v3(23, 0, -2.6), rot: 0.4, ph: 2 },
]
extras.forEach(e => scene.add(e.rig.root))
// brass pot on the head of the woman at the well
extras[1].rig.head.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshStandardMaterial({ color: '#D4A017', metalness: 0.7, roughness: 0.3 })).translateY(0.2))

/* =============================== phones =============================== */
const phoneKit = createPhone()
const handPhone = phoneKit.build(); handPhone.scale.setScalar(0.072); handPhone.position.set(0, -0.075, 0.03); handPhone.rotation.set(-0.35, 0, Math.PI)
A.handR.add(handPhone)
const heroPhone = phoneKit.build(); ui.add(heroPhone)
const glowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256
  const g = c.getContext('2d')!; const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  gr.addColorStop(0, 'rgba(153,239,229,0.9)'); gr.addColorStop(0.45, 'rgba(46,196,182,0.35)'); gr.addColorStop(1, 'rgba(46,196,182,0)')
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
})()
const heroGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }))
heroGlow.scale.set(3.4, 3.4, 1); heroGlow.position.z = -0.4; heroPhone.add(heroGlow)

const arch = buildArchitecture(scene, phoneKit.build)
const impact = buildImpact(scene, world.phc)

/* =============================== FX =============================== */
function radialSprite(inner: string, outer: string, size = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }))
  s.scale.setScalar(size); return s
}
function ringSprite(color: string) {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!; g.strokeStyle = color; g.lineWidth = 7; g.beginPath(); g.arc(64, 64, 56, 0, Math.PI * 2); g.stroke()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
}
const painGlow = radialSprite('rgba(255,60,60,1)', 'rgba(255,0,0,0)', 0.4); scene.add(painGlow)
const bleRings = [0, 1, 2].map(() => { const s = ringSprite('#99EFE5'); scene.add(s); return s })
const dataDots = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: '#7CFFE9' })); scene.add(m); return m })
const syncDots = Array.from({ length: 18 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshBasicMaterial({ color: '#FFE08A' })); scene.add(m); return m })
const towerRings = [0, 1, 2].map(() => { const s = ringSprite('#FFE08A'); scene.add(s); return s })

/* =============================== character animation =============================== */
const findU = (x: number) => { let best = 0, bd = 1e9; for (let i = 0; i <= 2000; i++) { const p = world.road.getPointAt(i / 2000); const d = Math.abs(p.x - x); if (d < bd) { bd = d; best = i / 2000 } } return best }
const uStart = findU(-52), uStop = findU(5)
const doorPos = v3(4, 0, -0.5), standPos = v3(6.1, 0, 1.75)
const seatPos = world.charpai.clone().setZ(world.charpai.z + 0.08)
const ashaStand = v3(8.6, 0, 2.35)
const DEG = Math.PI / 180
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpQ = new THREE.Quaternion()

function animateCast(t: number) {
  // ---- Kamala ----
  resetPose(K)
  stick.visible = t < 24
  K.torso.rotation.x = 0.16
  if (t < 8) {
    K.root.position.copy(doorPos); K.root.rotation.y = 0.2
    K.head.rotation.y = Math.sin(t * 0.6) * 0.3
    K.shoulderR.rotation.x = -0.25
  } else if (t < 12.5) {
    const u = seg(t, 8, 12.5)
    K.root.position.lerpVectors(doorPos, standPos, u)
    K.root.rotation.y = Math.atan2(standPos.x - doorPos.x, standPos.z - doorPos.z)
    walkPose(K, t * 4.6, 0.3, 1)
    K.torso.rotation.x = 0.22
    K.shoulderR.rotation.x = -0.3 + Math.sin(t * 4.6) * 0.1
  } else if (t < 24) {
    K.root.position.copy(standPos)
    const k = smooth(seg(t, 12.5, 13.3)) * (1 - smooth(seg(t, 15.6, 16.4)))
    K.root.rotation.y = lerp(Math.atan2(standPos.x - doorPos.x, standPos.z - doorPos.z), 0.15, smooth(seg(t, 12.5, 13.5))) + 0.7 * smooth(seg(t, 21.5, 22.6))
    K.torso.rotation.x = 0.2 + 0.5 * k
    K.shoulderL.rotation.x = -0.7 * k; K.elbowL.rotation.x = -0.4 * k
    K.legL.rotation.x = -0.15 * k; K.kneeL.rotation.x = 0.3 * k
    K.head.rotation.x = 0.15 * k
    K.shoulderR.rotation.x = -0.25
  } else {
    K.root.position.copy(seatPos); K.root.rotation.y = 0
    sitPose(K, 0.43)
    K.torso.rotation.x = 0.04
    K.shoulderL.rotation.x = -0.55; K.shoulderR.rotation.x = -0.55; K.elbowL.rotation.x = -0.65; K.elbowR.rotation.x = -0.65
    K.head.rotation.y = 0.45 + Math.sin(t * 0.5) * 0.1
    if (t > 47 && t < 53.6) K.kneeL.rotation.x = Math.PI / 2 - kneeAngle(t) * DEG
    if (t > 56) K.head.rotation.x = Math.max(0, Math.sin((t - 56) * 3)) * 0.15 * (1 - seg(t, 58, 60))
  }

  // ---- Sunita (ASHA) + scooter ----
  resetPose(A)
  const show = t >= 15.9
  A.root.visible = scoot.visible = show
  handPhone.visible = t >= 21.3
  const stopP = world.road.getPointAt(uStop), stopT = world.road.getTangentAt(uStop)
  const stopRot = Math.atan2(stopT.x, stopT.z)
  if (t < 21) {
    const s = seg(t, 16, 21)
    const f = s < 0.7 ? s / 0.7 * 0.82 : 0.82 + (1 - Math.pow(1 - (s - 0.7) / 0.3, 2)) * 0.18
    const u = lerp(uStart, uStop, f)
    const p = world.road.getPointAt(u), tg = world.road.getTangentAt(u)
    const rot = Math.atan2(tg.x, tg.z)
    scoot.position.copy(p); scoot.rotation.set(0, rot, Math.sin(t * 2) * 0.02)
    A.root.position.copy(p); A.root.rotation.y = rot
    placeOnSeat(A); A.hips.position.z = -0.28
    A.head.rotation.y = Math.sin(t * 0.8) * 0.1
  } else {
    scoot.position.copy(stopP); scoot.rotation.set(0, stopRot, -0.08)
    const side = v3(stopT.z, 0, -stopT.x).multiplyScalar(-0.8)
    const dis = stopP.clone().add(side)
    if (t < 23.6) {
      const u = seg(t, 21.2, 23.6)
      A.root.position.lerpVectors(dis, ashaStand, smooth(u))
      A.root.rotation.y = Math.atan2(ashaStand.x - dis.x, ashaStand.z - dis.z)
      if (t > 21.2) walkPose(A, t * 8.5, 0.5)
      holdPhonePose(A, 0.5)
    } else {
      A.root.position.copy(ashaStand)
      A.root.rotation.y = Math.atan2(seatPos.x - ashaStand.x, seatPos.z - ashaStand.z) + 0.35
      holdPhonePose(A, 0.6 + 0.4 * smooth(seg(t, 23.6, 24.4)))
      A.head.rotation.y = t > 44 && t < 56 ? -0.25 : 0
    }
  }

  // ---- villagers ----
  for (const e of extras) {
    resetPose(e.rig)
    if (e.kind === 'run' && e.c && e.rad && e.sp) {
      const a = t * e.sp + e.ph
      e.rig.root.position.set(e.c.x + Math.cos(a) * e.rad, 0, e.c.z + Math.sin(a) * e.rad)
      e.rig.root.rotation.y = -a + Math.PI
      walkPose(e.rig, t * 11 + e.ph, 0.75)
      e.rig.shoulderL.rotation.x *= 1.3
    } else if (e.kind === 'sit') {
      e.rig.root.position.copy(e.pos); e.rig.root.rotation.y = e.rot
      sitPose(e.rig, 0.62)
      e.rig.shoulderL.rotation.x = -0.5; e.rig.shoulderR.rotation.x = -0.5
      e.rig.head.rotation.y = Math.sin(t * 0.4) * 0.4
    } else {
      e.rig.root.position.copy(e.pos); e.rig.root.rotation.y = e.rot + Math.sin(t * 0.3 + e.ph) * 0.2
      e.rig.head.rotation.y = Math.sin(t * 0.7 + e.ph) * 0.4
      e.rig.shoulderR.rotation.x = Math.sin(t * 1.2 + e.ph) * 0.2
      if (e === extras[1]) { e.rig.shoulderR.rotation.x = -2.8; e.rig.elbowR.rotation.x = -0.6 }
    }
  }

  // ---- sensor + FX ----
  sensor.visible = strap.visible = t >= 40
  ;(sensor.userData.led as THREE.Mesh).visible = Math.floor(t * 3) % 2 === 0 || (t > 47 && t < 54)
  K.kneeL.getWorldPosition(tmpV)
  painGlow.position.copy(tmpV)
  const pk = win(t, 12.8, 16.4, 0.5)
  painGlow.visible = pk > 0.01
  painGlow.scale.setScalar((0.35 + 0.18 * Math.sin(t * 7)) * pk)
  sensor.getWorldPosition(tmpV)
  handPhone.getWorldPosition(tmpV2)
  bleRings.forEach((r, i) => {
    const k = ((t * 0.8 + i / 3) % 1)
    r.visible = t > 41.5 && t < 56
    r.position.copy(tmpV)
    r.scale.setScalar(0.05 + k * 0.5)
    r.material.opacity = (1 - k) * 0.9
  })
  dataDots.forEach((d, i) => {
    d.visible = t > 44 && t < 56
    if (!d.visible) return
    const u = (t * 0.7 + i / dataDots.length) % 1
    d.position.lerpVectors(tmpV, tmpV2, u); d.position.y += Math.sin(u * Math.PI) * 0.35
  })
  // sync to tower → PHC
  const sk = t > 62 && t < 66.5
  const towerTop = world.towerTop, phcTop = world.phc.clone().setY(7)
  syncDots.forEach((d, i) => {
    d.visible = sk
    if (!sk) return
    const u = (t * 0.35 + i / syncDots.length) % 1
    if (u < 0.5) { const k = u / 0.5; d.position.lerpVectors(tmpV2, towerTop, k); d.position.y += Math.sin(k * Math.PI) * 10 }
    else { const k = (u - 0.5) / 0.5; d.position.lerpVectors(towerTop, phcTop, k); d.position.y += Math.sin(k * Math.PI) * 14 }
  })
  towerRings.forEach((r, i) => {
    const k = ((t * 0.6 + i / 3) % 1)
    r.visible = sk; r.position.copy(towerTop); r.scale.setScalar(2 + k * 14); r.material.opacity = (1 - k)
  })
}

/* =============================== camera direction =============================== */
type Seg = { a: number; b: number; blend?: number; keys?: { p: number[][]; l: number[][] }; proc?: (t: number, p: THREE.Vector3, l: THREE.Vector3) => void }
const SEGS: Seg[] = [
  { a: 0, b: 16, keys: {
    p: [[0, -78, 58, 108], [3, -42, 32, 66], [6, -8, 12, 30], [8, 10, 4.6, 13], [11, 10.6, 2.6, 8.6], [14, 8.8, 1.4, 4.8], [16, 8.4, 1.2, 4.2]],
    l: [[0, 0, 0, 0], [3, 0, 2, 0], [6, 4, 2, 0], [8, 5.4, 1, 0], [11, 5.8, 1.0, 1.0], [14, 6.2, 0.6, 1.7], [16, 6.2, 0.55, 1.75]] } },
  { a: 16, b: 21, proc: (t, p, l) => {
    const s = seg(t, 16, 21)
    const f = s < 0.7 ? s / 0.7 * 0.82 : 0.82 + (1 - Math.pow(1 - (s - 0.7) / 0.3, 2)) * 0.18
    const u = lerp(uStart, uStop, f)
    const sp = world.road.getPointAt(u), tg = world.road.getTangentAt(u)
    const side = v3(tg.z, 0, -tg.x)
    const orbit = lerp(-0.9, 0.9, smooth(s))
    p.copy(sp).addScaledVector(tg, -5.5 * Math.cos(orbit) + 1.5).addScaledVector(side, -4.5 * Math.sin(orbit) - 1.5).add(v3(0, 2.0 + s * 0.8, 0))
    l.copy(sp).addScaledVector(tg, 1.5).add(v3(0, 0.9, 0))
  } },
  { a: 21, b: 24, keys: { p: [[21, 12.8, 2.6, 10.5], [24, 11.2, 2.4, 8.2]], l: [[21, 5.5, 1.0, 3.5], [24, 7.2, 1.0, 2.0]] } },
  { a: 24, b: 44, blend: 1.2, proc: (t, p, l) => {
    const c = v3(6.8, 0.9, 1.6)
    const a = lerp(0.2, 1.05, seg(t, 24, 44))
    p.set(c.x + Math.sin(a) * 9.5, 2.8 + Math.sin(t * 0.3) * 0.3, c.z + Math.cos(a) * 9.5)
    l.copy(c)
  } },
  { a: 44, b: 56, keys: { p: [[44, 4.6, 1.5, 4.6], [50, 5.1, 1.1, 4.0], [56, 5.0, 1.35, 4.5]], l: [[44, 7.4, 0.55, 1.6], [50, 7.3, 0.45, 1.6], [56, 7.6, 0.7, 1.4]] } },
  { a: 56, b: 61.5, keys: { p: [[56, 3.5, 2.6, 9.5], [61.5, 1, 4.5, 13]], l: [[56, 7, 1.2, 1], [61.5, 6, 1.6, 0]] } },
  { a: 61.5, b: TOTAL, blend: 0.8, keys: {
    p: [[61.5, 8, 22, 64], [64, 12, 34, 80], [66.2, -15, 76, 31], [70, -6, 76.5, 31], [73, 3, 77, 32], [76.5, 14, 77, 32], [80, 4, 84, 56], [83, 60, 150, 205], [87, 185, 140, 125], [90, 210, 118, -30], [94, 34, 42, 72], [98, 8, 14, 31]],
    l: [[61.5, 2, 9, -8], [64, 5, 12, -10], [66.2, -16, 74, 0], [70, -6, 74.5, 0], [73, 3, 74.5, 0], [76.5, 15, 74.5, 0], [80, 4, 73.5, 0], [83, 10, 0, 0], [87, 10, 0, 0], [90, 10, 0, 0], [94, 4, 3, 0], [98, 4, 2.5, -2]] } },
]
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3()
function evalSeg(s: Seg, t: number, p: THREE.Vector3, l: THREE.Vector3) {
  if (s.proc) s.proc(t, p, l)
  else if (s.keys) { splineAt(s.keys.p, t, p); splineAt(s.keys.l, t, l) }
}
function cameraAt(t: number, p: THREE.Vector3, l: THREE.Vector3) {
  let i = 0; while (i < SEGS.length - 1 && t >= SEGS[i + 1].a) i++
  const s = SEGS[i]
  evalSeg(s, t, p, l)
  if (s.blend && i > 0 && t < s.a + s.blend) {
    const pp = new THREE.Vector3(), pl = new THREE.Vector3()
    evalSeg(SEGS[i - 1], s.a, pp, pl)
    const k = easeInOut((t - s.a) / s.blend)
    p.lerpVectors(pp, p, k); l.lerpVectors(pl, l, k)
  }
}

/* =============================== hero phone choreography =============================== */
type PMode = 'hand' | 'hero' | 'corner' | 'gone'
const PKEYS: [number, PMode][] = [[0, 'hand'], [24, 'hand'], [25.2, 'hero'], [44, 'hero'], [45, 'corner'], [56, 'corner'], [57, 'hero'], [61.5, 'hero'], [62.5, 'corner'], [64.3, 'corner'], [65.2, 'gone']]
const poseP = { a: new THREE.Vector3(), b: new THREE.Vector3() }, poseQ = { a: new THREE.Quaternion(), b: new THREE.Quaternion() }
function modePose(m: PMode, t: number, pos: THREE.Vector3, q: THREE.Quaternion) {
  if (m === 'hand') {
    handPhone.getWorldPosition(pos); handPhone.getWorldQuaternion(q)
    return 0.072
  }
  const asp = camera.aspect
  const wide = asp > 1.15
  let off: THREE.Vector3, s: number, ry: number
  if (m === 'hero') { off = v3(wide ? 0.5 * Math.min(1.25, asp / 1.78) : 0, -0.02, -2.5); s = 0.8; ry = -0.2 }
  else { off = v3(wide ? 0.98 * Math.min(1.3, asp / 1.78) : 0.3, -0.12, -2.6); s = m === 'gone' ? 0.0001 : 0.5; ry = -0.32 }
  pos.copy(off).applyMatrix4(camera.matrixWorld)
  q.copy(camera.quaternion).multiply(tmpQ.setFromEuler(new THREE.Euler(Math.sin(t * 0.5) * 0.04, ry + Math.sin(t * 0.6) * 0.06, 0)))
  return s
}
function updateHeroPhone(t: number) {
  let i = 0; while (i < PKEYS.length - 1 && t >= PKEYS[i + 1][0]) i++
  const [ta, ma] = PKEYS[i], [tb, mb] = PKEYS[Math.min(i + 1, PKEYS.length - 1)]
  if ((ma === 'hand' && mb === 'hand') || (ma === 'gone') || t > 66) { heroPhone.visible = false; heroGlow.visible = false; return }
  heroPhone.visible = true
  const k = tb > ta ? easeInOut((t - ta) / (tb - ta)) : 1
  const sa = modePose(ma, t, poseP.a, poseQ.a), sb = modePose(mb, t, poseP.b, poseQ.b)
  heroPhone.position.lerpVectors(poseP.a, poseP.b, k)
  heroPhone.quaternion.slerpQuaternions(poseQ.a, poseQ.b, k)
  heroPhone.scale.setScalar(lerp(sa, sb, k))
  heroGlow.visible = true
  heroGlow.material.opacity = 0.75 * (ma === 'hand' ? k : mb === 'hand' ? 1 - k : 1)
}

/* =============================== 2D overlay (minimal text) =============================== */
const CAPTIONS: [number, number, string, string, boolean?][] = [
  [9, 15.4, 'Joint pain, silently endured', 'The nearest specialist is hours away'],
  [17, 23.4, 'Meet Sunita, ASHA worker', 'SAATHI turns her phone into a screening kit'],
  [56.6, 61.2, 'Screening risk in minutes', 'A smarter referral — not a diagnosis', true],
  [62.3, 64.6, 'Syncs when the network returns', 'Records reach the PHC medical officer'],
  [80.6, 89.6, 'Every village. Earlier care.', ''],
]
const STEP_GROUPS: { title: string; from: number; to: number; names: string[] }[] = [
  { title: 'APP FLOW · SCREEN', from: 0, to: 5, names: ['Sign in', 'Language', 'Dashboard', 'Register patient', 'Select joint', 'Symptoms'] },
  { title: 'APP FLOW · SENSOR', from: 6, to: 9, names: ['Connect sensor', 'Calibrate', 'Live movement test', 'On-device AI'] },
  { title: 'APP FLOW · OUTCOME', from: 10, to: 12, names: ['Risk result', 'Guidance', 'Report & sync'] },
]
const logoForOverlay = new Image(); logoForOverlay.src = logoUrl
const markForOverlay = new Image(); markForOverlay.src = markUrl
;(document.getElementById('brandMark') as HTMLImageElement).src = markUrl
;(document.getElementById('startLogo') as HTMLImageElement).src = logoUrl
void logoImg; void markImg

function project(v: THREE.Vector3, W: number, H: number) {
  const p = v.clone().project(camera)
  return { x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H, front: p.z < 1 }
}
function txt(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, weight: number, color: string, align: CanvasTextAlign = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y)
}
function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) { roundRect(ctx, x, y, w, h, h / 2); ctx.fillStyle = fill; ctx.fill() }

function drawOverlay(t: number) {
  const W = overlay.width, H = overlay.height
  const u = Math.min(W / 1920, H / 1080)
  const ctx = octx
  ctx.clearRect(0, 0, W, H)
  ctx.save()

  // ----- intro title -----
  const ia = win(t, 0.6, 7.3, 0.8)
  if (ia > 0) {
    ctx.globalAlpha = ia
    const cw = 300 * u, cx = W / 2, cy = H * 0.4 - (1 - ia) * 20 * u
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 40 * u
    roundRect(ctx, cx - cw / 2, cy - cw / 2, cw, cw, 44 * u); ctx.fillStyle = 'rgba(255,255,255,0.96)'; ctx.fill(); ctx.restore()
    if (logoForOverlay.complete) ctx.drawImage(logoForOverlay, cx - cw / 2 + 14 * u, cy - cw / 2 + 14 * u, cw - 28 * u, cw - 28 * u)
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16 * u
    txt(ctx, 'AI-assisted osteoarthritis screening for rural India', cx, cy + cw / 2 + 52 * u, 34 * u, 700, '#FFFFFF', 'center')
    ctx.shadowBlur = 0; ctx.globalAlpha = 1
  }

  // ----- chapter tag -----
  const ch = chapterAt(t)
  if (ch > 0 && ch < CHAPTERS.length - 1) {
    const a = win(t, CHAPTERS[ch].t + 0.2, CHAPTERS[ch].t + 3.2, 0.4)
    if (a > 0) {
      ctx.globalAlpha = a
      const label = CHAPTERS[ch].name.toUpperCase()
      ctx.font = `800 ${20 * u}px ${FONT}`
      const w = ctx.measureText(label).width + 110 * u
      pill(ctx, 60 * u, 96 * u, w, 50 * u, 'rgba(0,79,72,0.88)')
      pill(ctx, 66 * u, 102 * u, 52 * u, 38 * u, '#99EFE5')
      txt(ctx, String(ch).padStart(2, '0'), 92 * u, 121 * u, 18 * u, 800, '#004F48', 'center')
      txt(ctx, label, 132 * u, 122 * u, 20 * u, 800, '#FFFFFF')
      ctx.globalAlpha = 1
    }
  }

  // ----- lower-third captions -----
  for (const [a, b, title, sub, left] of CAPTIONS) {
    const k = win(t, a, b, 0.6)
    if (k <= 0) continue
    ctx.globalAlpha = k
    const g = ctx.createLinearGradient(0, H * 0.62, 0, H)
    g.addColorStop(0, 'rgba(0,20,18,0)'); g.addColorStop(1, 'rgba(0,20,18,0.55)')
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.62, W, H * 0.38)
    const y = H - 190 * u + (1 - k) * 20 * u
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18 * u
    const lx = left && camera.aspect > 1.15 ? 70 * u : W / 2, al: CanvasTextAlign = left && camera.aspect > 1.15 ? 'left' : 'center'
    txt(ctx, title, lx, y, (left ? 54 : 62) * u, 800, '#FFFFFF', al)
    if (sub) txt(ctx, sub, lx, y + 58 * u, 28 * u, 600, '#D5F8F5', al)
    ctx.shadowBlur = 0; ctx.globalAlpha = 1
  }

  // ----- app flow step rail -----
  if (t > 24.3 && t < 64.4 && camera.aspect > 1.15) {
    const cur = screenAt(t)
    const grp = STEP_GROUPS.find(g => cur.idx >= g.from && cur.idx <= g.to)!
    const a = Math.min(smooth(seg(t, 24.3, 25.3)), 1 - smooth(seg(t, 63.6, 64.4)))
    ctx.globalAlpha = a
    const x = 70 * u, rowH = 64 * u
    const top = H / 2 - (grp.names.length * rowH) / 2 - 40 * u
    roundRect(ctx, x - 24 * u, top - 50 * u, 470 * u, grp.names.length * rowH + 90 * u, 30 * u)
    ctx.fillStyle = 'rgba(0,40,36,0.55)'; ctx.fill()
    txt(ctx, grp.title, x, top - 12 * u, 17 * u, 800, '#99EFE5')
    grp.names.forEach((n, i) => {
      const idx = grp.from + i
      const y = top + 34 * u + i * rowH
      const active = idx === cur.idx, done = idx < cur.idx
      if (active) { pill(ctx, x - 10 * u, y - 25 * u, 430 * u, 50 * u, '#FFFFFF') }
      ctx.beginPath(); ctx.arc(x + 18 * u, y, 15 * u, 0, Math.PI * 2)
      ctx.fillStyle = active ? '#00685F' : done ? '#99EFE5' : 'rgba(255,255,255,0.25)'; ctx.fill()
      if (done) { ctx.strokeStyle = '#004F48'; ctx.lineWidth = 3.5 * u; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 11 * u, y); ctx.lineTo(x + 16 * u, y + 6 * u); ctx.lineTo(x + 26 * u, y - 6 * u); ctx.stroke() }
      else txt(ctx, String(idx + 1), x + 18 * u, y + 1 * u, 14 * u, 800, active ? '#FFFFFF' : '#FFFFFF', 'center')
      txt(ctx, n, x + 48 * u, y + 1 * u, 25 * u, active ? 800 : 600, active ? '#004F48' : done ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)')
      if (active) { progressBar(ctx, x + 48 * u, y + 16 * u, 300 * u, 4 * u, cur.p) }
    })
    ctx.globalAlpha = 1
  }

  // ----- sensor callout + live knee HUD -----
  const sa = win(t, 44.4, 47.2, 0.4)
  if (sa > 0) {
    const p = project(sensor.getWorldPosition(new THREE.Vector3()), W, H)
    if (p.front) {
      ctx.globalAlpha = sa
      const lx = p.x - 220 * u, ly = p.y + 140 * u
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(lx + 120 * u, ly - 26 * u); ctx.stroke()
      ctx.beginPath(); ctx.arc(p.x, p.y, 10 * u, 0, Math.PI * 2); ctx.strokeStyle = '#99EFE5'; ctx.lineWidth = 4 * u; ctx.stroke()
      pill(ctx, lx - 120 * u, ly - 26 * u, 330 * u, 56 * u, 'rgba(255,255,255,0.96)')
      txt(ctx, 'SAATHI knee sensor', lx + 45 * u, ly + 2 * u, 24 * u, 800, '#004F48', 'center')
      ctx.globalAlpha = 1
    }
  }
  const ka = win(t, 47.3, 53.4, 0.4)
  if (ka > 0) {
    const p = project(K.kneeL.getWorldPosition(new THREE.Vector3()), W, H)
    if (p.front) {
      ctx.globalAlpha = ka
      const a = kneeAngle(t)
      const R = 90 * u
      ctx.lineCap = 'round'
      ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 8 * u; ctx.stroke()
      ctx.beginPath(); ctx.arc(p.x, p.y, R, Math.PI / 2, Math.PI / 2 - (a / 90) * Math.PI, true); ctx.strokeStyle = '#99EFE5'; ctx.lineWidth = 10 * u; ctx.stroke()
      pill(ctx, p.x - R - 210 * u, p.y - 40 * u, 180 * u, 80 * u, 'rgba(0,79,72,0.92)')
      txt(ctx, `${Math.round(a)}°`, p.x - R - 120 * u, p.y - 6 * u, 40 * u, 800, '#FFFFFF', 'center')
      txt(ctx, 'live angle', p.x - R - 120 * u, p.y + 24 * u, 15 * u, 700, '#99EFE5', 'center')
      ctx.globalAlpha = 1
    }
  }
  // AI caption during analysis
  const aa = win(t, 53.4, 56, 0.4)
  if (aa > 0 && camera.aspect > 1.15) {
    ctx.globalAlpha = aa
    pill(ctx, W * 0.5 - 300 * u, H - 150 * u, 600 * u, 70 * u, 'rgba(255,255,255,0.95)')
    txt(ctx, 'On-device AI · works without internet', W * 0.5, H - 115 * u, 26 * u, 800, '#004F48', 'center')
    ctx.globalAlpha = 1
  }

  // ----- architecture header -----
  const ar = win(t, 65.6, 79.6, 0.6)
  if (ar > 0) {
    ctx.globalAlpha = ar
    pill(ctx, W / 2 - 330 * u, 80 * u, 660 * u, 96 * u, 'rgba(255,255,255,0.95)')
    txt(ctx, 'How SAATHI works', W / 2, 114 * u, 38 * u, 800, '#004F48', 'center')
    txt(ctx, 'Sensor → Phone → Cloud → PHC  ·  offline-first', W / 2, 151 * u, 21 * u, 600, '#2F8981', 'center')
    ctx.globalAlpha = 1
  }

  // ----- impact pills -----
  const ip = win(t, 82.5, 89.6, 0.6)
  if (ip > 0) {
    const items = ['Doorstep screening', 'Earlier referrals', 'Works offline', '6 Indian languages']
    const pw = 330 * u, gap = 22 * u, total = items.length * pw + (items.length - 1) * gap
    items.forEach((s, i) => {
      const k = smooth(seg(t, 82.5 + i * 0.35, 83.3 + i * 0.35)) * ip
      ctx.globalAlpha = k
      const x = W / 2 - total / 2 + i * (pw + gap), y = H - 100 * u + (1 - k) * 20 * u
      pill(ctx, x, y - 32 * u, pw, 64 * u, 'rgba(255,255,255,0.95)')
      ctx.beginPath(); ctx.arc(x + 34 * u, y, 13 * u, 0, Math.PI * 2); ctx.fillStyle = ['#2EC4B6', '#FFB703', '#3A86FF', '#E84C8B'][i]; ctx.fill()
      txt(ctx, s, x + 60 * u, y + 1 * u, 23 * u, 800, '#004F48')
    })
    ctx.globalAlpha = 1
  }

  // ----- finale -----
  const fa = smooth(seg(t, 91.2, 92.6))
  if (fa > 0) {
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7)
    g.addColorStop(0, `rgba(255,255,255,${0.75 * fa})`); g.addColorStop(1, `rgba(255,255,255,${0.15 * fa})`)
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = fa
    const s = 360 * u
    if (logoForOverlay.complete) ctx.drawImage(logoForOverlay, W / 2 - s / 2, H / 2 - s * 0.68 - (1 - fa) * 20 * u, s, s)
    txt(ctx, 'A companion for earlier care', W / 2, H / 2 + s * 0.45, 48 * u, 800, '#00685F', 'center')
    const fb = smooth(seg(t, 93, 94))
    ctx.globalAlpha = fb
    txt(ctx, 'Screening support for community health workers · not a diagnostic device', W / 2, H / 2 + s * 0.45 + 56 * u, 22 * u, 600, '#5F6B6B', 'center')
    ctx.globalAlpha = 1
  }

  // ----- watermark -----
  if (t > 8 && t < 91 && (t < 64 || t > 80.5) && markForOverlay.complete) {
    ctx.globalAlpha = 0.9
    pill(ctx, W - 240 * u, 96 * u, 180 * u, 48 * u, 'rgba(255,255,255,0.9)')
    ctx.drawImage(markForOverlay, W - 228 * u, 102 * u, 46 * u, 36 * u)
    txt(ctx, 'SAATHI', W - 130 * u, 121 * u, 22 * u, 800, '#00685F', 'center')
    ctx.globalAlpha = 1
  }
  ctx.restore()
}
function progressBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, p: number) {
  roundRect(ctx, x, y, w, h, h / 2); ctx.fillStyle = 'rgba(0,104,95,0.15)'; ctx.fill()
  roundRect(ctx, x, y, Math.max(h, w * clamp(p)), h, h / 2); ctx.fillStyle = '#00685F'; ctx.fill()
}

/* =============================== sizing =============================== */
let fixedSize: [number, number] | null = null
function resize() {
  const vw = window.innerWidth, vh = window.innerHeight
  let w: number, h: number, cssW: number, cssH: number
  if (fixedSize) {
    [w, h] = fixedSize
    const s = Math.min(vw / w, vh / h); cssW = w * s; cssH = h * s
    renderer.setPixelRatio(1)
  } else {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    cssW = vw; cssH = vh; w = Math.round(vw * dpr); h = Math.round(vh * dpr)
  }
  renderer.setSize(fixedSize ? w : cssW, fixedSize ? h : cssH, false)
  for (const c of [glCanvas, overlay]) { c.style.width = cssW + 'px'; c.style.height = cssH + 'px' }
  overlay.width = renderer.domElement.width; overlay.height = renderer.domElement.height
  camera.aspect = cssW / cssH; camera.updateProjectionMatrix()
}
window.addEventListener('resize', resize)
resize()

/* =============================== controls & UI =============================== */
const controls = new OrbitControls(camera, glCanvas)
controls.enabled = false; controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.495; controls.maxDistance = 600; controls.minDistance = 2

let t = 0, playing = false, exploring = false, started = false
let score: Score | null = null
let musicOn = true
const $ = (id: string) => document.getElementById(id)!
const btnPlay = $('btnPlay'), timeEl = $('time'), chaptersEl = $('chapters'), hint = $('hint')
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

const chapEls = CHAPTERS.map((c, i) => {
  const end = i < CHAPTERS.length - 1 ? CHAPTERS[i + 1].t : TOTAL
  const el = document.createElement('div'); el.className = 'chap'; el.style.flex = String(end - c.t)
  el.innerHTML = `<span>${c.name}</span><div class="bar"><div class="fill"></div></div>`
  el.addEventListener('click', (e) => {
    const r = el.getBoundingClientRect()
    const f = clamp((e.clientX - r.left) / r.width)
    seek(c.t + f * (end - c.t) * 0.98)
  })
  chaptersEl.appendChild(el)
  return { el, fill: el.querySelector('.fill') as HTMLElement, a: c.t, b: end }
})

function ensureScore() {
  if (!score) { try { score = new Score(); score.start(); score.setMuted(!musicOn) } catch { score = null } }
}
function setPlaying(p: boolean) {
  playing = p
  btnPlay.textContent = p ? '❚❚' : '▶'
  if (p && exploring) setExplore(false)
  if (score) { if (p) score.resume(); else score.pause() }
}
function seek(nt: number) { t = clamp(nt, 0, TOTAL - 0.01); if (exploring) setExplore(false); if (!playing) setPlaying(true) }
function setExplore(on: boolean) {
  exploring = on
  controls.enabled = on
  $('btnExplore').classList.toggle('on', on)
  hint.classList.toggle('hidden', !on)
  hotspotLayer.style.display = on ? 'block' : 'none'
  if (on) {
    if (playing) { playing = false; btnPlay.textContent = '▶'; score?.pause() }
    controls.target.copy(camLook)
    controls.update()
  }
}
btnPlay.addEventListener('click', () => { ensureScore(); setPlaying(!playing) })
$('btnExplore').addEventListener('click', () => setExplore(!exploring))
$('btnSound').addEventListener('click', () => {
  musicOn = !musicOn
  ;($('btnSound').querySelector('span') as HTMLElement).textContent = musicOn ? 'Music on' : 'Music off'
  $('btnSound').classList.toggle('on', !musicOn)
  ensureScore(); score?.setMuted(!musicOn)
})
glCanvas.addEventListener('pointerdown', () => { if (started && !exploring && !recording) setExplore(true) })

function begin(explore: boolean) {
  started = true
  $('start').classList.add('gone')
  ensureScore()
  if (explore) { t = 6; setExplore(true); camera.position.set(-30, 26, 48); controls.target.set(4, 1, 0); controls.update() }
  else { t = 0; setPlaying(true) }
}
$('btnStart').addEventListener('click', () => begin(false))
$('btnStartExplore').addEventListener('click', () => begin(true))
window.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); if (!started) begin(false); else { ensureScore(); setPlaying(!playing) } }
  if (e.code === 'ArrowRight') seek(t + 5)
  if (e.code === 'ArrowLeft') seek(t - 5)
})

// auto-hide UI while the film plays
let lastMove = performance.now()
window.addEventListener('pointermove', () => { lastMove = performance.now() })
const uiEls = Array.from(document.querySelectorAll('.ui'))

// hotspots (explore mode)
const hotspotLayer = $('hotspots')
hotspotLayer.style.display = 'none'
const HOTSPOTS: { label: string; pos: () => THREE.Vector3; t: number }[] = [
  { label: "Kamala's home", pos: () => world.kamalaHouse.clone().setY(5.6), t: 8 },
  { label: 'ASHA worker + SAATHI app', pos: () => A.head.getWorldPosition(new THREE.Vector3()).add(v3(0, 0.45, 0)), t: 24 },
  { label: 'Wearable knee sensor', pos: () => sensor.getWorldPosition(new THREE.Vector3()).add(v3(0, 0.25, 0)), t: 44 },
  { label: 'Mobile tower · sync', pos: () => world.towerTop.clone().add(v3(0, 2, 0)), t: 61.6 },
  { label: 'PHC Rampur', pos: () => world.phc.clone().setY(9), t: 61.6 },
  { label: 'Architecture', pos: () => v3(0, 72, 0), t: 64 },
]
const hsEls = HOTSPOTS.map(h => {
  const el = document.createElement('div'); el.className = 'hotspot'
  el.innerHTML = `<b>${h.label}</b><i></i>`
  el.addEventListener('pointerdown', e => e.stopPropagation())
  el.addEventListener('click', () => seek(h.t))
  hotspotLayer.appendChild(el)
  return el
})

/* =============================== recording =============================== */
let recording = false
let recorder: MediaRecorder | null = null
let comp: HTMLCanvasElement | null = null, compCtx: CanvasRenderingContext2D | null = null
const recChunks: Blob[] = []
function startRecording() {
  if (recording) return
  if (typeof MediaRecorder === 'undefined') { alert('Video recording is not supported in this browser. Try Chrome or Edge.'); return }
  ensureScore()
  fixedSize = [1920, 1080]; resize()
  comp = document.createElement('canvas'); comp.width = 1920; comp.height = 1080
  compCtx = comp.getContext('2d')!
  const stream = comp.captureStream(30)
  score?.stream.stream.getAudioTracks().forEach(tr => stream.addTrack(tr))
  const types = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
  const mime = types.find(m => MediaRecorder.isTypeSupported(m)) ?? ''
  recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 14_000_000 } : undefined)
  recChunks.length = 0
  recorder.ondataavailable = e => { if (e.data.size) recChunks.push(e.data) }
  recorder.onstop = () => {
    const type = recorder?.mimeType || 'video/webm'
    const blob = new Blob(recChunks, { type })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = `SAATHI-3D-demo.${type.includes('mp4') ? 'mp4' : 'webm'}`
    document.body.appendChild(a); a.click(); a.remove()
    fixedSize = null; resize()
    $('recBadge').classList.add('hidden'); $('btnRecord').classList.remove('on')
  }
  if (exploring) setExplore(false)
  t = 0; recording = true
  setPlaying(true)
  recorder.start(1000)
  $('recBadge').classList.remove('hidden'); $('btnRecord').classList.add('on')
}
function stopRecording() { if (!recording) return; recording = false; recorder?.stop() }
$('btnRecord').addEventListener('click', () => { if (!started) begin(false); if (recording) stopRecording(); else startRecording() })

/* =============================== main loop =============================== */
let last = performance.now()
cameraAt(0, camPos, camLook); camera.position.copy(camPos); camera.lookAt(camLook)

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now
  if (playing) {
    t += dt
    if (t >= TOTAL) {
      if (recording) { t = TOTAL - 0.001; stopRecording(); setPlaying(false) }
      else { t = TOTAL - 0.001; setPlaying(false) }
    }
  }
  world.update(now / 1000, dt)
  animateCast(t)
  arch.update(exploring ? 79 : t)
  impact.update(t)
  if (exploring) {
    controls.update()
    camLook.copy(controls.target)
  } else {
    cameraAt(t, camPos, camLook)
    camera.position.copy(camPos)
    camera.lookAt(camLook)
  }
  camera.updateMatrixWorld()
  updateHeroPhone(exploring ? Math.min(t, 23.9) : t)
  phoneKit.render(t)

  renderer.clear()
  renderer.render(scene, camera)
  renderer.clearDepth()
  renderer.render(ui, camera)
  drawOverlay(exploring ? -10 : t)
  if (recording && compCtx) { compCtx.drawImage(glCanvas, 0, 0, 1920, 1080); compCtx.drawImage(overlay, 0, 0, 1920, 1080); $('recTime').textContent = `${fmt(t)} / ${fmt(TOTAL)}` }

  // UI state
  timeEl.textContent = `${fmt(t)} / ${fmt(TOTAL)}`
  const ci = chapterAt(t)
  chapEls.forEach((c, i) => { c.fill.style.width = `${clamp((t - c.a) / (c.b - c.a)) * 100}%`; c.el.classList.toggle('active', i === ci) })
  const idle = started && playing && !exploring && now - lastMove > 2600
  uiEls.forEach(el => el.classList.toggle('idle', idle || recording))
  if (exploring) {
    const rect = glCanvas.getBoundingClientRect()
    HOTSPOTS.forEach((h, i) => {
      const p = h.pos().project(camera)
      const vis = p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05
      hsEls[i].style.display = vis ? 'flex' : 'none'
      if (vis) { hsEls[i].style.left = `${rect.left + (p.x * 0.5 + 0.5) * rect.width}px`; hsEls[i].style.top = `${rect.top + (-p.y * 0.5 + 0.5) * rect.height}px` }
    })
  }
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)

// expose for debugging / screenshots
;(window as unknown as { saathi: unknown }).saathi = { seek: (s: number) => { t = s }, get t() { return t }, play: () => setPlaying(true), pause: () => setPlaying(false), SCREENS, easeOut }
