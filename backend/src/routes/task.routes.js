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

// Protected: List tasks 
router.get('/', listTasksValidation, validate, listTasks);

// Protected: Create task
router.post('/', singleImage, createTaskValidation, validate, createTask);

// Protected: Get task by ID
router.get('/:id', getTaskValidation, validate, getTask);

// Protected: Update task by ID
router.patch('/:id', singleImage, updateTaskValidation, validate, updateTask);

// Protected: Delete task by ID
router.delete('/:id', deleteTaskValidation, validate, deleteTask);

export default router;
