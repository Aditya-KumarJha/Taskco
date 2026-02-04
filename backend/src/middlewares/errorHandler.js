import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.entries(err.errors).map(([k, v]) => ({
      field: k,
      message: v.message,
    }));
  }

  if (err.code === 11000) {
    statusCode = 409;
    const key = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${key} already exists`;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID or parameter';
  }

  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  } else {
    logger.warn(`${statusCode} ${message}`);
  }

  const response = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Not found: ${req.originalUrl}`));
};

export default errorHandler;
