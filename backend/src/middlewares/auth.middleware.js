import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { Unauthorized, Forbidden } from '../utils/ApiError.js';
import { validateSession } from '../utils/session.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    if (!token) {
      throw Unauthorized('Access token required. Please log in.');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const isValid = await validateSession(token);
    if (!isValid) {
      throw Unauthorized('Session expired or invalid. Please log in again.');
    }
    
    const userId = decoded.id || decoded.sub;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw Unauthorized('User not found. Token may be invalid.');
    }
    
    req.user = user;
    req.token = token; 
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
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.sub;
    const user = await User.findById(userId).select('-password');
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
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.id || decoded.sub;
    const user = await User.findById(userId).select('-password');
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

export const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      throw Unauthorized('Authentication required. Please log in.');
    }
    if (req.user.role !== 'admin') {
      throw Forbidden('Access denied. Admin privileges required.');
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const authMiddleware = protect;
export default protect;
