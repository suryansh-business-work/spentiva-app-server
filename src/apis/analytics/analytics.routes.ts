import express from 'express';
import {
  getSummaryController,
  getByCategoryController,
  getByMonthController,
  getTotalController,
} from './analytics.controllers';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * Analytics Routes
 */

// GET /api/analytics/summary - Get summary statistics
router.get('/summary', getSummaryController);

// GET /api/analytics/by-category - Get expenses grouped by category
router.get('/by-category', getByCategoryController);

// GET /api/analytics/by-month - Get expenses grouped by month
router.get('/by-month', getByMonthController);

// GET /api/analytics/total - Get total expenses
router.get('/total', getTotalController);

export default router;
