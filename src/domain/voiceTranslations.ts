import type { SupportedLang } from '../components/Voice'

const translations: Record<string, Record<SupportedLang, string>> = {
  'Waiting...': {
    en: 'Waiting...',
    hi: 'प्रतीक्षा हो रही है...',
    ta: 'காத்திருக்கிறது...',
    te: 'వేచి ఉంది...',
    mr: 'प्रतीक्षा करत आहे...',
    bn: 'অপেক্ষা করা হচ্ছে...',
    as: 'অপেক্ষা কৰা হৈছে...',
  },
  'Tracking patient': {
    en: 'Tracking patient',
    hi: 'रोगी को ट्रैक किया जा रहा है',
    ta: 'நோயாளியைக் கண்காணிக்கிறது',
    te: 'రోగిని ట్రాక్ చేస్తోంది',
    mr: 'रुग्णाचा मागोवा घेत आहे',
    bn: 'রোগীকে ট্র্যাক করা হচ্ছে',
    as: 'ৰোগীক ট্ৰেক কৰা হৈছে',
  },
  'No person detected. Move into the camera frame.': {
    en: 'No person detected. Move into the camera frame.',
    hi: 'कोई व्यक्ति नहीं मिला। कैमरे के फ्रेम में आएं।',
    ta: 'யாரும் கண்டறியப்படவில்லை. கேமரா முன் வரவும்.',
    te: 'ఎవరూ గుర్తించబడలేదు. కెమెరా ఫ్రేమ్‌లోకి వెళ్లండి.',
    mr: 'कोणीही आढळले नाही. कॅमेरा फ्रेममध्ये या.',
    bn: 'কাউকে শনাক্ত করা যায়নি। ক্যামেরার ফ্রেমে আসুন।',
    as: 'কোনো ব্যক্তি ধৰা পৰা নাই। কেমেৰাৰ ফ্ৰেমলৈ আহক।',
  },
  'Move back so your full body is visible.': {
    en: 'Move back so your full body is visible.',
    hi: 'पीछे हटें ताकि आपका पूरा शरीर दिखाई दे।',
    ta: 'முழு உடல் தெரியும்படி பின்னால் செல்லவும்.',
    te: 'మీ పూర్తి శరీరం కనిపించేలా వెనుకకు వెళ్లండి.',
    mr: 'आपले पूर्ण शरीर दिसण्यासाठी मागे सरका.',
    bn: 'পিছিয়ে যান যাতে আপনার পুরো শরীর দেখা যায়।',
    as: 'পিছুৱাই যাওক যাতে আপোনাৰ গোটেই শৰীৰ দেখা যায়।',
  },
  'Both knees must be visible. Adjust your position.': {
    en: 'Both knees must be visible. Adjust your position.',
    hi: 'दोनों घुटने दिखाई देने चाहिए। अपनी स्थिति ठीक करें।',
    ta: 'இரண்டு முழங்கால்களும் தெரிய வேண்டும். இடத்தை சரிசெய்யவும்.',
    te: 'రెండు మోకాళ్లు కనిపించాలి. మీ స్థానాన్ని సర్దుబాటు చేయండి.',
    mr: 'दोन्ही गुडघे दिसले पाहिजेत. आपली जागा समायोजित करा.',
    bn: 'দুটি হাঁটু দৃশ্যমান হতে হবে। আপনার অবস্থান ঠিক করুন।',
    as: 'দুয়োটা আঁঠু দৃশ্যমান হ’ব লাগিব। আপোনাৰ অৱস্থান ঠিক কৰক।',
  },
  'Please make sure your feet are visible.': {
    en: 'Please make sure your feet are visible.',
    hi: 'कृपया सुनिश्चित करें कि आपके पैर दिखाई दे रहे हैं।',
    ta: 'உங்கள் பாதங்கள் தெரியும்படி பார்த்துக்கொள்ளவும்.',
    te: 'దయచేసి మీ పాదాలు కనిపించేలా చూసుకోండి.',
    mr: 'कृपया तुमचे पाय दिसत असल्याची खात्री करा.',
    bn: 'অনুগ্রহ করে নিশ্চিত করুন যে আপনার পা দেখা যাচ্ছে।',
    as: 'অনুগ্ৰহ কৰি নিশ্চিত কৰক যে আপোনাৰ ভৰি দেখা গৈছে।',
  },
  'The camera cannot clearly track your movement. Improve lighting and keep your body visible.': {
    en: 'The camera cannot clearly track your movement. Improve lighting and keep your body visible.',
    hi: 'कैमरा आपकी गति को साफ नहीं देख पा रहा है। रोशनी ठीक करें।',
    ta: 'கேமரா இயக்கத்தை தெளிவாக கண்காணிக்க முடியவில்லை. ஒளியை சரிசெய்யவும்.',
    te: 'కెమెరా కదలికను స్పష్టంగా ట్రాక్ చేయలేకపోతుంది. వెలుతురు పెంచండి.',
    mr: 'कॅमेरा तुमच्या हालचालींचा मागोवा घेऊ शकत नाही. प्रकाश वाढवा.',
    bn: 'ক্যামেরা নড়াচড়া পরিষ্কারভাবে ট্র্যাক করতে পারছে না। আলো ঠিক করুন।',
    as: 'কেমেৰাই আপোনাৰ গতিবিধিসমূহ স্পষ্টভাৱে ট্ৰেক কৰিব পৰা নাই। পোহৰ বঢ়াওক।',
  },
  'Keep the phone steady.': {
    en: 'Keep the phone steady.',
    hi: 'फोन को स्थिर रखें।',
    ta: 'போனை நிலையாக வைக்கவும்.',
    te: 'ఫోన్‌ను స్థిరంగా ఉంచండి.',
    mr: 'फोन स्थिर ठेवा.',
    bn: 'ফোন স্থির রাখুন।',
    as: 'ফোনটো স্থিৰ ৰাখক।',
  },
  'Patient detected. The patient is ready. Please tap Start Assessment.': {
    en: 'Patient detected. The patient is ready. Please tap Start Assessment.',
    hi: 'रोगी मिल गया। रोगी तैयार है। कृपया स्टार्ट दबाएं।',
    ta: 'நோயாளி தயாராக உள்ளார். தொடங்கு பொத்தானை அழுத்தவும்.',
    te: 'రోగి సిద్ధంగా ఉన్నారు. ప్రారంభించండి నొక్కండి.',
    mr: 'रुग्ण तयार आहे. सुरू करा दाबा.',
    bn: 'রোগী প্রস্তুত। শুরু করুন এ চাপ দিন।',
    as: 'ৰোগী প্ৰস্তুত। আৰম্ভ কৰক টিপক।',
  },
  'Assessment could not be completed. Please try again.': {
    en: 'Assessment could not be completed. Please try again.',
    hi: 'मूल्यांकन पूरा नहीं हो सका। कृपया पुनः प्रयास करें।',
    ta: 'மதிப்பீட்டை முடிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    te: 'అంచనా పూర్తి కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    mr: 'मूल्यांकन पूर्ण होऊ शकले नाही. कृपया पुन्हा प्रयत्न करा.',
    bn: 'মূল্যায়ন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।',
    as: 'মূল্যায়ন সম্পূৰ্ণ কৰিব পৰা নগ’ল। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
  },
  'Please ask the patient to slowly bend the affected joint as far as comfortable and then slowly straighten it. Continue the movement naturally.': {
    en: 'Please ask the patient to slowly bend the affected joint as far as comfortable and then slowly straighten it. Continue the movement naturally.',
    hi: 'कृपया रोगी से प्रभावित जोड़ को धीरे-धीरे मोड़ने और फिर सीधा करने को कहें।',
    ta: 'பாதிக்கப்பட்ட மூட்டை மெதுவாக மடக்கவும் நீட்டவும் சொல்லவும்.',
    te: 'ప్రభావిత కీలును నెమ్మదిగా వంచి, ఆపై నెమ్మదిగా నిఠారుగా చేయమని రోగిని అడగండి.',
    mr: 'कृपया रुग्णाला प्रभावित सांधा हळूहळू वाकवण्यास आणि सरळ करण्यास सांगा.',
    bn: 'রোগীকে ধীরে ধীরে আক্রান্ত জয়েন্ট বাঁকা করতে এবং সোজা করতে বলুন।',
    as: 'ৰোগীক লাহে লাহে আক্ৰান্ত গাঁঠিটো ভাঁজ কৰিবলৈ আৰু তাৰ পিছত পোন কৰিবলৈ কওক।',
  },
  'Please ask the patient to stand up from the chair and sit back down as many times as possible for 30 seconds.': {
    en: 'Please ask the patient to stand up from the chair and sit back down as many times as possible for 30 seconds.',
    hi: 'कृपया रोगी से 30 सेकंड तक कुर्सी से उठने और बैठने को कहें।',
    ta: '30 வினாடிகளுக்கு நாற்காலியில் இருந்து எழுந்து உட்கார சொல்லவும்.',
    te: '30 సెకన్ల పాటు కుర్చీ నుండి లేచి కూర్చోమని రోగిని అడగండి.',
    mr: 'कृपया रुग्णाला 30 सेकंदांसाठी खुर्चीवरून उठायला आणि बसायला सांगा.',
    bn: 'রোগীকে 30 সেকেন্ডের জন্য চেয়ার থেকে উঠতে এবং বসতে বলুন।',
    as: 'ৰোগীক ৩০ ছেকেণ্ডৰ বাবে চকীৰ পৰা উঠিবলৈ আৰু বহিবলৈ কওক।',
  },
  'Please ask the patient to walk across the camera view normally.': {
    en: 'Please ask the patient to walk across the camera view normally.',
    hi: 'कृपया रोगी से कैमरे के सामने सामान्य रूप से चलने को कहें।',
    ta: 'கேமராவிற்கு முன் சாதாரணமாக நடக்க சொல்லவும்.',
    te: 'దయచేసి కెమెరా ముందు సాధారణంగా నడవమని రోగిని అడగండి.',
    mr: 'कृपया रुग्णाला कॅमेऱ्यासमोर सामान्यपणे चालण्यास सांगा.',
    bn: 'রোগীকে ক্যামেরার সামনে স্বাভাবিকভাবে হাঁটতে বলুন।',
    as: 'অনুগ্ৰহ কৰি ৰোগীক কেমেৰাৰ সন্মুখত স্বাভাৱিকভাৱে খোজ কাঢ়িবলৈ কওক।',
  },
  'Please ask the patient to stand still for 5 seconds.': {
    en: 'Please ask the patient to stand still for 5 seconds.',
    hi: 'कृपया रोगी से 5 सेकंड तक स्थिर खड़े रहने को कहें।',
    ta: 'நோயாளியை 5 வினாடிகள் அசையாமல் நிற்க சொல்லவும்.',
    te: 'రోగిని 5 సెకన్ల పాటు కదలకుండా నిలబడమని అడగండి.',
    mr: 'कृपया रुग्णाला 5 सेकंद स्थिर उभे राहण्यास सांगा.',
    bn: 'রোগীকে 5 সেকেন্ড স্থির হয়ে দাঁড়িয়ে থাকতে বলুন।',
    as: 'অনুগ্ৰহ কৰি ৰোগীক ৫ ছেকেণ্ডৰ বাবে স্থিৰ হৈ থিয় হ’বলৈ কওক।',
  },
}

export function tVoice(text: string, lang: SupportedLang): string {
  if (translations[text] && translations[text][lang]) {
    return translations[text][lang]
  }
  
  if (text.startsWith("Test ") && text.includes("completed")) {
    return translations['Test completed.']?.[lang] || 'Test completed.';
  }
  
  return text;
}
