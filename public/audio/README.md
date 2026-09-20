# SAATHI Voice Audio Architecture

This directory is the architecture for bundled native-language prerecorded audio.

## Structure
```
/public/audio/{language}/{contentId}/step{index}.mp3
/public/audio/en/instructions/step1.mp3
/public/audio/hi/instructions/step1.mp3
/public/audio/as/instructions/step1.mp3
/public/audio/bn/instructions/step1.mp3
/public/audio/mni/instructions/step1.mp3
/public/audio/ta/instructions/step1.mp3
/public/audio/en/exercises/quad/step1.mp3
...
```

## Current Status (as of Voice v2)

**No actual audio files are bundled yet.** This is intentional - DO NOT generate fake placeholder audio.

The VoiceEngine will:
1. Try exact target-language SpeechSynthesis voice (genuine)
2. Try target-language regional/base voice (same language only)
3. Try bundled prerecorded audio at /public/audio/{lang}/...
4. If none exists: show "Native voice unavailable on this device" - DO NOT fallback to English

## Language Support Reality

SpeechSynthesis availability is DEVICE dependent:

- **en (English)**: High availability - en-IN, en-US, en-GB voices exist on most devices. Genuine voice expected.
- **hi (Hindi)**: Medium - hi-IN available on Android Chrome, some desktops, NOT on iOS Safari. Requires audio pack for iOS.
- **bn (Bengali)**: Low-Medium - bn-IN/bn-BD available on some Android, rare on desktop/iOS. Requires audio pack.
- **ta (Tamil)**: Low-Medium - ta-IN available on some Android, rare on desktop/iOS. Requires audio pack.
- **as (Assamese)**: Very Low - as-IN almost never available in any browser. Requires audio pack: /public/audio/as/
- **mni (Meitei/Manipuri)**: Very Low - mni-IN almost never available. Requires audio pack: /public/audio/mni/

## Implementation

VoiceEngine receives:
```ts
{
  language: 'en'|'hi'|'as'|'bn'|'mni'|'ta',
  text: string, // actual visible instruction text
  optionalAudioSource?: string // e.g., /audio/hi/instructions/step1.mp3
}
```

If audioSource provided, Audio element is tried first. If 404/error, fallback to TTS. If TTS genuine voice not found, UI shows unavailable state.

Never label English voice as Assamese/Bengali/Meitei/Tamil/Hindi.

## For Future

To add native audio:
1. Record native speakers for each instructional step
2. Place files at /public/audio/{lang}/{contentId}/step{N}.mp3
3. Update manifest or pass audioSources array to InstructionPlayer
4. Document which languages now have genuine audio support

Do NOT claim support merely because utterance.lang can be assigned.
