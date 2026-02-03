import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/user.model.js';

const api = request(app);

describe('Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test-auth/ });
    await mongoose.disconnect();
  });

  const testUser = {
    email: `test-auth-${Date.now()}@test.com`,
    password: 'TestPass123',
    name: 'Test User',
  };

  describe('POST /api/v1/auth/signup', () => {
    it('should signup with valid data', async () => {
      const res = await api.post('/api/v1/auth/signup').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const res = await api.post('/api/v1/auth/signup').send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const res = await api.post('/api/v1/auth/signup').send({
        email: 'invalid',
        password: 'TestPass123',
      });
      expect(res.status).toBe(422);
    });

    it('should reject weak password', async () => {
      const res = await api.post('/api/v1/auth/signup').send({
        email: 'weak@test.com',
        password: 'short',
      });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await api.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await api.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'WrongPass123',
      });
      expect(res.status).toBe(401);
    });

    it('should reject unknown email', async () => {
      const res = await api.post('/api/v1/auth/login').send({
        email: 'unknown@test.com',
        password: 'TestPass123',
      });
      expect(res.status).toBe(401);
    });
  });
});
