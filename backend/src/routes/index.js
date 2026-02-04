import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import taskRoutes from './task.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/me', profileRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);

export default router;
