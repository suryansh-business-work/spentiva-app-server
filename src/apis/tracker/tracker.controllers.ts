import { Response } from 'express';
import TrackerService from './tracker.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';

/**
 * Tracker Controllers - Request handlers using response-object.ts
 */

/**
 * Get all trackers for the authenticated user
 */
export const getAllTrackersController = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const trackers = await TrackerService.getAllTrackers(userId);

    return successResponse(res, { trackers }, 'Trackers retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Create a new tracker
 */
export const createTrackerController = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { name, type, description, currency } = req.body;

    const tracker = await TrackerService.createTracker(userId, {
      name,
      type,
      description,
      currency,
    });

    return successResponse(
      res,
      {
        tracker: {
          id: tracker.id,
          name: tracker.name,
          type: tracker.type,
          description: tracker.description,
          currency: tracker.currency,
          createdAt: tracker.createdAt,
        },
      },
      'Tracker created successfully'
    );
  } catch (error: any) {
    if (error.message.includes('Missing required fields')) {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get a single tracker by ID
 */
export const getTrackerByIdController = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const tracker = await TrackerService.getTrackerById(userId, id);

    return successResponse(res, { tracker }, 'Tracker retrieved successfully');
  } catch (error: any) {
    if (error.message === 'Tracker not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Update a tracker
 */
export const updateTrackerController = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, type, description, currency } = req.body;

    const tracker = await TrackerService.updateTracker(userId, id, {
      name,
      type,
      description,
      currency,
    });

    return successResponse(res, { tracker }, 'Tracker updated successfully');
  } catch (error: any) {
    if (error.message === 'Tracker not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Delete a tracker
 */
export const deleteTrackerController = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await TrackerService.deleteTracker(userId, id);

    return successResponse(res, result, result.message);
  } catch (error: any) {
    if (error.message === 'Tracker not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};
