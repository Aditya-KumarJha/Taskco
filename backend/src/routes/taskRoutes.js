import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.js';
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

router.use(protect);

router.get('/', listTasksValidation, validate, taskController.listTasks);
router.post('/', createTaskValidation, validate, taskController.createTask);
router.post('/upload', singleImage, taskController.uploadTaskImage);
router.post('/upload-base64', taskController.uploadTaskImageBase64);

router.get('/:id', getTaskValidation, validate, taskController.getTask);
router.put('/:id', updateTaskValidation, validate, taskController.updateTask);
router.delete('/:id', deleteTaskValidation, validate, taskController.deleteTask);

export default router;
