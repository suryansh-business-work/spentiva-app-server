import { Request, Response } from "express";
import ExpenseModel from "../models/Expense";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export interface AnalyticsQuery {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  categoryId?: string;
  trackerId?: string;
}

export class AnalyticsService {
  // Get total expenses
  static async getTotalExpenses(query: AnalyticsQuery): Promise<number> {
    const filter: any = {};
    
    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) filter.timestamp.$gte = query.startDate;
      if (query.endDate) filter.timestamp.$lte = query.endDate;
    }
    
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }
    
    if (query.trackerId) {
      filter.trackerId = query.trackerId;
    }
    
    const result = await ExpenseModel.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  }

  // Get expenses by category
  static async getExpensesByCategory(query: AnalyticsQuery) {
    const filter: any = {};
    
    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) filter.timestamp.$gte = query.startDate;
      if (query.endDate) filter.timestamp.$lte = query.endDate;
    }
    
    if (query.trackerId) {
      filter.trackerId = query.trackerId;
    }
    
    const result = await ExpenseModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { category: "$category", categoryId: "$categoryId" },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    return result.map(item => ({
      category: item._id.category,
      categoryId: item._id.categoryId,
      total: item.total,
      count: item.count
    }));
  }

  // Get expenses by month
  static async getExpensesByMonth(year?: number, trackerId?: string) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);
    
    const filter: any = {
      timestamp: { $gte: startDate, $lte: endDate }
    };
    
    if (trackerId) {
      filter.trackerId = trackerId;
    }
    
    const result = await ExpenseModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $month: "$timestamp" },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Fill in missing months with 0
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
      count: 0
    }));
    
    result.forEach(item => {
      monthlyData[item._id - 1] = {
        month: item._id,
        total: item.total,
        count: item.count
      };
    });
    
    return monthlyData;
  }

  // Get date range based on filter
  static getDateRange(filter: string, customStart?: string, customEnd?: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);
    
    switch (filter) {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "yesterday":
        const yesterday = subDays(now, 1);
        startDate = startOfDay(yesterday);
        endDate = endOfDay(yesterday);
        break;
      case "last7days":
        startDate = startOfDay(subDays(now, 6));
        break;
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "thisMonth":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "indiaFY":
        // India FY: April 1 to March 31
        const currentYear = now.getFullYear();
        const fyStartYear = now.getMonth() >= 3 ? currentYear : currentYear - 1;
        startDate = new Date(fyStartYear, 3, 1); // April 1
        endDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59); // March 31 next year
        break;
      case "thisYear":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case "custom":
        if (customStart && customEnd) {
          startDate = startOfDay(new Date(customStart));
          endDate = endOfDay(new Date(customEnd));
        } else {
          startDate = startOfDay(subDays(now, 30));
        }
        break;
      default:
        startDate = startOfDay(subDays(now, 30));
    }
    
    return { startDate, endDate };
  }

  // Get summary statistics
  static async getSummaryStats(query: AnalyticsQuery) {
    const filter: any = {};
    
    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) filter.timestamp.$gte = query.startDate;
      if (query.endDate) filter.timestamp.$lte = query.endDate;
    }
    
    if (query.trackerId) {
      filter.trackerId = query.trackerId;
    }
    
    const [totalResult, avgResult, countResult] = await Promise.all([
      ExpenseModel.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      ExpenseModel.aggregate([
        { $match: filter },
        { $group: { _id: null, average: { $avg: "$amount" } } }
      ]),
      ExpenseModel.countDocuments(filter)
    ]);
    
    return {
      total: totalResult.length > 0 ? totalResult[0].total : 0,
      average: avgResult.length > 0 ? avgResult[0].average : 0,
      count: countResult
    };
  }
}
