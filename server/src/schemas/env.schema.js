import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  GEMINI_TTS_MODEL: z.string().default('gemini-2.5-flash-preview-tts'),
  GEMINI_TTS_VOICE: z.string().default('Kore'),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),

  MAX_AUDIO_MB: z.coerce.number().positive().default(8),
  MAX_ANSWER_SECONDS: z.coerce.number().positive().default(130),
  AI_TURNS_PER_HOUR: z.coerce.number().int().positive().default(30),
  TTS_PER_HOUR: z.coerce.number().int().positive().default(60),
  GLOBAL_RATE_LIMIT_PER_15MIN: z.coerce.number().int().positive().default(300)
});

