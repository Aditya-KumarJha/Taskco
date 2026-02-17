import { body, param, query } from 'express-validator';

export const getUsersValidation = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('limit 1-100'),
  query('role').optional().isIn(['user', 'admin']).withMessage('Invalid role'),
  query('isVerified').optional().isBoolean().withMessage('isVerified must be boolean'),
  query('provider').optional().isIn(['email', 'google', 'github']).withMessage('Invalid provider'),
  query('search').optional().isString().trim(),
];

export const getUserByIdValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const deleteUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const updateUserRoleValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['user', 'admin'])
    .withMessage('Role must be "user" or "admin"'),
];

export const toggleUserVerificationValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const bulkDeleteUsersValidation = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be a non-empty array'),
  body('userIds.*').isMongoId().withMessage('Each userId must be a valid MongoDB ID'),
];

export const getTasksValidation = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('limit 1-100'),
  query('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Invalid status'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  query('userId').optional().isMongoId().withMessage('Invalid user ID'),
  query('search').optional().isString().trim(),
  query('sort').optional().isString().trim(),
];

export const deleteTaskValidation = [
  param('id').isMongoId().withMessage('Invalid task ID'),
];

export const bulkDeleteTasksValidation = [
  body('taskIds')
    .isArray({ min: 1 })
    .withMessage('taskIds must be a non-empty array'),
  body('taskIds.*').isMongoId().withMessage('Each taskId must be a valid MongoDB ID'),
];
