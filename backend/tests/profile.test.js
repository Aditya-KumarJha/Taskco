import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import * as dbHandler from './db-handler.js';

const api = request(app);

describe('Profile API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await dbHandler.connect();
    const email = `test-profile-${Date.now()}@test.com`;
    
    const registerRes = await api.post('/api/v1/auth/register').send({
      email,
      password: 'TestPass123',
      fullName: { firstName: 'Profile', lastName: 'Test' },
    });
    
    const otp = registerRes.body.data.otp; 
    
    const verifyRes = await api.post('/api/v1/auth/verify-register-otp').send({
      email,
      otp,
    });
    
    token = verifyRes.body.data.accessToken;
    userId = verifyRes.body.data.user._id;
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  describe('GET /api/v1/me', () => {
    it('should return 401 without token', async () => {
      const res = await api.get('/api/v1/me');
      expect(res.status).toBe(401);
    });

    it('should return profile with valid token', async () => {
      const res = await api
        .get('/api/v1/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });
  });

  describe('PUT /api/v1/me', () => {
    it('should update profile', async () => {
      const res = await api
        .put('/api/v1/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: { firstName: 'Updated', lastName: 'Name' } });
      expect(res.status).toBe(200);
      expect(res.body.data.user.fullName.firstName).toBe('Updated');
    });

    it('should update username', async () => {
      const res = await api
        .put('/api/v1/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'newusername123' });
      expect(res.status).toBe(200);
      expect(res.body.data.user.username).toBe('newusername123');
    });

    it('should reject duplicate username', async () => {
      const anotherEmail = `test-another-${Date.now()}@test.com`;
      const registerRes = await api.post('/api/v1/auth/register').send({
        email: anotherEmail,
        password: 'TestPass123',
        fullName: { firstName: 'Another', lastName: 'User' },
        username: 'existingusername',
      });
      const otp = registerRes.body.data.otp;
      await api.post('/api/v1/auth/verify-register-otp').send({
        email: anotherEmail,
        otp,
      });

      const res = await api
        .put('/api/v1/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'existingusername' });
      expect(res.status).toBe(409);
    });

    it('should return 401 without token', async () => {
      const res = await api
        .put('/api/v1/me')
        .send({ fullName: { firstName: 'No', lastName: 'Auth' } });
      expect(res.status).toBe(401);
    });
  });
});
