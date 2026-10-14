import * as THREE from 'three'
import { mat, mesh, rng, v3 } from './util'

export const SUN_DIR = new THREE.Vector3(0.55, 0.5, 0.66).normalize()

function rotm(m: THREE.Mesh, axis: 'x' | 'y' | 'z', v: number) { m.rotation[axis] = v; return m }

export function groundHeight(x: number, z: number) {
  const hill = Math.max(0, Math.hypot(x, z) - 160) / 240
  return hill > 0 ? (Math.sin(x * 0.018) * Math.cos(z * 0.021) + 1) * 14 * Math.min(1, hill) + hill * 6 : 0
}

export const WALLS = ['#E84C8B', '#2EC4B6', '#FFB703', '#3A86FF', '#FB8500', '#8AC926', '#F15BB5', '#00B4D8', '#FF6B6B', '#9B5DE5', '#06D6A0', '#FFD166']
const FLAG = ['#FF9933', '#FFFFFF', '#138808', '#E84C8B', '#FFB703', '#3A86FF', '#9B5DE5', '#FB5607']

export interface World {
  road: THREE.CatmullRomCurve3
  kamalaHouse: THREE.Vector3
  charpai: THREE.Vector3
  phc: THREE.Vector3
  tower: THREE.Vector3
  towerTop: THREE.Vector3
  update: (t: number, dt: number) => void
}

