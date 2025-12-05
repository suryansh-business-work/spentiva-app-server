import { Response } from 'express';
import UsageService from './usage.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from './usage.validators';

/**
 * Usage Controllers - Request handlers using response-object.ts
 */

/**
 * Get overall usage overview for a user
 */
export const getOverviewController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    const response = await UsageService.getOverallUsage(userId);

    return successResponse(res, response, 'Usage overview retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get overall usage graphs for a user
 */
export const getOverallGraphsController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    const response = await UsageService.getOverallGraphs(userId);

    return successResponse(res, response, 'Usage graphs retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get usage statistics for a specific tracker
 */
export const getTrackerStatsController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { trackerId } = req.params;

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    const response = await UsageService.getTrackerUsage(userId, trackerId);

    return successResponse(res, response, 'Tracker statistics retrieved successfully');
  } catch (error: any) {
    if (error.message === 'Tracker not found') {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get usage graphs for a specific tracker
 */
export const getTrackerGraphsController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { trackerId } = req.params;

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    const response = await UsageService.getTrackerGraphs(userId, trackerId);

    return successResponse(res, response, 'Tracker graphs retrieved successfully');
  } catch (error: any) {
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
    const queryDto = plainToInstance(PaginationQueryDto, req.query);

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    const response = await UsageService.getTrackerLogs(
      userId,
      trackerId,
      queryDto.limit || 100,
      queryDto.offset || 0
    );

    return successResponse(res, response, 'Tracker logs retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error, 'Internal server error');
  }
};
