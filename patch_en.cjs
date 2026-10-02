const fs = require('fs');

let text = fs.readFileSync('src/i18n/en.ts', 'utf8');

text = text.replace(/    assessment: \{\r?\n/, `    assessment: {
      liveRecording: "LIVE RECORDING",
      getReady: "GET READY",
      instructionText: "Ask the patient to begin slow movements when you say 'go'.",
      movementDetected: "Movement detected — keep going steadily",
      waitingMovement: "Waiting for movement…",
      movementTrace: "Movement Trace",
      sensorSimulated: "SAATHI sensor (simulated)",
      noMovementCallout: "The sensor did not detect joint movement. Check the strap is snug and ask the patient to move the joint slowly.",
      interruptedCallout: "The recording was stopped before completion. Nothing has been saved.",
      stopRecording: "Stop Recording",
      discardRestart: "Discard & restart test",
      demoNoMovement: "Demo: no movement",
      exitScreening: "Exit screening",
      movementRecorded: "Movement recorded. Preparing analysis…",\n`);

text = text.replace(/    exercises: \{\r?\n/, `    exercises: {
      easy: "Easy",\n`);

text = text.replace(/    guidance: \{\r?\n/, `    guidance: {
      recommendedExercises: "Recommended Exercises",
      exercisesDesc: "Simple exercises to maintain joint function and reduce pain.",
      lifestyleCare: "Lifestyle Care",
      essential: "Essential everyday habits",
      weightActivity: "Weight and Activity",
      weightActivityDesc: "Maintain a healthy weight. Every kilo lost reduces knee load by 4 kilos. Keep moving gently.",
      whenToVisitPHC: "When to Visit PHC",
      priority: "Seek clinical care if pain prevents sleep or restricts daily walking.",
      shareTitle: "Share Guidance",
      copiedAlert: "Copied to clipboard",
      shareBtn: "Share via WhatsApp",
      personalisedGuidelines: "Personalised Guidelines",
      printBooklet: "Print Booklet",\n`);

text = text.replace(/    result: \{\r?\n/, `    result: {
      viewDetailedReport: "View detailed report",
      notRequired: "Not required",\n`);

text = text.replace(/    sensor: \{\r?\n/, `    sensor: {
      pairingProg: "Pairing...",
      connectBtn: "Connect",
      signalStrength: "Signal Strength",
      timeLft: "Time Left",
      errorTitle: "Connection Error",
      errorDesc: "Could not connect to the sensor. Please try again.",
      ledCheck: "Check that the sensor LED is blinking blue.",
      refreshDevices: "Refresh Devices",\n`);

text = text.replace(/    joint: \{\r?\n/, `    joint: {
      noSelection: "No selection",\n`);

fs.writeFileSync('src/i18n/en.ts', text, 'utf8');
console.log('en.ts patched.');
