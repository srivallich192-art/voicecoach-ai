import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getProgress } from '../controllers/progress.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', getProgress);

export default router;

