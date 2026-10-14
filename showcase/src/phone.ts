import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import logoUrl from '../../src/assets/saathi-logo.png'
import markUrl from '../../src/assets/saathi-mark.png'
import { FONT, clamp, easeOut, roundRect, seg, smooth } from './util'

/* ---------- palette (from the SAATHI Figma exports) ---------- */
const C = {
  primary: '#00685F', primaryDark: '#004F48', primaryMid: '#2F8981', primaryLight: '#D5F8F5', mint: '#99EFE5', mintSoft: '#E1FBF8',
  bg: '#F8F9FF', surface: '#FFFFFF', tint: '#EFF4FF', tint2: '#E4E9F4', ink: '#0E1A1A', secondary: '#5F6B6B', muted: '#8A9494',
  warning: '#B7791F', warningText: '#7A5A17', warningTint: '#FFF1D6', error: '#BA1B1B', errorTint: '#FFDAD6', info: '#2A5DA8', infoTint: '#DCE9FF', success: '#0F7A5A',
}

export const logoImg = new Image(); logoImg.src = logoUrl
export const markImg = new Image(); markImg.src = markUrl

/** Simulated knee extension angle from the wearable (degrees). Starts at t=47 */
export function kneeAngle(t: number) {
  if (t < 47) return 2
  const ph = ((t - 47) % 4) / 4
  return 3 + 75 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 2)) * (0.96 + 0.04 * Math.sin(t * 0.7)) + Math.sin(t * 23) * 0.6
}

export const SCREENS: [string, number, number][] = [
  ['login', 24, 27], ['language', 27, 29.5], ['dashboard', 29.5, 32.5], ['register', 32.5, 35.5], ['joint', 35.5, 38], ['questions', 38, 41],
  ['connect', 41, 44], ['calibrate', 44, 47], ['assess', 47, 53], ['analysis', 53, 56], ['result', 56, 59.5], ['exercises', 59.5, 61.8], ['sync', 61.8, 70],
]

const W = 360, H = 780, S = 1.5

/* ---------- drawing helpers ---------- */
type Ctx = CanvasRenderingContext2D
function txt(ctx: Ctx, s: string, x: number, y: number, size: number, weight = 400, color: string = C.ink, align: CanvasTextAlign = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'
  ctx.fillText(s, x, y)
}
function wrap(ctx: Ctx, s: string, x: number, y: number, maxW: number, size: number, weight: number, color: string, lh = 1.3) {
  ctx.font = `${weight} ${size}px ${FONT}`
  const words = s.split(' '); let line = ''; let yy = y
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) { txt(ctx, line, x, yy, size, weight, color); line = w; yy += size * lh }
    else line = test
  }
  if (line) txt(ctx, line, x, yy, size, weight, color)
  return yy
}
function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 1.5) {
  roundRect(ctx, x, y, w, h, r)
  ctx.fillStyle = fill; ctx.fill()
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke() }
}
function card(ctx: Ctx, x: number, y: number, w: number, h: number, r = 16, fill = C.surface) {
  ctx.save(); ctx.shadowColor = 'rgba(16,30,54,0.10)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4
  rr(ctx, x, y, w, h, r, fill); ctx.restore()
}
function button(ctx: Ctx, label: string, y: number, pressed: number, opts: { variant?: 'primary' | 'secondary'; x?: number; w?: number; h?: number } = {}) {
  const x = opts.x ?? 24, w = opts.w ?? 312, h = opts.h ?? 54
  const k = 1 - 0.035 * Math.sin(clamp(pressed) * Math.PI)
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-(x + w / 2), -(y + h / 2))
  if (opts.variant === 'secondary') rr(ctx, x, y, w, h, 16, C.surface, C.primary)
  else {
    ctx.shadowColor = 'rgba(0,104,95,0.30)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6
    rr(ctx, x, y, w, h, 16, pressed > 0 ? C.primaryDark : C.primary)
    ctx.shadowColor = 'transparent'
  }
  txt(ctx, label, x + w / 2, y + h / 2 + 6, 16, 700, opts.variant === 'secondary' ? C.primary : '#FFFFFF', 'center')
  if (pressed > 0 && pressed < 1) { // ripple
    ctx.save(); roundRect(ctx, x, y, w, h, 16); ctx.clip()
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, pressed * w * 0.7, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - pressed)})`; ctx.fill(); ctx.restore()
  }
  ctx.restore()
}
function tap(ctx: Ctx, x: number, y: number, k: number) {
  if (k <= 0 || k >= 1) return
  ctx.beginPath(); ctx.arc(x, y, 10 + k * 26, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(0,104,95,${0.25 * (1 - k)})`; ctx.fill()
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fillStyle = `rgba(14,26,26,${0.25 * (1 - k)})`; ctx.fill()
}
function check(ctx: Ctx, x: number, y: number, r: number, bg = C.primary, fg = '#fff') {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill()
  ctx.strokeStyle = fg; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(x - r * 0.45, y); ctx.lineTo(x - r * 0.1, y + r * 0.38); ctx.lineTo(x + r * 0.5, y - r * 0.35); ctx.stroke()
}
function chip(ctx: Ctx, label: string, x: number, y: number, bg: string, fg: string, size = 12, align: 'left' | 'right' = 'left') {
  ctx.font = `700 ${size}px ${FONT}`
  const w = ctx.measureText(label).width + 22
  const xx = align === 'right' ? x - w : x
  rr(ctx, xx, y, w, size + 14, (size + 14) / 2, bg)
  txt(ctx, label, xx + 11, y + size + 6, size, 700, fg)
  return w
}
function progress(ctx: Ctx, x: number, y: number, w: number, p: number, h = 6, bg = C.tint2, fg = C.primary) {
  rr(ctx, x, y, w, h, h / 2, bg)
  if (p > 0) rr(ctx, x, y, Math.max(h, w * clamp(p)), h, h / 2, fg)
}
function field(ctx: Ctx, label: string, value: string, x: number, y: number, w: number, focus: boolean, t: number) {
  txt(ctx, label, x, y, 13, 600, C.secondary)
  rr(ctx, x, y + 8, w, 48, 12, C.surface, focus ? C.primary : C.tint2, focus ? 2 : 1.5)
  txt(ctx, value, x + 14, y + 39, 16, 500, C.ink)
  if (focus && Math.floor(t * 2.5) % 2 === 0) {
    ctx.font = `500 16px ${FONT}`
    const cx = x + 15 + ctx.measureText(value).width
    ctx.fillStyle = C.primary; ctx.fillRect(cx, y + 22, 2, 22)
  }
}
function header(ctx: Ctx, title: string, step?: string, p?: number) {
  // back arrow
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(36, 60); ctx.lineTo(28, 68); ctx.lineTo(36, 76); ctx.moveTo(28, 68); ctx.lineTo(44, 68); ctx.stroke()
  txt(ctx, title, 180, 74, 17, 700, C.ink, 'center')
  if (step) txt(ctx, step, 336, 74, 13, 600, C.secondary, 'right')
  if (p !== undefined) progress(ctx, 24, 94, 312, p)
}
function statusBar(ctx: Ctx, dark = false) {
  const col = dark ? '#FFFFFF' : C.ink
  txt(ctx, '9:41', 28, 26, 14, 700, col)
  ctx.fillStyle = col
  for (let i = 0; i < 4; i++) ctx.fillRect(270 + i * 6, 22 - i * 3, 4, 4 + i * 3)
  roundRect(ctx, 302, 13, 26, 13, 4); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke()
  ctx.fillRect(305, 16, 17, 7); ctx.fillRect(329, 17, 2, 5)
  // camera notch
  rr(ctx, 140, 10, 80, 22, 11, '#0B0B0B')
}

