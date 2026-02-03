import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import User from '../models/user.model.js';
import { env } from '../config/env.js';
import { Unauthorized, Conflict, BadRequest } from '../utils/ApiError.js';

export const hashPassword = (plain) => argon2.hash(plain);
export const verifyPassword = (plain, hash) => argon2.verify(hash, plain);

export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { sub: userId.toString() },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { sub: userId.toString() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY }
  );
  return { accessToken, refreshToken };
};

export const signup = async (email, password, name = '') => {
  const existing = await User.findOne({ email });
  if (existing) throw new Conflict('Email already registered');
  const hashed = await hashPassword(password);
  const user = await User.create({
    email,
    password: hashed,
    name: name || email.split('@')[0],
  });
  const tokens = generateTokens(user._id);
  const u = user.toObject();
  delete u.password;
  return { user: u, ...tokens };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new Unauthorized('Invalid email or password');
  if (!user.password) throw new Unauthorized('Please sign in with Google or GitHub');
  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Unauthorized('Invalid email or password');
  const tokens = generateTokens(user._id);
  const u = user.toObject();
  delete u.password;
  return { user: u, ...tokens };
};

export const refreshTokens = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.sub);
  if (!user) throw new Unauthorized('User not found');
  return generateTokens(user._id);
};

export default { hashPassword, verifyPassword, generateTokens, signup, login, refreshTokens };
