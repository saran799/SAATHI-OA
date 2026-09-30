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