function sky(scene: THREE.Scene) {
  const geo = new THREE.SphereGeometry(950, 32, 16)
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color('#3E9BE8') }, mid: { value: new THREE.Color('#9FD3F5') },
      horizon: { value: new THREE.Color('#FFD9A8') }, sun: { value: SUN_DIR.clone() },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; uniform vec3 sun; varying vec3 vDir;
      void main(){ float h = vDir.y;
        vec3 c = mix(horizon, mid, smoothstep(-0.02, 0.18, h));
        c = mix(c, top, smoothstep(0.18, 0.75, h));
        float s = max(dot(normalize(vDir), normalize(sun)), 0.0);
        c += vec3(1.0,0.75,0.45)*pow(s, 18.0)*0.35 + vec3(1.0,0.95,0.8)*pow(s, 600.0)*1.5;
        if (h < 0.0) c = mix(horizon, vec3(0.75,0.72,0.55), smoothstep(0.0,-0.2,h));
        gl_FragColor = vec4(c,1.0); }`,
  })
  scene.add(new THREE.Mesh(geo, m))
}

function triPrism(w: number, h: number, len: number) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false })
  g.translate(0, 0, -len / 2)
  return g
}

function toran(g: THREE.Group, width: number, y: number, z: number) {
  // marigold garland + mango leaves over the door
  const n = 11
  for (let i = 0; i < n; i++) {
    const x = -width / 2 + (width * i) / (n - 1)
    const sag = Math.sin((i / (n - 1)) * Math.PI) * 0.18
    g.add(mesh(new THREE.IcosahedronGeometry(0.075, 0), mat(i % 2 ? '#FF8C00' : '#FFC300'), x, y - sag, z, false))
    if (i % 2 === 0) {
      const leaf = mesh(new THREE.ConeGeometry(0.05, 0.22, 4), mat('#2E8B3D'), x, y - sag - 0.16, z, false)
      leaf.rotation.x = Math.PI
      g.add(leaf)
    }
  }
}

export function house(x: number, z: number, rotY: number, wall: string, kind: 'tile' | 'flat' | 'hut', w = 5, d = 4, h = 3) {
  const g = new THREE.Group()
  g.position.set(x, 0, z); g.rotation.y = rotY
  if (kind === 'hut') {
    const r = 1.8
    g.add(mesh(new THREE.CylinderGeometry(r, r * 1.05, 2.1, 10), mat('#C98B5A'), 0, 1.05, 0))
    g.add(mesh(new THREE.CylinderGeometry(r * 1.07, r * 1.07, 0.35, 10), mat(wall), 0, 0.17, 0))
    g.add(mesh(new THREE.ConeGeometry(r * 1.45, 2.2, 10), mat('#D9B26A'), 0, 3.1, 0))
    g.add(mesh(new THREE.BoxGeometry(0.8, 1.4, 0.2), mat('#5A3A22'), 0, 0.7, r))
    return g
  }
  // plinth + walls
  g.add(mesh(new THREE.BoxGeometry(w + 0.5, 0.35, d + 0.5), mat('#C9A27A'), 0, 0.17, 0))
  g.add(mesh(new THREE.BoxGeometry(w, h, d), mat(wall), 0, 0.35 + h / 2, 0))
  // base band and top band (painted)
  g.add(mesh(new THREE.BoxGeometry(w + 0.04, 0.45, d + 0.04), mat('#B5482A'), 0, 0.57, 0, false))
  g.add(mesh(new THREE.BoxGeometry(w + 0.04, 0.18, d + 0.04), mat('#FFFFFF'), 0, 0.35 + h - 0.2, 0, false))
  // door
  g.add(mesh(new THREE.BoxGeometry(1.0, 1.9, 0.12), mat('#6B3E1F'), 0, 0.35 + 0.95, d / 2 + 0.03, false))
  g.add(mesh(new THREE.BoxGeometry(1.25, 0.12, 0.16), mat('#FFFFFF'), 0, 0.35 + 1.95, d / 2 + 0.04, false))
  toran(g, 1.3, 0.35 + 1.85, d / 2 + 0.12)
  // windows
  for (const sx of [-1, 1]) {
    const wx = sx * (w / 2 - 1.0)
    g.add(mesh(new THREE.BoxGeometry(0.85, 0.85, 0.1), mat('#FFFFFF'), wx, 0.35 + 1.6, d / 2 + 0.03, false))
    g.add(mesh(new THREE.BoxGeometry(0.65, 0.65, 0.12), mat(sx > 0 ? '#1F6F8B' : '#2A9D8F'), wx, 0.35 + 1.6, d / 2 + 0.04, false))
  }
  // side window
  g.add(mesh(new THREE.BoxGeometry(0.1, 0.7, 0.7), mat('#1F6F8B'), w / 2 + 0.03, 0.35 + 1.6, 0, false))
  if (kind === 'tile') {
    const rg = triPrism(d + 0.9, 1.5, w + 0.9); rg.rotateY(Math.PI / 2)
    g.add(mesh(rg, mat('#B5482A'), 0, 0.35 + h, 0))
    // ridge
    g.add(mesh(new THREE.BoxGeometry(w + 1.0, 0.2, 0.2), mat('#8E3420'), 0, 0.35 + h + 1.5, 0, false))
  } else {
    // flat roof with parapet and water tank
    g.add(mesh(new THREE.BoxGeometry(w + 0.2, 0.5, d + 0.2), mat(wall), 0, 0.35 + h + 0.25, 0))
    g.add(mesh(new THREE.BoxGeometry(w - 0.3, 0.3, d - 0.3), mat('#D8CBB5'), 0, 0.35 + h + 0.4, 0, false))
    g.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.9, 10), mat('#1B1B1B', { rough: 0.5 }), w / 2 - 0.9, 0.35 + h + 0.95, -d / 2 + 0.9))
  }
  return g
}

function palm(x: number, z: number, h: number, r: () => number) {
  const g = new THREE.Group(); g.position.set(x, 0, z)
  const lean = (r() - 0.5) * 0.5
  let px = 0, py = 0
  const segs = 6
  for (let i = 0; i < segs; i++) {
    const sh = h / segs
    const m = mesh(new THREE.CylinderGeometry(0.17 - i * 0.012, 0.22 - i * 0.012, sh, 6), mat(i % 2 ? '#8B6B45' : '#7A5C3A'), px, py + sh / 2, 0)
    m.rotation.z = -lean * (i / segs)
    g.add(m)
    px += Math.sin(lean * (i / segs)) * sh; py += sh * 0.98
  }
  const crown = new THREE.Group(); crown.position.set(px, py, 0); g.add(crown)
  for (let i = 0; i < 8; i++) {
    const leaf = mesh(new THREE.BoxGeometry(0.35, 0.04, 2.6), mat(i % 2 ? '#2F8F3A' : '#3FA34D'), 0, 0, 1.2, true)
    const holder = new THREE.Group(); holder.rotation.y = (i / 8) * Math.PI * 2; holder.add(leaf)
    leaf.rotation.x = 0.45
    leaf.position.set(0, -0.45, 1.15)
    crown.add(holder)
  }
  for (let i = 0; i < 3; i++) crown.add(mesh(new THREE.SphereGeometry(0.16, 6, 5), mat('#6B8E23'), Math.cos(i * 2) * 0.2, -0.2, Math.sin(i * 2) * 0.2))
  g.userData.crown = crown
  return g
}

function neem(x: number, z: number, s: number, r: () => number) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s)
  g.add(mesh(new THREE.CylinderGeometry(0.22, 0.32, 2.4, 6), mat('#6E4B2E'), 0, 1.2, 0))
  const greens = ['#3F9A3A', '#4CAF50', '#2E7D32', '#5DBB46']
  for (let i = 0; i < 4; i++) {
    const b = mesh(new THREE.IcosahedronGeometry(1.1 + r() * 0.5, 0), mat(greens[i % 4]), (r() - 0.5) * 1.6, 2.8 + r() * 1.0, (r() - 0.5) * 1.6)
    g.add(b)
  }
  return g
}

function banyan(x: number, z: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z)
  g.add(mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.6, 16), mat('#D9C3A0'), 0, 0.3, 0))
  g.add(mesh(new THREE.CylinderGeometry(3.85, 3.85, 0.12, 16), mat('#E84C8B'), 0, 0.62, 0, false))
  g.add(mesh(new THREE.CylinderGeometry(0.7, 1.0, 4.5, 8), mat('#6A4A30'), 0, 2.6, 0))
  const r = rng(7)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, rad = 2.5 + r() * 2.5
    g.add(mesh(new THREE.IcosahedronGeometry(2.2 + r() * 1.2, 1), mat(i % 3 === 0 ? '#2E7D32' : i % 3 === 1 ? '#388E3C' : '#43A047'), Math.cos(a) * rad, 5.4 + r() * 1.5, Math.sin(a) * rad))
  }
  g.add(mesh(new THREE.IcosahedronGeometry(3.2, 1), mat('#2E7D32'), 0, 7.2, 0))
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2, rad = 2 + r() * 3.5
    g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.5, 4), mat('#7A5A40'), Math.cos(a) * rad, 2.6, Math.sin(a) * rad, false))
  }
  // sacred threads on trunk
  g.add(rotm(mesh(new THREE.TorusGeometry(0.85, 0.06, 6, 16), mat('#D7263D'), 0, 2.0, 0, false), 'x', Math.PI / 2))
  return g
}

function temple(x: number, z: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI
  g.add(mesh(new THREE.BoxGeometry(7, 0.8, 7), mat('#E8DCC4'), 0, 0.4, 0))
  g.add(mesh(new THREE.BoxGeometry(7.2, 0.16, 7.2), mat('#FF9933'), 0, 0.82, 0, false))
  g.add(mesh(new THREE.BoxGeometry(4, 3.2, 4), mat('#FFF7E8'), 0, 2.4, 0))
  g.add(mesh(new THREE.BoxGeometry(1.2, 2, 0.2), mat('#7A1F1F'), 0, 1.8, 2.02, false))
  // shikhara
  for (let i = 0; i < 5; i++) {
    const s = 2.3 - i * 0.38
    const m = mesh(new THREE.CylinderGeometry(s * 0.82, s, 1.0, 4), mat(i % 2 ? '#FF9933' : '#FFF1D6'), 0, 4.5 + i * 0.95, 0)
    m.rotation.y = Math.PI / 4
    g.add(m)
  }
  g.add(mesh(new THREE.SphereGeometry(0.35, 10, 8), mat('#E0A526', { metal: 0.6, rough: 0.35 }), 0, 9.4, 0))
  g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 4), mat('#5A3A22'), 0, 10.4, 0, false))
  const flagShape = new THREE.Shape(); flagShape.moveTo(0, 0); flagShape.lineTo(1.4, -0.35); flagShape.lineTo(0, -0.8); flagShape.closePath()
  const flag = new THREE.Mesh(new THREE.ShapeGeometry(flagShape), new THREE.MeshStandardMaterial({ color: '#FF7A00', side: THREE.DoubleSide }))
  flag.position.set(0.04, 11.45, 0)
  g.add(flag)
  // diyas / bells
  for (const sx of [-1.6, 1.6]) g.add(mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.0, 8), mat('#FF6B6B'), sx, 1.3, 2.4))
  g.userData.flag = flag
  return g
}

function well(x: number, z: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z)
  g.add(mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.9, 14, 1, true), mat('#A89A8A'), 0, 0.45, 0))
  g.add(rotm(mesh(new THREE.TorusGeometry(1.0, 0.14, 6, 18), mat('#BDB0A0'), 0, 0.9, 0), 'x', Math.PI / 2))
  g.add(rotm(mesh(new THREE.CircleGeometry(0.95, 14), mat('#2B6F8F', { rough: 0.2 }), 0, 0.5, 0, false), 'x', -Math.PI / 2))
  for (const sx of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.15, 2.2, 0.15), mat('#6E4B2E'), sx * 1.0, 1.1, 0))
  g.add(rotm(mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 6), mat('#6E4B2E'), 0, 2.1, 0), 'z', Math.PI / 2))
  g.add(mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.3, 8), mat('#C0C0C0', { metal: 0.8, rough: 0.3 }), 0, 1.4, 0))
  // brass pots
  g.add(mesh(new THREE.SphereGeometry(0.25, 10, 8), mat('#D4A017', { metal: 0.7, rough: 0.3 }), 1.4, 0.25, 0.4))
  return g
}

function cow(x: number, z: number, rot: number, hornColor: string) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot
  const white = mat('#F2EFE8')
  g.add(mesh(new THREE.BoxGeometry(0.75, 0.7, 1.6), white, 0, 1.05, 0))
  g.add(mesh(new THREE.BoxGeometry(0.4, 0.45, 0.35), mat('#E8E2D6'), 0, 1.45, 0.25, false)) // hump
  g.add(mesh(new THREE.BoxGeometry(0.42, 0.45, 0.55), white, 0, 1.3, 1.0))
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.22, 0.2), mat('#C9A9A0'), 0, 1.18, 1.3, false))
  for (const sx of [-1, 1]) {
    const horn = mesh(new THREE.ConeGeometry(0.05, 0.38, 5), mat(hornColor), sx * 0.15, 1.65, 0.95, false)
    horn.rotation.z = -sx * 0.4
    g.add(horn)
    for (const sz of [-0.6, 0.6]) g.add(mesh(new THREE.BoxGeometry(0.16, 0.75, 0.16), white, sx * 0.25, 0.37, sz))
  }
  g.add(mesh(new THREE.TorusGeometry(0.24, 0.04, 5, 12), mat('#FF8C00'), 0, 1.15, 0.85, false))
  return g
}

function charpai(x: number, z: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z)
  const wood = mat('#8B5A2B')
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 6), wood, sx * 0.95, 0.22, sz * 0.42))
  for (const sz of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(2.05, 0.08, 0.08), wood, 0, 0.44, sz * 0.42))
  for (const sx of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.08, 0.08, 0.92), wood, sx * 0.98, 0.44, 0))
  g.add(mesh(new THREE.BoxGeometry(1.9, 0.04, 0.8), mat('#E9D8A6'), 0, 0.45, 0))
  // woven pattern stripes
  for (let i = -4; i <= 4; i++) g.add(mesh(new THREE.BoxGeometry(0.06, 0.045, 0.8), mat(i % 2 ? '#E84C8B' : '#2EC4B6'), i * 0.2, 0.455, 0, false))
  return g
}

function rangoli(x: number, z: number, radius: number) {
  const c = document.createElement('canvas'); c.width = c.height = 512
  const ctx = c.getContext('2d')!
  const cx = 256, cy = 256
  const cols = ['#E84C8B', '#FFB703', '#2EC4B6', '#FB5607', '#9B5DE5', '#FFFFFF', '#8AC926']
  for (let ring = 6; ring >= 0; ring--) {
    const R = 40 + ring * 34
    const petals = 8 + ring * 2
    ctx.fillStyle = cols[ring % cols.length]
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2
      ctx.beginPath()
      ctx.ellipse(cx + Math.cos(a) * R * 0.75, cy + Math.sin(a) * R * 0.75, R * 0.32, R * 0.14, a, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2); ctx.fillStyle = cols[(ring + 3) % cols.length]; ctx.fill()
  }
  ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fillStyle = '#FFD166'; ctx.fill()
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9 }))
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.04, z); m.receiveShadow = true
  return m
}

function phcBuilding(x: number, z: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI * 0.92
  g.add(mesh(new THREE.BoxGeometry(12, 0.5, 8), mat('#CFC6B8'), 0, 0.25, 0))
  g.add(mesh(new THREE.BoxGeometry(11, 4.2, 7), mat('#F7F7F2'), 0, 2.6, 0))
  g.add(mesh(new THREE.BoxGeometry(11.05, 0.5, 7.05), mat('#00685F'), 0, 1.1, 0, false))
  g.add(mesh(new THREE.BoxGeometry(11.6, 0.4, 7.6), mat('#E9E9E2'), 0, 4.9, 0))
  g.add(mesh(new THREE.BoxGeometry(2.0, 2.4, 0.2), mat('#99EFE5', { rough: 0.3 }), 0, 1.7, 3.55, false))
  for (const sx of [-3.6, -2, 2, 3.6]) g.add(mesh(new THREE.BoxGeometry(1.0, 1.0, 0.15), mat('#2A5DA8', { rough: 0.3 }), sx, 2.8, 3.55, false))
  // sign board
  const c = document.createElement('canvas'); c.width = 512; c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#00685F'; ctx.fillRect(0, 0, 512, 128)
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(28, 34, 60, 60)
  ctx.fillStyle = '#D7263D'; ctx.fillRect(50, 40, 16, 48); ctx.fillRect(34, 56, 48, 16)
  ctx.fillStyle = '#FFFFFF'; ctx.font = '700 58px Inter, system-ui, sans-serif'; ctx.textBaseline = 'middle'
  ctx.fillText('PHC Rampur', 110, 66)
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace
  const board = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: tex }))
  board.position.set(0, 5.9, 3.0)
  g.add(board)
  for (const sx of [-2.6, 2.6]) g.add(mesh(new THREE.BoxGeometry(0.15, 1.6, 0.15), mat('#555555'), sx, 5.3, 3.0, false))
  // ambulance-ish van
  const van = new THREE.Group(); van.position.set(-7.5, 0, 4.5); van.rotation.y = 0.3
  van.add(mesh(new THREE.BoxGeometry(2, 1.8, 4), mat('#FFFFFF'), 0, 1.3, 0))
  van.add(mesh(new THREE.BoxGeometry(2.02, 0.35, 4.02), mat('#D7263D'), 0, 1.1, 0, false))
  van.add(mesh(new THREE.BoxGeometry(1.8, 0.7, 0.1), mat('#2A5DA8', { rough: 0.2 }), 0, 1.75, 2.0, false))
  for (const sx of [-1, 1]) for (const sz of [-1.3, 1.3]) {
    const w = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 12), mat('#222222'), sx * 1.0, 0.38, sz)
    w.rotation.z = Math.PI / 2; van.add(w)
  }
  g.add(van)
  return g
}

function tower(x: number, z: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z)
  const H = 26
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const leg = mesh(new THREE.CylinderGeometry(0.12, 0.18, H, 5), mat('#9AA4AA', { metal: 0.6, rough: 0.4 }), Math.cos(a) * 1.1, H / 2, Math.sin(a) * 1.1)
    leg.rotation.z = Math.cos(a) * 0.05; leg.rotation.x = -Math.sin(a) * 0.05
    g.add(leg)
  }
  for (let k = 1; k < 9; k++) {
    const y = (k / 9) * H
    const ring = mesh(new THREE.TorusGeometry(1.1 - k * 0.07, 0.06, 4, 4), mat(k % 2 ? '#D7263D' : '#FFFFFF'), 0, y, 0, false)
    ring.rotation.x = Math.PI / 2; ring.rotation.z = Math.PI / 4
    g.add(ring)
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    g.add(mesh(new THREE.BoxGeometry(0.4, 1.8, 0.25), mat('#E8E8E8'), Math.cos(a) * 0.8, H - 1.5, Math.sin(a) * 0.8))
  }
  g.add(mesh(new THREE.SphereGeometry(0.25, 8, 6), mat('#FF2D2D', { emissive: '#FF2D2D', ei: 2 }), 0, H + 0.3, 0, false))
  return g
}

function scooterlessCart(x: number, z: number, rot: number) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot
  g.add(mesh(new THREE.BoxGeometry(1.8, 0.2, 2.6), mat('#9C6B3C'), 0, 1.0, 0))
  for (const sx of [-1, 1]) {
    g.add(mesh(new THREE.BoxGeometry(0.1, 0.5, 2.6), mat('#7A4F2A'), sx * 0.9, 1.3, 0))
    const wheel = mesh(new THREE.TorusGeometry(0.75, 0.08, 6, 16), mat('#5A3A22'), sx * 1.05, 0.78, 0)
    wheel.rotation.y = Math.PI / 2; g.add(wheel)
    for (let s = 0; s < 4; s++) { const sp = mesh(new THREE.BoxGeometry(0.05, 1.45, 0.05), mat('#5A3A22'), sx * 1.05, 0.78, 0, false); sp.rotation.x = (s / 4) * Math.PI; g.add(sp) }
  }
  g.add(mesh(new THREE.BoxGeometry(0.12, 0.12, 2.6), mat('#7A4F2A'), 0, 0.95, 2.4))
  g.add(mesh(new THREE.ConeGeometry(0.9, 1.1, 8), mat('#E9C46A'), 0, 1.65, -0.2))
  return g
}

function bunting(group: THREE.Group, a: THREE.Vector3, b: THREE.Vector3, r: () => number) {
  for (const p of [a, b]) group.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, p.y, 5), mat('#6E4B2E'), p.x, p.y / 2, p.z))
  const n = 26
  const tri = new THREE.Shape(); tri.moveTo(-0.17, 0); tri.lineTo(0.17, 0); tri.lineTo(0, -0.42); tri.closePath()
  const geo = new THREE.ShapeGeometry(tri)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= n; i++) {
    const u = i / n
    const p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 1.2
    pts.push(p)
    if (i > 0 && i < n) {
      const f = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: FLAG[Math.floor(r() * FLAG.length)], side: THREE.DoubleSide, roughness: 0.8 }))
      f.position.copy(p)
      f.lookAt(p.x + (b.z - a.z), p.y, p.z - (b.x - a.x))
      f.userData.phase = r() * 6
      group.add(f)
    }
  }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#444' }))
  group.add(line)
}

export function buildWorld(scene: THREE.Scene): World {
  scene.background = new THREE.Color('#FFD9A8')
  scene.fog = new THREE.Fog('#F7DDB8', 140, 620)
  sky(scene)

  // lights
  scene.add(new THREE.HemisphereLight('#CFE8FF', '#B08550', 1.25))
  const sun = new THREE.DirectionalLight('#FFE3B5', 2.6)
  sun.position.copy(SUN_DIR).multiplyScalar(120)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const sc = sun.shadow.camera as THREE.OrthographicCamera
  sc.left = -75; sc.right = 75; sc.top = 75; sc.bottom = -75; sc.near = 10; sc.far = 320
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04
  scene.add(sun); scene.add(sun.target)

  const r = rng(42)
  const world = new THREE.Group(); scene.add(world)

  // ground with vertex colours + distant rolling hills
  const gGeo = new THREE.PlaneGeometry(1400, 1400, 140, 140)
  gGeo.rotateX(-Math.PI / 2)
  const pos = gGeo.attributes.position as THREE.BufferAttribute
  const cols: number[] = []
  const cA = new THREE.Color('#86B84A'), cB = new THREE.Color('#A7C957'), cDirt = new THREE.Color('#D8B07A'), tmp = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    pos.setY(i, groundHeight(x, z) - 0.02)
    tmp.copy(cA).lerp(cB, (Math.sin(x * 0.07) * Math.cos(z * 0.05) + 1) / 2)
    const dirt = Math.max(0, 1 - Math.hypot(x / 70, z / 28))
    tmp.lerp(cDirt, Math.min(1, dirt * 1.3))
    cols.push(tmp.r, tmp.g, tmp.b)
  }
  gGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
  gGeo.computeVertexNormals()
  const ground = new THREE.Mesh(gGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: false }))
  ground.receiveShadow = true
  world.add(ground)

  // mountains
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + r() * 0.2
    const rad = 430 + r() * 120, hgt = 70 + r() * 90
    const m = mesh(new THREE.ConeGeometry(hgt * 1.3, hgt, 7), mat(i % 3 ? '#6F9F6B' : '#5E8C7A'), Math.cos(a) * rad, hgt / 2 - 5, Math.sin(a) * rad, false)
    m.rotation.y = r() * 3
    world.add(m)
  }

  // road
  const road = new THREE.CatmullRomCurve3([v3(-110, 0, 46), v3(-70, 0, 30), v3(-40, 0, 18), v3(-15, 0, 8), v3(0, 0, 6), v3(20, 0, 4), v3(45, 0, -6), v3(75, 0, -20), v3(110, 0, -30)])
  {
    const N = 300, W = 4.4
    const verts: number[] = [], idx: number[] = []
    for (let i = 0; i <= N; i++) {
      const u = i / N
      const p = road.getPointAt(u), tg = road.getTangentAt(u)
      const nx = -tg.z, nz = tg.x
      verts.push(p.x + nx * W / 2, 0.03, p.z + nz * W / 2, p.x - nx * W / 2, 0.03, p.z - nz * W / 2)
      if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2) }
    }
    const rg = new THREE.BufferGeometry()
    rg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); rg.setIndex(idx); rg.computeVertexNormals()
    const rm = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: '#C8955E', roughness: 1, side: THREE.DoubleSide }))
    rm.receiveShadow = true
    world.add(rm)
  }
  const roadZ = (x: number) => { let best = 0, bd = 1e9; for (let i = 0; i <= 200; i++) { const p = road.getPointAt(i / 200); const d = Math.abs(p.x - x); if (d < bd) { bd = d; best = p.z } } return best }

  // fields (mustard, paddy, wheat, sugarcane, ploughed)
  const crops = {
    mustard: { base: '#7FAE3A', inst: [] as THREE.Matrix4[], geo: new THREE.IcosahedronGeometry(0.32, 0), mat: mat('#F6C915') },
    paddy: { base: '#4E9A3A', inst: [] as THREE.Matrix4[], geo: new THREE.ConeGeometry(0.18, 0.8, 4), mat: mat('#6CC24A') },
    cane: { base: '#5D8A2E', inst: [] as THREE.Matrix4[], geo: new THREE.CylinderGeometry(0.08, 0.1, 1.9, 4), mat: mat('#7DAA3C') },
    marigold: { base: '#5E8C2E', inst: [] as THREE.Matrix4[], geo: new THREE.IcosahedronGeometry(0.26, 0), mat: mat('#FF8C00') },
  }
  const kinds = ['mustard', 'paddy', 'wheat', 'mustard', 'paddy', 'cane', 'plough', 'marigold'] as const
  const addPlot = (x0: number, z0: number, w: number, d: number) => {
    const k = kinds[Math.floor(r() * kinds.length)]
    const base = k === 'wheat' ? '#D9B85C' : k === 'plough' ? '#9A6B3E' : crops[k as keyof typeof crops].base
    world.add(mesh(new THREE.BoxGeometry(w, 0.14, d), mat(base), x0 + w / 2, 0.05, z0 + d / 2, false))
    if (k === 'wheat' || k === 'plough') {
      for (let row = 0.6; row < d; row += 1.2) world.add(mesh(new THREE.BoxGeometry(w - 0.6, 0.12, 0.3), mat(k === 'wheat' ? '#E6C66A' : '#7E5530'), x0 + w / 2, 0.15, z0 + row, false))
      return
    }
    const c = crops[k as keyof typeof crops]
    const step = k === 'cane' ? 0.9 : 1.1
    for (let xx = 0.5; xx < w - 0.3; xx += step) for (let zz = 0.5; zz < d - 0.3; zz += step) {
      const m4 = new THREE.Matrix4()
      const s = 0.8 + r() * 0.5
      m4.compose(v3(x0 + xx + (r() - 0.5) * 0.3, k === 'cane' ? 1.0 : 0.4 * s, z0 + zz + (r() - 0.5) * 0.3), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 3, 0)), v3(s, s, s))
      c.inst.push(m4)
    }
  }
  for (let gx = -11; gx < 11; gx++) for (let gz = 0; gz < 5; gz++) {
    const x0 = gx * 11, z0 = -30 - gz * 11
    if (x0 > -42 && x0 < -12 && z0 > -32) continue
    addPlot(x0, z0, 10, 10)
  }
  for (let gx = 0; gx < 9; gx++) for (let gz = 0; gz < 4; gz++) {
    const x0 = -4 + gx * 11, z0 = 24 + gz * 11 - gx * 1.5
    if (z0 < roadZ(x0 + 5) + 16) continue
    addPlot(x0, z0, 10, 10)
  }
  for (const c of Object.values(crops)) {
    const im = new THREE.InstancedMesh(c.geo, c.mat, c.inst.length)
    c.inst.forEach((m4, i) => im.setMatrixAt(i, m4))
    im.castShadow = false; im.receiveShadow = true
    world.add(im)
  }

  // houses — left (north) side face the road, right side face back
  const kamalaHouse = v3(4, 0, -3.2)
  world.add(house(kamalaHouse.x, kamalaHouse.z, 0, '#2EC4B6', 'tile', 6, 4.5, 3.2))
  const leftX = [-58, -46, -37, -28, -19, -10, 16, 25, 34, 43, 52]
  leftX.forEach((x, i) => world.add(house(x, roadZ(x) - 7.5 - r() * 1.5, (r() - 0.5) * 0.15, WALLS[(i * 5) % WALLS.length], r() > 0.5 ? 'tile' : 'flat', 4.5 + r() * 1.5, 4, 2.8 + r() * 0.6)))
  const rightX = [-56, -44, -35, -26, -17, 0, 7, 28, 37, 46]
  rightX.forEach((x, i) => world.add(house(x, roadZ(x) + 8 + r() * 1.5, Math.PI + (r() - 0.5) * 0.15, WALLS[(i * 7 + 3) % WALLS.length], r() > 0.55 ? 'tile' : 'flat', 4.5 + r() * 1.5, 4, 2.8 + r() * 0.6)))
  // huts
  const huts: [number, number][] = [[-50, -14], [-6, -14], [24, -16], [60, 14], [-62, 4], [12, 26]]
  huts.forEach(([x, z], i) => world.add(house(x, z, r() * 6, WALLS[(i * 3) % WALLS.length], 'hut')))
  for (const [x, z] of [[-3, -12], [-8, -15], [27, -20], [58, 18]]) world.add(mesh(new THREE.ConeGeometry(1.4, 2.4, 8), mat('#E2B74F'), x, 1.2, z))
  world.add(scooterlessCart(-1, -16, 0.6))

  // landmarks
  const tmpl = temple(17, 16.5); world.add(tmpl)
  world.add(banyan(-8, 16))
  world.add(well(-3.2, 0.3))
  world.add(cow(-15, 19, 0.8, '#E84C8B'))
  world.add(cow(-12.5, 21.5, -0.4, '#3A86FF'))
  world.add(cow(30, -15, 2.2, '#FFB703'))
  const charpaiPos = v3(7.2, 0, 1.0)
  world.add(charpai(charpaiPos.x, charpaiPos.z))
  world.add(rangoli(1.6, 2.1, 1.0))
  world.add(rangoli(-40, roadZ(-40) - 4.5, 0.8))
  world.add(rangoli(25, roadZ(25) - 4.2, 0.8))
  // tulsi planter
  world.add(mesh(new THREE.BoxGeometry(0.7, 0.8, 0.7), mat('#F2A65A'), 0.2, 0.4, 0.2))
  world.add(mesh(new THREE.IcosahedronGeometry(0.42, 0), mat('#3F9A3A'), 0.2, 1.05, 0.2))
  // pots / matkas
  for (let i = 0; i < 3; i++) world.add(mesh(new THREE.SphereGeometry(0.28, 10, 8), mat('#B5542F'), 9.6 + i * 0.6, 0.28, -0.6))

  const phc = v3(66, 0, -3)
  world.add(phcBuilding(phc.x, phc.z))
  const towerPos = v3(-40, 0, -17)
  world.add(tower(towerPos.x, towerPos.z))

  // pond with lotus
  const pond = mesh(new THREE.CircleGeometry(7, 28), new THREE.MeshStandardMaterial({ color: '#3BA7C9', roughness: 0.15, metalness: 0.1 }), -24, 0.06, -14, false)
  pond.rotation.x = -Math.PI / 2
  world.add(pond)
  world.add(rotm(mesh(new THREE.RingGeometry(7, 7.8, 28), mat('#B89C74'), -24, 0.07, -14, false), 'x', -Math.PI / 2))
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2, rad = r() * 5.5
    world.add(rotm(mesh(new THREE.CircleGeometry(0.45, 8), mat('#3E8E41'), -24 + Math.cos(a) * rad, 0.09, -14 + Math.sin(a) * rad, false), 'x', -Math.PI / 2))
    if (i % 2 === 0) world.add(mesh(new THREE.ConeGeometry(0.22, 0.3, 6), mat('#FF7EB6'), -24 + Math.cos(a) * rad + 0.2, 0.2, -14 + Math.sin(a) * rad, false))
  }

  // trees
  const palms: THREE.Group[] = []
  const treeSpots: [number, number][] = [[-31, -8], [-17, -9], [-28, -21], [-19, -20], [12, -9], [-14, 2], [22, 12], [48, 10], [56, -12], [-48, 10], [-64, 22], [70, 6], [32, 13], [-36, 28], [5, 18]]
  treeSpots.forEach(([x, z], i) => {
    if (i % 3 === 0) world.add(neem(x, z, 1 + r() * 0.5, r))
    else { const p = palm(x, z, 7 + r() * 4, r); palms.push(p); world.add(p) }
  })
  for (let i = 0; i < 60; i++) {
    const a = r() * Math.PI * 2, rad = 85 + r() * 140
    const x = Math.cos(a) * rad, z = Math.sin(a) * rad
    if (Math.abs(z - roadZ(x)) < 8) continue
    if (r() > 0.5) world.add(neem(x, z, 1.2 + r(), r)); else { const p = palm(x, z, 8 + r() * 4, r); palms.push(p); world.add(p) }
  }

  // bunting across the main street
  const buntGroup = new THREE.Group(); world.add(buntGroup)
  for (const x of [-30, -12, 24, 38]) {
    const z = roadZ(x)
    bunting(buntGroup, v3(x - 1, 4.6, z - 3.6), v3(x + 1, 4.6, z + 3.6), r)
  }

  // kites
  const kites: THREE.Group[] = []
  const kiteCols = ['#FF006E', '#FFBE0B', '#3A86FF', '#FB5607', '#8338EC', '#06D6A0', '#FF9933', '#E63946']
  for (let i = 0; i < 9; i++) {
    const k = new THREE.Group()
    const s = new THREE.Shape(); s.moveTo(0, 0.9); s.lineTo(0.65, 0); s.lineTo(0, -0.9); s.lineTo(-0.65, 0); s.closePath()
    k.add(new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshStandardMaterial({ color: kiteCols[i % kiteCols.length], side: THREE.DoubleSide, emissive: kiteCols[i % kiteCols.length], emissiveIntensity: 0.25 })))
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 3), mat(kiteCols[(i + 3) % kiteCols.length]))
    tail.position.y = -1.1; tail.rotation.x = Math.PI
    k.add(tail)
    k.userData = { a: r() * Math.PI * 2, rad: 18 + r() * 40, h: 18 + r() * 16, sp: 0.05 + r() * 0.08, ph: r() * 6 }
    world.add(k); kites.push(k)
  }

  // birds
  const birds: THREE.Group[] = []
  for (let i = 0; i < 14; i++) {
    const b = new THREE.Group()
    const wingGeo = new THREE.BoxGeometry(0.7, 0.03, 0.22)
    const wl = new THREE.Mesh(wingGeo, mat('#333')); wl.position.x = -0.35
    const wr = new THREE.Mesh(wingGeo, mat('#333')); wr.position.x = 0.35
    const pl = new THREE.Group(); pl.add(wl); const pr = new THREE.Group(); pr.add(wr)
    b.add(pl, pr)
    b.userData = { pl, pr, a: r() * 6, rad: 30 + r() * 20, h: 26 + r() * 8, ph: r() * 6 }
    world.add(b); birds.push(b)
  }

  // clouds
  const clouds: THREE.Group[] = []
  const cloudMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 1, emissive: '#FFF4E6', emissiveIntensity: 0.35, flatShading: true })
  for (let i = 0; i < 16; i++) {
    const c = new THREE.Group()
    const n = 4 + Math.floor(r() * 4)
    for (let k = 0; k < n; k++) c.add(new THREE.Mesh(new THREE.IcosahedronGeometry(3 + r() * 3, 1), cloudMat).translateX(k * 3.5 - n * 1.7).translateY(r() * 2).translateZ(r() * 3))
    const a = r() * Math.PI * 2, rad = 40 + r() * 160
    c.position.set(Math.cos(a) * rad, 36 + r() * 18, Math.sin(a) * rad)
    c.scale.setScalar(0.8 + r() * 0.9)
    world.add(c); clouds.push(c)
  }

  const flag = tmpl.userData.flag as THREE.Mesh

  return {
    road, kamalaHouse, charpai: charpaiPos, phc, tower: towerPos, towerTop: towerPos.clone().setY(26),
    update(t) {
      for (const k of kites) {
        const u = k.userData
        const a = u.a + t * u.sp
        k.position.set(Math.cos(a) * u.rad, u.h + Math.sin(t * 0.8 + u.ph) * 1.5, Math.sin(a) * u.rad - 10)
        k.rotation.set(Math.sin(t * 1.3 + u.ph) * 0.25, a, Math.sin(t * 0.9 + u.ph) * 0.3)
      }
      for (const b of birds) {
        const u = b.userData
        const a = u.a + t * 0.18
        b.position.set(Math.cos(a) * u.rad + 10, u.h + Math.sin(t + u.ph) * 0.6, Math.sin(a) * u.rad - 20)
        b.rotation.y = -a
        const f = Math.sin(t * 9 + u.ph) * 0.6
        u.pl.rotation.z = f; u.pr.rotation.z = -f
      }
      for (const c of clouds) c.position.x += 0.01
      for (const p of palms) { const cr = p.userData.crown as THREE.Group; cr.rotation.z = Math.sin(t * 0.8 + p.position.x) * 0.05 }
      flag.rotation.y = Math.sin(t * 3) * 0.35
      buntGroup.children.forEach(ch => { if (ch.userData.phase !== undefined) ch.rotation.x = Math.sin(t * 2.5 + ch.userData.phase) * 0.35 })
    },
  }
}
