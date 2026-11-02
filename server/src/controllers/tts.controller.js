import { synthesizeSpeech } from '../services/gemini.js';
import { BadGatewayError } from '../lib/errors.js';

export async function handleTts(req, res, next) {
  try {
    const { text, language } = req.body;
    const userId = req.user?.id;

    try {
      const result = await synthesizeSpeech({
        text,
        language: language || 'English',
        userId
      });

      return res.status(200).json({
        data: result,
        error: null
      });
    } catch (ttsErr) {
      // Return 502 BadGateway so frontend client seamlessly falls back to window.speechSynthesis
      throw new BadGatewayError(`Gemini TTS service unavailable (${ttsErr.message}). Fallback to browser synthesis.`);
    }
  } catch (err) {
    next(err);
  }
}

