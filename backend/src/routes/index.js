import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import taskRoutes from './task.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';
import sessionRoutes from './session.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/me', profileRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/sessions', sessionRoutes);

export default router;
