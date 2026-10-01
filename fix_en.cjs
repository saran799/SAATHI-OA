const fs = require('fs');
let content = fs.readFileSync('src/i18n/en.ts', 'utf-8');

// common.bothJoints
content = content.replace(
  'selected: "Selected",',
  'selected: "Selected",\n    bothJoints: "Both {{joint}}s",\n    sideJoint: "{{side}} {{joint}}",'
);

// calibration
content = content.replace(
  'calibration: {',
  'calibration: {\n      barTitle: "Movement Assessment",\n      triageActive: "Triage active",\n      stepLabel: "Sensor Setup",\n      patientSeated: "Patient is seated",\n      start: "Start calibration",\n      retry: "Retry calibration",\n      continueWithout: "Continue without sensor",\n      calibrating: "Calibrating…",\n      startMovement: "Start movement assessment",\n      holdStill: "Hold still…",\n      progress: "Calibration progress",\n      sensorCalibrated: "Sensor calibrated",\n      failedTitle: "Calibration failed",\n      failedDesc: "The sensor moved during setup. Ask the patient to keep the joint completely still, then retry.",\n      demoFailure: "Demo: simulate calibration failure",'
);

// calibration steps & copy (flat keys for UI)
content = content.replace(
  'steps: ["Prepare", "Position", "Calibrate", "Ready"],',
  'steps: ["Prepare", "Position", "Calibrate", "Ready"],\n      "steps.0": "Prepare",\n      "steps.1": "Position",\n      "steps.2": "Calibrate",\n      "steps.3": "Ready",\n      "copy.0": "Ask {{name}} to sit comfortably with the sensor strapped on. The patient should relax the joint.",\n      "copy.1": "Place the joint in its resting position — straight and still. The sensor must not move for a few seconds.",\n      "copy.2t": "Calibrating…",\n      "copy.2": "Hold still. SAATHI is setting the starting position of the sensor.",\n      "copy.3": "Setup complete. You can now start the movement assessment.",'
);

// analysis
content = content.replace(
  'analysis: {',
  'analysis: {\n      analysisStopped: "Analysis stopped",\n      preparingResult: "Preparing screening result…",\n      finalising: "Finalising",\n      triageActive: "Triage active",\n      engineDemo: "Screening engine · demo",\n      couldNotFinish: "Analysis could not finish",\n      analysingData: "Analysing Data…",\n      savedOnDevice: "Your screening data is saved on this device.",\n      pleaseWait: "Please wait while the screening model processes the results.",\n      analysing: "Analysing",\n      currentRoutine: "Current routine",\n      screeningPipeline: "Screening pipeline",\n      stepProgress: "Step {{step}} of {{total}}",\n      activeStatus: "Active",\n      analysisFailed: "Analysis failed",\n      retryAnalysis: "Retry analysis",\n      backToPatient: "Back to patient",\n      demoSimulateFailure: "Demo: simulate analysis failure",\n      processedOnDevice: "Processed on-device (demo) · Screening risk estimation only, not a diagnosis.",'
);

// analysis steps
content = content.replace(
  'descs: {',
  '"steps.patient.label": "Patient information",\n      "steps.patient.sub": "Age, background and reported history",\n      "steps.patient.subCompleted": "Age, background and reported history",\n      "steps.symptoms.label": "Symptoms",\n      "steps.symptoms.sub": "Pain, stiffness and daily-function answers",\n      "steps.symptoms.subCompleted": "Pain, stiffness and daily-function answers",\n      "steps.movement.label": "Movement assessment",\n      "steps.movement.sub": "Range of movement and smoothness",\n      "steps.movement.subSkipped": "Skipped — symptoms only",\n      "steps.movement.subCompleted": "Range of movement and smoothness",\n      "steps.risk.label": "Estimating screening risk",\n      "steps.risk.sub": "Combining factors into a screening risk band",\n      "steps.risk.subCompleted": "Combining factors into a screening risk band",\n      descs: {'
);

// result
content = content.replace(
  'result: {',
  'result: {\n      triageActive: "Triage active",\n      assessmentFinalised: "Assessment finalised",\n      screeningComplete: "{{joint}} screening complete",\n      withMovement: "Symptoms and sensor movement analysis",\n      withoutMovement: "Symptom-based screening (movement test skipped)",\n      riskTitle: "Screening result",\n      riskWord: "screening risk",\n      screeningBand: "Screening band",\n      demo: "Demo",\n      confirmation: "Clinical confirmation required",\n      doctorVisit: "Recommended next action",\n      recommended: "Advise a PHC visit for clinical evaluation.",\n      indicates: "Clinical notice",\n      keyFactors: "Key contributing factors",\n      factorsNoted: "{{count}} noted",\n      recommendedAction: "Recommended next action",'
);

fs.writeFileSync('src/i18n/en.ts', content);
console.log('en.ts updated successfully');
