import { z } from 'zod';
import { EXPERIENCE_LEVELS } from '../../../shared/constants.js';

const expValues = EXPERIENCE_LEVELS.map(e => e.value);

export const clientProfileSchema = z.object({
  display_name: z.string().trim().min(1, 'Display name is required').max(80),
  target_role_domain: z.string().min(1, 'Please select your target domain'),
  target_role_title: z.string().trim().min(2, 'Target role title must be at least 2 characters').max(80),
  experience_level: z.enum(expValues),
  native_language: z.string().min(1, 'Native language is required'),
  feedback_language: z.string().min(1, 'Feedback language is required'),
  save_audio_default: z.boolean().default(false)
});

