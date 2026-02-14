import request from 'supertest';
import app from '../src/app.js';
import Notification from '../src/models/notification.model.js';
import * as dbHandler from './db-handler.js';

const api = request(app);

describe('Notifications API', () => {
  let token;
  let userId;
  let notificationId;

  beforeAll(async () => {
    await dbHandler.connect();
    const email = `test-notif-${Date.now()}@test.com`;
    
    const registerRes = await api.post('/api/v1/auth/register').send({
      email,
      password: 'TestPass123',
      fullName: { firstName: 'Notif', lastName: 'Test' },
    });
    
    const otp = registerRes.body.data.otp;
    const verifyRes = await api.post('/api/v1/auth/verify-register-otp').send({
      email,
      otp,
    });
    
    token = verifyRes.body.data.accessToken;
    userId = verifyRes.body.data.user.id;

    const notification = await Notification.create({
      userId,
      type: 'task_created',
      title: 'Test Notification',
      message: 'This is a test notification',
      read: false,
    });
    notificationId = notification._id.toString();
  });

  afterAll(async () => {
    // Wait for any pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    await dbHandler.closeDatabase();
  });

  describe('GET /api/v1/notifications', () => {
    it('should return 401 without token', async () => {
      const res = await api.get('/api/v1/notifications');
      expect(res.status).toBe(401);
    });

    it('should get user notifications with pagination', async () => {
      const res = await api
        .get('/api/v1/notifications?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications).toBeDefined();
      expect(Array.isArray(res.body.data.notifications)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.unreadCount).toBeDefined();
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const res = await api
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent notification', async () => {
      const res = await api
        .patch('/api/v1/notifications/000000000000000000000000/read')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const res = await api
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/notifications/:id', () => {
    it('should delete notification', async () => {
      const res = await api
        .delete(`/api/v1/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for already deleted notification', async () => {
      const res = await api
        .delete(`/api/v1/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
