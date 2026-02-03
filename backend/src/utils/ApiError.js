export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const BadRequest = (message = 'Bad request', errors = null) =>
  new ApiError(400, message, errors);
export const Unauthorized = (message = 'Unauthorized') => new ApiError(401, message);
export const Forbidden = (message = 'Forbidden') => new ApiError(403, message);
export const NotFound = (message = 'Resource not found') => new ApiError(404, message);
export const Conflict = (message = 'Conflict') => new ApiError(409, message);
export const UnprocessableEntity = (message = 'Unprocessable entity', errors = null) =>
  new ApiError(422, message, errors);

export default ApiError;
