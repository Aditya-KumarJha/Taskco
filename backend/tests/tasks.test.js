import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Task from '../src/models/task.model.js';
import * as dbHandler from './db-handler.js';

const api = request(app);

describe('Tasks API', () => {
  let token;
  let userId;
  let taskId;

  beforeAll(async () => {
    await dbHandler.connect();
    const email = `test-tasks-${Date.now()}@test.com`;
    
    const registerRes = await api.post('/api/v1/auth/register').send({
      email,
      password: 'TestPass123',
      fullName: { firstName: 'Tasks', lastName: 'Test' },
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
    await new Promise(resolve => setTimeout(resolve, 100));
    await dbHandler.closeDatabase();
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

  describe('PATCH /api/v1/tasks/:id', () => {
    it('should update task', async () => {
      const res = await api
        .patch(`/api/v1/tasks/${taskId}`)
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

  describe('Task Filters and Search', () => {
    beforeAll(async () => {
      await api
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'High Priority Task', priority: 'high', status: 'todo' });
      
      await api
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'In Progress Task', status: 'in_progress' });
    });

    it('should filter tasks by status', async () => {
      const res = await api
        .get('/api/v1/tasks?status=in_progress')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.tasks.every(t => t.status === 'in_progress')).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const res = await api
        .get('/api/v1/tasks?priority=high')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.tasks.every(t => t.priority === 'high')).toBe(true);
    });

    it('should search tasks by title', async () => {
      const res = await api
        .get('/api/v1/tasks?search=High')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBeGreaterThan(0);
    });

    it('should sort tasks', async () => {
      const res = await api
        .get('/api/v1/tasks?sort=title&order=asc')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
    });
  });

  describe('Task Authorization', () => {
    let otherUserToken;
    let otherUserTaskId;

    beforeAll(async () => {
      const email = `test-other-${Date.now()}@test.com`;
      const registerRes = await api.post('/api/v1/auth/register').send({
        email,
        password: 'TestPass123',
        fullName: { firstName: 'Other', lastName: 'User' },
      });
      const otp = registerRes.body.data.otp;
      const verifyRes = await api.post('/api/v1/auth/verify-register-otp').send({
        email,
        otp,
      });
      otherUserToken = verifyRes.body.data.accessToken;

      const taskRes = await api
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Other User Task', status: 'todo' });
      otherUserTaskId = taskRes.body.data.task._id;
    });

    it('should not allow accessing another user\'s task', async () => {
      const res = await api
        .get(`/api/v1/tasks/${otherUserTaskId}`)
        .set('Authorization', `Bearer ${token}`);
      expect([403, 404]).toContain(res.status);
    });

    it('should not allow updating another user\'s task', async () => {
      const res = await api
        .patch(`/api/v1/tasks/${otherUserTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hacked Title' });
      expect([403, 404]).toContain(res.status);
    });

    it('should not allow deleting another user\'s task', async () => {
      const res = await api
        .delete(`/api/v1/tasks/${otherUserTaskId}`)
        .set('Authorization', `Bearer ${token}`);
      expect([403, 404]).toContain(res.status);
    });
  });



  describe('Task without authentication', () => {
    it('should reject creating task without auth', async () => {
      const res = await api
        .post('/api/v1/tasks')
        .send({ title: 'Unauthorized Task' });
      expect(res.status).toBe(401);
    });

    it('should reject listing tasks without auth', async () => {
      const res = await api.get('/api/v1/tasks');
      expect(res.status).toBe(401);
    });
  });
});
