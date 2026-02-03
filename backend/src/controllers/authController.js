import * as authService from '../services/authService.js';
import { sendWelcomeEmail } from '../services/mailService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/env.js';
import passport from '../config/passport.js';

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = env.NODE_ENV === 'production';
  const cookieOpts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  res.cookie('accessToken', accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, cookieOpts);
};

export const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const result = await authService.signup(email, password, name);
  setTokenCookies(res, result.accessToken, result.refreshToken);
  await sendWelcomeEmail(result.user.email, result.user.name).catch(() => {});
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: '15m',
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  setTokenCookies(res, result.accessToken, result.refreshToken);
  res.json({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: '15m',
    },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  const tokens = await authService.refreshTokens(refreshToken);
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: '15m',
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

export const googleAuth = (req, res, next) => {
  passport.authenticate('google', { session: false })(req, res, next);
};

export const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const tokens = authService.generateTokens(user._id);
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
  res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`);
});

export const githubAuth = (req, res, next) => {
  passport.authenticate('github', { session: false })(req, res, next);
};

export const githubCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const tokens = authService.generateTokens(user._id);
  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
  res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`);
});

export default {
  signup,
  login,
  refresh,
  logout,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
};
