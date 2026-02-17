import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import { generateOTP } from '../utils/generate.otp.js';
import { Conflict, Unauthorized, NotFound } from '../utils/ApiError.js';

const SALT_ROUNDS = 12;
const JWT_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '7d';

export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

export const generateToken = (userId, email, username) =>
  jwt.sign(
    { id: userId, email, username },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

export const generateOTPCode = () => generateOTP();

export const registerUser = async ({ email, password, fullName, username, provider = 'email' }) => {
  const existing = await userModel.findOne({ email });
  if (existing) {
    if (!existing.isVerified && existing.otp?.expiresAt && existing.otp.expiresAt < new Date()) {
      await userModel.deleteOne({ _id: existing._id });
    } else if (existing.isVerified) {
      throw Conflict('User already exists with this email');
    } else {
      throw Conflict('User already exists. Please verify your email or wait for OTP to expire.');
    }
  }
  const hashedPassword = provider === 'email' ? await hashPassword(password) : undefined;
  const otpData = generateOTP();
  console.log('Generated OTP for registration:', otpData.code, 'expires at', otpData.expiresAt);
  const user = await userModel.create({
    email,
    password: hashedPassword,
    fullName,
    username,
    provider,
    otp: otpData,
    isVerified: false,
  });
  return { user, otpData };
};

export const verifyRegisterOTP = async (email, otp) => {
  const user = await userModel.findOne({ email });
  if (!user) throw NotFound('User not found');
  if (user.provider !== 'email') {
    throw Unauthorized(`Account registered via ${user.provider}. Please sign in with ${user.provider}.`);
  }
  if (user.isVerified) throw Unauthorized('User is already verified');
  if (!user.otp?.code || !user.otp?.expiresAt) throw Unauthorized('OTP not found. Please request a new OTP.');
  if (user.otp.expiresAt < new Date()) throw Unauthorized('OTP has expired. Please request a new OTP.');
  if (user.otp.code !== otp) throw Unauthorized('Invalid OTP');
  user.isVerified = true;
  user.otp = undefined;
  await user.save();
  return user;
};

export const resendOTPUser = async (email, username) => {
  let user = email ? await userModel.findOne({ email }) : null;
  if (!user && username) user = await userModel.findOne({ username });
  if (!user) throw NotFound('User not found');
  if (user.isVerified) throw Unauthorized('User is already verified');
  const otpData = generateOTP();
  console.log('Generated OTP for resend:', otpData.code, 'expires at', otpData.expiresAt);
  user.otp = otpData;
  await user.save();
  return { user, otpData };
};

export const loginUser = async (emailOrUsername, password) => {
  const byEmail = await userModel.findOne({ email: emailOrUsername }).select('+password');
  const user = byEmail || await userModel.findOne({ username: emailOrUsername }).select('+password');
  if (!user) throw NotFound('No account found with this email or username');
  if (user.provider !== 'email') throw Unauthorized(`Please login using ${user.provider}`);
  if (!user.isVerified) throw Unauthorized('Please verify your email before logging in');
  const valid = await verifyPassword(password, user.password);
  if (!valid) throw Unauthorized('Invalid password');
  const otpData = generateOTP();
  console.log('Generated OTP for login:', otpData.code, 'expires at', otpData.expiresAt);
  user.otp = otpData;
  await user.save();
  return { user, otpData };
};

export const verifyLoginOTPUser = async (emailOrUsername, otp) => {
  let user = await userModel.findOne({ email: emailOrUsername });
  if (!user) user = await userModel.findOne({ username: emailOrUsername });
  if (!user) throw NotFound('User not found');
  if (!user.otp?.code || !user.otp?.expiresAt) throw Unauthorized('OTP not found. Please login again.');
  if (user.otp.expiresAt < new Date()) throw Unauthorized('OTP expired. Please login again.');
  if (user.otp.code !== otp) throw Unauthorized('Invalid OTP');
  user.otp = undefined;
  await user.save();
  return user;
};

export const forgotPasswordUser = async (emailOrUsername) => {
  let user = await userModel.findOne({ email: emailOrUsername });
  if (!user) user = await userModel.findOne({ username: emailOrUsername });
  if (!user) throw NotFound('User not found');
  if (user.provider !== 'email') {
    throw Unauthorized(`Password reset not available for ${user.provider} accounts. Use ${user.provider} sign-in.`);
  }
  const otpData = generateOTP();
  console.log('Generated OTP for forgot password:', otpData.code, 'expires at', otpData.expiresAt);
  user.otp = otpData;
  await user.save();
  return { user, otpData };
};

export const verifyForgotPasswordOTPUser = async (emailOrUsername, otp) => {
  let user = await userModel.findOne({ email: emailOrUsername });
  if (!user) user = await userModel.findOne({ username: emailOrUsername });
  if (!user) throw NotFound('User not found');
  if (!user.otp?.code || !user.otp?.expiresAt) throw Unauthorized('OTP not found. Please request a new OTP.');
  if (user.otp.expiresAt < new Date()) throw Unauthorized('OTP has expired. Please request a new OTP.');
  if (user.otp.code !== otp) throw Unauthorized('Invalid OTP');
  user.otp = undefined;
  user._canResetPassword = true;
  await user.save();
  return user;
};

export const resetPasswordUser = async (emailOrUsername, newPassword) => {
  let user = await userModel.findOne({ email: emailOrUsername }).select('+password');
  if (!user) user = await userModel.findOne({ username: emailOrUsername }).select('+password');
  if (!user) throw NotFound('User not found');
  user.password = await hashPassword(newPassword);
  await user.save();
  return user;
};

export const getProfileUser = (user) => ({
  id: user._id,
  email: user.email,
  username: user.username,
  fullName: user.fullName,
  profilePic: user.profilePic,
  provider: user.provider,
  isVerified: user.isVerified,
  role: user.role,
});

export const updateProfileUser = async (userId, payload) => {
  const user = await userModel.findById(userId).select('+password');
  if (!user) throw NotFound('User not found');
  const { username, fullName, currentPassword, newPassword, profilePic } = payload;
  if (profilePic !== undefined) user.profilePic = profilePic;
  if (username !== undefined) {
    const trimmed = typeof username === 'string' ? username.trim() : '';
    if (trimmed && trimmed !== user.username) {
      const existing = await userModel.findOne({ username: trimmed });
      if (existing && existing._id.toString() !== userId.toString()) {
        throw Conflict('Username already taken');
      }
      user.username = trimmed;
    } else if (trimmed === '') user.username = '';
  }
  if (fullName !== undefined) {
    let parsed = fullName;
    if (typeof fullName === 'string') {
      try {
        parsed = JSON.parse(fullName);
      } catch {
        parsed = null;
      }
    }
    if (parsed && typeof parsed === 'object') {
      user.fullName = user.fullName || {};
      if (parsed.firstName !== undefined) user.fullName.firstName = parsed.firstName;
      if (parsed.lastName !== undefined) user.fullName.lastName = parsed.lastName;
    }
  }
  if (currentPassword && newPassword) {
    if (user.provider !== 'email') throw Unauthorized('Password cannot be changed for OAuth accounts');
    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) throw Unauthorized('Current password is incorrect');
    user.password = await hashPassword(newPassword);
  }
  await user.save();
  return user;
};

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  generateOTPCode,
  registerUser,
  verifyRegisterOTP,
  resendOTPUser,
  loginUser,
  verifyLoginOTPUser,
  forgotPasswordUser,
  verifyForgotPasswordOTPUser,
  resetPasswordUser,
  getProfileUser,
  updateProfileUser,
};
