import { Router, Request, Response } from 'express';

const router = Router();

// Get the key from environment
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;

router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { text, language } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Valid text is required' });
    }

    // Default to Indian English
    let languageCode = language || 'en-IN';
    
    // Assamese and Manipuri are generally unsupported by standard TTS engines.
    // They share identical/similar scripts with Bengali, so we map them to Bengali 
    // to ensure the TTS engine can still pronounce the characters.
    if (languageCode.startsWith('as') || languageCode.startsWith('mni')) {
      languageCode = 'bn-IN';
    }
    
    // Voice name selection based on Google Cloud TTS documentation
    let name: string | undefined;
    if (languageCode.startsWith('en')) {
      name = 'en-IN-Standard-A';
    } else if (languageCode.startsWith('hi')) {
      name = 'hi-IN-Standard-A';
    } else {
      // For ta, te, mr, bn, as, mni - let Google TTS auto-select the best default voice
      name = undefined;
    }

    let audioBuffer: Buffer | null = null;
    if (GOOGLE_TTS_API_KEY) {
      try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode,
              ...(name ? { name } : {})
            },
            audioConfig: {
              audioEncoding: 'MP3'
            }
          })
        });
        
        if (response.ok) {
          const data: any = await response.json();
          if (data.audioContent) {
            audioBuffer = Buffer.from(data.audioContent, 'base64');
          }
        } else {
          const errorDetails = await response.text().catch(() => '');
          console.warn(`Google Cloud TTS responded with error (${response.status}): ${errorDetails}. Falling back to Google Translate TTS.`);
        }
      } catch (cloudErr) {
        console.warn('Google Cloud TTS request threw an exception. Falling back to Google Translate TTS:', cloudErr);
      }
    }

    // Fallback to free Google Translate TTS if Cloud TTS was not used, failed, or key was disabled
    if (!audioBuffer) {
      // Extract the short lang code (e.g., 'as' from 'as-IN')
      let shortLang = languageCode.split('-')[0];
      // Assamese and Manipuri are not directly supported by translate_tts, map to Bengali (similar script)
      if (shortLang === 'as' || shortLang === 'mni') {
        shortLang = 'bn';
      }
      const translateUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${shortLang}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(translateUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.error(`Google Translate TTS Error (${response.status})`);
        return res.status(response.status).json({ error: 'Translate TTS request failed' });
      }

      audioBuffer = Buffer.from(await response.arrayBuffer());
    }

    if (audioBuffer && audioBuffer.length > 0) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length.toString());
      return res.send(audioBuffer);
    } else {
      return res.status(500).json({ error: 'No audio returned' });
    }
  } catch (err) {
    console.error('TTS endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
