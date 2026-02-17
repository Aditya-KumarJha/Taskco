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

router.get('/', getNotifications);

router.patch('/read-all', markAllAsRead);

router.patch('/:id/read', markAsRead);

router.delete('/:id', deleteNotification);

export default router;
