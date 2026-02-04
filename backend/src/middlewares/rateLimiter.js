import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60 * 1000; 
const maxGeneral = process.env.NODE_ENV === 'production' ? 100 : 1000;
const maxAuth = 10;

export const generalLimiter = rateLimit({
  windowMs,
  max: maxGeneral,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs,
  max: maxAuth,
  message: {
    success: false,
    message: 'Too many login/signup attempts. Try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default generalLimiter;
