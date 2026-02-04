import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import * as dbHandler from './db-handler.js';

const api = request(app);

describe('Auth API', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  const testUser = {
    email: `test-auth-${Date.now()}@test.com`,
    password: 'TestPass123',
    fullName: {
      firstName: 'Test',
      lastName: 'User'
    },
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register with valid data', async () => {
      const res = await api.post('/api/v1/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.otp).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const res = await api.post('/api/v1/auth/register').send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const res = await api.post('/api/v1/auth/register').send({
        email: 'invalid',
        password: 'TestPass123',
        fullName: { firstName: 'Test', lastName: 'User' },
      });
      expect(res.status).toBe(400);
    });

    it('should reject weak password', async () => {
      const res = await api.post('/api/v1/auth/register').send({
        email: 'weak@test.com',
        password: 'short',
        fullName: { firstName: 'Test', lastName: 'User' },
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const loginUser = {
      email: `test-login-${Date.now()}@test.com`,
      password: 'TestPass123',
      fullName: {
        firstName: 'Login',
        lastName: 'User'
      },
    };

    beforeAll(async () => {
      // First register and verify a new user for login tests
      const registerRes = await api.post('/api/v1/auth/register').send(loginUser);
      const otp = registerRes.body.data.otp;
      await api.post('/api/v1/auth/verify-register-otp').send({ 
        email: loginUser.email, 
        otp 
      });
    });

    it('should login with valid credentials', async () => {
      const res = await api.post('/api/v1/auth/login').send({
        email: loginUser.email,
        password: loginUser.password,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await api.post('/api/v1/auth/login').send({
        email: loginUser.email,
        password: 'WrongPass123',
      });
      expect(res.status).toBe(401);
    });

    it('should reject unknown email', async () => {
      const res = await api.post('/api/v1/auth/login').send({
        email: 'unknown@test.com',
        password: 'TestPass123',
      });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/auth/verify-register-otp', () => {
    const otpUser = {
      email: `test-otp-${Date.now()}@test.com`,
      password: 'TestPass123',
      fullName: {
        firstName: 'OTP',
        lastName: 'Test'
      },
    };

    let otpCode;

    beforeAll(async () => {
      const registerRes = await api.post('/api/v1/auth/register').send(otpUser);
      otpCode = registerRes.body.data.otp;
    });

    it('should verify OTP and return token', async () => {
      const res = await api.post('/api/v1/auth/verify-register-otp').send({
        email: otpUser.email,
        otp: otpCode,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user).toBeDefined();
    });

    it('should reject invalid OTP', async () => {
      const newUser = {
        email: `test-invalid-otp-${Date.now()}@test.com`,
        password: 'TestPass123',
        fullName: { firstName: 'Invalid', lastName: 'OTP' },
      };
      await api.post('/api/v1/auth/register').send(newUser);
      
      const res = await api.post('/api/v1/auth/verify-register-otp').send({
        email: newUser.email,
        otp: '000000',
      });
      expect(res.status).toBe(401);
    });

    it('should reject for non-existent user', async () => {
      const res = await api.post('/api/v1/auth/verify-register-otp').send({
        email: 'nonexistent@test.com',
        otp: '123456',
      });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/auth/resend-otp', () => {
    const resendUser = {
      email: `test-resend-${Date.now()}@test.com`,
      password: 'TestPass123',
      fullName: { firstName: 'Resend', lastName: 'Test' },
    };

    beforeAll(async () => {
      await api.post('/api/v1/auth/register').send(resendUser);
    });

    it('should resend OTP successfully', async () => {
      const res = await api.post('/api/v1/auth/resend-otp').send({
        email: resendUser.email,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject for already verified user', async () => {
      // Create and verify a new user
      const verifiedEmail = `test-verified-${Date.now()}@test.com`;
      const registerRes = await api.post('/api/v1/auth/register').send({
        email: verifiedEmail,
        password: 'TestPass123',
        fullName: { firstName: 'Verified', lastName: 'User' },
      });
      const otp = registerRes.body.data.otp;
      await api.post('/api/v1/auth/verify-register-otp').send({
        email: verifiedEmail,
        otp,
      });

      // Try to resend OTP
      const res = await api.post('/api/v1/auth/resend-otp').send({
        email: verifiedEmail,
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    const forgotUser = {
      email: `test-forgot-${Date.now()}@test.com`,
      password: 'TestPass123',
      fullName: { firstName: 'Forgot', lastName: 'Test' },
    };

    beforeAll(async () => {
      const registerRes = await api.post('/api/v1/auth/register').send(forgotUser);
      const otp = registerRes.body.data.otp;
      await api.post('/api/v1/auth/verify-register-otp').send({
        email: forgotUser.email,
        otp,
      });
    });

    it('should send forgot password OTP', async () => {
      const res = await api.post('/api/v1/auth/forgot-password').send({
        email: forgotUser.email,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject for non-existent user', async () => {
      const res = await api.post('/api/v1/auth/forgot-password').send({
        email: 'nonexistent@test.com',
      });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await api.post('/api/v1/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
