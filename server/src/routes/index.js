import { Router } from 'express';
import healthRouter from './health.routes.js';
import configRouter from './config.routes.js';
import profileRouter from './profile.routes.js';
import sessionsRouter from './sessions.routes.js';
import ttsRouter from './tts.routes.js';
import progressRouter from './progress.routes.js';
import accountRouter from './account.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/config', configRouter);
router.use('/profile', profileRouter);
router.use('/sessions', sessionsRouter);
router.use('/tts', ttsRouter);
router.use('/progress', progressRouter);
router.use('/account', accountRouter);

export default router;

