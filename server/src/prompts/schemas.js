/**
 * JSON Schema definitions for Gemini structured outputs.
 * Compatible with Gemini API responseSchema formats.
 */

export const planJsonSchema = {
  type: 'object',
  properties: {
    greeting: {
      type: 'string',
      description: '1-2 sentence spoken welcome, max 40 words'
    },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          topic: { type: 'string' },
          category: {
            type: 'string',
            enum: ['intro', 'behavioral', 'situational', 'technical', 'motivation', 'closing']
          },
          what_a_good_answer_includes: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['question', 'topic', 'category', 'what_a_good_answer_includes']
      }
    }
  },
  required: ['greeting', 'questions']
};

export const turnAnalysisJsonSchema = {
  type: 'object',
  properties: {
    answer_status: {
      type: 'string',
      enum: ['ok', 'too_short', 'silent_or_unintelligible', 'off_topic']
    },
    transcript: { type: 'string' },
    scores: {
      type: 'object',
      properties: {
        clarity: { type: 'integer' },
        pacing: { type: 'integer' },
        confidence_tone: { type: 'integer' },
        structure: { type: 'integer' },
        relevance: { type: 'integer' },
        vocabulary_grammar: { type: 'integer' }
      },
      required: ['clarity', 'pacing', 'confidence_tone', 'structure', 'relevance', 'vocabulary_grammar']
    },
    delivery_observations: {
      type: 'object',
      properties: {
        tone_summary: { type: 'string' },
        pace_comment: { type: 'string' },
        pauses_comment: { type: 'string' },
        hedging_phrases: {
          type: 'array',
          items: { type: 'string' }
        },
        filler_words_noticed: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['tone_summary', 'pace_comment', 'pauses_comment', 'hedging_phrases', 'filler_words_noticed']
    },
    structure_analysis: {
      type: 'object',
      properties: {
        framework_detected: {
          type: 'string',
          enum: ['STAR', 'partial_STAR', 'list', 'rambling', 'direct_answer', 'none']
        },
        missing_elements: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['framework_detected', 'missing_elements']
    },
    strengths: {
      type: 'array',
      items: { type: 'string' }
    },
    improvements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          issue: { type: 'string' },
          fix: { type: 'string' },
          example_phrase: { type: 'string' }
        },
        required: ['issue', 'fix', 'example_phrase']
      }
    },
    spoken_feedback: { type: 'string' },
    improved_answer_example: { type: 'string' },
    next_step: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['follow_up', 'next_question', 'end_interview', 'repeat_question']
        },
        question_text: { type: 'string' },
        reason: { type: 'string' }
      },
      required: ['action', 'question_text', 'reason']
    }
  },
  required: [
    'answer_status',
    'transcript',
    'scores',
    'delivery_observations',
    'structure_analysis',
    'strengths',
    'improvements',
    'spoken_feedback',
    'improved_answer_example',
    'next_step'
  ]
};

export const reportJsonSchema = {
  type: 'object',
  properties: {
    overall_score: { type: 'integer' },
    readiness_level: {
      type: 'string',
      enum: ['needs_foundation', 'developing', 'interview_ready', 'strong']
    },
    summary: { type: 'string' },
    category_scores: {
      type: 'object',
      properties: {
        clarity: { type: 'integer' },
        pacing: { type: 'integer' },
        confidence_tone: { type: 'integer' },
        structure: { type: 'integer' },
        relevance: { type: 'integer' },
        vocabulary_grammar: { type: 'integer' }
      },
      required: ['clarity', 'pacing', 'confidence_tone', 'structure', 'relevance', 'vocabulary_grammar']
    },
    top_strengths: {
      type: 'array',
      items: { type: 'string' }
    },
    priority_improvements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          area: { type: 'string' },
          why_it_matters: { type: 'string' },
          how_to_fix: { type: 'string' },
          drill: { type: 'string' }
        },
        required: ['area', 'why_it_matters', 'how_to_fix', 'drill']
      }
    },
    filler_word_insight: { type: 'string' },
    pacing_insight: { type: 'string' },
    best_answer_turn_index: { type: 'integer' },
    weakest_answer_turn_index: { type: 'integer' },
    rewritten_answers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          turn_index: { type: 'integer' },
          original_gist: { type: 'string' },
          improved_version: { type: 'string' }
        },
        required: ['turn_index', 'original_gist', 'improved_version']
      }
    },
    seven_day_plan: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'integer' },
          focus: { type: 'string' },
          activity: { type: 'string' },
          minutes: { type: 'integer' }
        },
        required: ['day', 'focus', 'activity', 'minutes']
      }
    },
    encouragement: { type: 'string' },
    spoken_summary: { type: 'string' }
  },
  required: [
    'overall_score',
    'readiness_level',
    'summary',
    'category_scores',
    'top_strengths',
    'priority_improvements',
    'filler_word_insight',
    'pacing_insight',
    'best_answer_turn_index',
    'weakest_answer_turn_index',
    'rewritten_answers',
    'seven_day_plan',
    'encouragement',
    'spoken_summary'
  ]
};

