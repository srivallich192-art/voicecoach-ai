/**
 * Question Plan prompt generator
 * Section 15.1
 */

export function buildPlanPrompt({
  role_title,
  role_domain,
  experience_level,
  interview_type,
  difficulty,
  question_count,
  job_description
}) {
  const sanitizedJD = job_description ? job_description.slice(0, 4000) : 'None provided';

  return `Create an interview plan.
<role_context>
Role: ${role_title} (${role_domain})
Experience level: ${experience_level}
Interview type: ${interview_type}
Difficulty: ${difficulty}
Number of main questions: ${question_count}
</role_context>
<job_description>${sanitizedJD}</job_description>

Rules: Start with a short, friendly opener ("Tell me about yourself" style, tailored to the role). Then order questions from easier to harder. Cover a mix of topics appropriate to the type. Each question must be answerable in 60 to 90 seconds. For "mixed", blend behavioral, situational, and role-knowledge questions.
Ensure all questions are natural spoken English, under 35 words each. Respond ONLY with the requested JSON schema.`;
}

