import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { successResponse, errorResponse, noContentResponse } from '../../utils/response-object';
import { logger } from '../../utils/logger';

/**
 * Health check controller
 * Checks system health including database connectivity
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      checks: {
        database: 'unknown',
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        },
      },
    };

    // Check database connection
    try {
      const dbState = mongoose.connection.readyState;
      healthData.checks.database =
        dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
    } catch (dbError) {
      logger.error('Database health check failed', { error: dbError });
      healthData.checks.database = 'error';
    }

    // If database is not connected, return error status
    if (healthData.checks.database !== 'connected') {
      healthData.status = 'degraded';
      logger.warn('Health check - degraded status', healthData);
      return noContentResponse(
        res,
        { ...healthData, message: 'Service degraded - database not connected' },
        'Service degraded - database not connected'
      );
    }

    logger.info('Health check - ok', healthData);
    return successResponse(res, healthData, 'Service is healthy');
  } catch (error) {
    logger.error('Health check failed', { error });
    return errorResponse(res, error, 'Health check failed');
  }
};

/**
 * Simple ping endpoint
 * Quick response without database check
 */
export const ping = (req: Request, res: Response) => {
  return successResponse(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    'pong'
  );
};
