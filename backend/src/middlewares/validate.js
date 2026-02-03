import { validationResult } from 'express-validator';
import { UnprocessableEntity } from '../utils/ApiError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const extracted = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
  }));
  next(UnprocessableEntity('Validation failed', extracted));
};

export default validate;
