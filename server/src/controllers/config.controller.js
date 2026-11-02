import {
  ROLE_DOMAINS,
  FEEDBACK_LANGUAGES,
  INTERVIEW_TYPES,
  EXPERIENCE_LEVELS,
  DIFFICULTY_LEVELS,
  COACHING_CONFIG
} from '../config/coaching.js';

export function getRolesAndConfig(req, res) {
  res.status(200).json({
    data: {
      domains: ROLE_DOMAINS,
      languages: FEEDBACK_LANGUAGES,
      interviewTypes: INTERVIEW_TYPES,
      experienceLevels: EXPERIENCE_LEVELS,
      difficultyLevels: DIFFICULTY_LEVELS,
      coachingConfig: {
        pace: COACHING_CONFIG.pace,
        duration: COACHING_CONFIG.duration,
        categories: COACHING_CONFIG.categories
      }
    },
    error: null
  });
}

