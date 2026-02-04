import { Router } from 'express';
import {
  getProfile,
  updateProfile,
} from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import updateProfileValidation, { normalizeFullName } from '../validations/profile.validatior.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getProfile);
router.patch('/', uploadSingle, normalizeFullName, updateProfileValidation, updateProfile);

export default router;
