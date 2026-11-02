import { describe, it, expect } from 'vitest';
import { createSessionSchema } from '../schemas/session.schema.js';
import { updateProfileSchema } from '../schemas/profile.schema.js';
import { audioTurnSchema, textTurnSchema } from '../schemas/turn.schema.js';
import { ttsSchema } from '../schemas/tts.schema.js';

describe('Validation Schemas', () => {
  describe('createSessionSchema', () => {
    it('accepts valid session setup data', () => {
      const valid = {
        role_domain: 'software_it',
        role_title: 'Frontend Developer',
        interview_type: 'behavioral',
        difficulty: 'standard',
        question_count: 5,
        job_description: 'Looking for a React specialist.',
        feedback_language: 'English',
        enable_follow_ups: true,
        silence_auto_stop_seconds: 4,
        save_audio: false
      };
      const result = createSessionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects question count below 3 or above 10', () => {
      const low = {
        role_domain: 'software_it',
        role_title: 'Frontend Developer',
        interview_type: 'behavioral',
        question_count: 2
      };
      expect(createSessionSchema.safeParse(low).success).toBe(false);

      const high = { ...low, question_count: 11 };
      expect(createSessionSchema.safeParse(high).success).toBe(false);
    });

    it('rejects unknown fields with strict validation', () => {
      const unknown = {
        role_domain: 'software_it',
        role_title: 'Frontend Developer',
        interview_type: 'behavioral',
        malicious_field: 'attack'
      };
      expect(createSessionSchema.safeParse(unknown).success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('validates experience levels correctly', () => {
      expect(updateProfileSchema.safeParse({ experience_level: 'fresher' }).success).toBe(true);
      expect(updateProfileSchema.safeParse({ experience_level: 'expert' }).success).toBe(false);
    });
  });

  describe('turn schemas', () => {
    it('validates audio duration between 2 and 130s', () => {
      expect(audioTurnSchema.safeParse({ duration_seconds: 45 }).success).toBe(true);
      expect(audioTurnSchema.safeParse({ duration_seconds: 1.5 }).success).toBe(false);
      expect(audioTurnSchema.safeParse({ duration_seconds: 135 }).success).toBe(false);
    });

    it('validates text turn fallback length', () => {
      expect(textTurnSchema.safeParse({ text: 'I spearheaded the frontend redesign' }).success).toBe(true);
      expect(textTurnSchema.safeParse({ text: 'hi' }).success).toBe(false);
    });
  });

  describe('ttsSchema', () => {
    it('enforces 600 character ceiling', () => {
      expect(ttsSchema.safeParse({ text: 'A short sentence' }).success).toBe(true);
      const longText = 'a'.repeat(601);
      expect(ttsSchema.safeParse({ text: longText }).success).toBe(false);
    });
  });
});

