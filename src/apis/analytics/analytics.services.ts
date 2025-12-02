import ExpenseModel from '../expense/expense.models';

export interface DateRangeQuery {
  startDate: Date;
  endDate: Date;
  categoryId?: string;
  trackerId?: string;
}

export class AnalyticsService {
  /**
   * Get date range based on filter
   */
  static getDateRange(filter: string, customStart?: string, customEnd?: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (filter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'yesterday':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (customStart && customEnd) {
          startDate = new Date(customStart);
          endDate = new Date(customEnd);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  }

  /**
   * Get summary statistics
   */
  static async getSummaryStats(query: DateRangeQuery) {
    const { startDate, endDate, categoryId, trackerId } = query;

    const matchQuery: any = {
      timestamp: { $gte: startDate, $lte: endDate }
    };

    if (categoryId) {
      matchQuery.categoryId = categoryId;
    }

    if (trackerId) {
      matchQuery.trackerId = trackerId;
    }

    const stats = await ExpenseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageExpense: { $avg: '$amount' }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalExpenses: 0,
        transactionCount: 0,
        averageExpense: 0
      };
    }

    return stats[0];
  }

  /**
   * Get expenses grouped by category
   */
  static async getExpensesByCategory(query: DateRangeQuery) {
    const { startDate, endDate, trackerId } = query;

    const matchQuery: any = {
      timestamp: { $gte: startDate, $lte: endDate }
    };

    if (trackerId) {
      matchQuery.trackerId = trackerId;
    }

    const categoryData = await ExpenseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    return categoryData;
  }

  /**
   * Get expenses grouped by month
   */
  static async getExpensesByMonth(year?: number, trackerId?: string) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const matchQuery: any = {
      timestamp: { $gte: startDate, $lte: endDate }
    };

    if (trackerId) {
      matchQuery.trackerId = trackerId;
    }

    const monthlyData = await ExpenseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $month: '$timestamp' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          total: 1,
          count: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    return monthlyData;
  }

  /**
   * Get total expenses for a period
   */
  static async getTotalExpenses(query: DateRangeQuery) {
    const { startDate, endDate, trackerId } = query;

    const matchQuery: any = {
      timestamp: { $gte: startDate, $lte: endDate }
    };

    if (trackerId) {
      matchQuery.trackerId = trackerId;
    }

    const result = await ExpenseModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }
}

export default AnalyticsService;