/* ---------- icons ---------- */
function bluetooth(ctx: Ctx, x: number, y: number, s: number, col = '#fff') {
  ctx.strokeStyle = col; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(x - s * 0.3, y - s * 0.25); ctx.lineTo(x + s * 0.3, y + s * 0.25); ctx.lineTo(x, y + s * 0.5); ctx.lineTo(x, y - s * 0.5); ctx.lineTo(x + s * 0.3, y - s * 0.25); ctx.lineTo(x - s * 0.3, y + s * 0.25); ctx.stroke()
}
function jointIcon(ctx: Ctx, kind: string, x: number, y: number, col: string) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath()
  if (kind === 'knee') { ctx.moveTo(x - 6, y - 18); ctx.lineTo(x + 2, y); ctx.lineTo(x - 4, y + 18); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 2, y, 6, 0, Math.PI * 2); ctx.fill() }
  else if (kind === 'hip') { ctx.arc(x, y - 4, 14, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(x - 9, y + 6, 4.5, 0, Math.PI * 2); ctx.arc(x + 9, y + 6, 4.5, 0, Math.PI * 2); ctx.fill() }
  else if (kind === 'hand') { rr(ctx, x - 9, y - 2, 18, 18, 6, col); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 7 + i * 4.6, y - 2); ctx.lineTo(x - 7 + i * 4.6, y - 14 + Math.abs(i - 1.5) * 2); ctx.lineWidth = 3.4; ctx.stroke() } }
  else { for (let i = 0; i < 5; i++) rr(ctx, x - 7 + (i % 2) * 1.5, y - 20 + i * 8.5, 14, 6.5, 3, col) }
}
function speaker(ctx: Ctx, x: number, y: number, col: string) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x + 4, y - 3); ctx.lineTo(x + 9, y - 7); ctx.lineTo(x + 9, y + 7); ctx.lineTo(x + 4, y + 3); ctx.lineTo(x, y + 3); ctx.fill()
  ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x + 10, y, 5, -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 10, y, 9, -0.9, 0.9); ctx.stroke()
}
function stickFigure(ctx: Ctx, kind: number, x: number, y: number, t: number) {
  ctx.strokeStyle = C.primaryDark; ctx.fillStyle = C.primaryDark; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  const a = (Math.sin(t * 3) + 1) / 2
  if (kind === 0) { // seated knee extension
    ctx.beginPath(); ctx.arc(x - 8, y - 22, 5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.moveTo(x - 8, y - 16); ctx.lineTo(x - 8, y + 2); ctx.lineTo(x + 8, y + 2)
    ctx.lineTo(x + 8 + Math.sin(a * 1.3) * 16, y + 2 + Math.cos(a * 1.3) * 16); ctx.stroke()
    ctx.strokeStyle = C.primaryMid; ctx.beginPath(); ctx.moveTo(x - 16, y + 4); ctx.lineTo(x + 6, y + 4); ctx.moveTo(x - 14, y + 4); ctx.lineTo(x - 14, y + 20); ctx.stroke()
  } else if (kind === 1) { // heel slides (lying)
    ctx.beginPath(); ctx.arc(x - 20, y + 8, 5, 0, Math.PI * 2); ctx.fill()
    const kx = x + 2 + a * 4, ky = y + 10 - a * 12
    ctx.beginPath(); ctx.moveTo(x - 14, y + 10); ctx.lineTo(x - 2, y + 10); ctx.lineTo(kx, ky); ctx.lineTo(x + 22 - a * 10, y + 12); ctx.stroke()
  } else { // walking
    const s = Math.sin(t * 5) * 0.5
    ctx.beginPath(); ctx.arc(x, y - 20, 5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 4)
    ctx.moveTo(x, y + 4); ctx.lineTo(x + Math.sin(s) * 14, y + 4 + Math.cos(s) * 14)
    ctx.moveTo(x, y + 4); ctx.lineTo(x - Math.sin(s) * 14, y + 4 + Math.cos(s) * 14)
    ctx.moveTo(x, y - 10); ctx.lineTo(x - Math.sin(s) * 10, y)
    ctx.moveTo(x, y - 10); ctx.lineTo(x + Math.sin(s) * 10, y); ctx.stroke()
  }
}

/* ---------- screens ---------- */
type Draw = (ctx: Ctx, p: number, t: number, d: number) => void

const login: Draw = (ctx, p, t) => {
  const g = ctx.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, C.primaryLight); g.addColorStop(1, C.bg)
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  card(ctx, 90, 58, 180, 180, 32)
  if (logoImg.complete) ctx.drawImage(logoImg, 98, 66, 164, 164)
  txt(ctx, 'Health worker sign in', 180, 292, 21, 700, C.ink, 'center')
  txt(ctx, 'Offline-first · data stays on device', 180, 316, 13, 500, C.secondary, 'center')
  const id = 'ASHA-2041'.slice(0, Math.floor(seg(p, 0.05, 0.38) * 9))
  field(ctx, 'Worker ID', id, 24, 352, 312, p < 0.4, t)
  txt(ctx, 'PIN', 24, 438, 13, 600, C.secondary)
  const n = Math.floor(seg(p, 0.42, 0.72) * 4.01)
  for (let i = 0; i < 4; i++) {
    rr(ctx, 24 + i * 82, 448, 66, 58, 14, C.surface, i === n && p < 0.75 ? C.primary : C.tint2, i === n ? 2 : 1.5)
    if (i < n) { ctx.beginPath(); ctx.arc(57 + i * 82, 477, 7, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill() }
  }
  button(ctx, 'Sign in', 548, seg(p, 0.8, 0.95))
  rr(ctx, 24, 690, 312, 50, 14, C.mintSoft)
  check(ctx, 50, 715, 10)
  txt(ctx, 'Screening support · not a diagnostic tool', 70, 720, 12.5, 600, C.primaryDark)
}

const LANGS = [['English', 'English'], ['हिन्दी', 'Hindi'], ['தமிழ்', 'Tamil'], ['తెలుగు', 'Telugu'], ['मराठी', 'Marathi'], ['বাংলা', 'Bengali']]
const language: Draw = (ctx, p) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  txt(ctx, 'Choose your language', 24, 92, 23, 800)
  txt(ctx, 'भाषा चुनें  ·  மொழியைத் தேர்வுசெய்க', 24, 118, 14, 500, C.secondary)
  const sel = p > 0.42 ? 1 : -1
  LANGS.forEach(([n, e], i) => {
    const c = i % 2, r = Math.floor(i / 2)
    const x = 24 + c * 162, y = 146 + r * 124
    const on = i === sel
    card(ctx, x, y, 150, 110, 18, on ? C.primaryLight : C.surface)
    if (on) { roundRect(ctx, x, y, 150, 110, 18); ctx.strokeStyle = C.primary; ctx.lineWidth = 2.5; ctx.stroke(); check(ctx, x + 128, y + 22, 10) }
    txt(ctx, n, x + 18, y + 58, 26, 700, on ? C.primaryDark : C.ink)
    txt(ctx, e, x + 18, y + 86, 13, 500, C.secondary)
  })
  tap(ctx, 260, 205, seg(p, 0.38, 0.6))
  rr(ctx, 24, 540, 312, 64, 14, C.tint)
  speaker(ctx, 44, 572, C.primary)
  txt(ctx, 'Voice prompts for every question', 70, 568, 13.5, 700, C.ink)
  txt(ctx, 'Designed for low-literacy settings', 70, 588, 12, 500, C.secondary)
  button(ctx, 'जारी रखें · Continue', 690, seg(p, 0.82, 0.97))
}

