const fs = require('fs');

const languages = {
  hi: {
    assessment: `
      liveRecording: "लाइव रिकॉर्डिंग",
      getReady: "तैयार हो जाएं",
      instructionText: "मरीज़ से कहें कि जब आप 'गो' कहें तो धीरे-धीरे हिलना शुरू करें।",
      movementDetected: "मूवमेंट का पता चला — स्थिरता से जारी रखें",
      waitingMovement: "मूवमेंट की प्रतीक्षा में…",
      movementTrace: "मूवमेंट ट्रेस",
      sensorSimulated: "साथी सेंसर (सिम्युलेटेड)",
      noMovementCallout: "सेंसर को जोड़ की मूवमेंट का पता नहीं चला। जांचें कि पट्टा कसकर बंधा है और मरीज को जोड़ धीरे से हिलाने के लिए कहें।",
      interruptedCallout: "पूरा होने से पहले रिकॉर्डिंग रोक दी गई। कुछ भी सेव नहीं किया गया है।",
      stopRecording: "रिकॉर्डिंग रोकें",
      discardRestart: "छोड़ें और फिर से टेस्ट करें",
      demoNoMovement: "डेमो: कोई मूवमेंट नहीं",
      exitScreening: "स्क्रीनिंग से बाहर निकलें",
      movementRecorded: "मूवमेंट रिकॉर्ड किया गया। विश्लेषण तैयार कर रहा है…",`,
    exercises: `
      easy: "आसान",`,
    guidance: `
      recommendedExercises: "अनुशंसित व्यायाम",
      exercisesDesc: "जोड़ों की कार्यक्षमता बनाए रखने और दर्द कम करने के लिए सरल व्यायाम।",
      lifestyleCare: "जीवनशैली की देखभाल",
      essential: "ज़रूरी रोज़मर्रा की आदतें",
      weightActivity: "वजन और गतिविधि",
      weightActivityDesc: "स्वस्थ वजन बनाए रखें। हर किलो वजन कम करने से घुटने का भार 4 किलो कम हो जाता है। धीरे-धीरे चलते रहें।",
      whenToVisitPHC: "PHC कब जाएं",
      priority: "यदि दर्द के कारण नींद नहीं आती या चलने में परेशानी होती है तो क्लीनिक जाएं।",
      shareTitle: "मार्गदर्शन साझा करें",
      copiedAlert: "क्लिपबोर्ड पर कॉपी किया गया",
      shareBtn: "WhatsApp के माध्यम से साझा करें",
      personalisedGuidelines: "व्यक्तिगत दिशानिर्देश",
      printBooklet: "बुकलेट प्रिंट करें",`,
    result: `
      viewDetailedReport: "विस्तृत रिपोर्ट देखें",
      notRequired: "आवश्यक नहीं",`,
    sensor: `
      pairingProg: "पेयर हो रहा है...",
      connectBtn: "कनेक्ट करें",
      signalStrength: "सिग्नल स्ट्रेंथ",
      timeLft: "बचा हुआ समय",
      errorTitle: "कनेक्शन त्रुटि",
      errorDesc: "सेंसर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।",
      ledCheck: "जांचें कि सेंसर LED नीले रंग में झपक रही है।",
      refreshDevices: "डिवाइस रिफ्रेश करें",`,
    joint: `
      noSelection: "कोई चयन नहीं",`
  },
  bn: {
    assessment: `
      liveRecording: "লাইভ রেকর্ডিং",
      getReady: "প্রস্তুত হন",
      instructionText: "রোগীকে বলুন যখন আপনি 'গো' বলবেন তখন ধীরে ধীরে নড়াচড়া শুরু করতে।",
      movementDetected: "নড়াচড়া শনাক্ত হয়েছে — স্থিরভাবে চালিয়ে যান",
      waitingMovement: "নড়াচড়ার জন্য অপেক্ষা করা হচ্ছে…",
      movementTrace: "নড়াচড়ার ট্রেস",
      sensorSimulated: "সাথী সেন্সর (সিমুলেটেড)",
      noMovementCallout: "সেন্সর জয়েন্টের নড়াচড়া শনাক্ত করতে পারেনি। স্ট্র্যাপটি শক্ত আছে কিনা পরীক্ষা করুন।",
      interruptedCallout: "সম্পন্ন হওয়ার আগেই রেকর্ডিং বন্ধ করা হয়েছে। কিছুই সেভ করা হয়নি।",
      stopRecording: "রেকর্ডিং থামান",
      discardRestart: "বাদ দিন এবং আবার পরীক্ষা করুন",
      demoNoMovement: "ডেমো: কোন নড়াচড়া নেই",
      exitScreening: "স্ক্রিনিং থেকে প্রস্থান করুন",
      movementRecorded: "নড়াচড়া রেকর্ড করা হয়েছে। বিশ্লেষণ প্রস্তুত করা হচ্ছে…",`,
    exercises: `
      easy: "সহজ",`,
    guidance: `
      recommendedExercises: "প্রস্তাবিত ব্যায়াম",
      exercisesDesc: "জয়েন্টের কার্যকারিতা বজায় রাখতে এবং ব্যথা কমাতে সহজ ব্যায়াম।",
      lifestyleCare: "জীবনধারা যত্ন",
      essential: "প্রয়োজনীয় দৈনন্দিন অভ্যাস",
      weightActivity: "ওজন এবং কার্যকলাপ",
      weightActivityDesc: "সুস্থ ওজন বজায় রাখুন। ধীরে ধীরে নড়াচড়া চালিয়ে যান।",
      whenToVisitPHC: "কখন PHC তে যাবেন",
      priority: "ব্যথা যদি ঘুমের ব্যাঘাত ঘটায় তবে চিকিৎসকের পরামর্শ নিন।",
      shareTitle: "নির্দেশিকা শেয়ার করুন",
      copiedAlert: "ক্লিপবোর্ডে কপি করা হয়েছে",
      shareBtn: "WhatsApp এর মাধ্যমে শেয়ার করুন",
      personalisedGuidelines: "ব্যক্তিগত নির্দেশিকা",
      printBooklet: "বুকলেট প্রিন্ট করুন",`,
    result: `
      viewDetailedReport: "বিস্তারিত রিপোর্ট দেখুন",
      notRequired: "প্রয়োজন নেই",`,
    sensor: `
      pairingProg: "পেয়ার করা হচ্ছে...",
      connectBtn: "কানেক্ট করুন",
      signalStrength: "সিগন্যালের শক্তি",
      timeLft: "বাকি সময়",
      errorTitle: "কানেকশন ত্রুটি",
      errorDesc: "সেন্সরের সাথে কানেক্ট করা যায়নি। আবার চেষ্টা করুন।",
      ledCheck: "সেন্সরের LED নীল জ্বলছে কিনা চেক করুন।",
      refreshDevices: "ডিভাইস রিফ্রেশ করুন",`,
    joint: `
      noSelection: "কোনো নির্বাচন নেই",`
  },
  as: {
    assessment: `
      liveRecording: "লাইভ ৰেকৰ্ডিং",
      getReady: "প্ৰস্তুত হওক",
      instructionText: "ৰোগীক কওক যেতিয়া আপুনি 'গো' ক'ব তেতিয়া লাহে লাহে লৰচৰ কৰিবলৈ আৰম্ভ কৰিব।",
      movementDetected: "লৰচৰ ধৰা পৰিছে — স্থিৰভাৱে চলাই যাওক",
      waitingMovement: "লৰচৰৰ বাবে অপেক্ষা কৰা হৈছে…",
      movementTrace: "লৰচৰৰ ট্ৰেচ",
      sensorSimulated: "সাথী ছেন্সৰ (চিমুলেটেড)",
      noMovementCallout: "ছেন্সৰে গাঁঠিৰ লৰচৰ ধৰা পেলাব নোৱাৰিলে।",
      interruptedCallout: "সম্পূৰ্ণ হোৱাৰ আগতেই ৰেকৰ্ডিং বন্ধ কৰা হৈছিল। একো ছেভ কৰা হোৱা নাই।",
      stopRecording: "ৰেকৰ্ডিং বন্ধ কৰক",
      discardRestart: "বাদ দিয়ক আৰু পুনৰ পৰীক্ষা কৰক",
      demoNoMovement: "ডেমো: কোনো লৰচৰ নাই",
      exitScreening: "স্ক্ৰীনিঙৰ পৰা প্ৰস্থান কৰক",
      movementRecorded: "লৰচৰ ৰেকৰ্ড কৰা হ'ল। বিশ্লেষণ প্ৰস্তুত কৰা হৈছে…",`,
    exercises: `
      easy: "সহজ",`,
    guidance: `
      recommendedExercises: "পৰামৰ্শ দিয়া ব্যায়াম",
      exercisesDesc: "গাঁঠিৰ কাৰ্যক্ষমতা বজাই ৰাখিবলৈ আৰু বিষ কমাবলৈ সহজ ব্যায়াম।",
      lifestyleCare: "জীৱনশৈলীৰ যতন",
      essential: "প্ৰয়োজনীয় দৈনন্দিন অভ্যাস",
      weightActivity: "ওজন আৰু কাৰ্যকলাপ",
      weightActivityDesc: "সুস্থ ওজন বজাই ৰাখক।",
      whenToVisitPHC: "কেতিয়া PHC লৈ যাব",
      priority: "বিষৰ বাবে টোপনিত ব্যাঘাত জন্মিলে চিকিৎসকৰ পৰামৰ্শ লওক।",
      shareTitle: "মাৰ্গদৰ্শন শ্বেয়াৰ কৰক",
      copiedAlert: "ক্লিপবৰ্ডলৈ কপি কৰা হ'ল",
      shareBtn: "WhatsApp ৰ জৰিয়তে শ্বেয়াৰ কৰক",
      personalisedGuidelines: "ব্যক্তিগত নিৰ্দেশিকা",
      printBooklet: "বুকলেট প্ৰিণ্ট কৰক",`,
    result: `
      viewDetailedReport: "বিতং ৰিপৰ্ট চাওক",
      notRequired: "প্ৰয়োজন নাই",`,
    sensor: `
      pairingProg: "পেয়াৰ কৰা হৈছে...",
      connectBtn: "কানেক্ট কৰক",
      signalStrength: "চিগনেলৰ শক্তি",
      timeLft: "বাকী থকা সময়",
      errorTitle: "কানেকচন ত্ৰুটি",
      errorDesc: "ছেন্সৰৰ সৈতে কানেক্ট কৰিব পৰা নগ'ল। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।",
      ledCheck: "ছেন্সৰৰ LED নীলা ৰঙত জ্বলিছে নেকি পৰীক্ষা কৰক।",
      refreshDevices: "ডিভাইচ ৰিফ্ৰেচ কৰক",`,
    joint: `
      noSelection: "কোনো নিৰ্বাচন নাই",`
  },
  ta: {
    assessment: `
      liveRecording: "நேரடி பதிவு",
      getReady: "தயாராகுங்கள்",
      instructionText: "நீங்கள் 'கோ' என்று சொல்லும்போது நோயாளியை மெதுவாக நகரத் தொடங்கச் சொல்லுங்கள்.",
      movementDetected: "அசைவு கண்டறியப்பட்டது - சீராக தொடரவும்",
      waitingMovement: "அசைவுக்காக காத்திருக்கிறது…",
      movementTrace: "அசைவு சுவடு",
      sensorSimulated: "சாத்தி சென்சார் (சிமுலேட்டட்)",
      noMovementCallout: "சென்சார் மூட்டு அசைவைக் கண்டறியவில்லை.",
      interruptedCallout: "முடிவதற்குள் பதிவு நிறுத்தப்பட்டது. எதுவும் சேமிக்கப்படவில்லை.",
      stopRecording: "பதிவை நிறுத்து",
      discardRestart: "நிராகரித்து மீண்டும் சோதிக்கவும்",
      demoNoMovement: "டெமோ: எந்த அசைவும் இல்லை",
      exitScreening: "ஸ்கிரீனிங்கிலிருந்து வெளியேறு",
      movementRecorded: "அசைவு பதிவு செய்யப்பட்டது. பகுப்பாய்வு தயாராகிறது…",`,
    exercises: `
      easy: "எளிதானது",`,
    guidance: `
      recommendedExercises: "பரிந்துரைக்கப்படும் உடற்பயிற்சிகள்",
      exercisesDesc: "மூட்டு செயல்பாட்டை பராமரிக்கவும் வலியை குறைக்கவும் எளிய பயிற்சிகள்.",
      lifestyleCare: "வாழ்க்கை முறை பராமரிப்பு",
      essential: "அன்றாட பழக்கவழக்கங்கள்",
      weightActivity: "எடை மற்றும் செயல்பாடு",
      weightActivityDesc: "ஆரோக்கியமான எடையை பராமரிக்கவும்.",
      whenToVisitPHC: "PHC ஐ எப்போது பார்வையிட வேண்டும்",
      priority: "வலி தூக்கத்தை தடுத்தால் கிளினிக்கிற்குச் செல்லுங்கள்.",
      shareTitle: "வழிகாட்டலைப் பகிரவும்",
      copiedAlert: "கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது",
      shareBtn: "WhatsApp மூலம் பகிரவும்",
      personalisedGuidelines: "தனிப்பயனாக்கப்பட்ட வழிகாட்டுதல்கள்",
      printBooklet: "கையேட்டை அச்சிடுக",`,
    result: `
      viewDetailedReport: "விரிவான அறிக்கையைப் பார்க்கவும்",
      notRequired: "தேவையில்லை",`,
    sensor: `
      pairingProg: "இணைக்கப்படுகிறது...",
      connectBtn: "இணை",
      signalStrength: "சிக்னல் வலிமை",
      timeLft: "மீதமுள்ள நேரம்",
      errorTitle: "இணைப்பு பிழை",
      errorDesc: "சென்சாருடன் இணைக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
      ledCheck: "சென்சார் LED நீல நிறத்தில் ஒளிர்கிறதா என சரிபார்க்கவும்.",
      refreshDevices: "சாதனங்களை புதுப்பிக்கவும்",`,
    joint: `
      noSelection: "தேர்வு இல்லை",`
  },
  mni: {
    assessment: `
      liveRecording: "Live Recording",
      getReady: "Semsabiro",
      instructionText: "Ask the patient to begin slow movements when you say 'go'.",
      movementDetected: "Movement detected — keep going steadily",
      waitingMovement: "Waiting for movement…",
      movementTrace: "Movement Trace",
      sensorSimulated: "SAATHI sensor (simulated)",
      noMovementCallout: "The sensor did not detect joint movement.",
      interruptedCallout: "The recording was stopped before completion.",
      stopRecording: "Stop Recording",
      discardRestart: "Discard & restart test",
      demoNoMovement: "Demo: no movement",
      exitScreening: "Exit screening",
      movementRecorded: "Movement recorded. Preparing analysis…",`,
    exercises: `
      easy: "Easy",`,
    guidance: `
      recommendedExercises: "Recommended Exercises",
      exercisesDesc: "Simple exercises to maintain joint function and reduce pain.",
      lifestyleCare: "Lifestyle Care",
      essential: "Essential everyday habits",
      weightActivity: "Weight and Activity",
      weightActivityDesc: "Maintain a healthy weight.",
      whenToVisitPHC: "When to Visit PHC",
      priority: "Seek clinical care if pain prevents sleep.",
      shareTitle: "Share Guidance",
      copiedAlert: "Copied to clipboard",
      shareBtn: "Share via WhatsApp",
      personalisedGuidelines: "Personalised Guidelines",
      printBooklet: "Print Booklet",`,
    result: `
      viewDetailedReport: "View detailed report",
      notRequired: "Not required",`,
    sensor: `
      pairingProg: "Pairing...",
      connectBtn: "Connect",
      signalStrength: "Signal Strength",
      timeLft: "Time Left",
      errorTitle: "Connection Error",
      errorDesc: "Could not connect to the sensor. Please try again.",
      ledCheck: "Check that the sensor LED is blinking blue.",
      refreshDevices: "Refresh Devices",`,
    joint: `
      noSelection: "No selection",`
  }
};

const keys = ['assessment', 'exercises', 'guidance', 'result', 'sensor', 'joint'];

Object.keys(languages).forEach(lang => {
  const file = 'src/i18n/' + lang + '.ts';
  let text = fs.readFileSync(file, 'utf8');
  
  keys.forEach(k => {
    const patch = languages[lang][k];
    if (patch) {
      // Find the block like `assessment: {` or `assessment: {\n`
      const regex = new RegExp('    ' + k + ': \\{\\r?\\n');
      text = text.replace(regex, '    ' + k + ': {' + '\\n' + patch + '\\n');
    }
  });

  fs.writeFileSync(file, text, 'utf8');
  console.log('Patched ' + file);
});
