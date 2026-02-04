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

// Protected: Get current user's profile
router.get('/', getProfile);

// Protected: Update current user's profile
router.patch('/', singleAvatar, normalizeFullName, updateProfileValidation, updateProfile);

export default router;