const dashboard: Draw = (ctx, p, t) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  if (markImg.complete) ctx.drawImage(markImg, 22, 46, 40, 32)
  txt(ctx, 'SAATHI', 68, 70, 19, 800, C.primary)
  ctx.beginPath(); ctx.arc(318, 62, 18, 0, Math.PI * 2); ctx.fillStyle = '#E85D9A'; ctx.fill()
  txt(ctx, 'S', 318, 68, 16, 700, '#fff', 'center')
  txt(ctx, 'नमस्ते, Sunita', 24, 124, 25, 800)
  txt(ctx, 'Rampur Sub-centre · Tue, 14 Oct', 24, 147, 13, 500, C.secondary)
  rr(ctx, 24, 164, 312, 34, 17, C.warningTint)
  ctx.beginPath(); ctx.arc(42, 181, 4, 0, Math.PI * 2); ctx.fillStyle = C.warning; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 6); ctx.fill(); ctx.globalAlpha = 1
  txt(ctx, 'Offline · 2 records will sync later', 54, 186, 12.5, 600, C.warningText)
  const k = easeOut(seg(p, 0, 0.5))
  const stats: [number, string, string][] = [[6, 'Screened today', C.primary], [3, 'Follow-ups', C.info], [1, 'Referred', C.error]]
  stats.forEach(([v, l, col], i) => {
    const x = 24 + i * 106
    card(ctx, x, 212, 98, 88, 16)
    txt(ctx, String(Math.round(v * k)), x + 14, 252, 28, 800, col)
    txt(ctx, l, x + 14, 280, 11.5, 600, C.secondary)
  })
  // CTA
  const press = seg(p, 0.75, 0.92)
  ctx.save()
  const sc = 1 - 0.03 * Math.sin(press * Math.PI)
  ctx.translate(180, 362); ctx.scale(sc, sc); ctx.translate(-180, -362)
  const g = ctx.createLinearGradient(24, 318, 336, 410); g.addColorStop(0, C.primary); g.addColorStop(1, C.primaryMid)
  ctx.shadowColor = 'rgba(0,104,95,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8
  roundRect(ctx, 24, 318, 312, 92, 20); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent'
  ctx.beginPath(); ctx.arc(66, 364, 22, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(66, 353); ctx.lineTo(66, 375); ctx.moveTo(55, 364); ctx.lineTo(77, 364); ctx.stroke()
  txt(ctx, 'New screening', 102, 360, 20, 800, '#fff')
  txt(ctx, 'Register patient & start', 102, 382, 12.5, 500, C.mint)
  ctx.restore()
  tap(ctx, 200, 364, press)
  txt(ctx, 'Recent screenings', 24, 446, 16, 800)
  txt(ctx, 'See all', 336, 446, 13, 700, C.primary, 'right')
  const rows: [string, string, string, string, string][] = [['Ramesh Yadav', 'Knee · 2 days ago', 'Low', C.mint, C.primaryDark], ['Lakshmi Bai', 'Hip · 3 days ago', 'Moderate', C.warningTint, C.warningText], ['Gopal Singh', 'Knee · 5 days ago', 'Higher', C.errorTint, C.error]]
  rows.forEach(([n, s, b, bg, fg], i) => {
    const y = 460 + i * 70
    card(ctx, 24, y, 312, 60, 14)
    ctx.beginPath(); ctx.arc(52, y + 30, 17, 0, Math.PI * 2); ctx.fillStyle = C.tint; ctx.fill()
    txt(ctx, n.split(' ').map(w => w[0]).join(''), 52, y + 35, 12, 700, C.primary, 'center')
    txt(ctx, n, 78, y + 27, 14.5, 700)
    txt(ctx, s, 78, y + 45, 12, 500, C.secondary)
    chip(ctx, b, 324, y + 17, bg, fg, 11, 'right')
  })
  // tab bar
  ctx.save(); ctx.shadowColor = 'rgba(16,30,54,0.08)'; ctx.shadowBlur = 12; ctx.fillStyle = '#fff'; ctx.fillRect(0, 712, W, 68); ctx.restore()
  ;['Home', 'Patients', 'Records', 'Settings'].forEach((l, i) => {
    const x = 45 + i * 90
    if (i === 0) rr(ctx, x - 28, 720, 56, 28, 14, C.mint)
    rr(ctx, x - 8, 726, 16, 16, 4, i === 0 ? C.primaryDark : C.muted)
    txt(ctx, l, x, 764, 11, 700, i === 0 ? C.primaryDark : C.muted, 'center')
  })
}

