"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
const date_fns_1 = require("date-fns");
class AnalyticsService {
    // Get total expenses
    static async getTotalExpenses(query) {
        const filter = {};
        if (query.startDate || query.endDate) {
            filter.timestamp = {};
            if (query.startDate)
                filter.timestamp.$gte = query.startDate;
            if (query.endDate)
                filter.timestamp.$lte = query.endDate;
        }
        if (query.categoryId) {
            filter.categoryId = query.categoryId;
        }
        if (query.trackerId) {
            filter.trackerId = query.trackerId;
        }
        const result = await Expense_1.default.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        return result.length > 0 ? result[0].total : 0;
    }
    // Get expenses by category
    static async getExpensesByCategory(query) {
        const filter = {};
        if (query.startDate || query.endDate) {
            filter.timestamp = {};
            if (query.startDate)
                filter.timestamp.$gte = query.startDate;
            if (query.endDate)
                filter.timestamp.$lte = query.endDate;
        }
        if (query.trackerId) {
            filter.trackerId = query.trackerId;
        }
        const result = await Expense_1.default.aggregate([
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
    static async getExpensesByMonth(year, trackerId) {
        const targetYear = year || new Date().getFullYear();
        const startDate = new Date(targetYear, 0, 1);
        const endDate = new Date(targetYear, 11, 31, 23, 59, 59);
        const filter = {
            timestamp: { $gte: startDate, $lte: endDate }
        };
        if (trackerId) {
            filter.trackerId = trackerId;
        }
        const result = await Expense_1.default.aggregate([
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
    static getDateRange(filter, customStart, customEnd) {
        const now = new Date();
        let startDate;
        let endDate = (0, date_fns_1.endOfDay)(now);
        switch (filter) {
            case "today":
                startDate = (0, date_fns_1.startOfDay)(now);
                endDate = (0, date_fns_1.endOfDay)(now);
                break;
            case "yesterday":
                const yesterday = (0, date_fns_1.subDays)(now, 1);
                startDate = (0, date_fns_1.startOfDay)(yesterday);
                endDate = (0, date_fns_1.endOfDay)(yesterday);
                break;
            case "last7days":
                startDate = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 6));
                break;
            case "lastMonth":
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                startDate = (0, date_fns_1.startOfMonth)(lastMonth);
                endDate = (0, date_fns_1.endOfMonth)(lastMonth);
                break;
            case "thisMonth":
                startDate = (0, date_fns_1.startOfMonth)(now);
                endDate = (0, date_fns_1.endOfMonth)(now);
                break;
            case "indiaFY":
                // India FY: April 1 to March 31
                const currentYear = now.getFullYear();
                const fyStartYear = now.getMonth() >= 3 ? currentYear : currentYear - 1;
                startDate = new Date(fyStartYear, 3, 1); // April 1
                endDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59); // March 31 next year
                break;
            case "thisYear":
                startDate = (0, date_fns_1.startOfYear)(now);
                endDate = (0, date_fns_1.endOfYear)(now);
                break;
            case "custom":
                if (customStart && customEnd) {
                    startDate = (0, date_fns_1.startOfDay)(new Date(customStart));
                    endDate = (0, date_fns_1.endOfDay)(new Date(customEnd));
                }
                else {
                    startDate = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 30));
                }
                break;
            default:
                startDate = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(now, 30));
        }
        return { startDate, endDate };
    }
    // Get summary statistics
    static async getSummaryStats(query) {
        const filter = {};
        if (query.startDate || query.endDate) {
            filter.timestamp = {};
            if (query.startDate)
                filter.timestamp.$gte = query.startDate;
            if (query.endDate)
                filter.timestamp.$lte = query.endDate;
        }
        if (query.trackerId) {
            filter.trackerId = query.trackerId;
        }
        const [totalResult, avgResult, countResult] = await Promise.all([
            Expense_1.default.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Expense_1.default.aggregate([
                { $match: filter },
                { $group: { _id: null, average: { $avg: "$amount" } } }
            ]),
            Expense_1.default.countDocuments(filter)
        ]);
        return {
            total: totalResult.length > 0 ? totalResult[0].total : 0,
            average: avgResult.length > 0 ? avgResult[0].average : 0,
            count: countResult
        };
    }
}
exports.AnalyticsService = AnalyticsService;
