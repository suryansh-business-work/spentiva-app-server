import { Router } from 'express';
import { AdminController } from './admin.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';
import { requireAdminMiddleware } from '../../middleware/admin.middleware';

const router = Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateMiddleware);
router.use(requireAdminMiddleware);

/**
 * @route GET /v1/api/admin/stats
 * @desc Get user statistics with optional filters
 * @access Admin only
 */
router.get('/stats', AdminController.getUsersStatistics);

/**
 * @route GET /v1/api/admin/users
 * @desc Get all users with pagination
 * @access Admin only
 */
router.get('/users', AdminController.getAllUsers);

/**
 * @route GET /v1/api/admin/users/:userId
 * @desc Get specific user by ID
 * @access Admin only
 */
router.get('/users/:userId', AdminController.getUserById);

/**
 * @route PUT /v1/api/admin/users/:userId
 * @desc Update user role or account type
 * @access Admin only
 */
router.put('/users/:userId', AdminController.updateUser);

/**
 * @route DELETE /v1/api/admin/users/:userId
 * @desc Delete user
 * @access Admin only
 */
router.delete('/users/:userId', AdminController.deleteUser);

export default router;
