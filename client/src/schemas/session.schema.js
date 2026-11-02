import { z } from 'zod';
import {
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS
} from '../../../shared/constants.js';

const typeValues = INTERVIEW_TYPES.map(t => t.value);
const diffValues = DIFFICULTY_LEVELS.map(d => d.value);

export const clientSessionSchema = z.object({
  role_domain: z.string().min(1, 'Please select a domain'),
  role_title: z.string().trim().min(2, 'Role title must be at least 2 characters').max(80),
  interview_type: z.enum(typeValues),
  difficulty: z.enum(diffValues).default('standard'),
  question_count: z.coerce.number().min(3, 'At least 3 questions').max(10, 'Maximum 10 questions').default(5),
  job_description: z.string().max(4000, 'Job description exceeds 4000 characters').optional().nullable(),
  feedback_language: z.string().default('English'),
  enable_follow_ups: z.boolean().default(true),
  silence_auto_stop_seconds: z.coerce.number().min(2).max(8).default(4),
  save_audio: z.boolean().default(false)
});

