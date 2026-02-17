import { Router } from 'express';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  getAllUsers,
  getUserById,
  getAllTasks,
  deleteUser,
  deleteTask,
  updateUserRole,
  getAdminStats,
  toggleUserVerification,
  bulkDeleteUsers,
  bulkDeleteTasks,
} from '../controllers/admin.controller.js';
import {
  getUsersValidation,
  getUserByIdValidation,
  deleteUserValidation,
  updateUserRoleValidation,
  toggleUserVerificationValidation,
  bulkDeleteUsersValidation,
  getTasksValidation,
  deleteTaskValidation,
  bulkDeleteTasksValidation,
} from '../validations/admin.validator.js';

const router = Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', getAdminStats);

router.get('/users', getUsersValidation, validate, getAllUsers);
router.get('/users/:id', getUserByIdValidation, validate, getUserById);
router.delete('/users/:id', deleteUserValidation, validate, deleteUser);
router.patch('/users/:id/role', updateUserRoleValidation, validate, updateUserRole);
router.patch('/users/:id/verification', toggleUserVerificationValidation, validate, toggleUserVerification);
router.post('/users/bulk-delete', bulkDeleteUsersValidation, validate, bulkDeleteUsers);

router.get('/tasks', getTasksValidation, validate, getAllTasks);
router.delete('/tasks/:id', deleteTaskValidation, validate, deleteTask);
router.post('/tasks/bulk-delete', bulkDeleteTasksValidation, validate, bulkDeleteTasks);

export default router;
