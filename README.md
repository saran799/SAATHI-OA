# SAATHI — A companion for earlier care

AI-assisted **osteoarthritis screening-support** prototype for community healthcare workers.
SAATHI is **not a diagnostic system**; every result is a *screening risk estimate* with a clinical disclaimer.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```
Demo login: any Worker ID + any 4-digit PIN.

## Demo flow
Login → Language → Dashboard → **+ New Patient** → Register (3 steps) → Patient profile → Select joint → 8 symptom questions → Movement instructions → Sensor connect → Calibration (Prepare/Position/Calibrate/Ready) → Live movement assessment (30 s) → AI analysis → Screening result → Guidance → Exercises → Patient report → Records.

Each simulated stage has a small "Demo: simulate … failure" link to show error recovery (sensor not found, calibration failed, movement not detected, assessment interrupted, analysis failed). Settings → Demo controls toggles offline mode and a failing sync.

## Design source
UI follows the Figma exports in `/home/user/figma-reference/` (16 frames). Palette sampled from the exports: primary `#00685F`, mint `#99EFE5` / `#D5F8F5`, lavender tint `#EFF4FF`, background `#F8F9FF`, error `#BA1B1B`. Logo asset: `src/assets/saathi-logo.png`, `saathi-mark.png` (cropped from Screen 01).

## Architecture
```
src/
  app/router.tsx            routes + auth/language guards
  components/ui             Button, SelectableCard, Field/Input, Chip, Callout, ProgressBar, Stepper, Ring…
  components/layout         AppShell (tabs + sync strip), FlowShell (back, step, progress, sticky CTA)
  domain/                   types, questions, risk engine (DEMO, not validated), guidance/exercises, copy
  services/                 sensor.ts (SensorAdapter + SimulatedSensor), analysis.ts (simulated AI), sync.ts (simulated), mockData.ts
  store/                    appStore (patients/records/sync, persisted to localStorage), sessionStore (current screening)
  features/                 one folder per screen group
```
Replace points: `services/sensor.ts` (Web Bluetooth), `services/analysis.ts` + `domain/risk.ts` (real model/API), `services/sync.ts` (backend).

Sync is **simulated** — no data leaves the device.

## Interactive 3D demo film (`/showcase`)
A ~2.7-minute 3D film (Three.js) set in a Himalayan hill hamlet above a river gorge. It walks through the idea, the app prototype, the screening procedure and the architecture. It's interactive: drag to orbit, jump between chapters, click markers.
```bash
npm run showcase         # http://localhost:5174
npm run showcase:build   # → dist/showcase (static, deployable anywhere)
```
Chapters: Hills → The problem → ASHA arrives (on foot, up the switchbacks) → App (intake: sign-in, language, dashboard, patient, joint, symptoms) → **Camera ROM** (pose model tracks hip–knee–ankle angle) → **Knee posture** (standing still for 5 s: left vs right hip–knee–ankle angle and the symmetry difference) → **Strap pod** (below the knee, on the tibia) → **Tibial shock** (walk test plus an anatomy explainer) → **Lab-validated** (the shoe-cushioning tibial-accelerometer method, and why it is novel) → Result → **Nutrition** (diet plan by risk band) → Sync → **PHC dashboard** (the screening arrives at PHC Rongli: Overview counters tick, the new row appears in the Patient Registry, Analytics update) → Architecture → Impact → SAATHI.
- The patient is Tashi Bhutia (68, a farmer from a Sikkim hill hamlet) in trousers, so the camera can see his knee landmarks clearly; the worker is ASHA Sunita. The app runs in English.
- The PHC dashboard numbers follow the real PHC dashboard design (Overview / Patients / Analytics); the names and numbers are demo data.
- Peak tibial-acceleration values in the film (2.0 / 3.1–3.6 / 5.1 / 8.4 g) are **illustrative**, not measured results.
- **Share it:** `npm run showcase:publish` builds a static copy into `docs/` (relative paths, works from any sub-folder). Host that folder anywhere, e.g. GitHub Pages (Settings → Pages → branch + `/docs`), Vercel or Netlify.
- **Record video** writes the whole film to an MP4/WebM file at 1080p, with music (Chrome/Edge).
- Music is generated live with WebAudio: tanpura drone, bansuri in raag Bhupali, tabla keherwa. No audio files are used.
- Code: `showcase/src/` — `timeline.ts` (chapter times), `world.ts` (mountain hamlet, terraces, gorge, PHC), `characters.ts` (people, pod, tripod), `signals.ts` (knee angle, sway, tibial shock), `phone.ts` (app screens drawn on canvas), `dashboard.ts` (PHC dashboard), `lab.ts` (anatomy + sports-lab dioramas), `architecture.ts`, `impact.ts`, `audio.ts`, `main.ts` (cast, camera, overlay, UI).
