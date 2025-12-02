import express from 'express';
import {
  getAllLogsController,
  createLogController,
  deleteOldLogsController,
} from './usage-log.controllers';
import { authenticateToken } from '../auth/auth.routes';

const router = express.Router();

/**
 * Usage Log Routes
 */

// GET /api/usage-logs - Get all usage logs with optional filtering
router.get('/', authenticateToken, getAllLogsController);

// POST /api/usage-logs - Create a new usage log
router.post('/', authenticateToken, createLogController);

// DELETE /api/usage-logs/cleanup - Delete old logs (maintenance)
router.delete('/cleanup', authenticateToken, deleteOldLogsController);

export default router;
