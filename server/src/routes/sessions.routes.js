import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { aiTurnRateLimiter } from '../middleware/rateLimit.js';
import { audioUploadMiddleware } from '../middleware/upload.js';
import { createSessionSchema, sessionFilterQuerySchema } from '../schemas/session.schema.js';
import { audioTurnSchema, textTurnSchema, retryQuestionSchema } from '../schemas/turn.schema.js';
import {
  createSession,
  listSessions,
  getSession,
  deleteSession,
  startSession,
  retryQuestion
} from '../controllers/sessions.controller.js';
import {
  submitAudioTurn,
  submitTextTurn,
  completeSession,
  getSessionReport
} from '../controllers/turns.controller.js';

const router = Router();

router.use(requireAuth);

// Session lifecycle routes
router.post('/', validate(createSessionSchema, 'body'), createSession);
router.get('/', validate(sessionFilterQuerySchema, 'query'), listSessions);
router.get('/:id', getSession);
router.delete('/:id', deleteSession);
router.post('/:id/start', startSession);
router.post('/:id/retry-question', validate(retryQuestionSchema, 'body'), retryQuestion);

// Turn evaluation routes
router.post(
  '/:id/turns',
  aiTurnRateLimiter,
  audioUploadMiddleware,
  validate(audioTurnSchema, 'body'),
  submitAudioTurn
);

router.post(
  '/:id/turns/text',
  aiTurnRateLimiter,
  validate(textTurnSchema, 'body'),
  submitTextTurn
);

// Final report routes
router.post('/:id/complete', completeSession);
router.get('/:id/report', getSessionReport);

export default router;

