import { COACH_ARIA_SYSTEM_PROMPT } from '../prompts/systemPrompt.js';
import { buildPlanPrompt } from '../prompts/planPrompt.js';
import { planJsonSchema } from '../prompts/schemas.js';
import { aiPlanSchema } from '../schemas/ai.schemas.js';
import { generateStructured } from './gemini.js';

export async function createInterviewPlan({
  role_title,
  role_domain,
  experience_level,
  interview_type,
  difficulty,
  question_count,
  job_description,
  userId
}) {
  const prompt = buildPlanPrompt({
    role_title,
    role_domain,
    experience_level,
    interview_type,
    difficulty,
    question_count,
    job_description
  });

  const plan = await generateStructured({
    systemInstruction: COACH_ARIA_SYSTEM_PROMPT,
    contents: prompt,
    responseSchema: planJsonSchema,
    schemaZod: aiPlanSchema,
    temperature: 0.3,
    userId,
    endpointName: 'create_plan'
  });

  return plan;
}

