import { asyncHandler } from '../utils/asyncHandler.js';
import { getUserSessions, revokeSession, revokeAllUserSessions, getSessionStats } from '../utils/session.js';
import { BadRequest } from '../utils/ApiError.js';

export const getActiveSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const sessions = await getUserSessions(userId);
  
  const maskedSessions = sessions.map(session => ({
    ...session,
    token: session.token ? `...${session.token.slice(-10)}` : undefined,
    current: session.token === req.token, 
  }));
  
  res.json({
    success: true,
    data: {
      sessions: maskedSessions,
      count: sessions.length,
    },
  });
});

export const getSessionStatistics = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const stats = await getSessionStats(userId);
  
  res.json({
    success: true,
    data: stats,
  });
});

export const revokeSpecificSession = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { sessionId } = req.params;
  
  if (!sessionId) {
    throw BadRequest('Session ID is required');
  }
  
  await revokeSession(userId, sessionId);
  
  res.json({
    success: true,
    message: 'Session revoked successfully',
  });
});

export const revokeOtherSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const currentToken = req.token;
  
  const sessions = await getUserSessions(userId);
  
  let revokedCount = 0;
  for (const session of sessions) {
    if (session.token !== currentToken) {
      await revokeSession(userId, session.sessionId || session.token);
      revokedCount++;
    }
  }
  
  res.json({
    success: true,
    message: `${revokedCount} session(s) revoked. Current session is still active.`,
    data: {
      revokedCount,
    },
  });
});

export const revokeAllSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  
  await revokeAllUserSessions(userId);
  
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  
  res.json({
    success: true,
    message: 'All sessions revoked successfully. You have been logged out from all devices.',
  });
});

export default {
  getActiveSessions,
  getSessionStatistics,
  revokeSpecificSession,
  revokeOtherSessions,
  revokeAllSessions,
};
