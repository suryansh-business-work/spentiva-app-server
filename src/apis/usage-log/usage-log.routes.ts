import express from 'express';
import {
  getAllLogsController,
  createLogController,
  deleteOldLogsController,
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

export default router;
