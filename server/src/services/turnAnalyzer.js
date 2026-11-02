import { COACH_ARIA_SYSTEM_PROMPT } from '../prompts/systemPrompt.js';
import { buildTurnPrompt } from '../prompts/turnPrompt.js';
import { turnAnalysisJsonSchema } from '../prompts/schemas.js';
import { aiTurnAnalysisSchema } from '../schemas/ai.schemas.js';
import { generateStructured } from './gemini.js';
import {
  calculateWordCount,
  calculateWpm,
  detectFillers,
  computePacingScore,
  computeOverallScore
} from './metrics.js';

export async function analyzeTurn({
  session,
  currentTurn,
  durationSeconds,
  audioBuffer = null,
  audioMimeType = 'audio/webm',
  textAnswer = null,
  priorTurns = [],
  nextPlannedQuestion = null,
  userId
}) {
  // Build context summary of prior turns
  const priorSummary = priorTurns.length > 0
    ? priorTurns.map((t, idx) => `Q${idx + 1}: "${t.question_text}" | Answer summary: "${(t.transcript || '').slice(0, 100)}..."`).join('\n')
    : 'None (First question)';

  // Calculate remaining follow-ups for this parent question
  const maxFollowUps = session.difficulty === 'challenging' ? 2 : 1;
  const followUpsCountForParent = priorTurns.filter(
    t => t.kind === 'follow_up' && (t.parent_turn_id === currentTurn.id || t.parent_turn_id === currentTurn.parent_turn_id)
  ).length;
  const followUpsRemaining = session.enable_follow_ups
    ? Math.max(0, maxFollowUps - followUpsCountForParent)
    : 0;

  const prompt = buildTurnPrompt({
    role_title: session.role_title,
    experience_level: session.profiles?.experience_level || 'fresher',
    interview_type: session.interview_type,
    difficulty: session.difficulty,
    kind: currentTurn.kind,
    question_text: currentTurn.question_text,
    what_a_good_answer_includes: currentTurn.question_topic || 'Clear structured explanation',
    prior_turns_summary: priorSummary,
    duration_seconds: durationSeconds,
    follow_ups_remaining: followUpsRemaining,
    next_planned_question: nextPlannedQuestion,
    feedback_language: session.feedback_language || 'English',
    text_answer: textAnswer
  });

  const audioPayload = audioBuffer
    ? {
        mimeType: audioMimeType,
        data: audioBuffer.toString('base64')
      }
    : null;

  const rawAnalysis = await generateStructured({
    systemInstruction: COACH_ARIA_SYSTEM_PROMPT,
    contents: prompt,
    responseSchema: turnAnalysisJsonSchema,
    schemaZod: aiTurnAnalysisSchema,
    audio: audioPayload,
    temperature: 0.35,
    userId,
    endpointName: 'turn_analysis'
  });

  // Effective transcript
  const transcript = textAnswer || rawAnalysis.transcript || '';

  // Deterministic metrics calculation
  const wordCount = calculateWordCount(transcript);
  const wpm = calculateWpm(wordCount, durationSeconds);
  const { total: fillerTotal, breakdown: fillerBreakdown } = detectFillers(transcript);

  // Deterministic pacing score override
  const pacingScore = computePacingScore(wpm, rawAnalysis.scores.pacing);

  // Merge scores
  const mergedScores = {
    clarity: rawAnalysis.scores.clarity,
    pacing: pacingScore,
    confidence_tone: rawAnalysis.scores.confidence_tone,
    structure: rawAnalysis.scores.structure,
    relevance: rawAnalysis.scores.relevance,
    vocabulary_grammar: rawAnalysis.scores.vocabulary_grammar
  };
  mergedScores.overall = computeOverallScore(mergedScores);

  // If answer was silent, too short, or unintelligible, do not advance turn
  let nextStep = { ...rawAnalysis.next_step };
  if (rawAnalysis.answer_status !== 'ok') {
    nextStep = {
      action: 'repeat_question',
      question_text: currentTurn.question_text,
      reason: rawAnalysis.answer_status === 'silent_or_unintelligible'
        ? "We couldn't hear you clearly. Let's try this question once more!"
        : "Your answer was very brief. Could you elaborate a bit more with specific examples?"
    };
  }

  // Cap follow-ups if model attempted to follow up when limit was reached
  if (nextStep.action === 'follow_up' && followUpsRemaining <= 0) {
    if (nextPlannedQuestion) {
      nextStep.action = 'next_question';
      nextStep.question_text = nextPlannedQuestion;
      nextStep.reason = 'Moving to the next planned interview topic.';
    } else {
      nextStep.action = 'end_interview';
      nextStep.question_text = '';
      nextStep.reason = 'Interview plan complete.';
    }
  }

  return {
    answer_status: rawAnalysis.answer_status,
    transcript,
    duration_seconds: durationSeconds,
    word_count: wordCount,
    words_per_minute: wpm,
    filler_total: fillerTotal,
    filler_breakdown: fillerBreakdown,
    scores: mergedScores,
    delivery_observations: rawAnalysis.delivery_observations,
    structure_analysis: rawAnalysis.structure_analysis,
    strengths: rawAnalysis.strengths,
    improvements: rawAnalysis.improvements,
    spoken_feedback: rawAnalysis.spoken_feedback,
    improved_answer_example: rawAnalysis.improved_answer_example,
    next_step: nextStep
  };
}

