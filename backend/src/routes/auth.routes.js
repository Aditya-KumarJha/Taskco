import { Router } from 'express';
import passport from '../config/passport.js';
import {
	registerUser,
	verifyRegisterOTP,
	resendOTP,
	loginUser,
	verifyLoginOTP,
	oauthCallback,
	forgotPassword,
	verifyForgotPasswordOTP,
	resetPassword,
	logout,
  getCurrentUser
} from '../controllers/auth.controller.js';
import {
	registerUserValidations,
	verifyOTPValidations,
	resendOTPValidations,
	loginUserValidations,
	verifyLoginOTPValidations,
	forgotPasswordValidations,
	verifyForgotPasswordOTPValidations,
	resetPasswordValidations,
} from '../validations/auth.validator.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { get } from 'mongoose';

const router = Router();

router.post('/register', registerUserValidations, registerUser);

router.post('/verify-register-otp', verifyOTPValidations, verifyRegisterOTP);

router.post('/resend-otp', resendOTPValidations, resendOTP);

router.post('/login', loginUserValidations, loginUser);

router.post('/verify-login-otp', verifyLoginOTPValidations, verifyLoginOTP);

router.post('/forgot-password', forgotPasswordValidations, forgotPassword);

router.post('/verify-forgot-password-otp', verifyForgotPasswordOTPValidations, verifyForgotPasswordOTP);

router.post('/reset-password', resetPasswordValidations, resetPassword);

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state: 'login',
  })
);
router.get('/google/signup',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state: 'signup',
  })
);
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.redirect(`${process.env.FRONTEND_URL || '/'}/login?error=${encodeURIComponent(info?.message || 'Google sign-in failed')}`);
      req.user = user;
      req.authInfo = info || {};
      next();
    })(req, res, next);
  },
  oauthCallback('google')
);

router.get('/github',
  passport.authenticate('github', {
    scope: ['user:email'],
    state: 'login',
  })
);
router.get('/github/signup',
  passport.authenticate('github', {
    scope: ['user:email'],
    state: 'signup',
  })
);
router.get(
  '/github/callback',
  (req, res, next) => {
    passport.authenticate('github', { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.redirect(`${process.env.FRONTEND_URL || '/'}/login?error=${encodeURIComponent(info?.message || 'GitHub sign-in failed')}`);
      req.user = user;
      req.authInfo = info || {};
      next();
    })(req, res, next);
  },
  oauthCallback('github')
);

router.get('/oauth-failure', (req, res) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  const provider = (req.query.provider || '').toLowerCase();
  let message = req.query.error || 'OAuth authentication failed';

  if (provider === 'github') {
    message =
      'No GitHub account found for this user. If you registered using Google or email/password, try logging in with that method or sign up with GitHub.';
  } else if (provider === 'google') {
    message =
      'No Google account found for this user. If you registered using GitHub or email/password, try logging in with that method or sign up with Google.';
  }

  return res.redirect(`${frontend}/login?error=${encodeURIComponent(message)}`);
});

router.post('/logout', logout);

router.get('/me', authMiddleware, getCurrentUser);

export default router;
