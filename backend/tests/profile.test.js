import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import * as authService from '../src/services/auth.service.js';

const api = request(app);

describe('Profile API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = `test-profile-${Date.now()}@test.com`;
    const result = await authService.signup(email, 'TestPass123', 'Profile Test');
    token = result.accessToken;
    userId = result.user._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test-profile/ });
    await mongoose.disconnect();
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
      expect(res.body.data.user._id).toBe(userId.toString());
      expect(res.body.data.user.password).toBeUndefined();
    });
  });

  describe('PUT /api/v1/me', () => {
    it('should update profile', async () => {
      const res = await api
        .put('/api/v1/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Name');
    });
  });
});
