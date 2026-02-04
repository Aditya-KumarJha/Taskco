import { Router } from 'express';
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { singleImage } from '../middlewares/upload.js';
import {
  createTaskValidation,
  updateTaskValidation,
  getTaskValidation,
  listTasksValidation,
  deleteTaskValidation,
} from '../validations/taskValidation.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listTasksValidation, validate, listTasks);
router.post('/', singleImage, createTaskValidation, validate, createTask);

router.get('/:id', getTaskValidation, validate, getTask);
router.patch('/:id', singleImage, updateTaskValidation, validate, updateTask);
router.delete('/:id', deleteTaskValidation, validate, deleteTask);

export default router;
