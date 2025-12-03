import { Response } from 'express';
import AnalyticsService from './analytics.services';
import { successResponse, errorResponse } from '../../utils/response-object';
import { AnalyticsQueryDto, DateFilter } from './analytics.validators';
import { plainToInstance } from 'class-transformer';

/**
 * Analytics Controllers - Request handlers using response-object.ts
 */

/**
 * Get summary statistics
 */
export const getSummaryController = async (req: any, res: Response) => {
  try {
    const queryDto = plainToInstance(AnalyticsQueryDto, req.query as any);
    const stats = await AnalyticsService.getSummaryStats(queryDto);

    return successResponse(
      res,
      {
        stats,
        filter: queryDto.filter || DateFilter.THIS_MONTH, // Default used in service
        trackerId: queryDto.trackerId, // Include trackerId in response for debugging
      },
      'Summary statistics retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching summary:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get expenses by category
 */
export const getByCategoryController = async (req: any, res: Response) => {
  try {
    const queryDto = plainToInstance(AnalyticsQueryDto, req.query as any);
    const data = await AnalyticsService.getExpensesByCategory(queryDto);

    return successResponse(
      res,
      { data, filter: queryDto.filter || DateFilter.THIS_MONTH },
      'Category analytics retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching category analytics:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get expenses by month
 */
export const getByMonthController = async (req: any, res: Response) => {
  try {
    const queryDto = plainToInstance(AnalyticsQueryDto, req.query as any);
    const data = await AnalyticsService.getExpensesByMonth(queryDto);

    return successResponse(
      res,
      { data, year: queryDto.year || new Date().getFullYear() },
      'Monthly analytics retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching monthly analytics:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get expenses by payment method (source)
 */
export const getByExpenseFromController = async (req: any, res: Response) => {
  try {
    const queryDto = plainToInstance(AnalyticsQueryDto, req.query as any);
    const data = await AnalyticsService.getExpensesBySource(queryDto);

    return successResponse(
      res,
      { data, filter: queryDto.filter || DateFilter.THIS_MONTH },
      'Source analytics retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching source analytics:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get total expenses
 */
export const getTotalController = async (req: any, res: Response) => {
  try {
    const queryDto = plainToInstance(AnalyticsQueryDto, req.query as any);
    const total = await AnalyticsService.getTotalExpenses(queryDto);

    return successResponse(res, { total }, 'Total expenses retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching total:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};
