import express from 'express';
import {
  getAllTrackersController,
  createTrackerController,
  getTrackerByIdController,
  updateTrackerController,
  deleteTrackerController,
} from './tracker.controllers';
import { authenticateMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * Tracker Routes
 * All routes require authentication
 */

// Get all trackers for authenticated user
router.get('/all', authenticateMiddleware, getAllTrackersController);

// Create a new tracker
router.post('/create', authenticateMiddleware, createTrackerController);

// Get a single tracker by ID
router.get('/get/:id', authenticateMiddleware, getTrackerByIdController);

// Update a tracker
router.put('/update/:id', authenticateMiddleware, updateTrackerController);

// Delete a tracker
router.delete('/delete/:id', authenticateMiddleware, deleteTrackerController);

export default router;
