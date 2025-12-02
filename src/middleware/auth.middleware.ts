import jwt from 'jsonwebtoken';
import config from '../config/env';
import { errorResponse } from '../utils/response-object';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticateMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, null, 'Access token required');
  }

  jwt.verify(token, config.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return errorResponse(res, null, 'Invalid or expired token');
    }
    req.user = user;
    next();
  });
};
