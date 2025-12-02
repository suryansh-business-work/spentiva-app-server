import { Response } from 'express';
import UsageService from './usage.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';

/**
 * Usage Controllers - Request handlers using response-object.ts
 */

/**
 * Get overall usage statistics for a user
 */
export const getOverallUsageController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    const response = await UsageService.getOverallUsage(userId);

    console.log('[Overall Usage] Response:', {
      totalMessages: response.overall.totalMessages,
      trackersCount: response.byTracker.length,
      deletedTrackers: response.byTracker.filter(t => t.isDeleted).length,
    });

    return successResponse(res, response, 'Overall usage statistics retrieved successfully');
  } catch (error: any) {
    console.error('[Overall Usage] Error:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get usage statistics for a specific tracker
 */
export const getTrackerUsageController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { trackerId } = req.params;

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    const response = await UsageService.getTrackerUsage(userId, trackerId);

    console.log('[Tracker Usage] Response:', {
      trackerId,
      totalMessages: response.usage.totalMessages,
      isDeleted: response.tracker.isDeleted,
      messagesCount: response.messages.length,
    });

    return successResponse(res, response, 'Tracker usage statistics retrieved successfully');
  } catch (error: any) {
    console.error('[Tracker Usage] Error:', error);
    if (error.message === 'Tracker not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get logs for a specific tracker
 */
export const getTrackerLogsController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { trackerId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    const response = await UsageService.getTrackerLogs(
      userId,
      trackerId,
      Number(limit),
      Number(offset)
    );

    console.log('[Tracker Logs] Response:', {
      trackerId,
      totalCount: response.totalCount,
      returnedCount: response.logs.length,
      hasMore: response.hasMore,
    });

    return successResponse(res, response, 'Tracker logs retrieved successfully');
  } catch (error: any) {
    console.error('[Tracker Logs] Error:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};
