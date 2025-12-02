import express from 'express';
import {
  getOverallUsageController,
  getTrackerUsageController,
  getTrackerLogsController,
} from './usage.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * Usage Routes
 */

// GET /api/usage/overall - Get overall usage statistics
router.get('/overall', authenticateMiddleware, getOverallUsageController);

// GET /api/usage/tracker/:trackerId - Get usage for a specific tracker
router.get('/tracker/:trackerId', authenticateMiddleware, getTrackerUsageController);

// GET /api/usage/tracker/:trackerId/logs - Get logs for a specific tracker
router.get('/tracker/:trackerId/logs', authenticateMiddleware, getTrackerLogsController);

export default router;
