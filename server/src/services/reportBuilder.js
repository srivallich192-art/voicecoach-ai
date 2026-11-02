import { COACH_ARIA_SYSTEM_PROMPT } from '../prompts/systemPrompt.js';
import { buildReportPrompt } from '../prompts/reportPrompt.js';
import { reportJsonSchema } from '../prompts/schemas.js';
import { aiReportSchema } from '../schemas/ai.schemas.js';
import { generateStructured } from './gemini.js';
import { computeOverallScore } from './metrics.js';

export async function generateSessionReport({
  session,
  turns = [],
  userId
}) {
  // Compute aggregate statistics
  let totalWpm = 0;
  let validWpmTurns = 0;
  let totalFillers = 0;
  const fillerBreakdown = {};

  for (const turn of turns) {
    if (turn.words_per_minute && turn.words_per_minute > 0) {
      totalWpm += Number(turn.words_per_minute);
      validWpmTurns++;
    }
    if (turn.filler_total) {
      totalFillers += turn.filler_total;
    }
    if (turn.filler_breakdown && typeof turn.filler_breakdown === 'object') {
      for (const [word, count] of Object.entries(turn.filler_breakdown)) {
        fillerBreakdown[word] = (fillerBreakdown[word] || 0) + Number(count);
      }
    }
  }

  const avgWpm = validWpmTurns > 0 ? Math.round((totalWpm / validWpmTurns) * 10) / 10 : 120;

  const prompt = buildReportPrompt({
    role_title: session.role_title,
    role_domain: session.role_domain,
    experience_level: session.profiles?.experience_level || 'fresher',
    interview_type: session.interview_type,
    difficulty: session.difficulty,
    turns,
    avg_wpm: avgWpm,
    total_fillers: totalFillers,
    filler_breakdown: fillerBreakdown,
    feedback_language: session.feedback_language || 'English'
  });

  const report = await generateStructured({
    systemInstruction: COACH_ARIA_SYSTEM_PROMPT,
    contents: prompt,
    responseSchema: reportJsonSchema,
    schemaZod: aiReportSchema,
    temperature: 0.35,
    userId,
    endpointName: 'generate_report'
  });

  // Calculate final overall score
  const finalCategoryScores = report.category_scores;
  const computedOverall = computeOverallScore(finalCategoryScores);

  return {
    overall_score: computedOverall || report.overall_score,
    category_scores: finalCategoryScores,
    report: {
      ...report,
      overall_score: computedOverall || report.overall_score
    },
    avg_wpm: avgWpm,
    total_fillers: totalFillers
  };
}

