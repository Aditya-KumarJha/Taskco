import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import logger from '../utils/logger.js';

/**
 * Sanitization middleware to prevent XSS and NoSQL injection attacks
 */

/**
 * MongoDB NoSQL injection sanitization
 * Removes any keys that start with $ or contain .
 */
export const sanitizeMongo = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`MongoDB injection attempt detected: ${key} in ${req.path}`);
  },
});

/**
 * XSS sanitization for request body, query, and params
 * Cleans HTML/script tags from user input
 */
export const sanitizeXSS = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    logger.error(`XSS sanitization error: ${error.message}`);
    next();
  }
};

/**
 * Recursively sanitize an object's values
 */
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return xss(obj, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both key and value
      const cleanKey = xss(key, { whiteList: {} });
      sanitized[cleanKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Combined sanitization middleware (MongoDB + XSS)
 * Use this to apply all sanitization at once
 */
export const sanitize = [sanitizeMongo, sanitizeXSS];

/**
 * Sanitize HTML content but allow safe tags
 * Useful for rich text fields like descriptions, bio, etc.
 */
export const sanitizeHTML = (content) => {
  return xss(content, {
    whiteList: {
      p: [],
      br: [],
      strong: [],
      em: [],
      u: [],
      ul: ['class'],
      ol: ['class'],
      li: [],
      a: ['href', 'title', 'target'],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      blockquote: [],
      code: ['class'],
      pre: ['class'],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
};

/**
 * Sanitize specific fields in request body
 * @param {Array<string>} fields - Fields to sanitize
 */
export const sanitizeFields = (fields = []) => {
  return (req, res, next) => {
    try {
      if (req.body) {
        fields.forEach(field => {
          if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = xss(req.body[field], { whiteList: {} });
          }
        });
      }
      next();
    } catch (error) {
      logger.error(`Field sanitization error: ${error.message}`);
      next();
    }
  };
};

export default {
  sanitizeMongo,
  sanitizeXSS,
  sanitize,
  sanitizeHTML,
  sanitizeFields,
};
