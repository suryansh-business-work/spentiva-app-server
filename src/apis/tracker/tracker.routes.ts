import express from 'express';
import {
  getAllTrackersController,
  createTrackerController,
  getTrackerByIdController,
  updateTrackerController,
  deleteTrackerController,
} from './tracker.controllers';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * Tracker Routes
 * All routes require authentication
 */

// Get all trackers for authenticated user
router.get('/trackers', authenticateToken, getAllTrackersController);

// Create a new tracker
router.post('/create/tracker', authenticateToken, createTrackerController);

// Get a single tracker by ID
router.get('/get/tracker/:id', authenticateToken, getTrackerByIdController);

// Update a tracker
router.put('/update/tracker/:id', authenticateToken, updateTrackerController);

// Delete a tracker
router.delete('/delete/tracker/:id', authenticateToken, deleteTrackerController);

export default router;