const register: Draw = (ctx, p, t) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  header(ctx, 'New patient', '1 / 3', 0.33)
  txt(ctx, 'Patient details', 24, 140, 23, 800)
  txt(ctx, 'Step 1 · Basic information', 24, 163, 13, 500, C.secondary)
  const name = 'Kamala Devi'.slice(0, Math.floor(seg(p, 0.05, 0.32) * 11))
  field(ctx, 'Full name', name, 24, 192, 312, p < 0.35, t)
  field(ctx, 'Age', '64'.slice(0, Math.floor(seg(p, 0.36, 0.46) * 2)), 24, 272, 100, p >= 0.35 && p < 0.48, t)
  txt(ctx, 'Sex', 140, 272, 13, 600, C.secondary)
  ;['Female', 'Male', 'Other'].forEach((s, i) => {
    const on = i === 0 && p > 0.5
    const x = 140 + i * 66
    rr(ctx, x, 280, 60, 48, 12, on ? C.primary : C.surface, on ? C.primary : C.tint2)
    txt(ctx, s, x + 30, 309, 12.5, 700, on ? '#fff' : C.ink, 'center')
  })
  tap(ctx, 170, 304, seg(p, 0.48, 0.62))
  field(ctx, 'Village', 'Rampur'.slice(0, Math.floor(seg(p, 0.56, 0.7) * 6)), 24, 352, 312, p >= 0.52 && p < 0.72, t)
  field(ctx, 'Mobile number', '98765 43210'.slice(0, Math.floor(seg(p, 0.72, 0.86) * 11)), 24, 432, 312, p >= 0.72 && p < 0.88, t)
  rr(ctx, 24, 520, 312, 70, 14, C.tint)
  txt(ctx, 'Linked to', 44, 548, 12, 600, C.secondary)
  txt(ctx, 'PHC Rampur · ABHA ID optional', 44, 570, 14.5, 700, C.ink)
  button(ctx, 'Continue', 700, seg(p, 0.88, 0.99))
}

const JOINTS: [string, string, string][] = [['knee', 'Knee', 'Most common'], ['hip', 'Hip', 'Groin or thigh'], ['hand', 'Hand', 'Fingers, thumb'], ['spine', 'Spine', 'Neck, lower back']]
const joint: Draw = (ctx, p) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  header(ctx, 'Select joint', '2 / 3', 0.66)
  txt(ctx, 'Where does it hurt?', 24, 140, 23, 800)
  JOINTS.forEach(([id, l, h], i) => {
    const c = i % 2, r = Math.floor(i / 2)
    const x = 24 + c * 162, y = 166 + r * 150
    const on = i === 0 && p > 0.28
    card(ctx, x, y, 150, 136, 18, on ? C.primaryLight : C.surface)
    if (on) { roundRect(ctx, x, y, 150, 136, 18); ctx.strokeStyle = C.primary; ctx.lineWidth = 2.5; ctx.stroke(); check(ctx, x + 128, y + 22, 10) }
    ctx.beginPath(); ctx.arc(x + 40, y + 44, 26, 0, Math.PI * 2); ctx.fillStyle = on ? C.mint : C.tint; ctx.fill()
    jointIcon(ctx, id, x + 40, y + 44, on ? C.primaryDark : C.primary)
    txt(ctx, l, x + 16, y + 100, 17, 800, on ? C.primaryDark : C.ink)
    txt(ctx, h, x + 16, y + 120, 12, 500, C.secondary)
  })
  tap(ctx, 100, 230, seg(p, 0.22, 0.42))
  txt(ctx, 'Which side?', 24, 492, 16, 800)
  rr(ctx, 24, 506, 312, 52, 14, C.tint)
  ;['Left', 'Right', 'Both'].forEach((s, i) => {
    const on = i === 1 && p > 0.6
    if (on) card(ctx, 28 + i * 103, 510, 98, 44, 11)
    txt(ctx, s, 77 + i * 103, 538, 14, 700, on ? C.primary : C.secondary, 'center')
  })
  tap(ctx, 180, 532, seg(p, 0.55, 0.72))
  button(ctx, 'Continue', 700, seg(p, 0.86, 0.99))
}

