import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { protect, refreshAuth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
  signupValidation,
  loginValidation,
  refreshValidation,
} from '../validations/authValidation.js';
import passport from '../config/passport.js';
import { Unauthorized } from '../utils/ApiError.js';

const router = Router();

router.use(authLimiter);

router.post('/signup', signupValidation, validate, authController.signup);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh', refreshValidation, validate, refreshAuth, authController.refresh);
router.post('/logout', authController.logout);

router.get(
  '/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err) return next(err);
      if (!user) return next(Unauthorized('Google sign-in failed'));
      req.user = user;
      next();
    })(req, res, next);
  },
  authController.googleCallback
);

router.get(
  '/github',
  passport.authenticate('github', { session: false, scope: ['user:email'] })
);
router.get(
  '/github/callback',
  (req, res, next) => {
    passport.authenticate('github', { session: false }, (err, user) => {
      if (err) return next(err);
      if (!user) return next(Unauthorized('GitHub sign-in failed'));
      req.user = user;
      next();
    })(req, res, next);
  },
  authController.githubCallback
);

export default router;
