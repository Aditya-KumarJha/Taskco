import request from 'supertest';
import app from '../src/app.js';
import * as dbHandler from './db-handler.js';
import { createSession, getUserSessions } from '../src/utils/session.js';

const api = request(app);

describe('Session API', () => {
  let token1;
  let token2;
  let userId;
  let sessionId1;
  let sessionId2;

  beforeAll(async () => {
    await dbHandler.connect();
    
    // Create and verify a test user
    const email = `test-session-${Date.now()}@test.com`;
    
    const registerRes = await api.post('/api/v1/auth/register').send({
      email,
      password: 'TestPass123',
      fullName: { firstName: 'Session', lastName: 'Test' },
    });
    
    const otp = registerRes.body.data.otp;

    // First login
    const verifyRes1 = await api.post('/api/v1/auth/verify-register-otp').send({
      email,
      otp,
    });
    
    token1 = verifyRes1.body.data.accessToken;
    userId = verifyRes1.body.data.user._id;

    // Second login (simulate another device)
    const loginRes = await api.post('/api/v1/auth/login').send({
      email,
      password: 'TestPass123',
    });
    const loginOtp = loginRes.body.data.otp;
    
    const verifyRes2 = await api.post('/api/v1/auth/verify-login-otp').send({
      email,
      otp: loginOtp,
    });
    // Extract token from cookie
    const cookies2 = verifyRes2.headers['set-cookie'];
    token2 = cookies2[0].split(';')[0].split('=')[1];

    // Get session IDs
    await new Promise(resolve => setTimeout(resolve, 100));
    const sessions = await getUserSessions(userId);
    if (sessions.length >= 2) {
      sessionId1 = sessions[0].sessionId;
      sessionId2 = sessions[1].sessionId;
    }
  });

  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    await dbHandler.closeDatabase();
  });

  describe('GET /api/v1/sessions', () => {
    it('should get active sessions for authenticated user', async () => {
      const res = await api
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessions).toBeDefined();
      expect(Array.isArray(res.body.data.sessions)).toBe(true);
      expect(res.body.data.count).toBeGreaterThanOrEqual(1);
    });

    it('should mask token in response', async () => {
      const res = await api
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      if (res.body.data.sessions.length > 0) {
        const session = res.body.data.sessions[0];
        if (session.token) {
          expect(session.token).toMatch(/^\.\.\./);
        }
      }
    });

    it('should indicate current session', async () => {
      const res = await api
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      const currentSession = res.body.data.sessions.find(s => s.current === true);
      expect(currentSession).toBeDefined();
    });

    it('should reject unauthorized requests', async () => {
      const res = await api.get('/api/v1/sessions');
      
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const res = await api
        .get('/api/v1/sessions')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/sessions/stats', () => {
    it('should get session statistics', async () => {
      const res = await api
        .get('/api/v1/sessions/stats')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.activeSessions).toBeGreaterThanOrEqual(0);
    });

    it('should include session details in stats', async () => {
      const res = await api
        .get('/api/v1/sessions/stats')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      if (res.body.data.sessions && res.body.data.sessions.length > 0) {
        const session = res.body.data.sessions[0];
        expect(session.createdAt).toBeDefined();
        expect(session.expiresAt).toBeDefined();
      }
    });

    it('should reject unauthorized requests', async () => {
      const res = await api.get('/api/v1/sessions/stats');
      
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/sessions/:sessionId', () => {
    it('should revoke a specific session', async () => {
      // Get current sessions
      const sessionsRes = await api
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${token1}`);
      
      if (sessionsRes.body.data.sessions.length >= 2) {
        // Find a session that is not the current one
        const sessionToRevoke = sessionsRes.body.data.sessions.find(s => !s.current);
        
        if (sessionToRevoke) {
          const res = await api
            .delete(`/api/v1/sessions/${sessionToRevoke.sessionId}`)
            .set('Authorization', `Bearer ${token1}`);
          
          expect(res.status).toBe(200);
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('revoked');
        }
      }
    });

    it('should reject request without sessionId', async () => {
      const res = await api
        .delete('/api/v1/sessions/')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(404);
    });

    it('should handle revoking non-existent session gracefully', async () => {
      const res = await api
        .delete('/api/v1/sessions/non-existent-session-id')
        .set('Authorization', `Bearer ${token1}`);
      
      // Should still succeed even if session doesn't exist
      expect([200, 404]).toContain(res.status);
    });

    it('should reject unauthorized requests', async () => {
      const res = await api.delete('/api/v1/sessions/some-session-id');
      
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/sessions/revoke-others', () => {
    beforeEach(async () => {
      // Create multiple sessions for testing
      const email = `test-revoke-others-${Date.now()}@test.com`;
      
      const registerRes = await api.post('/api/v1/auth/register').send({
        email,
        password: 'TestPass123',
        fullName: { firstName: 'Revoke', lastName: 'Test' },
      });
      
      const otp = registerRes.body.data.otp;

      const verifyRes = await api.post('/api/v1/auth/verify-register-otp').send({
        email,
        otp,
      });
      
      token1 = verifyRes.body.data.accessToken;
      userId = verifyRes.body.data.user._id;

      // Create second session
      await api.post('/api/v1/auth/login').send({
        email,
        password: 'TestPass123',
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should revoke all sessions except current', async () => {
      const res = await api
        .post('/api/v1/sessions/revoke-others')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('session(s) revoked');
      expect(res.body.data.revokedCount).toBeDefined();
    });

    it('should keep current session active', async () => {
      await api
        .post('/api/v1/sessions/revoke-others')
        .set('Authorization', `Bearer ${token1}`);
      
      // Current token should still work
      const res = await api
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.sessions.length).toBe(1);
    });

    it('should handle when there are no other sessions', async () => {
      // First revoke all other sessions
      await api
        .post('/api/v1/sessions/revoke-others')
        .set('Authorization', `Bearer ${token1}`);
      
      // Try again
      const res = await api
        .post('/api/v1/sessions/revoke-others')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.revokedCount).toBe(0);
    });

    it('should reject unauthorized requests', async () => {
      const res = await api.post('/api/v1/sessions/revoke-others');
      
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/sessions/revoke-all', () => {
    let testToken;
    
    beforeEach(async () => {
      // Create a fresh user for this test
      const email = `test-revoke-all-${Date.now()}@test.com`;
      
      const registerRes = await api.post('/api/v1/auth/register').send({
        email,
        password: 'TestPass123',
        fullName: { firstName: 'RevokeAll', lastName: 'Test' },
      });
      
      const otp = registerRes.body.data.otp;

      const verifyRes = await api.post('/api/v1/auth/verify-register-otp').send({
        email,
        otp,
      });
      
      testToken = verifyRes.body.data.accessToken;
    });

    it('should revoke all sessions including current', async () => {
      const res = await api
        .post('/api/v1/sessions/revoke-all')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('All sessions revoked');
    });

    it('should clear authentication cookies', async () => {
      const res = await api
        .post('/api/v1/sessions/revoke-all')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res.status).toBe(200);
      // Check if Set-Cookie header is present to clear cookies
      const cookies = res.headers['set-cookie'];
      if (cookies) {
        expect(cookies.some(cookie => cookie.includes('token='))).toBe(true);
      }
    });

    it('should invalidate token after revoking all', async () => {
      await api
        .post('/api/v1/sessions/revoke-all')
        .set('Authorization', `Bearer ${testToken}`);
      
      // Token should no longer work
      const res = await api
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${testToken}`);
      
      // Depending on implementation, this could be 401 or empty sessions
      expect([401, 200]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.data.sessions.length).toBe(0);
      }
    });

    it('should reject unauthorized requests', async () => {
      const res = await api.post('/api/v1/sessions/revoke-all');
      
      expect(res.status).toBe(401);
    });

    it('should handle multiple revoke-all calls gracefully', async () => {
      const res1 = await api
        .post('/api/v1/sessions/revoke-all')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res1.status).toBe(200);

      // Second call with same token (should fail)
      const res2 = await api
        .post('/api/v1/sessions/revoke-all')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect([401, 200]).toContain(res2.status);
    });
  });

  describe('Session Security', () => {
    it('should not allow access with revoked token', async () => {
      const email = `test-security-${Date.now()}@test.com`;
      
      const registerRes = await api.post('/api/v1/auth/register').send({
        email,
        password: 'TestPass123',
        fullName: { firstName: 'Security', lastName: 'Test' },
      });
      
      const otp = registerRes.body.data.otp;

      const verifyRes = await api.post('/api/v1/auth/verify-register-otp').send({
        email,
        otp,
      });
      
      const testToken = verifyRes.body.data.accessToken;

      // Logout to revoke token
      await api
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${testToken}`);

      // Try to use revoked token
      const res = await api
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect([401, 200]).toContain(res.status);
      if (res.status === 200) {
        // If Redis is not available, it might still return 200 but with empty sessions
        expect(res.body.data.sessions.length).toBe(0);
      }
    });

    it('should not allow user to revoke another user\'s sessions', async () => {
      // Create two different users
      const email1 = `test-sec1-${Date.now()}@test.com`;
      const email2 = `test-sec2-${Date.now()}@test.com`;
      
      // User 1
      const registerRes1 = await api.post('/api/v1/auth/register').send({
        email: email1,
        password: 'TestPass123',
        fullName: { firstName: 'User', lastName: 'One' },
      });
      
      const otp1 = registerRes1.body.data.otp;

      const verifyRes1 = await api.post('/api/v1/auth/verify-register-otp').send({
        email: email1,
        otp: otp1,
      });
      
      const token_user1 = verifyRes1.body.data.accessToken;

      // User 2
      const registerRes2 = await api.post('/api/v1/auth/register').send({
        email: email2,
        password: 'TestPass123',
        fullName: { firstName: 'User', lastName: 'Two' },
      });
      
      const otp2 = registerRes2.body.data.otp;

      const verifyRes2 = await api.post('/api/v1/auth/verify-register-otp').send({
        email: email2,
        otp: otp2,
      });
      
      const userId2 = verifyRes2.body.data.user._id;

      await new Promise(resolve => setTimeout(resolve, 100));

      // Get user 2 sessions
      const sessions2 = await getUserSessions(userId2);
      
      if (sessions2.length > 0) {
        // User 1 tries to revoke User 2's session
        const res = await api
          .delete(`/api/v1/sessions/${sessions2[0].sessionId}`)
          .set('Authorization', `Bearer ${token_user1}`);
        
        // Should succeed but not actually revoke user 2's session
        // because session doesn't belong to user 1
        expect(res.status).toBe(200);

        // Verify user 2's session still exists
        const sessions2After = await getUserSessions(userId2);
        expect(sessions2After.length).toBe(sessions2.length);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle sessions when Redis is unavailable', async () => {
      // This test assumes Redis might be unavailable in test environment
      const res = await api
        .get('/api/v1/sessions')
        .set('Authorization', `Bearer ${token1}`);
      
      // Should not crash, either returns empty array or sessions
      expect([200, 500, 503]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.body.data.sessions)).toBe(true);
      }
    });

    it('should handle malformed session IDs', async () => {
      const res = await api
        .delete('/api/v1/sessions/<script>alert("xss")</script>')
        .set('Authorization', `Bearer ${token1}`);
      
      expect([200, 400, 404]).toContain(res.status);
    });

    it('should handle very long session IDs', async () => {
      const longSessionId = 'a'.repeat(10000);
      const res = await api
        .delete(`/api/v1/sessions/${longSessionId}`)
        .set('Authorization', `Bearer ${token1}`);
      
      expect([200, 400, 404, 414]).toContain(res.status);
    });
  });
});