const OPTS = ['No stiffness', 'Less than 30 minutes', 'More than 30 minutes']
const questions: Draw = (ctx, p) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  header(ctx, 'Symptoms', '3 of 8', 0.25 + 0.125 * smooth(seg(p, 0.75, 0.9)))
  chip(ctx, 'QUESTION 3', 24, 116, C.mint, C.primaryDark, 11)
  rr(ctx, 248, 112, 88, 32, 16, C.surface, C.tint2)
  speaker(ctx, 262, 128, C.primary)
  txt(ctx, 'Listen', 284, 133, 12.5, 700, C.primary)
  if (seg(p, 0.05, 0.3) > 0 && p < 0.35) { // speaking waves
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(292, 128, 18 + i * 6 + (p * 60 % 6), 0, Math.PI * 2); ctx.strokeStyle = `rgba(0,104,95,${0.2 - i * 0.06})`; ctx.lineWidth = 2; ctx.stroke() }
  }
  wrap(ctx, 'Is the joint stiff in the morning or after sitting for a while?', 24, 186, 312, 22, 800, C.ink, 1.3)
  rr(ctx, 24, 252, 312, 58, 14, C.infoTint)
  wrap(ctx, 'Stiffness that eases within 30 minutes of moving is common.', 44, 276, 280, 12.5, 500, C.info, 1.35)
  const sel = p > 0.45 ? 2 : -1
  OPTS.forEach((o, i) => {
    const y = 332 + i * 70
    const on = i === sel
    card(ctx, 24, y, 312, 58, 14, on ? C.primaryLight : C.surface)
    if (on) { roundRect(ctx, 24, y, 312, 58, 14); ctx.strokeStyle = C.primary; ctx.lineWidth = 2; ctx.stroke() }
    ctx.beginPath(); ctx.arc(50, y + 29, 10, 0, Math.PI * 2); ctx.strokeStyle = on ? C.primary : C.muted; ctx.lineWidth = 2; ctx.stroke()
    if (on) { ctx.beginPath(); ctx.arc(50, y + 29, 5.5, 0, Math.PI * 2); ctx.fillStyle = C.primary; ctx.fill() }
    txt(ctx, o, 72, y + 34, 15, 600, on ? C.primaryDark : C.ink)
  })
  tap(ctx, 200, 501, seg(p, 0.4, 0.6))
  button(ctx, 'Next', 700, seg(p, 0.82, 0.97))
}

