import { body, validationResult } from 'express-validator';

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors.array().map((e) => ({ field: e.path || e.param, message: e.msg }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors: extracted });
  }
  next();
};

export const registerUserValidations = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('fullName')
    .optional()
    .custom((value) => {
      if (value == null) return true;
      if (typeof value !== 'object') throw new Error('fullName must be an object');
      if (value.firstName !== undefined && (typeof value.firstName !== 'string' || !value.firstName.trim())) {
        throw new Error('firstName must be a non-empty string');
      }
      if (value.lastName !== undefined && (typeof value.lastName !== 'string' || !value.lastName.trim())) {
        throw new Error('lastName must be a non-empty string');
      }
      return true;
    }),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim(),
  body('provider')
    .optional()
    .isIn(['email', 'google', 'github'])
    .withMessage("Provider must be 'email', 'google', or 'github'"),
  (req, res, next) => {
    if (req.body.provider === 'email' && !req.body.password) {
      return res.status(400).json({ success: false, message: 'Password is required for email registration', errors: [] });
    }
    respondWithValidationErrors(req, res, next);
  },
];

export const verifyOTPValidations = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('otp')
    .isString()
    .withMessage('OTP must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 characters')
    .trim(),
  respondWithValidationErrors,
];

export const resendOTPValidations = [
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim(),
  (req, res, next) => {
    if (!req.body.email && !req.body.username) {
      return res.status(400).json({ success: false, message: 'Either email or username is required', errors: [] });
    }
    respondWithValidationErrors(req, res, next);
  },
];

export const loginUserValidations = [
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    if (!req.body.email && !req.body.username) {
      return res.status(400).json({ success: false, message: 'Either email or username is required', errors: [] });
    }
    respondWithValidationErrors(req, res, next);
  },
];

export const verifyLoginOTPValidations = [
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim(),
  body('otp')
    .isString()
    .withMessage('OTP must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 characters')
    .trim(),
  (req, res, next) => {
    if (!req.body.email && !req.body.username) {
      return res.status(400).json({ success: false, message: 'Either email or username is required', errors: [] });
    }
    respondWithValidationErrors(req, res, next);
  },
];

export const forgotPasswordValidations = [
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim(),
  (req, res, next) => {
    if (!req.body.email && !req.body.username) {
      return res.status(400).json({ success: false, message: 'Either email or username is required', errors: [] });
    }
    respondWithValidationErrors(req, res, next);
  },
];

export const verifyForgotPasswordOTPValidations = [
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim(),
  body('otp')
    .isString()
    .withMessage('OTP must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 characters')
    .trim(),
  (req, res, next) => {
    if (!req.body.email && !req.body.username) {
      return res.status(400).json({ success: false, message: 'Either email or username is required', errors: [] });
    }
    respondWithValidationErrors(req, res, next);
  },
];

export const resetPasswordValidations = [
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim(),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
  (req, res, next) => {
    if (!req.body.email && !req.body.username) {
      return res.status(400).json({ success: false, message: 'Either email or username is required', errors: [] });
    }
    respondWithValidationErrors(req, res, next);
  },
];
