import { Router } from 'express';
import { getRolesAndConfig } from '../controllers/config.controller.js';

const router = Router();

router.get('/roles', getRolesAndConfig);

export default router;

