import { body, validationResult } from 'express-validator';

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors.array().map((e) => ({ field: e.path || e.param, message: e.msg }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors: extracted });
  }
  next();
};

export const normalizeFullName = (req, res, next) => {
  if (req.body['fullName.firstName'] || req.body['fullName.lastName']) {
    req.body.fullName = {
      firstName: req.body['fullName.firstName'],
      lastName: req.body['fullName.lastName'],
    };
  }

  if (typeof req.body.fullName === 'string') {
    try {
      req.body.fullName = JSON.parse(req.body.fullName);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'fullName must be valid JSON object',
        errors: [],
      });
    }
  }

  next();
};

export const updateProfileValidation = [
  body('username')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  body('fullName')
    .optional()
    .isObject()
    .withMessage('fullName must be an object'),

  body('fullName.firstName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('firstName must be a non-empty string'),

  body('fullName.lastName')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('lastName must be a non-empty string'),

  body('currentPassword')
    .optional()
    .isString()
    .withMessage('Current password must be a string'),

  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain uppercase, lowercase, and number'),

  (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Both currentPassword and newPassword are required to change password',
        errors: [],
      });
    }

    respondWithValidationErrors(req, res, next);
  },
];

export default updateProfileValidation;
