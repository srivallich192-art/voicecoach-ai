import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { deleteAccountData } from '../controllers/account.controller.js';

const router = Router();

router.use(requireAuth);
router.delete('/data', deleteAccountData);

export default router;

