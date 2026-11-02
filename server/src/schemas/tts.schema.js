import { z } from 'zod';

export const ttsSchema = z.object({
  text: z.string().trim().min(1, 'Text is required').max(600, 'Text exceeds 600 character limit for TTS'),
  language: z.string().optional()
}).strict();

