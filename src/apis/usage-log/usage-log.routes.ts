import express from 'express';
import {
  getAllLogsController,
  createLogController,
  deleteOldLogsController,
  deleteLogsByTrackerController,
  deleteLogsByUserController,
} from './usage-log.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * Usage Log Routes
 */

// GET /api/usage-logs - Get all usage logs with optional filtering
router.get('/', authenticateMiddleware, getAllLogsController);

// POST /api/usage-logs - Create a new usage log
router.post('/', authenticateMiddleware, createLogController);

// DELETE /api/usage-logs/cleanup - Delete old logs (maintenance)
router.delete('/cleanup', authenticateMiddleware, deleteOldLogsController);

// DELETE /api/usage-logs/tracker/:trackerId - Delete all logs for a specific tracker
router.delete('/tracker/:trackerId', authenticateMiddleware, deleteLogsByTrackerController);

// DELETE /api/usage-logs/user - Delete ALL logs for the authenticated user
router.delete('/user', authenticateMiddleware, deleteLogsByUserController);

export default router;
