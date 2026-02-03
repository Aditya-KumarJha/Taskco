import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileValidation } from '../validations/profileValidation.js';

const router = Router();

router.use(protect);

router.get('/me', profileController.getProfile);
router.put('/me', updateProfileValidation, validate, profileController.updateProfile);

export default router;
