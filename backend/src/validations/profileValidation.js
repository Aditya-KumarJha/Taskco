import { body } from 'express-validator';

export const updateProfileValidation = [
  body('name').trim().optional().isLength({ max: 100 }).withMessage('Name max 100 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
];

export default updateProfileValidation;
