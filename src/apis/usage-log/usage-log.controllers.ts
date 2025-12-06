import { Response } from 'express';
import UsageLogService from './usage-log.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';
import { plainToInstance } from 'class-transformer';
import {
  GetUsageLogsQueryDto,
  CreateUsageLogDto,
  DeleteOldLogsQueryDto,
} from './usage-log.validators';

/**
 * UsageLog Controllers - Request handlers using response-object.ts
 */

/**
 * Get all usage logs with optional filtering
 */
export const getAllLogsController = async (req: any, res: Response) => {
  try {
    const queryDto = plainToInstance(GetUsageLogsQueryDto, req.query);
    const userId = req.user?.userId;

    const logs = await UsageLogService.getAllLogs({
      userId,
      trackerId: queryDto.trackerId,
      limit: queryDto.limit,
    });

    return successResponse(res, { logs }, 'Usage logs retrieved successfully');
  } catch (error: any) {
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Create a new usage log
 */
export const createLogController = async (req: any, res: Response) => {
  try {
    const createDto = plainToInstance(CreateUsageLogDto, req.body);
    const userId = req.user?.userId;

    const log = await UsageLogService.createLog({
      userId,
      trackerSnapshot: createDto.trackerSnapshot,
      messageRole: createDto.messageRole,
      messageContent: createDto.messageContent,
      tokenCount: createDto.tokenCount,
      timestamp: createDto.timestamp,
    });

    return successResponse(
      res,
      {
        log: {
          id: log._id,
          trackerSnapshot: log.trackerSnapshot,
          messageRole: log.messageRole,
          tokenCount: log.tokenCount,
          timestamp: log.timestamp,
        },
      },
      'Usage log created successfully'
    );
  } catch (error: any) {
    if (error.message.includes('Missing required fields')) {
      return badRequestResponse(res, null, error.message);
    }
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Delete old logs (maintenance endpoint)
 */
export const deleteOldLogsController = async (req: any, res: Response) => {
  try {
    const queryDto = plainToInstance(DeleteOldLogsQueryDto, req.query);
    const result = await UsageLogService.deleteOldLogs(queryDto.daysOld || 90);

    return successResponse(res, result, result.message);
  } catch (error: any) {
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Delete all logs for a specific tracker
 */
export const deleteLogsByTrackerController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { trackerId } = req.params;

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    if (!trackerId) {
      return badRequestResponse(res, null, 'Tracker ID is required');
    }

    const result = await UsageLogService.deleteLogsByTracker(userId, trackerId);

    return successResponse(res, result, result.message);
  } catch (error: any) {
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Delete ALL logs for the authenticated user
 */
export const deleteLogsByUserController = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return badRequestResponse(res, null, 'Unauthorized');
    }

    const result = await UsageLogService.deleteLogsByUser(userId);

    return successResponse(res, result, result.message);
  } catch (error: any) {
    return errorResponse(res, error, 'Internal server error');
  }
};
