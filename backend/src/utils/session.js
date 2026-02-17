import jwt from 'jsonwebtoken';
import redis from '../config/redis.js';
import logger from './logger.js';

/**
 * Session management utilities using Redis
 * Industry-standard approach for token management
 */

const SESSION_PREFIX = 'session:';
const BLACKLIST_PREFIX = 'blacklist:';
const USER_SESSIONS_PREFIX = 'user:sessions:';
const REFRESH_TOKEN_PREFIX = 'refresh:';

const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days
const REFRESH_TTL = 30 * 24 * 60 * 60; // 30 days
const BLACKLIST_TTL = 7 * 24 * 60 * 60; // 7 days

/**
 * Store session in Redis after successful authentication
 * @param {string} userId - User ID
 * @param {string} token - JWT token
 * @param {Object} metadata - Additional session data (device, IP, etc.)
 */
export const createSession = async (userId, token, metadata = {}) => {
  try {
    if (!redis) return true; // Skip if Redis unavailable
    
    const decoded = jwt.decode(token);
    // Use same sessionId generation logic as validateSession
    const sessionId = decoded.jti || `${decoded.id || decoded.userId || userId}-${decoded.iat}`;
    
    const sessionData = {
      userId,
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
      ...metadata,
    };
    
    // Store session data
    await redis.set(
      `${SESSION_PREFIX}${sessionId}`,
      JSON.stringify(sessionData),
      'EX',
      SESSION_TTL
    );
    
    // Add session to user's session list
    await redis.sadd(`${USER_SESSIONS_PREFIX}${userId}`, sessionId);
    await redis.expire(`${USER_SESSIONS_PREFIX}${userId}`, SESSION_TTL);
    
    logger.info(`Session created for user ${userId} with sessionId: ${sessionId}`);
    return sessionId;
  } catch (error) {
    logger.error(`Create session error: ${error.message}`);
    return null;
  }
};

/**
 * Validate if session exists and is valid
 * @param {string} token - JWT token
 */
export const validateSession = async (token) => {
  try {
    if (!redis) return true; // Skip if Redis unavailable
    
    const decoded = jwt.decode(token);
    if (!decoded) {
      logger.warn('Failed to decode JWT token');
      return false;
    }
    
    // Use same sessionId generation logic as createSession
    const sessionId = decoded.jti || `${decoded.id || decoded.userId}-${decoded.iat}`;
    
    // Check if token is blacklisted
    const isBlacklisted = await redis.exists(`${BLACKLIST_PREFIX}${token}`);
    if (isBlacklisted) {
      logger.warn(`Blacklisted token attempt: ${sessionId}`);
      return false;
    }
    
    // Check if session exists
    const sessionData = await redis.get(`${SESSION_PREFIX}${sessionId}`);
    const isValid = !!sessionData;
    
    if (!isValid) {
      logger.warn(`Session not found for sessionId: ${sessionId}`);
    } else {
      logger.info(`Session validated for sessionId: ${sessionId}`);
    }
    
    return isValid;
  } catch (error) {
    logger.error(`Validate session error: ${error.message}`);
    return true; // Fail open if Redis error
  }
};

/**
 * Blacklist token on logout
 * @param {string} token - JWT token to blacklist
 */
export const blacklistToken = async (token) => {
  try {
    if (!redis) return true;
    
    const decoded = jwt.decode(token);
    if (!decoded) return false;
    
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.set(
        `${BLACKLIST_PREFIX}${token}`,
        'blacklisted',
        'EX',
        ttl
      );
      logger.info(`Token blacklisted successfully`);
    }
    
    // Remove from active sessions
    const sessionId = decoded.jti || `${decoded.userId || decoded.id}-${decoded.iat}`;
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
    
    if (decoded.userId || decoded.id) {
      await redis.srem(
        `${USER_SESSIONS_PREFIX}${decoded.userId || decoded.id}`,
        sessionId
      );
    }
    
    return true;
  } catch (error) {
    logger.error(`Blacklist token error: ${error.message}`);
    return false;
  }
};

