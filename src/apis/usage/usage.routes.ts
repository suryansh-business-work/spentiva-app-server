import express from 'express';
import {
  getOverviewController,
  getOverallGraphsController,
  getTrackerStatsController,
  getTrackerGraphsController,
  getTrackerLogsController,
} from './usage.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * Usage Routes
 */

// GET /api/usage/overview - Get overall usage overview for user
router.get('/overview', authenticateMiddleware, getOverviewController);

// GET /api/usage/graphs - Get overall usage graphs for user
router.get('/graphs', authenticateMiddleware, getOverallGraphsController);

// GET /api/usage/tracker/:trackerId/stats - Get usage statistics for a specific tracker
router.get('/tracker/:trackerId/stats', authenticateMiddleware, getTrackerStatsController);

// GET /api/usage/tracker/:trackerId/graphs - Get usage graphs for a specific tracker
router.get('/tracker/:trackerId/graphs', authenticateMiddleware, getTrackerGraphsController);

// GET /api/usage/tracker/:trackerId/logs - Get logs for a specific tracker
router.get('/tracker/:trackerId/logs', authenticateMiddleware, getTrackerLogsController);

export default router;
