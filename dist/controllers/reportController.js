"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailReport = exports.downloadReport = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const reportEmail_1 = require("../templates/reportEmail");
const Expense_1 = __importDefault(require("../models/Expense"));
// Helper function to get date range
const getDateRange = (filter, startDate, endDate) => {
    const now = new Date();
    let start;
    let end = now;
    switch (filter) {
        case 'today':
            start = new Date(now.setHours(0, 0, 0, 0));
            end = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'yesterday':
            start = new Date(now.setDate(now.getDate() - 1));
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setHours(23, 59, 59, 999);
            break;
        case 'last7days':
            start = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'lastMonth':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'thisMonth':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'indiaFY':
            const currentYear = now.getFullYear();
            const fyStart = now.getMonth() >= 3 ? currentYear : currentYear - 1;
            start = new Date(fyStart, 3, 1); // April 1st
            end = new Date(fyStart + 1, 2, 31); // March 31st
            break;
        case 'thisYear':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        case 'custom':
            if (startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
            }
            else {
                start = new Date(now.getFullYear(), now.getMonth(), 1);
            }
            break;
        default:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return { start, end };
};
// Get formatted date range string
const getDateRangeString = (filter, start, end) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    switch (filter) {
        case 'today':
            return 'Today';
        case 'yesterday':
            return 'Yesterday';
        case 'last7days':
            return 'Last 7 Days';
        case 'lastMonth':
            return 'Last Month';
        case 'thisMonth':
            return 'This Month';
        case 'indiaFY':
            return `India FY ${start.getFullYear()}-${end.getFullYear()}`;
        case 'thisYear':
            return `Year ${start.getFullYear()}`;
        default:
            return `${start.toLocaleDateString('en-IN', options)} - ${end.toLocaleDateString('en-IN', options)}`;
    }
};
const downloadReport = async (req, res) => {
    console.log("Start Download Report Process....");
    try {
        const userId = req.user?.userId;
        const { filter = 'thisMonth', startDate, endDate, trackerId } = req.query;
        console.log('Download report request:', { userId, filter, startDate, endDate, trackerId });
        const { start, end } = getDateRange(filter, startDate, endDate);
        // Build query
        const query = {
            userId,
            timestamp: { $gte: start, $lte: end },
        };
        if (trackerId && trackerId !== 'undefined') {
            query.trackerId = trackerId;
        }
        // Get expenses
        const expenses = await Expense_1.default.find(query).sort({ timestamp: -1 });
        console.log(`Found ${expenses.length} expenses for report`);
        console.log('Query:', JSON.stringify(query));
        // Calculate summary
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
        const transactionCount = expenses.length;
        // Calculate category breakdown
        const categoryMap = new Map();
        expenses.forEach((exp) => {
            const category = exp.category || 'Uncategorized';
            const existing = categoryMap.get(category) || { total: 0, count: 0 };
            categoryMap.set(category, {
                total: existing.total + exp.amount,
                count: existing.count + 1,
            });
        });
        const categoryData = Array.from(categoryMap.entries())
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total);
        // Calculate monthly data
        const monthlyMap = new Map();
        expenses.forEach((exp) => {
            const month = new Date(exp.timestamp).getMonth() + 1;
            monthlyMap.set(month, (monthlyMap.get(month) || 0) + exp.amount);
        });
        const monthlyData = Array.from(monthlyMap.entries())
            .map(([month, total]) => ({ month, total }))
            .sort((a, b) => a.month - b.month);
        // Generate CSV content
        const dateRangeString = getDateRangeString(filter, start, end);
        let csvContent = `Expense Report - ${dateRangeString}\n`;
        csvContent += `Generated on: ${new Date().toLocaleString('en-IN')}\n\n`;
        csvContent += `Summary\n`;
        csvContent += `Total Expenses,₹${totalExpenses.toLocaleString('en-IN')}\n`;
        csvContent += `Average Expense,₹${Math.round(averageExpense).toLocaleString('en-IN')}\n`;
        csvContent += `Total Transactions,${transactionCount}\n\n`;
        if (categoryData.length > 0) {
            csvContent += `Category Breakdown\n`;
            csvContent += `Category,Amount,Transactions,Percentage\n`;
            categoryData.forEach((cat) => {
                const percentage = totalExpenses > 0 ? ((cat.total / totalExpenses) * 100).toFixed(1) : '0.0';
                csvContent += `${cat.category},₹${cat.total.toLocaleString('en-IN')},${cat.count},${percentage}%\n`;
            });
        }
        if (monthlyData.length > 0) {
            csvContent += `\nMonthly Breakdown\n`;
            csvContent += `Month,Amount\n`;
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthlyData.forEach((m) => {
                csvContent += `${monthNames[m.month - 1]},₹${m.total.toLocaleString('en-IN')}\n`;
            });
        }
        if (expenses.length > 0) {
            csvContent += `\nDetailed Transactions\n`;
            csvContent += `Date,Description,Category,Amount,Payment Method\n`;
            expenses.forEach((exp) => {
                const date = new Date(exp.timestamp).toLocaleDateString('en-IN');
                const desc = (exp.description || '').replace(/"/g, '""'); // Escape quotes
                csvContent += `${date},"${desc}",${exp.category || 'Uncategorized'},₹${exp.amount.toLocaleString('en-IN')},${exp.paymentMethod || 'N/A'}\n`;
            });
        }
        else {
            csvContent += `\nNo expenses found for the selected period.\n`;
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="expense-report-${filter}-${Date.now()}.csv"`);
        res.send(csvContent);
        console.log('Report downloaded successfully');
    }
    catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
};
exports.downloadReport = downloadReport;
const emailReport = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const userEmail = req.user?.email;
        const userName = req.user?.name || 'User';
        const { filter = 'thisMonth', startDate, endDate, trackerId } = req.body;
        console.log('Email report request:', { userId, userEmail, userName, filter, startDate, endDate, trackerId });
        if (!userEmail) {
            return res.status(400).json({ message: 'User email not found. Please add an email to your profile.' });
        }
        const { start, end } = getDateRange(filter, startDate, endDate);
        // Build query
        const query = {
            userId,
            timestamp: { $gte: start, $lte: end },
        };
        if (trackerId && trackerId !== 'undefined') {
            query.trackerId = trackerId;
        }
        // Get expenses
        const expenses = await Expense_1.default.find(query).sort({ timestamp: -1 });
        // Calculate summary
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
        const transactionCount = expenses.length;
        // Calculate category breakdown
        const categoryMap = new Map();
        expenses.forEach((exp) => {
            const category = exp.category || 'Uncategorized';
            const existing = categoryMap.get(category) || { total: 0, count: 0 };
            categoryMap.set(category, {
                total: existing.total + exp.amount,
                count: existing.count + 1,
            });
        });
        const categoryData = Array.from(categoryMap.entries())
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10); // Top 10 categories for email
        // Calculate monthly data
        const monthlyMap = new Map();
        expenses.forEach((exp) => {
            const month = new Date(exp.timestamp).getMonth() + 1;
            monthlyMap.set(month, (monthlyMap.get(month) || 0) + exp.amount);
        });
        const monthlyData = Array.from(monthlyMap.entries())
            .map(([month, total]) => ({ month, total }))
            .sort((a, b) => a.month - b.month);
        const dateRangeString = getDateRangeString(filter, start, end);
        // Generate HTML email
        const htmlContent = (0, reportEmail_1.generateReportEmail)({
            userName,
            dateRange: dateRangeString,
            totalExpenses,
            averageExpense,
            transactionCount,
            categoryData,
            monthlyData,
        });
        // Configure email transporter
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        // Send email
        await transporter.sendMail({
            from: `"expensia" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `Your Expense Report - ${dateRangeString}`,
            html: htmlContent,
        });
        console.log(`Email report sent successfully to ${userEmail}`);
        res.json({ message: 'Report sent successfully to your email' });
    }
    catch (error) {
        console.error('Error sending email report:', error);
        res.status(500).json({ message: 'Failed to send email report', error: error.message });
    }
};
exports.emailReport = emailReport;
