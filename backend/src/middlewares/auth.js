import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { env } from '../config/env.js';
import { Unauthorized } from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      throw Unauthorized('Access token required. Please log in.');
    }
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
      throw Unauthorized('User not found. Token may be invalid.');
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(Unauthorized('Invalid token. Please log in again.'));
    }
    if (err.name === 'TokenExpiredError') {
      return next(Unauthorized('Token expired. Please log in again.'));
    }
    next(err);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      return next();
    }
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select('-password');
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};

export const refreshAuth = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      throw Unauthorized('Refresh token required.');
    }
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
      throw Unauthorized('User not found.');
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(Unauthorized('Invalid or expired refresh token.'));
    }
    next(err);
  }
};

export default protect;
