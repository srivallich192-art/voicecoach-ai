import { z } from 'zod';

export const audioTurnSchema = z.object({
  turn_id: z.string().min(1).optional(),
  duration_seconds: z.coerce.number().min(2, 'Answer must be at least 2 seconds').max(130, 'Answer cannot exceed 130 seconds')
});

export const textTurnSchema = z.object({
  turn_id: z.string().min(1).optional(),
  text: z.string().trim().min(5, 'Text answer must be at least 5 characters').max(3000, 'Text answer cannot exceed 3000 characters'),
  estimated_duration_seconds: z.coerce.number().min(5).max(180).default(45)
}).strict();

export const retryQuestionSchema = z.object({
  turn_id: z.string().min(1)
}).strict();

