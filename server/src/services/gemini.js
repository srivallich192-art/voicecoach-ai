import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { wrapPcmInWav } from '../lib/wav.js';
import {
  AppError,
  RateLimitError,
  BadGatewayError,
  ValidationError
} from '../lib/errors.js';
import { supabaseAdmin } from '../lib/supabase.js';

export const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Log AI API usage to the database
 */
async function recordUsage({ userId, endpoint, model, inputAudioSeconds = null, status = 'success' }) {
  try {
    if (!userId) return;
    await supabaseAdmin.from('ai_usage_log').insert({
      user_id: userId,
      endpoint,
      model: model || env.GEMINI_MODEL,
      input_audio_seconds: inputAudioSeconds,
      status
    });
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to record AI usage log');
  }
}

/**
 * Enforces a timeout on a promise.
 */
function withTimeout(promise, ms = 30000, timeoutMessage = 'AI model request timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new BadGatewayError(timeoutMessage)), ms)
    )
  ]);
}

/**
 * Robust helper to call Gemini with structured JSON output and schema validation.
 * Retries once if JSON parsing or Zod validation fails.
 */
export async function generateStructured({
  systemInstruction,
  contents,
  responseSchema,
  schemaZod,
  audio = null, // { mimeType, data (base64) }
  temperature = 0.4,
  userId = null,
  endpointName = 'turn_analysis'
}) {
  const modelName = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  const contentParts = [];
  if (Array.isArray(contents)) {
    contentParts.push(...contents);
  } else if (contents) {
    contentParts.push(contents);
  }

  if (audio && audio.data) {
    contentParts.push({
      inlineData: {
        mimeType: audio.mimeType || 'audio/webm',
        data: audio.data
      }
    });
  }

  const callModel = async (repairPrompt = null) => {
    const activeParts = repairPrompt
      ? [...contentParts, { text: repairPrompt }]
      : contentParts;

    const requestConfig = {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
      temperature
    };

    const callPromise = ai.models.generateContent({
      model: modelName,
      contents: activeParts,
      config: requestConfig
    });

    const response = await withTimeout(callPromise, env.GEMINI_TIMEOUT_MS);
    return response;
  };

  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const repairInstruction = attempt === 2
        ? `Previous JSON was invalid: ${lastError?.message || 'schema mismatch'}. Fix your JSON output and ensure strict adherence to the schema.`
        : null;

      const response = await callModel(repairInstruction);

      // Extract text content
      const textOutput = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textOutput) {
        throw new BadGatewayError('Empty response from AI generation model');
      }

      // Check safety ratings if available
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new ValidationError('Input triggered safety moderation filters. Please keep answers professional.');
      }

      // Parse JSON
      let parsed;
      try {
        parsed = JSON.parse(textOutput);
      } catch (jsonErr) {
        // Strip code fence if model accidentally included it
        const cleanJson = textOutput.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        parsed = JSON.parse(cleanJson);
      }

      // Validate with Zod
      if (schemaZod) {
        const validated = schemaZod.parse(parsed);
        await recordUsage({ userId, endpoint: endpointName, model: modelName, status: 'success' });
        return validated;
      }

      await recordUsage({ userId, endpoint: endpointName, model: modelName, status: 'success' });
      return parsed;

    } catch (err) {
      lastError = err;
      logger.warn({ attempt, err: err.message }, 'Gemini structured call attempt failed');

      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        await recordUsage({ userId, endpoint: endpointName, model: modelName, status: 'rate_limited' });
        throw new RateLimitError('Upstream Gemini API rate limit exceeded. Please wait a moment.');
      }

      if (attempt === 2) {
        await recordUsage({ userId, endpoint: endpointName, model: modelName, status: 'error' });
        if (err instanceof AppError) throw err;
        throw new BadGatewayError(`AI evaluation service failed: ${err.message}`);
      }
    }
  }

  throw new BadGatewayError('Failed to produce valid structured output from AI model');
}

/**
 * Synthesize speech from text using Gemini TTS or returns 502 to trigger client fallback.
 */
export async function synthesizeSpeech({ text, language = 'English', userId = null }) {
  const ttsModel = env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
  const voiceName = env.GEMINI_TTS_VOICE || 'Kore';

  try {
    const prompt = `Read the following text aloud in a calm, clear, professional voice. Text: "${text}"`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: ttsModel,
        contents: prompt,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName
              }
            }
          }
        }
      }),
      env.GEMINI_TIMEOUT_MS,
      'TTS synthesis timed out'
    );

    // Check for inline audio parts
    const candidates = response.candidates || [];
    for (const cand of candidates) {
      const parts = cand.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.includes('audio')) {
          const rawBuffer = Buffer.from(part.inlineData.data, 'base64');
          // Wrap in WAV if raw PCM
          const wavBuffer = wrapPcmInWav(rawBuffer, 24000, 1, 16);
          await recordUsage({ userId, endpoint: 'tts', model: ttsModel, status: 'success' });
          return {
            audio_base64: wavBuffer.toString('base64'),
            mime_type: 'audio/wav'
          };
        }
      }
    }

    throw new BadGatewayError('TTS response did not contain inline audio data');
  } catch (err) {
    logger.warn({ err: err.message }, 'Gemini TTS synthesis failed, will signal client to use speechSynthesis');
    await recordUsage({ userId, endpoint: 'tts', model: ttsModel, status: 'tts_fallback' });
    throw new BadGatewayError(`TTS synthesis unavailable: ${err.message}`);
  }
}

