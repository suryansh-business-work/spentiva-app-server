import { Response } from 'express';
import AnalyticsService from './analytics.services';
import { successResponse, errorResponse } from '../../utils/response-object';

/**
 * Analytics Controllers - Request handlers using response-object.ts
 */

/**
 * Get summary statistics
 */
export const getSummaryController = async (req: any, res: Response) => {
  try {
    const { filter, customStart, customEnd, categoryId, trackerId } = req.query;

    let dateRange = { startDate: new Date(0), endDate: new Date() };

    if (filter) {
      dateRange = AnalyticsService.getDateRange(
        filter as string,
        customStart as string,
        customEnd as string
      );
    }

    const query: any = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (trackerId) {
      query.trackerId = trackerId;
    }

    const stats = await AnalyticsService.getSummaryStats(query);

    return successResponse(
      res,
      {
        stats,
        filter: filter || 'all',
        dateRange
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
    const { filter, customStart, customEnd, trackerId } = req.query;

    let dateRange = { startDate: new Date(0), endDate: new Date() };

    if (filter) {
      dateRange = AnalyticsService.getDateRange(
        filter as string,
        customStart as string,
        customEnd as string
      );
    }

    const query: any = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    if (trackerId) {
      query.trackerId = trackerId;
    }

    const data = await AnalyticsService.getExpensesByCategory(query);

    return successResponse(
      res,
      { data, filter: filter || 'all', dateRange },
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
    const { year, trackerId } = req.query;
    const targetYear = year ? parseInt(year as string) : undefined;

    const data = await AnalyticsService.getExpensesByMonth(targetYear, trackerId as string | undefined);

    return successResponse(
      res,
      { data, year: targetYear || new Date().getFullYear() },
      'Monthly analytics retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error fetching monthly analytics:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};

/**
 * Get total expenses
 */
export const getTotalController = async (req: any, res: Response) => {
  try {
    const { trackerId } = req.query;
    const query: any = {
      startDate: new Date(0),
      endDate: new Date()
    };

    if (trackerId) {
      query.trackerId = trackerId;
    }

    const total = await AnalyticsService.getTotalExpenses(query);

    return successResponse(res, { total }, 'Total expenses retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching total:', error);
    return errorResponse(res, error, 'Internal server error');
  }
};
