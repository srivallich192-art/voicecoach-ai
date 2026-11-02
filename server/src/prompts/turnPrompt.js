/**
 * Per-turn prompt generator
 * Section 15.2
 */

export function buildTurnPrompt({
  role_title,
  experience_level,
  interview_type,
  difficulty,
  kind,
  question_text,
  what_a_good_answer_includes,
  prior_turns_summary,
  duration_seconds,
  follow_ups_remaining,
  next_planned_question,
  feedback_language,
  text_answer
}) {
  const goodAnswerStr = Array.isArray(what_a_good_answer_includes)
    ? what_a_good_answer_includes.join('; ')
    : (what_a_good_answer_includes || 'Clear direct answer with concrete examples');

  const priorSummaryStr = prior_turns_summary || 'First question of the interview.';
  const nextPlannedStr = next_planned_question || 'This is the final planned question.';

  let prompt = `Analyze the candidate's answer and decide the next question.
<role_context>Role: ${role_title} | Level: ${experience_level} | Type: ${interview_type} | Difficulty: ${difficulty}</role_context>
Current question (${kind}): "${question_text}"
Good answers usually include: ${goodAnswerStr}
Previous turns summary: ${priorSummaryStr}
Duration (seconds): ${duration_seconds}
Follow-ups allowed for this question: ${follow_ups_remaining}
Next planned main question: "${nextPlannedStr}"
Feedback language: ${feedback_language}

Tasks:
1. Transcribe the audio faithfully (or use candidate text provided), keeping filler words (um, uh, like...) and false starts in the transcript. Do not clean it up.
2. Evaluate: clarity (intelligibility only, never accent), pacing, confidence/tone (steadiness, energy, hedging language, trailing off), structure (STAR/clear opening-middle-end), relevance to the question, vocabulary and grammar.
3. Identify up to 3 specific strengths and up to 3 specific improvements, each with a short example phrase to say instead.
4. Decide the next step: a targeted follow-up (only if follow-ups remain AND the answer was vague, missing a result/impact, or contained an interesting claim worth probing) or move to the next planned question (adapt its wording lightly to connect naturally). If no questions remain, choose "end_interview".
5. Write "spoken_feedback": 2-3 short sentences, natural when read aloud, in the requested feedback language (${feedback_language}). Keep candidate example phrases in English.`;

  if (text_answer) {
    prompt += `\n\n<candidate_answer>\n${text_answer.slice(0, 3000)}\n</candidate_answer>`;
  }

  return prompt;
}