/**
 * Get all active sessions for a user
 * @param {string} userId - User ID
 */
export const getUserSessions = async (userId) => {
  try {
    if (!redis) return [];
    
    const sessionIds = await redis.smembers(`${USER_SESSIONS_PREFIX}${userId}`);
    const sessions = [];
    
    for (const sessionId of sessionIds) {
      const sessionData = await redis.get(`${SESSION_PREFIX}${sessionId}`);
      if (sessionData) {
        sessions.push({ ...JSON.parse(sessionData), sessionId });
      }
    }
    
    return sessions;
  } catch (error) {
    logger.error(`Get user sessions error: ${error.message}`);
    return [];
  }
};

/**
 * Revoke specific session
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID to revoke
 */
export const revokeSession = async (userId, sessionId) => {
  try {
    if (!redis) return true;
    
    // Get session data to blacklist token
    const sessionData = await redis.get(`${SESSION_PREFIX}${sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      await blacklistToken(session.token);
    }
    
    // Remove session
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
    await redis.srem(`${USER_SESSIONS_PREFIX}${userId}`, sessionId);
    
    logger.info(`Session ${sessionId} revoked for user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Revoke session error: ${error.message}`);
    return false;
  }
};

/**
 * Revoke all sessions for a user (e.g., on password change)
 * @param {string} userId - User ID
 */
export const revokeAllUserSessions = async (userId) => {
  try {
    if (!redis) return true;
    
    const sessionIds = await redis.smembers(`${USER_SESSIONS_PREFIX}${userId}`);
    
    for (const sessionId of sessionIds) {
      await revokeSession(userId, sessionId);
    }
    
    await redis.del(`${USER_SESSIONS_PREFIX}${userId}`);
    logger.info(`All sessions revoked for user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Revoke all sessions error: ${error.message}`);
    return false;
  }
};

/**
 * Store refresh token in Redis
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token
 */
export const storeRefreshToken = async (userId, refreshToken) => {
  try {
    if (!redis) return true;
    
    await redis.set(
      `${REFRESH_TOKEN_PREFIX}${userId}`,
      refreshToken,
      'EX',
      REFRESH_TTL
    );
    
    logger.info(`Refresh token stored for user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Store refresh token error: ${error.message}`);
    return false;
  }
};

/**
 * Validate refresh token
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token to validate
 */
export const validateRefreshToken = async (userId, refreshToken) => {
  try {
    if (!redis) return true;
    
    const storedToken = await redis.get(`${REFRESH_TOKEN_PREFIX}${userId}`);
    return storedToken === refreshToken;
  } catch (error) {
    logger.error(`Validate refresh token error: ${error.message}`);
    return false;
  }
};

/**
 * Delete refresh token
 * @param {string} userId - User ID
 */
export const deleteRefreshToken = async (userId) => {
  try {
    if (!redis) return true;
    
    await redis.del(`${REFRESH_TOKEN_PREFIX}${userId}`);
    logger.info(`Refresh token deleted for user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Delete refresh token error: ${error.message}`);
    return false;
  }
};

/**
 * Get session statistics for a user
 * @param {string} userId - User ID
 */
export const getSessionStats = async (userId) => {
  try {
    if (!redis) return { activeSessions: 0, lastActivity: null };
    
    const sessions = await getUserSessions(userId);
    const lastActivity = sessions.length > 0 
      ? sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
      : null;
    
    return {
      activeSessions: sessions.length,
      lastActivity,
      sessions: sessions.map(s => ({
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        device: s.device,
        ip: s.ip,
      })),
    };
  } catch (error) {
    logger.error(`Get session stats error: ${error.message}`);
    return { activeSessions: 0, lastActivity: null };
  }
};

export default {
  createSession,
  validateSession,
  blacklistToken,
  getUserSessions,
  revokeSession,
  revokeAllUserSessions,
  storeRefreshToken,
  validateRefreshToken,
  deleteRefreshToken,
  getSessionStats,
};
