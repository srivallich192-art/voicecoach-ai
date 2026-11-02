import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { ttsRateLimiter } from '../middleware/rateLimit.js';
import { ttsSchema } from '../schemas/tts.schema.js';
import { handleTts } from '../controllers/tts.controller.js';

const router = Router();

router.use(requireAuth);
router.post('/', ttsRateLimiter, validate(ttsSchema, 'body'), handleTts);

export default router;

