import { z } from 'zod';
import {
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS,
  FEEDBACK_LANGUAGES,
  ROLE_DOMAINS
} from '../../../shared/constants.js';

const interviewTypeValues = INTERVIEW_TYPES.map(t => t.value);
const difficultyValues = DIFFICULTY_LEVELS.map(d => d.value);
const languageCodes = FEEDBACK_LANGUAGES.map(l => l.code);
const validDomainIds = ROLE_DOMAINS.map(d => d.id);

export const createSessionSchema = z.object({
  role_domain: z.string().min(1, 'Role domain is required'),
  role_title: z.string().trim().min(2, 'Role title must be at least 2 characters').max(80, 'Role title cannot exceed 80 characters'),
  interview_type: z.enum(interviewTypeValues, {
    errorMap: () => ({ message: 'Invalid interview type' })
  }),
  difficulty: z.enum(difficultyValues).default('standard'),
  question_count: z.coerce.number().int().min(3, 'Minimum 3 questions required').max(10, 'Maximum 10 questions allowed').default(5),
  job_description: z.string().max(4000, 'Job description cannot exceed 4000 characters').optional().nullable(),
  feedback_language: z.string().default('English'),
  enable_follow_ups: z.boolean().default(true),
  silence_auto_stop_seconds: z.coerce.number().int().min(2).max(8).default(4),
  save_audio: z.boolean().default(false)
}).strict();

export const sessionFilterQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z.enum(['created', 'in_progress', 'completed', 'abandoned']).optional(),
  domain: z.string().optional()
});

