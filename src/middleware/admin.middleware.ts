import { errorResponse, badRequestResponse } from '../utils/response-object';

/**
 * Admin Authorization Middleware
 * Requires user to have admin role
 * Must be used after authenticateMiddleware
 */
export const requireAdminMiddleware = (req: any, res: any, next: any) => {
  // req.user should be set by authenticateMiddleware
  if (!req.user) {
    return errorResponse(res, null, 'Authentication required');
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return badRequestResponse(res, null, 'Admin access required');
  }

  next();
};
