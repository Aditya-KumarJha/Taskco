import {
  registerUser as registerUserService,
  verifyRegisterOTP as verifyRegisterOTPService,
  generateToken,
  getProfileUser,
  resendOTPUser,
  loginUser as loginUserService,
  verifyLoginOTPUser,
  forgotPasswordUser,
  verifyForgotPasswordOTPUser,
  resetPasswordUser,
} from '../services/auth.service.js';
import { publishToQueue } from '../broker/broker.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, fullName, username, provider = 'email' } = req.body;
  const { user, otpData } = await registerUserService({
    email,
    password,
    fullName,
    username,
    provider,
  });
  await publishToQueue('AUTH_NOTIFICATION.REGISTER_OTP', {
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    otpCode: otpData.code,
  });
  
  const response = {
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: process.env.NODE_ENV === 'test' ? { otp: otpData.code } : {},
  };
  
  return res.status(201).json(response);
});

export const verifyRegisterOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await verifyRegisterOTPService(email, otp);
  const token = generateToken(user._id, user.email, user.username);
  setTokenCookie(res, token);
  await publishToQueue('AUTH_NOTIFICATION.WELCOME_USER', {
    email: user.email,
    fullName: user.fullName,
    username: user.username,
  });
  return res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: {
      user: getProfileUser(user),
      accessToken: token,
    },
  });
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email, username } = req.body;
  const { user, otpData } = await resendOTPUser(email, username);
  await publishToQueue('AUTH_NOTIFICATION.RESEND_OTP', {
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    otpCode: otpData.code,
  });
  return res.status(200).json({
    success: true,
    message: 'OTP resent successfully',
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const identifier = email || username;
  const { user, otpData } = await loginUserService(identifier, password);
  await publishToQueue('AUTH_NOTIFICATION.LOGIN_OTP', {
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    otpCode: otpData.code,
  });
  return res.status(200).json({
    success: true,
    message: 'OTP sent to your email. Please verify to complete login.',
  });
});

export const verifyLoginOTP = asyncHandler(async (req, res) => {
  const { email, username, otp } = req.body;
  const identifier = email || username;
  const user = await verifyLoginOTPUser(identifier, otp);
  const token = generateToken(user._id, user.email, user.username);
  setTokenCookie(res, token);
  await publishToQueue('AUTH_NOTIFICATION.LOGIN_SUCCESS', {
    email: user.email,
    fullName: user.fullName,
    username: user.username,
  });
  return res.status(200).json({
    success: true,
    message: 'Login successful',
    user: getProfileUser(user),
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, username } = req.body;
  const identifier = email || username;
  const { user, otpData } = await forgotPasswordUser(identifier);
  await publishToQueue('AUTH_NOTIFICATION.FORGOT_PASSWORD_OTP', {
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    otpCode: otpData.code,
  });
  return res.status(200).json({
    success: true,
    message: 'OTP sent to your email for password reset.',
  });
});

export const verifyForgotPasswordOTP = asyncHandler(async (req, res) => {
  const { email, username, otp } = req.body;
  const identifier = email || username;
  await verifyForgotPasswordOTPUser(identifier, otp);
  return res.status(200).json({
    success: true,
    message: 'OTP verified. You can now reset your password.',
    email: email || undefined,
    username: username || undefined,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, username, newPassword } = req.body;
  const identifier = email || username;
  const user = await resetPasswordUser(identifier, newPassword);
  await publishToQueue('AUTH_NOTIFICATION.PASSWORD_UPDATED', {
    email: user.email,
    fullName: user.fullName,
    username: user.username,
  });
  return res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now login with your new password.',
  });
});

export const oauthCallback = (provider) =>
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) return res.redirect(`${process.env.FRONTEND_URL || '/'}/login?error=oauth_failed`);
    const isNewUser = req.authInfo?.isNewUser === true;
    const token = generateToken(user._id, user.email, user.username);
    setTokenCookie(res, token);
    if (isNewUser) {
      await publishToQueue('AUTH_NOTIFICATION.OAUTH_WELCOME', {
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        provider,
      });
    } else {
      await publishToQueue('AUTH_NOTIFICATION.LOGIN_SUCCESS', {
        email: user.email,
        fullName: user.fullName,
        username: user.username,
      });
    }
    res.redirect(process.env.FRONTEND_URL || '/');
  });

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});


export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    user: getProfileUser(req.user),
  });
});
