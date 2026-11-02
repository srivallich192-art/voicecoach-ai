import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../schemas/profile.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', getProfile);
router.put('/', validate(updateProfileSchema, 'body'), updateProfile);

export default router;

