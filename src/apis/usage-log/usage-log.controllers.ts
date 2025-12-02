import { Response } from 'express';
import UsageLogService from './usage-log.services';
import { successResponse, errorResponse, badRequestResponse } from '../../utils/response-object';

/**
 * UsageLog Controllers - Request handlers using response-object.ts
 */

/**
 * Get all usage logs with optional filtering
 */
export const getAllLogsController = async (req: any, res: Response) => {
  try {
    const { trackerId, limit } = req.query;
    const userId = req.user?.userId;

    const logs = await UsageLogService.getAllLogs({
      userId,
      trackerId: trackerId as string,
      limit: limit ? parseInt(limit as string) : undefined
    });

    return successResponse(res, { logs }, 'Usage logs retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching usage logs:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Create a new usage log
 */
export const createLogController = async (req: any, res: Response) => {
  try {
    const { trackerSnapshot, messageRole, messageContent, tokenCount, timestamp } = req.body;
    const userId = req.user?.userId;

    const log = await UsageLogService.createLog({
      userId,
      trackerSnapshot,
      messageRole,
      messageContent,
      tokenCount,
      timestamp
    });

    res.status(201).json({
      message: 'Usage log created successfully',
      data: { log },
      status: 'success',
      statusCode: 201
    });
    return;
  } catch (error: any) {
    console.error('Error creating usage log:', error);
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
    const { daysOld = 90 } = req.query;

    const result = await UsageLogService.deleteOldLogs(Number(daysOld));

    return successResponse(res, result, result.message);
  } catch (error: any) {
    console.error('Error deleting old logs:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};
