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

    if (!GOOGLE_TTS_API_KEY) {
      // If no key provided, fail gracefully so frontend falls back to browser TTS
      return res.status(503).json({ error: 'TTS API not configured' });
    }

    // Default to Indian English
    const languageCode = language || 'en-IN';
    
    // Voice name selection based on Google Cloud TTS documentation
    let name: string | undefined;
    if (languageCode.startsWith('en')) {
      name = 'en-IN-Standard-A';
    } else if (languageCode.startsWith('ta')) {
      name = 'ta-IN-Standard-A';
    } else if (languageCode.startsWith('as')) {
      name = 'as-IN-Standard-A';
    } else if (languageCode.startsWith('hi')) {
      name = 'hi-IN-Standard-A';
    } else if (languageCode.startsWith('bn')) {
      name = 'bn-IN-Standard-A';
    } else if (languageCode.startsWith('mni')) {
      // Google TTS does not support Manipuri natively, fallback to general setting
      name = undefined;
    }

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

    if (!response.ok) {
      console.error(`Google TTS Error (${response.status})`);
      return res.status(response.status).json({ error: 'Cloud TTS request failed' });
    }

    const data: any = await response.json();
    if (data.audioContent) {
      // Convert base64 to buffer
      const buffer = Buffer.from(data.audioContent, 'base64');
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', buffer.length.toString());
      return res.send(buffer);
    } else {
      return res.status(500).json({ error: 'No audio returned' });
    }
  } catch (err) {
    console.error('TTS endpoint error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
