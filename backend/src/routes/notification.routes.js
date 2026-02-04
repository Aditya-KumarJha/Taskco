import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';

const router = Router();

router.use(authMiddleware);

// Protected: Get user notifications
router.get('/', getNotifications);

// Protected: Mark all notifications as read (must be before /:id/read)
router.patch('/read-all', markAllAsRead);

// Protected: Mark notification as read
router.patch('/:id/read', markAsRead);

// Protected: Delete notification
router.delete('/:id', deleteNotification);

export default router;
