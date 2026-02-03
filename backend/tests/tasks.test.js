import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Task from '../src/models/task.model.js';
import * as authService from '../src/services/auth.service.js';

const api = request(app);

describe('Tasks API', () => {
  let token;
  let userId;
  let taskId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = `test-tasks-${Date.now()}@test.com`;
    const result = await authService.signup(email, 'TestPass123', 'Tasks Test');
    token = result.accessToken;
    userId = result.user._id;
  });

  afterAll(async () => {
    await Task.deleteMany({ createdBy: userId });
    await User.deleteMany({ email: /test-tasks/ });
    await mongoose.disconnect();
  });

  describe('POST /api/v1/tasks', () => {
    it('should create task', async () => {
      const res = await api
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Task', description: 'Desc', status: 'todo' });
      expect(res.status).toBe(201);
      expect(res.body.data.task.title).toBe('Test Task');
      taskId = res.body.data.task._id;
    });

    it('should reject without title', async () => {
      const res = await api
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title' });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should list tasks with pagination', async () => {
      const res = await api
        .get('/api/v1/tasks?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.pagination).toBeDefined();
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should get single task', async () => {
      const res = await api
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.task._id).toBe(taskId);
    });

    it('should return 404 for invalid id', async () => {
      const res = await api
        .get('/api/v1/tasks/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update task', async () => {
      const res = await api
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Task', status: 'in_progress' });
      expect(res.status).toBe(200);
      expect(res.body.data.task.title).toBe('Updated Task');
      expect(res.body.data.task.status).toBe('in_progress');
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete task', async () => {
      const res = await api
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 after delete', async () => {
      const res = await api
        .get(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
