import { body, param, query } from 'express-validator';

const statusEnum = ['todo', 'in_progress', 'done'];
const priorityEnum = ['low', 'medium', 'high'];

export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title max 200 characters'),
  body('description')
    .trim()
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description max 2000 characters'),
  body('status').optional().isIn(statusEnum).withMessage(`Status must be one of: ${statusEnum.join(', ')}`),
  body('priority').optional().isIn(priorityEnum).withMessage(`Priority must be one of: ${priorityEnum.join(', ')}`),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be valid ISO date'),
  body('imageUrl').optional().isURL().withMessage('imageUrl must be valid URL'),
];

export const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title')
    .trim()
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title max 200 characters'),
  body('description')
    .trim()
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description max 2000 characters'),
  body('status').optional().isIn(statusEnum).withMessage(`Status must be one of: ${statusEnum.join(', ')}`),
  body('priority').optional().isIn(priorityEnum).withMessage(`Priority must be one of: ${priorityEnum.join(', ')}`),
  body('dueDate').optional({ values: 'null' }).isISO8601().withMessage('dueDate must be valid ISO date'),
  body('imageUrl').optional({ values: 'null' }).isURL().withMessage('imageUrl must be valid URL'),
];

export const getTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
];

export const listTasksValidation = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('limit 1-100'),
  query('search').trim().optional(),
  query('status').optional().isIn(statusEnum).withMessage(`status must be one of: ${statusEnum.join(', ')}`),
  query('priority').optional().isIn(priorityEnum).withMessage(`priority must be one of: ${priorityEnum.join(', ')}`),
  query('sort').optional().isIn(['createdAt', 'dueDate', 'title', 'status']).withMessage('Invalid sort field'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
];

export const deleteTaskValidation = [param('id').isMongoId().withMessage('Invalid task ID')];

export default {
  createTaskValidation,
  updateTaskValidation,
  getTaskValidation,
  listTasksValidation,
  deleteTaskValidation,
};
