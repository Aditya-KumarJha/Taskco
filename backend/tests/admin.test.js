import request from 'supertest';
import app from '../src/app.js';
import * as dbHandler from './db-handler.js';
import User from '../src/models/user.model.js';
import Task from '../src/models/task.model.js';
import bcrypt from 'bcryptjs';

const api = request(app);

describe('Admin API', () => {
  let adminToken;
  let adminUser;
  let regularUserToken;
  let regularUser;
  let testTask;

  beforeAll(async () => {
    await dbHandler.connect();

    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    adminUser = await User.create({
      email: `admin-${Date.now()}@test.com`,
      password: hashedPassword,
      fullName: { firstName: 'Admin', lastName: 'User' },
      username: 'adminuser',
      role: 'admin',
      isVerified: true,
      provider: 'email',
    });

    const regularHashedPassword = await bcrypt.hash('User@123', 12);
    regularUser = await User.create({
      email: `user-${Date.now()}@test.com`,
      password: regularHashedPassword,
      fullName: { firstName: 'Regular', lastName: 'User' },
      username: 'regularuser',
      role: 'user',
      isVerified: true,
      provider: 'email',
    });

    testTask = await Task.create({
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'medium',
      createdBy: regularUser._id,
    });

    const adminLoginRes = await api.post('/api/v1/auth/login').send({
      email: adminUser.email,
      password: 'Admin@123',
    });
    const adminOtp = adminLoginRes.body.data.otp;
    const adminVerifyRes = await api.post('/api/v1/auth/verify-login-otp').send({
      email: adminUser.email,
      otp: adminOtp,
    });
    // Extract token from cookie
    const adminCookies = adminVerifyRes.headers['set-cookie'];
    adminToken = adminCookies[0].split(';')[0].split('=')[1];

    const userLoginRes = await api.post('/api/v1/auth/login').send({
      email: regularUser.email,
      password: 'User@123',
    });
    const userOtp = userLoginRes.body.data.otp;
    const userVerifyRes = await api.post('/api/v1/auth/verify-login-otp').send({
      email: regularUser.email,
      otp: userOtp,
    });
    // Extract token from cookie
    const userCookies = userVerifyRes.headers['set-cookie'];
    regularUserToken = userCookies[0].split(';')[0].split('=')[1];
  });

  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    await dbHandler.closeDatabase();
  });

  describe('Admin Authorization', () => {
    it('should deny access without token', async () => {
      const res = await api.get('/api/v1/admin/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should deny access to regular users', async () => {
      const res = await api
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${regularUserToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Admin privileges required');
    });

    it('should allow access to admin users', async () => {
      const res = await api
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/stats', () => {
    it('should return admin dashboard statistics', async () => {
      const res = await api
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('users');
      expect(res.body.data).toHaveProperty('tasks');
      expect(res.body.data).toHaveProperty('topUsers');
      
      expect(res.body.data.users).toHaveProperty('total');
      expect(res.body.data.users).toHaveProperty('verified');
      expect(res.body.data.users).toHaveProperty('admins');
      expect(res.body.data.users.total).toBeGreaterThanOrEqual(2);
      expect(res.body.data.users.admins).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('should get all users with pagination', async () => {
      const res = await api
        .get('/api/v1/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('users');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThan(0);
      expect(res.body.data.pagination).toHaveProperty('page');
      expect(res.body.data.pagination).toHaveProperty('limit');
      expect(res.body.data.pagination).toHaveProperty('total');
    });

    it('should filter users by role', async () => {
      const res = await api
        .get('/api/v1/admin/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.users.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });

    it('should filter users by verification status', async () => {
      const res = await api
        .get('/api/v1/admin/users?isVerified=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.users.forEach(user => {
        expect(user.isVerified).toBe(true);
      });
    });

    it('should search users by email or username', async () => {
      const res = await api
        .get(`/api/v1/admin/users?search=${regularUser.username}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/admin/users/:id', () => {
    it('should get user by ID with task statistics', async () => {
      const res = await api
        .get(`/api/v1/admin/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('taskStats');
      expect(res.body.data.user._id).toBe(regularUser._id.toString());
      expect(res.body.data.taskStats).toHaveProperty('total');
      expect(res.body.data.taskStats.total).toBeGreaterThanOrEqual(1);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await api
        .get(`/api/v1/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid user ID', async () => {
      const res = await api
        .get('/api/v1/admin/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/role', () => {
    it('should update user role to admin', async () => {
      const res = await api
        .patch(`/api/v1/admin/users/${regularUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');

      await User.findByIdAndUpdate(regularUser._id, { role: 'user' });
    });

    it('should not allow user to change own role', async () => {
      const res = await api
        .patch(`/api/v1/admin/users/${adminUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('cannot change your own role');
    });

    it('should reject invalid role', async () => {
      const res = await api
        .patch(`/api/v1/admin/users/${regularUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'superadmin' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/verification', () => {
    it('should toggle user verification status', async () => {
      const initialStatus = regularUser.isVerified;
      
      const res = await api
        .patch(`/api/v1/admin/users/${regularUser._id}/verification`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isVerified).toBe(!initialStatus);

      await api
        .patch(`/api/v1/admin/users/${regularUser._id}/verification`)
        .set('Authorization', `Bearer ${adminToken}`);
    });
  });

  describe('GET /api/v1/admin/tasks', () => {
    it('should get all tasks from all users', async () => {
      const res = await api
        .get('/api/v1/admin/tasks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('tasks');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
      expect(res.body.data.tasks.length).toBeGreaterThan(0);
      
      res.body.data.tasks.forEach(task => {
        expect(task).toHaveProperty('createdBy');
        if (task.createdBy) {
          expect(task.createdBy).toHaveProperty('email');
        }
      });
    });

    it('should filter tasks by status', async () => {
      const res = await api
        .get('/api/v1/admin/tasks?status=todo')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.tasks.forEach(task => {
        expect(task.status).toBe('todo');
      });
    });

    it('should filter tasks by priority', async () => {
      const res = await api
        .get('/api/v1/admin/tasks?priority=medium')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.tasks.forEach(task => {
        expect(task.priority).toBe('medium');
      });
    });

    it('should filter tasks by user ID', async () => {
      const res = await api
        .get(`/api/v1/admin/tasks?userId=${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.tasks.forEach(task => {
        expect(task.createdBy._id).toBe(regularUser._id.toString());
      });
    });

    it('should search tasks by title or description', async () => {
      const res = await api
        .get('/api/v1/admin/tasks?search=Test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/admin/tasks/:id', () => {
    it('should delete any task as admin', async () => {
      
      const taskToDelete = await Task.create({
        title: 'Task to Delete',
        description: 'This will be deleted',
        status: 'todo',
        priority: 'low',
        createdBy: regularUser._id,
      });

      const res = await api
        .delete(`/api/v1/admin/tasks/${taskToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      const deletedTask = await Task.findById(taskToDelete._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await api
        .delete(`/api/v1/admin/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/admin/users/:id', () => {
    it('should delete user and associated data', async () => {
      const userToDelete = await User.create({
        email: `delete-${Date.now()}@test.com`,
        password: await bcrypt.hash('Test@123', 12),
        fullName: { firstName: 'Delete', lastName: 'Me' },
        username: `deleteuser${Date.now()}`,
        role: 'user',
        isVerified: true,
        provider: 'email',
      });

      const taskForDeletedUser = await Task.create({
        title: 'Task of deleted user',
        description: 'Will be deleted with user',
        status: 'todo',
        priority: 'low',
        createdBy: userToDelete._id,
      });

      const res = await api
        .delete(`/api/v1/admin/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
      
      const orphanedTask = await Task.findById(taskForDeletedUser._id);
      expect(orphanedTask).toBeNull();
    });

    it('should not allow admin to delete themselves', async () => {
      const res = await api
        .delete(`/api/v1/admin/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('cannot delete your own');
    });
  });

  describe('POST /api/v1/admin/users/bulk-delete', () => {
    it('should bulk delete multiple users', async () => {
      const user1 = await User.create({
        email: `bulk1-${Date.now()}@test.com`,
        password: await bcrypt.hash('Test@123', 12),
        fullName: { firstName: 'Bulk', lastName: 'One' },
        username: `bulk1${Date.now()}`,
        role: 'user',
        isVerified: true,
        provider: 'email',
      });

      const user2 = await User.create({
        email: `bulk2-${Date.now()}@test.com`,
        password: await bcrypt.hash('Test@123', 12),
        fullName: { firstName: 'Bulk', lastName: 'Two' },
        username: `bulk2${Date.now()}`,
        role: 'user',
        isVerified: true,
        provider: 'email',
      });

      const userIds = [user1._id.toString(), user2._id.toString()];

      const res = await api
        .post('/api/v1/admin/users/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userIds });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deletedCount).toBe(2);
    });

    it('should reject bulk delete including admin self', async () => {
      const res = await api
        .post('/api/v1/admin/users/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userIds: [adminUser._id.toString()] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('cannot delete your own');
    });

    it('should reject invalid userIds array', async () => {
      const res = await api
        .post('/api/v1/admin/users/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userIds: [] });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/admin/tasks/bulk-delete', () => {
    it('should bulk delete multiple tasks', async () => {
      const task1 = await Task.create({
        title: 'Bulk Task 1',
        description: 'Will be bulk deleted',
        status: 'todo',
        priority: 'low',
        createdBy: regularUser._id,
      });

      const task2 = await Task.create({
        title: 'Bulk Task 2',
        description: 'Will be bulk deleted',
        status: 'todo',
        priority: 'low',
        createdBy: regularUser._id,
      });

      const taskIds = [task1._id.toString(), task2._id.toString()];

      const res = await api
        .post('/api/v1/admin/tasks/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ taskIds });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deletedCount).toBe(2);
    });

    it('should reject invalid taskIds array', async () => {
      const res = await api
        .post('/api/v1/admin/tasks/bulk-delete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ taskIds: [] });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Admin access to regular task endpoints', () => {
    it('should allow admin to view all tasks through /api/v1/tasks', async () => {
      const res = await api
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks.length).toBeGreaterThan(0);
    });

    it('should allow admin to view any user task', async () => {
      const res = await api
        .get(`/api/v1/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task._id).toBe(testTask._id.toString());
    });

    it('should allow admin to update any user task', async () => {
      const res = await api
        .patch(`/api/v1/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated by Admin' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe('Updated by Admin');
    });

    it('should allow admin to delete any user task', async () => {
      const taskToDelete = await Task.create({
        title: 'Task to be deleted by admin',
        description: 'Test',
        status: 'todo',
        priority: 'low',
        createdBy: regularUser._id,
      });

      const res = await api
        .delete(`/api/v1/tasks/${taskToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
