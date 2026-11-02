import { z } from 'zod';
import { EXPERIENCE_LEVELS } from '../../../shared/constants.js';

const expValues = EXPERIENCE_LEVELS.map(e => e.value);

export const updateProfileSchema = z.object({
  display_name: z.string().trim().min(1).max(80).optional(),
  target_role_domain: z.string().trim().max(80).optional().nullable(),
  target_role_title: z.string().trim().max(80).optional().nullable(),
  experience_level: z.enum(expValues).optional(),
  native_language: z.string().trim().min(1).max(50).optional(),
  feedback_language: z.string().trim().min(1).max(50).optional(),
  onboarding_completed: z.boolean().optional(),
  save_audio_default: z.boolean().optional()
}).strict();

