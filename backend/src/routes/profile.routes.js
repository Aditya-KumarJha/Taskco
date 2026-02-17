import { Router } from 'express';
import {
  getProfile,
  updateProfile,
} from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { singleAvatar } from '../middlewares/upload.js';
import updateProfileValidation, { normalizeFullName } from '../validations/profile.validatior.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProfile);

router.patch('/', singleAvatar, normalizeFullName, updateProfileValidation, updateProfile);

export default router;
