import ExpenseModel from '../expense/expense.models';
import { AnalyticsQueryDto, DateFilter } from './analytics.validators';

export class AnalyticsService {
  /**
   * Get date range based on filter
   */
  static getDateRange(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    const { filter, customStart, customEnd } = query;
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (filter) {
      case DateFilter.TODAY:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case DateFilter.YESTERDAY:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case DateFilter.LAST_7_DAYS:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case DateFilter.THIS_MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case DateFilter.LAST_MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case DateFilter.THIS_YEAR:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case DateFilter.CUSTOM:
        if (customStart && customEnd) {
          startDate = new Date(customStart);
          endDate = new Date(customEnd);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        break;
      default:
        // Default to all time (or a reasonable default like this month if preferred, but 'all' usually implies no start limit)
        // However, for performance, let's default to this month if no filter is provided, or handle 'all' explicitly.
        // Based on previous code, default was this month.
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  }

  /**
   * Build match query from DTO and date range
   */
  private static buildMatchQuery(
    queryDto: AnalyticsQueryDto,
    dateRange: { startDate: Date; endDate: Date }
  ) {
    const matchQuery: any = {
      timestamp: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    };

    if (queryDto.trackerId) {
      matchQuery.trackerId = queryDto.trackerId;
    } else {
      console.log('[Analytics] No trackerId provided, returning all trackers');
    }

    if (queryDto.categoryId) {
      matchQuery.categoryId = queryDto.categoryId;
    }

    console.log('[Analytics] Final match query:', matchQuery);
    return matchQuery;
  }

  /**
   * Get summary statistics
   */
  static async getSummaryStats(queryDto: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(queryDto);
    const matchQuery = this.buildMatchQuery(queryDto, dateRange);

    const stats = await ExpenseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageExpense: { $avg: '$amount' },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalExpenses: 0,
        transactionCount: 0,
        averageExpense: 0,
      };
    }

    return stats[0];
  }

  /**
   * Get expenses grouped by category
   */
  static async getExpensesByCategory(queryDto: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(queryDto);
    const matchQuery = this.buildMatchQuery(queryDto, dateRange);

    const categoryData = await ExpenseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    return categoryData;
  }

  /**
   * Get expenses grouped by month
   */
  static async getExpensesByMonth(queryDto: AnalyticsQueryDto) {
    const targetYear = queryDto.year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const matchQuery: any = {
      timestamp: { $gte: startDate, $lte: endDate },
    };

    if (queryDto.trackerId) {
      matchQuery.trackerId = queryDto.trackerId;
    }

    const monthlyData = await ExpenseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $month: '$timestamp' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          total: 1,
          count: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    return monthlyData;
  }

  /**
   * Get expenses grouped by payment method (source)
   */
  static async getExpensesBySource(queryDto: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(queryDto);
    const matchQuery = this.buildMatchQuery(queryDto, dateRange);

    const sourceData = await ExpenseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          paymentMethod: '$_id',
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    return sourceData;
  }

  /**
   * Get total expenses for a period
   */
  static async getTotalExpenses(queryDto: AnalyticsQueryDto) {
    // For total, we might want all time if no filter is specified,
    // but consistent behavior with other endpoints is safer.
    // If specific behavior is needed for 'total' endpoint, we can adjust.
    // For now, using the same date range logic.

    // Override filter to 'all' if not provided for total?
    // The previous implementation used 0 to now.
    // Let's respect the filter if provided, otherwise default to all time for this specific method if that was the intent.
    // But the previous code: startDate: new Date(0), endDate: new Date()

    let startDate = new Date(0);
    let endDate = new Date();

    if (queryDto.filter) {
      const range = this.getDateRange(queryDto);
      startDate = range.startDate;
      endDate = range.endDate;
    }

    const matchQuery: any = {
      timestamp: { $gte: startDate, $lte: endDate },
    };

    if (queryDto.trackerId) {
      matchQuery.trackerId = queryDto.trackerId;
    }

    const result = await ExpenseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }
}

export default AnalyticsService;
