import { z } from 'zod';

const scoreSchema = z.number().int().min(0).max(100);

// 15.1 Question Plan Schema
export const aiPlanSchema = z.object({
  greeting: z.string().max(400),
  questions: z.array(
    z.object({
      question: z.string().max(500),
      topic: z.string().max(200),
      category: z.enum(['intro', 'behavioral', 'situational', 'technical', 'motivation', 'closing']),
      what_a_good_answer_includes: z.array(z.string().max(300)).max(6)
    })
  ).min(1).max(15)
});

// 15.2 Turn Analysis Schema
export const aiTurnAnalysisSchema = z.object({
  answer_status: z.enum(['ok', 'too_short', 'silent_or_unintelligible', 'off_topic']),
  transcript: z.string().max(4000).default(''),
  scores: z.object({
    clarity: scoreSchema,
    pacing: scoreSchema,
    confidence_tone: scoreSchema,
    structure: scoreSchema,
    relevance: scoreSchema,
    vocabulary_grammar: scoreSchema
  }),
  delivery_observations: z.object({
    tone_summary: z.string().max(400),
    pace_comment: z.string().max(400),
    pauses_comment: z.string().max(400),
    hedging_phrases: z.array(z.string().max(150)).max(10).default([]),
    filler_words_noticed: z.array(z.string().max(100)).max(15).default([])
  }),
  structure_analysis: z.object({
    framework_detected: z.enum(['STAR', 'partial_STAR', 'list', 'rambling', 'direct_answer', 'none']),
    missing_elements: z.array(z.string().max(200)).max(8).default([])
  }),
  strengths: z.array(z.string().max(300)).max(5).default([]),
  improvements: z.array(
    z.object({
      issue: z.string().max(300),
      fix: z.string().max(400),
      example_phrase: z.string().max(400)
    })
  ).max(5).default([]),
  spoken_feedback: z.string().max(600),
  improved_answer_example: z.string().max(1500),
  next_step: z.object({
    action: z.enum(['follow_up', 'next_question', 'end_interview', 'repeat_question']),
    question_text: z.string().max(500),
    reason: z.string().max(500)
  })
});

// 15.3 Session Report Schema
export const aiReportSchema = z.object({
  overall_score: scoreSchema,
  readiness_level: z.enum(['needs_foundation', 'developing', 'interview_ready', 'strong']),
  summary: z.string().max(2000),
  category_scores: z.object({
    clarity: scoreSchema,
    pacing: scoreSchema,
    confidence_tone: scoreSchema,
    structure: scoreSchema,
    relevance: scoreSchema,
    vocabulary_grammar: scoreSchema
  }),
  top_strengths: z.array(z.string().max(300)).min(1).max(8),
  priority_improvements: z.array(
    z.object({
      area: z.string().max(200),
      why_it_matters: z.string().max(400),
      how_to_fix: z.string().max(500),
      drill: z.string().max(500)
    })
  ).min(1).max(6),
  filler_word_insight: z.string().max(600),
  pacing_insight: z.string().max(600),
  best_answer_turn_index: z.number().int().min(0),
  weakest_answer_turn_index: z.number().int().min(0),
  rewritten_answers: z.array(
    z.object({
      turn_index: z.number().int(),
      original_gist: z.string().max(400),
      improved_version: z.string().max(1500)
    })
  ).max(10),
  seven_day_plan: z.array(
    z.object({
      day: z.number().int().min(1).max(7),
      focus: z.string().max(200),
      activity: z.string().max(500),
      minutes: z.number().int().min(5).max(60)
    })
  ).length(7),
  encouragement: z.string().max(1000),
  spoken_summary: z.string().max(800)
});

