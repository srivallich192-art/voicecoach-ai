/**
 * Final Report prompt generator
 * Section 15.3
 */

export function buildReportPrompt({
  role_title,
  role_domain,
  experience_level,
  interview_type,
  difficulty,
  turns,
  avg_wpm,
  total_fillers,
  filler_breakdown,
  feedback_language
}) {
  const turnsCompact = turns.map((t, idx) => ({
    turn_index: t.turn_index ?? idx,
    kind: t.kind,
    question: t.question_text,
    transcript: t.transcript || '',
    duration_seconds: t.duration_seconds,
    wpm: t.words_per_minute,
    fillers: t.filler_total,
    scores: t.scores
  }));

  return `Create the final coaching report for this mock interview.
<role_context>
Role: ${role_title} (${role_domain})
Experience level: ${experience_level}
Interview type: ${interview_type}
Difficulty: ${difficulty}
</role_context>

Per-turn data (JSON):
${JSON.stringify(turnsCompact, null, 2)}

Aggregate metrics:
Average WPM: ${avg_wpm}
Total Fillers: ${total_fillers}
Filler Breakdown: ${JSON.stringify(filler_breakdown || {})}
Feedback language: ${feedback_language}

Instructions:
Be specific, cite the candidate's actual words, stay encouraging, and make the 7-day practice plan realistic for someone with 15 to 20 minutes per day.
Write all feedback, analysis, and plan in ${feedback_language}, but keep English model phrases and improved sample sentences in English so the candidate learns spoken English delivery.
Respond strictly with the required JSON schema.`;
}