const connect: Draw = (ctx, p, t) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  header(ctx, 'Connect sensor', '3 / 3', 1)
  const cx = 180, cy = 270
  const found = p > 0.42
  for (let i = 0; i < 4; i++) {
    const k = ((t * 0.6 + i / 4) % 1)
    ctx.beginPath(); ctx.arc(cx, cy, 50 + k * 110, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(0,104,95,${(1 - k) * (found ? 0.15 : 0.35)})`; ctx.lineWidth = 2; ctx.stroke()
  }
  ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI * 2); ctx.fillStyle = 'rgba(153,239,229,0.25)'; ctx.fill()
  ctx.beginPath(); ctx.arc(cx, cy, 56, 0, Math.PI * 2); ctx.fillStyle = C.primary; ctx.fill()
  bluetooth(ctx, cx, cy, 46)
  if (!found) {
    txt(ctx, 'Searching for SAATHI sensor…', 180, 440, 17, 700, C.ink, 'center')
    txt(ctx, 'Keep the sensor within 1 metre', 180, 464, 13, 500, C.secondary, 'center')
  } else {
    const k = easeOut(seg(p, 0.42, 0.55))
    const y = 420 + (1 - k) * 40
    ctx.globalAlpha = k
    card(ctx, 24, y, 312, 86, 18)
    rr(ctx, 40, y + 18, 50, 50, 12, C.primary)
    rr(ctx, 50, y + 30, 30, 20, 5, C.mint)
    ctx.beginPath(); ctx.arc(76, y + 34, 3, 0, Math.PI * 2); ctx.fillStyle = '#16C784'; ctx.fill()
    txt(ctx, 'SAATHI Sensor', 104, y + 38, 15.5, 800)
    txt(ctx, 'S-01 · Battery 92%', 104, y + 60, 12.5, 500, C.secondary)
    if (p > 0.68) chip(ctx, 'Connected', 324, y + 28, C.mint, C.primaryDark, 11, 'right')
    else chip(ctx, 'Pairing…', 324, y + 28, C.tint, C.secondary, 11, 'right')
    ctx.globalAlpha = 1
    rr(ctx, 24, 528, 312, 110, 16, C.tint)
    txt(ctx, 'Placement', 44, 558, 12, 700, C.secondary)
    wrap(ctx, 'Strap just below the knee, LED facing forward.', 44, 584, 270, 15, 700, C.ink)
  }
  button(ctx, 'Continue to calibration', 700, seg(p, 0.86, 0.99))
}

const calibrate: Draw = (ctx, p) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  header(ctx, 'Calibration')
  const steps = ['Prepare', 'Position', 'Calibrate', 'Ready']
  const active = p < 0.12 ? 1 : p < 0.86 ? 2 : 3
  steps.forEach((s, i) => {
    const x = 50 + i * 87
    if (i < 3) { ctx.fillStyle = i < active ? C.primary : C.tint2; ctx.fillRect(x + 14, 127, 59, 3) }
    if (i < active) check(ctx, x, 128, 13)
    else { ctx.beginPath(); ctx.arc(x, 128, 13, 0, Math.PI * 2); ctx.fillStyle = i === active ? C.mint : C.tint2; ctx.fill(); txt(ctx, String(i + 1), x, 133, 12, 800, i === active ? C.primaryDark : C.muted, 'center') }
    txt(ctx, s, x, 160, 11.5, 700, i <= active ? C.ink : C.muted, 'center')
  })
  const k = smooth(seg(p, 0.12, 0.86))
  const cx = 180, cy = 330
  ctx.beginPath(); ctx.arc(cx, cy, 104, 0, Math.PI * 2); ctx.strokeStyle = C.tint2; ctx.lineWidth = 16; ctx.stroke()
  ctx.beginPath(); ctx.arc(cx, cy, 104, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.strokeStyle = C.primary; ctx.lineCap = 'round'; ctx.stroke()
  if (k < 1) { txt(ctx, `${Math.round(k * 100)}%`, cx, cy + 14, 44, 800, C.ink, 'center'); txt(ctx, 'calibrating', cx, cy + 40, 13, 600, C.secondary, 'center') }
  else check(ctx, cx, cy, 46, C.success)
  txt(ctx, k < 1 ? 'Keep the leg still' : 'Sensor calibrated', 180, 488, 20, 800, k < 1 ? C.ink : C.success, 'center')
  txt(ctx, 'Learning resting angle & orientation', 180, 512, 13, 500, C.secondary, 'center')
  button(ctx, 'Start movement test', 700, seg(p, 0.9, 0.99))
}

const assess: Draw = (ctx, p, t) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  header(ctx, 'Movement test')
  rr(ctx, 24, 98, 312, 36, 18, C.surface)
  ctx.beginPath(); ctx.arc(44, 116, 5, 0, Math.PI * 2); ctx.fillStyle = Math.floor(t * 2) % 2 ? C.error : '#F28B82'; ctx.fill()
  txt(ctx, 'Recording · Right knee', 58, 121, 13, 700, C.ink)
  const sec = Math.min(30, Math.floor(p * 30))
  txt(ctx, `00:${String(sec).padStart(2, '0')} / 00:30`, 322, 121, 13, 700, C.secondary, 'right')
  // gauge
  const a = kneeAngle(t)
  const cx = 180, cy = 300, R = 112
  ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, Math.PI * 2); ctx.strokeStyle = C.tint2; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.stroke()
  const g = ctx.createLinearGradient(cx - R, 0, cx + R, 0); g.addColorStop(0, C.mint); g.addColorStop(1, C.primary)
  ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, Math.PI + (a / 90) * Math.PI); ctx.strokeStyle = g; ctx.stroke()
  for (let i = 0; i <= 6; i++) { const an = Math.PI + (i / 6) * Math.PI; ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * (R - 20), cy + Math.sin(an) * (R - 20)); ctx.lineTo(cx + Math.cos(an) * (R - 28), cy + Math.sin(an) * (R - 28)); ctx.strokeStyle = C.muted; ctx.lineWidth = 2; ctx.stroke() }
  txt(ctx, `${Math.round(a)}°`, cx, cy - 18, 54, 800, C.ink, 'center')
  txt(ctx, 'knee extension', cx, cy + 6, 13, 600, C.secondary, 'center')
  // live waveform
  card(ctx, 24, 330, 312, 150, 16)
  txt(ctx, 'Live motion', 40, 356, 13, 700, C.secondary)
  ctx.save(); roundRect(ctx, 24, 330, 312, 150, 16); ctx.clip()
  ctx.strokeStyle = C.tint2; ctx.lineWidth = 1
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(40, 380 + i * 25); ctx.lineTo(320, 380 + i * 25); ctx.stroke() }
  ctx.beginPath()
  const span = 8
  for (let i = 0; i <= 140; i++) {
    const tt = t - span + (i / 140) * span
    if (tt < 47) continue
    const v = kneeAngle(tt)
    const x = 40 + (i / 140) * 280, y = 460 - (v / 90) * 85
    if (i === 0 || tt - span / 140 < 47) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = C.primary; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke()
  ctx.lineTo(320, 470); ctx.lineTo(40, 470); ctx.closePath()
  ctx.restore()
  ctx.beginPath(); ctx.arc(320, 460 - (a / 90) * 85, 5, 0, Math.PI * 2); ctx.fillStyle = C.primary; ctx.fill()
  // stats
  const reps = Math.max(0, Math.floor((t - 47 + 2) / 4))
  const st: [string, string][] = [[String(reps), 'Reps'], [`${Math.round(Math.min(78, 30 + (t - 47) * 25))}°`, 'Max range'], [p > 0.3 ? 'Even' : '—', 'Pattern']]
  st.forEach(([v, l], i) => { const x = 24 + i * 106; card(ctx, x, 496, 98, 76, 14); txt(ctx, v, x + 49, 532, 22, 800, C.primary, 'center'); txt(ctx, l, x + 49, 556, 11.5, 600, C.secondary, 'center') })
  progress(ctx, 24, 594, 312, p, 8)
  rr(ctx, 24, 620, 312, 56, 14, C.mintSoft)
  wrap(ctx, 'Slowly straighten, then bend the knee', 44, 653, 280, 14, 700, C.primaryDark)
  button(ctx, 'Stop test', 700, 0, { variant: 'secondary' })
}

const analysis: Draw = (ctx, p, t) => {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#E1FBF8'); g.addColorStop(1, C.bg)
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  const cx = 180, cy = 230
  for (let ring = 0; ring < 3; ring++) {
    ctx.beginPath(); ctx.arc(cx, cy, 50 + ring * 28, 0, Math.PI * 2); ctx.strokeStyle = `rgba(0,104,95,${0.18 - ring * 0.04})`; ctx.lineWidth = 2; ctx.stroke()
    for (let i = 0; i < 5 + ring * 2; i++) {
      const a = t * (1.2 - ring * 0.3) * (ring % 2 ? -1 : 1) + (i / (5 + ring * 2)) * Math.PI * 2
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (50 + ring * 28), cy + Math.sin(a) * (50 + ring * 28), 5 - ring, 0, Math.PI * 2)
      ctx.fillStyle = [C.primary, C.primaryMid, '#6ED9CC'][ring]; ctx.fill()
    }
  }
  ctx.beginPath(); ctx.arc(cx, cy, 36, 0, Math.PI * 2); ctx.fillStyle = C.primary; ctx.fill()
  txt(ctx, 'AI', cx, cy + 8, 22, 800, '#fff', 'center')
  txt(ctx, 'Analysing screening data', 180, 378, 20, 800, C.ink, 'center')
  txt(ctx, 'Runs on the phone · no internet needed', 180, 402, 13, 500, C.secondary, 'center')
  const items: [string, string][] = [['Symptom answers', '8 / 8'], ['Range of movement', '78°'], ['Movement smoothness', '0.72'], ['Age & risk factors', '3 found']]
  items.forEach(([l, v], i) => {
    const y = 430 + i * 62
    const k = seg(p, 0.1 + i * 0.2, 0.25 + i * 0.2)
    card(ctx, 24, y, 312, 52, 14)
    if (k >= 1) check(ctx, 50, y + 26, 11)
    else { ctx.beginPath(); ctx.arc(50, y + 26, 10, t * 6, t * 6 + 4.2); ctx.strokeStyle = C.primary; ctx.lineWidth = 3; ctx.stroke() }
    txt(ctx, l, 72, y + 31, 14.5, 700, k > 0 ? C.ink : C.muted)
    if (k >= 1) txt(ctx, v, 320, y + 31, 14, 800, C.primary, 'right')
  })
  progress(ctx, 24, 700, 312, p, 8)
}

const result: Draw = (ctx, p) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  header(ctx, 'Screening result')
  chip(ctx, '✓ Assessment finalised', 24, 98, C.mint, C.primaryDark, 11.5)
  txt(ctx, 'Right knee screening complete', 24, 150, 19.5, 800)
  rr(ctx, 24, 166, 312, 52, 14, C.tint)
  rr(ctx, 36, 176, 32, 32, 9, C.surface)
  txt(ctx, 'KD', 52, 197, 12, 800, C.primary, 'center')
  txt(ctx, 'Kamala Devi (64F)', 80, 197, 14.5, 800)
  chip(ctx, 'PHC Rampur', 326, 179, C.surface, C.ink, 10.5, 'right')
  // result card
  const k = easeOut(seg(p, 0.05, 0.3))
  ctx.globalAlpha = k
  card(ctx, 24, 232, 312, 220, 18)
  ctx.save(); roundRect(ctx, 24, 232, 312, 220, 18); ctx.clip()
  const gb = ctx.createLinearGradient(24, 0, 336, 0); gb.addColorStop(0, C.mint); gb.addColorStop(0.5, '#6ED9CC'); gb.addColorStop(1, C.errorTint)
  ctx.fillStyle = gb; ctx.fillRect(24, 232, 312, 7); ctx.restore()
  txt(ctx, 'SCREENING RESULT', 42, 268, 11, 800, C.secondary)
  txt(ctx, 'Moderate', 42, 302, 26, 800, C.warningText)
  txt(ctx, 'screening risk', 42, 326, 18, 700, C.ink)
  chip(ctx, 'Refer to PHC', 320, 254, C.warningTint, C.warningText, 11, 'right')
  const bx = 42, bw = 276, by = 352
  const bg = ctx.createLinearGradient(bx, 0, bx + bw, 0); bg.addColorStop(0, '#5ED3B8'); bg.addColorStop(0.5, '#F5C04A'); bg.addColorStop(1, '#E5534B')
  rr(ctx, bx, by, bw, 12, 6, '#fff'); roundRect(ctx, bx, by, bw, 12, 6); ctx.fillStyle = bg; ctx.fill()
  const mx = bx + bw * 0.52 * easeOut(seg(p, 0.15, 0.45))
  ctx.beginPath(); ctx.arc(mx, by + 6, 11, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke()
  txt(ctx, 'Low', bx, by + 36, 11.5, 700, C.secondary)
  txt(ctx, 'Moderate', bx + bw / 2, by + 36, 11.5, 800, C.ink, 'center')
  txt(ctx, 'Higher', bx + bw, by + 36, 11.5, 700, C.secondary, 'right')
  txt(ctx, 'Further clinical evaluation may help.', 42, 428, 13, 600, C.secondary)
  ctx.globalAlpha = 1
  // factors
  card(ctx, 24, 466, 312, 168, 18)
  txt(ctx, 'Key contributing factors', 42, 496, 15.5, 800)
  ;['Morning joint stiffness', 'Reduced range of movement', 'Age 60 or above'].forEach((f, i) => {
    const kk = easeOut(seg(p, 0.35 + i * 0.12, 0.5 + i * 0.12))
    ctx.globalAlpha = kk
    const y = 512 + i * 38 + (1 - kk) * 10
    rr(ctx, 40, y, 280, 32, 10, C.tint)
    ctx.beginPath(); ctx.arc(58, y + 16, 9, 0, Math.PI * 2); ctx.fillStyle = C.mint; ctx.fill()
    txt(ctx, f, 76, y + 21, 13, 700)
    ctx.globalAlpha = 1
  })
  rr(ctx, 24, 646, 312, 40, 12, C.infoTint)
  txt(ctx, 'Screening result — not a diagnosis', 180, 671, 12.5, 700, C.info, 'center')
  button(ctx, 'Next steps', 704, seg(p, 0.9, 0.99), { h: 50 })
}

const exercises: Draw = (ctx, p, t) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  header(ctx, 'Guidance')
  card(ctx, 24, 104, 312, 104, 18)
  roundRect(ctx, 24, 104, 312, 104, 18); ctx.strokeStyle = C.mint; ctx.lineWidth = 2.5; ctx.stroke()
  txt(ctx, 'RECOMMENDED NEXT ACTION', 42, 132, 11, 800, C.secondary)
  wrap(ctx, 'PHC visit for clinical evaluation. Begin gentle joint exercises.', 42, 160, 280, 15.5, 800, C.primaryDark, 1.3)
  txt(ctx, 'Gentle exercises', 24, 246, 17, 800)
  const ex: [string, string][] = [['Seated knee extension', '10 × 2 sets daily'], ['Heel slides', '10 × each leg'], ['Daily walk', '15 minutes, flat ground']]
  ex.forEach(([n, d], i) => {
    const kk = easeOut(seg(p, 0.05 + i * 0.12, 0.25 + i * 0.12))
    ctx.globalAlpha = kk
    const y = 262 + i * 96 + (1 - kk) * 16
    card(ctx, 24, y, 312, 84, 16)
    rr(ctx, 36, y + 10, 64, 64, 14, C.mintSoft)
    stickFigure(ctx, i, 68, y + 42, t + i)
    txt(ctx, n, 114, y + 38, 15, 800)
    txt(ctx, d, 114, y + 60, 12.5, 500, C.secondary)
    ctx.globalAlpha = 1
  })
  rr(ctx, 24, 560, 312, 60, 14, C.warningTint)
  wrap(ctx, 'Follow-up screening in 60 days', 44, 596, 280, 14, 700, C.warningText)
  button(ctx, 'View patient report', 700, seg(p, 0.88, 0.99))
}

const sync: Draw = (ctx, p, t) => {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H)
  header(ctx, 'Patient report')
  card(ctx, 24, 100, 312, 270, 18)
  ctx.beginPath(); ctx.arc(64, 146, 24, 0, Math.PI * 2); ctx.fillStyle = C.tint; ctx.fill()
  txt(ctx, 'KD', 64, 151, 14, 800, C.primary, 'center')
  txt(ctx, 'Kamala Devi', 100, 142, 17, 800)
  txt(ctx, '64 · Female · Rampur', 100, 163, 12.5, 500, C.secondary)
  const rows: [string, string][] = [['Joint', 'Right knee'], ['Screening band', 'Moderate'], ['Screened', '14 Oct 2026'], ['Follow-up', '13 Dec 2026'], ['Referred to', 'PHC Rampur']]
  rows.forEach(([a, b], i) => {
    const y = 196 + i * 34
    ctx.fillStyle = C.tint2; ctx.fillRect(42, y - 4, 276, 1)
    txt(ctx, a, 42, y + 20, 13, 600, C.secondary)
    txt(ctx, b, 318, y + 20, 13.5, 800, i === 1 ? C.warningText : C.ink, 'right')
  })
  // share
  ;['Print', 'Share', 'SMS'].forEach((l, i) => { rr(ctx, 24 + i * 106, 386, 98, 46, 14, C.surface, C.tint2); txt(ctx, l, 73 + i * 106, 415, 13.5, 700, C.primary, 'center') })
  // sync
  const online = p > 0.18, done = p > 0.62
  card(ctx, 24, 452, 312, 150, 18, done ? C.primaryLight : C.surface)
  // cloud icon
  const cx = 66, cy = 500
  ctx.fillStyle = done ? C.primary : online ? C.info : C.muted
  ctx.beginPath(); ctx.arc(cx - 8, cy + 4, 11, 0, Math.PI * 2); ctx.arc(cx + 4, cy - 3, 14, 0, Math.PI * 2); ctx.arc(cx + 16, cy + 5, 10, 0, Math.PI * 2); ctx.fill()
  ctx.fillRect(cx - 8, cy + 4, 24, 11)
  if (done) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 2, cy + 5); ctx.lineTo(cx + 3, cy + 10); ctx.lineTo(cx + 11, cy); ctx.stroke() }
  txt(ctx, done ? 'Synced to PHC Rampur' : online ? 'Syncing securely…' : 'Waiting for network', 100, 498, 16, 800, done ? C.primaryDark : C.ink)
  txt(ctx, done ? 'Medical officer notified' : online ? '4G signal found · uploading 3 records' : 'Saved on this device', 100, 520, 12.5, 500, C.secondary)
  progress(ctx, 42, 548, 276, done ? 1 : online ? smooth(seg(p, 0.18, 0.62)) : 0, 8, C.tint2, done ? C.success : C.info)
  if (online && !done) for (let i = 0; i < 3; i++) { const k = (t * 1.5 + i / 3) % 1; ctx.beginPath(); ctx.arc(42 + k * 276, 552, 3, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill() }
  txt(ctx, done ? '✓ 3 of 3 records' : '', 42, 584, 12.5, 700, C.success)
  button(ctx, 'Back to dashboard', 700, 0, { variant: 'secondary' })
}

const DRAW: Record<string, Draw> = { login, language, dashboard, register, joint, questions, connect, calibrate, assess, analysis, result, exercises, sync }

export function screenAt(t: number): { id: string; p: number; start: number; idx: number } {
  for (let i = 0; i < SCREENS.length; i++) {
    const [id, a, b] = SCREENS[i]
    if (t < b || i === SCREENS.length - 1) return { id, p: clamp((t - a) / (b - a)), start: a, idx: i }
  }
  return { id: 'login', p: 0, start: 0, idx: 0 }
}

/* ---------- the 3D phone ---------- */
export function createPhone() {
  const canvas = document.createElement('canvas')
  canvas.width = W * S; canvas.height = H * S
  const ctx = canvas.getContext('2d')!
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.minFilter = THREE.LinearMipmapLinearFilter

  const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
  const build = () => {
    const g = new THREE.Group()
    const body = new THREE.Mesh(new RoundedBoxGeometry(1, 2.12, 0.1, 4, 0.12), new THREE.MeshStandardMaterial({ color: '#1C2026', roughness: 0.35, metalness: 0.6 }))
    g.add(body)
    const rim = new THREE.Mesh(new RoundedBoxGeometry(1.02, 2.14, 0.07, 4, 0.12), new THREE.MeshStandardMaterial({ color: '#7FD8CF', roughness: 0.3, metalness: 0.8 }))
    g.add(rim)
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.93, 2.015), screenMat)
    screen.position.z = 0.0515
    g.add(screen)
    const btn = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.04), new THREE.MeshStandardMaterial({ color: '#7FD8CF', metalness: 0.8, roughness: 0.3 }))
    btn.position.set(0.515, 0.45, 0); g.add(btn)
    return g
  }

  let lastKey = ''
  function render(t: number) {
    const cur = screenAt(t)
    const key = `${cur.id}|${Math.round(t * 30)}`
    if (key === lastKey) return
    lastKey = key
    ctx.setTransform(S, 0, 0, S, 0, 0)
    const trans = 0.45
    const k = cur.idx > 0 ? smooth((t - cur.start) / trans) : 1
    if (k < 1) {
      const [pid, pa, pb] = SCREENS[cur.idx - 1]
      ctx.save(); ctx.translate(-k * W * 0.3, 0)
      DRAW[pid](ctx, 1, pa + (pb - pa), pb - pa)
      ctx.restore()
      ctx.fillStyle = `rgba(0,0,0,${0.15 * k})`; ctx.fillRect(0, 0, W, H)
      ctx.save(); ctx.translate((1 - k) * W, 0)
      ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 20
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); ctx.shadowColor = 'transparent'
      DRAW[cur.id](ctx, cur.p, t, 0)
      ctx.restore()
    } else DRAW[cur.id](ctx, cur.p, t, 0)
    statusBar(ctx)
    tex.needsUpdate = true
  }

  return { build, render, canvas }
}
