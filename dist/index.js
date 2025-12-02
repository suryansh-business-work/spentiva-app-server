"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// IMPORTANT: Load environment variables FIRST, before any other imports
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("./config/db"));
const env_1 = __importDefault(require("./config/env"));
const Expense_1 = __importDefault(require("./models/Expense"));
const Tracker_1 = __importDefault(require("./models/Tracker"));
const Category_1 = __importDefault(require("./models/Category"));
const expenseParser_1 = require("./services/expenseParser");
const analyticsService_1 = require("./services/analyticsService");
const categories_1 = require("./config/categories");
const report_1 = __importDefault(require("./routes/report"));
const usage_1 = __importDefault(require("./routes/usage"));
const auth_routes_1 = __importDefault(require("./apis/auth/auth.routes"));
const imagekit_routes_1 = __importDefault(require("./apis/file-upload/imagekit-file-upload/imagekit.routes"));
const app = (0, express_1.default)();
const PORT = env_1.default.PORT;
// Initialize database connection
(0, db_1.default)(env_1.default.DBURL);
// CORS Configuration
const allowedOrigins = [
    'https://app.spentiva.com',
    'http://localhost:8001'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
}));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Report routes
app.use('/api/reports', report_1.default);
// Usage routes
app.use('/api/usage', usage_1.default);
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};
// Routes
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});
// ============ AUTH ROUTES (New Modular Structure) ============
app.use('/api/auth', auth_routes_1.default);
// ============ END AUTH ROUTES ============
app.get("/api/categories", (req, res) => {
    res.json({
        categories: categories_1.EXPENSE_CATEGORIES,
        paymentMethods: categories_1.PAYMENT_METHODS,
    });
});
app.post("/api/parse-expense", authenticateToken, async (req, res) => {
    try {
        const { message, trackerId } = req.body;
        console.log('[Parse Expense] Request received:', {
            hasMessage: !!message,
            hasTrackerId: !!trackerId,
            hasUserId: !!req.user?.userId,
            trackerId,
            userId: req.user?.userId
        });
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        if (!trackerId) {
            return res.status(400).json({ error: "Tracker ID is required" });
        }
        // Get tracker information for snapshot
        let trackerSnapshot = null;
        if (req.user?.userId && trackerId) {
            try {
                const tracker = await Tracker_1.default.findOne({
                    _id: trackerId,
                    userId: req.user.userId
                });
                if (tracker) {
                    const { createTrackerSnapshot } = await Promise.resolve().then(() => __importStar(require('./utils/usageLogger')));
                    trackerSnapshot = createTrackerSnapshot(tracker);
                }
                else {
                    return res.status(404).json({ error: "Tracker not found" });
                }
            }
            catch (err) {
                console.error("[Parse Expense] Error fetching tracker:", err);
                return res.status(500).json({ error: "Error fetching tracker information" });
            }
        }
        // Log user message with tracker snapshot
        if (trackerSnapshot) {
            try {
                const { encode } = await Promise.resolve().then(() => __importStar(require('gpt-tokenizer')));
                const userTokens = encode(message).length;
                const { logUsage } = await Promise.resolve().then(() => __importStar(require('./utils/usageLogger')));
                await logUsage(req.user.userId, trackerSnapshot, 'user', message, userTokens);
                console.log('[Parse Expense] User message logged with snapshot');
            }
            catch (logError) {
                console.error("[Parse Expense] Error logging user message:", logError);
                // Continue processing even if logging fails
            }
        }
        const parsed = await expenseParser_1.ExpenseParser.parseExpense(message);
        // Log AI response with tracker snapshot
        if (trackerSnapshot && !("error" in parsed)) {
            try {
                const responseText = `Parsed expense: ₹${parsed.amount} for ${parsed.subcategory} via ${parsed.paymentMethod}`;
                const { encode } = await Promise.resolve().then(() => __importStar(require('gpt-tokenizer')));
                const aiTokens = encode(responseText).length;
                const { logUsage } = await Promise.resolve().then(() => __importStar(require('./utils/usageLogger')));
                await logUsage(req.user.userId, trackerSnapshot, 'assistant', responseText, aiTokens);
                console.log('[Parse Expense] AI response logged with snapshot');
            }
            catch (logError) {
                console.error("[Parse Expense] Error logging AI response:", logError);
                // Continue processing even if logging fails
            }
        }
        if ("error" in parsed) {
            return res.status(400).json(parsed);
        }
        res.json(parsed);
    }
    catch (error) {
        console.error("Error parsing expense:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post("/api/expenses", async (req, res) => {
    try {
        const { amount, category, subcategory, categoryId, paymentMethod, description, timestamp, trackerId } = req.body;
        if (!amount || !category || !subcategory || !categoryId || !paymentMethod) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Get userId from auth header if present
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let userId;
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                userId = decoded.userId;
            }
            catch (err) {
                // Token invalid, continue without userId
            }
        }
        const expense = new Expense_1.default({
            amount,
            category,
            subcategory,
            categoryId,
            paymentMethod,
            description,
            timestamp: timestamp || new Date(),
            trackerId: trackerId || 'default',
            userId,
        });
        await expense.save();
        res.status(201).json({
            message: "Expense logged successfully",
            expense: {
                id: expense._id.toString(),
                amount: expense.amount,
                category: expense.category,
                subcategory: expense.subcategory,
                categoryId: expense.categoryId,
                paymentMethod: expense.paymentMethod,
                description: expense.description,
                timestamp: expense.timestamp,
                createdAt: expense.createdAt,
                updatedAt: expense.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/api/expenses", async (req, res) => {
    try {
        const { trackerId } = req.query;
        const query = trackerId ? { trackerId } : {};
        const expenses = await Expense_1.default.find(query)
            .sort({ timestamp: -1 })
            .limit(100);
        const formattedExpenses = expenses.map(expense => ({
            id: expense._id.toString(),
            amount: expense.amount,
            category: expense.category,
            subcategory: expense.subcategory,
            categoryId: expense.categoryId,
            paymentMethod: expense.paymentMethod,
            description: expense.description,
            timestamp: expense.timestamp,
            trackerId: expense.trackerId || 'default',
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,
        }));
        res.json({ expenses: formattedExpenses });
    }
    catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.put("/api/expenses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, category, subcategory, categoryId, paymentMethod, description, timestamp } = req.body;
        const expense = await Expense_1.default.findByIdAndUpdate(id, {
            amount,
            category,
            subcategory,
            categoryId,
            paymentMethod,
            description,
            timestamp,
        }, { new: true });
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.json({
            message: "Expense updated successfully",
            expense: {
                id: expense._id.toString(),
                amount: expense.amount,
                category: expense.category,
                subcategory: expense.subcategory,
                categoryId: expense.categoryId,
                paymentMethod: expense.paymentMethod,
                description: expense.description,
                timestamp: expense.timestamp,
                createdAt: expense.createdAt,
                updatedAt: expense.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.delete("/api/expenses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense_1.default.findByIdAndDelete(id);
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.json({
            message: "Expense deleted successfully",
            id,
        });
    }
    catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post("/api/chat", authenticateToken, async (req, res) => {
    try {
        const { message, history = [], trackerId } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }
        // Get tracker snapshot and log user message
        let trackerSnapshot = null;
        if (req.user?.userId && trackerId) {
            try {
                const tracker = await Tracker_1.default.findOne({
                    _id: trackerId,
                    userId: req.user.userId
                });
                if (tracker) {
                    const { createTrackerSnapshot, logUsage } = await Promise.resolve().then(() => __importStar(require('./utils/usageLogger')));
                    const { encode } = await Promise.resolve().then(() => __importStar(require('gpt-tokenizer')));
                    trackerSnapshot = createTrackerSnapshot(tracker);
                    const userTokens = encode(message).length;
                    await logUsage(req.user.userId, trackerSnapshot, 'user', message, userTokens);
                }
            }
            catch (err) {
                console.error("[Chat] Error logging user message:", err);
            }
        }
        const response = await expenseParser_1.ExpenseParser.getChatResponse(message, history);
        // Log AI response
        if (trackerSnapshot && response) {
            try {
                const { logUsage } = await Promise.resolve().then(() => __importStar(require('./utils/usageLogger')));
                const { encode } = await Promise.resolve().then(() => __importStar(require('gpt-tokenizer')));
                const aiTokens = encode(response).length;
                await logUsage(req.user.userId, trackerSnapshot, 'assistant', response, aiTokens);
            }
            catch (err) {
                console.error("[Chat] Error logging AI response:", err);
            }
        }
        res.json({ response });
    }
    catch (error) {
        console.error("Error in chat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Analytics Routes
app.get("/api/analytics/summary", async (req, res) => {
    try {
        const { filter, customStart, customEnd, categoryId, trackerId } = req.query;
        let dateRange = { startDate: new Date(0), endDate: new Date() };
        if (filter) {
            dateRange = analyticsService_1.AnalyticsService.getDateRange(filter, customStart, customEnd);
        }
        const query = {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        };
        if (categoryId) {
            query.categoryId = categoryId;
        }
        if (trackerId) {
            query.trackerId = trackerId;
        }
        const stats = await analyticsService_1.AnalyticsService.getSummaryStats(query);
        res.json({
            stats,
            filter: filter || "all",
            dateRange
        });
    }
    catch (error) {
        console.error("Error fetching summary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/api/analytics/by-category", async (req, res) => {
    try {
        const { filter, customStart, customEnd, trackerId } = req.query;
        let dateRange = { startDate: new Date(0), endDate: new Date() };
        if (filter) {
            dateRange = analyticsService_1.AnalyticsService.getDateRange(filter, customStart, customEnd);
        }
        const query = {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        };
        if (trackerId) {
            query.trackerId = trackerId;
        }
        const data = await analyticsService_1.AnalyticsService.getExpensesByCategory(query);
        res.json({ data, filter: filter || "all", dateRange });
    }
    catch (error) {
        console.error("Error fetching category analytics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/api/analytics/by-month", async (req, res) => {
    try {
        const { year, trackerId } = req.query;
        const targetYear = year ? parseInt(year) : undefined;
        const data = await analyticsService_1.AnalyticsService.getExpensesByMonth(targetYear, trackerId);
        res.json({ data, year: targetYear || new Date().getFullYear() });
    }
    catch (error) {
        console.error("Error fetching monthly analytics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/api/analytics/total", async (req, res) => {
    try {
        const { trackerId } = req.query;
        const query = {
            startDate: new Date(0),
            endDate: new Date()
        };
        if (trackerId) {
            query.trackerId = trackerId;
        }
        const total = await analyticsService_1.AnalyticsService.getTotalExpenses(query);
        res.json({ total });
    }
    catch (error) {
        console.error("Error fetching total:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Tracker Routes
app.get("/api/trackers", authenticateToken, async (req, res) => {
    try {
        const trackers = await Tracker_1.default.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        const formattedTrackers = trackers.map(tracker => ({
            id: tracker._id.toString(),
            name: tracker.name,
            type: tracker.type,
            description: tracker.description,
            currency: tracker.currency,
            createdAt: tracker.createdAt,
            updatedAt: tracker.updatedAt,
        }));
        res.json({ trackers: formattedTrackers });
    }
    catch (error) {
        console.error("Error fetching trackers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post("/api/trackers", authenticateToken, async (req, res) => {
    try {
        const { name, type, description, currency } = req.body;
        if (!name || !type || !currency) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const tracker = new Tracker_1.default({
            name,
            type,
            description,
            currency,
            userId: req.user.userId,
        });
        await tracker.save();
        // Create default categories for the new tracker
        const defaultCategories = [
            {
                trackerId: tracker._id.toString(),
                name: "Food & Dining",
                subcategories: [
                    { id: `${Date.now()}-1`, name: "Groceries" },
                    { id: `${Date.now()}-2`, name: "Restaurants" },
                    { id: `${Date.now()}-3`, name: "Fast Food" },
                ],
            },
            {
                trackerId: tracker._id.toString(),
                name: "Transportation",
                subcategories: [
                    { id: `${Date.now()}-4`, name: "Fuel" },
                    { id: `${Date.now()}-5`, name: "Public Transport" },
                    { id: `${Date.now()}-6`, name: "Taxi/Uber" },
                ],
            },
            {
                trackerId: tracker._id.toString(),
                name: "Shopping",
                subcategories: [
                    { id: `${Date.now()}-7`, name: "Clothing" },
                    { id: `${Date.now()}-8`, name: "Electronics" },
                    { id: `${Date.now()}-9`, name: "Books" },
                ],
            },
            {
                trackerId: tracker._id.toString(),
                name: "Entertainment",
                subcategories: [
                    { id: `${Date.now()}-10`, name: "Movies" },
                    { id: `${Date.now()}-11`, name: "Games" },
                    { id: `${Date.now()}-12`, name: "Hobbies" },
                ],
            },
            {
                trackerId: tracker._id.toString(),
                name: "Bills & Utilities",
                subcategories: [
                    { id: `${Date.now()}-13`, name: "Electricity" },
                    { id: `${Date.now()}-14`, name: "Water" },
                    { id: `${Date.now()}-15`, name: "Internet" },
                ],
            },
        ];
        await Category_1.default.insertMany(defaultCategories);
        res.status(201).json({
            message: "Tracker created successfully",
            tracker: {
                id: tracker._id.toString(),
                name: tracker.name,
                type: tracker.type,
                description: tracker.description,
                currency: tracker.currency,
                createdAt: tracker.createdAt,
                updatedAt: tracker.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Error creating tracker:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/api/trackers/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const tracker = await Tracker_1.default.findOne({ _id: id, userId: req.user.userId });
        if (!tracker) {
            return res.status(404).json({ error: "Tracker not found" });
        }
        res.json({
            tracker: {
                id: tracker._id.toString(),
                name: tracker.name,
                type: tracker.type,
                description: tracker.description,
                currency: tracker.currency,
                createdAt: tracker.createdAt,
                updatedAt: tracker.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Error fetching tracker:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.put("/api/trackers/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, description, currency } = req.body;
        const tracker = await Tracker_1.default.findOneAndUpdate({ _id: id, userId: req.user.userId }, { name, type, description, currency }, { new: true });
        if (!tracker) {
            return res.status(404).json({ error: "Tracker not found" });
        }
        // Update tracker information in usage records
        if (name || type) {
            try {
                const { updateTrackerInUsage } = await Promise.resolve().then(() => __importStar(require('./utils/usageLogger')));
                await updateTrackerInUsage(id, tracker.name, tracker.type);
                console.log(`✅ Updated tracker ${id} in usage records`);
            }
            catch (usageError) {
                console.error("Error updating tracker in usage:", usageError);
                // Don't fail the update operation if usage update fails
            }
        }
        res.json({
            message: "Tracker updated successfully",
            tracker: {
                id: tracker._id.toString(),
                name: tracker.name,
                type: tracker.type,
                description: tracker.description,
                currency: tracker.currency,
                createdAt: tracker.createdAt,
                updatedAt: tracker.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Error updating tracker:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.delete("/api/trackers/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const tracker = await Tracker_1.default.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!tracker) {
            return res.status(404).json({ error: "Tracker not found" });
        }
        // Mark tracker as deleted in usage records (so data is preserved)
        try {
            const { markTrackerAsDeleted } = await Promise.resolve().then(() => __importStar(require('./utils/usageLogger')));
            await markTrackerAsDeleted(id);
            console.log(`✅ Marked tracker ${id} as deleted in usage records`);
        }
        catch (usageError) {
            console.error("Error marking tracker as deleted in usage:", usageError);
            // Don't fail the delete operation if usage marking fails
        }
        // Also delete all expenses associated with this tracker
        await Expense_1.default.deleteMany({ trackerId: id });
        // Also delete all categories associated with this tracker
        await Category_1.default.deleteMany({ trackerId: id });
        res.json({
            message: "Tracker and associated expenses deleted successfully",
            id,
        });
    }
    catch (error) {
        console.error("Error deleting tracker:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// ============ CATEGORY ROUTES ============
// Get all categories for a tracker
app.get("/api/trackers/:trackerId/categories", authenticateToken, async (req, res) => {
    try {
        const { trackerId } = req.params;
        // Verify tracker belongs to user
        const tracker = await Tracker_1.default.findOne({ _id: trackerId, userId: req.user.userId });
        if (!tracker) {
            return res.status(404).json({ error: "Tracker not found" });
        }
        const categories = await Category_1.default.find({ trackerId }).sort({ createdAt: 1 });
        const formattedCategories = categories.map(category => ({
            id: category._id.toString(),
            trackerId: category.trackerId,
            name: category.name,
            subcategories: category.subcategories,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        }));
        res.json({ categories: formattedCategories });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Create a new category
app.post("/api/trackers/:trackerId/categories", authenticateToken, async (req, res) => {
    try {
        const { trackerId } = req.params;
        const { name, subcategories = [] } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Category name is required" });
        }
        // Verify tracker belongs to user
        const tracker = await Tracker_1.default.findOne({ _id: trackerId, userId: req.user.userId });
        if (!tracker) {
            return res.status(404).json({ error: "Tracker not found" });
        }
        const category = new Category_1.default({
            trackerId,
            name,
            subcategories,
        });
        await category.save();
        res.status(201).json({
            message: "Category created successfully",
            category: {
                id: category._id.toString(),
                trackerId: category.trackerId,
                name: category.name,
                subcategories: category.subcategories,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update a category
app.put("/api/trackers/:trackerId/categories/:categoryId", authenticateToken, async (req, res) => {
    try {
        const { trackerId, categoryId } = req.params;
        const { name, subcategories } = req.body;
        // Verify tracker belongs to user
        const tracker = await Tracker_1.default.findOne({ _id: trackerId, userId: req.user.userId });
        if (!tracker) {
            return res.status(404).json({ error: "Tracker not found" });
        }
        const category = await Category_1.default.findOneAndUpdate({ _id: categoryId, trackerId }, { name, subcategories }, { new: true });
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json({
            message: "Category updated successfully",
            category: {
                id: category._id.toString(),
                trackerId: category.trackerId,
                name: category.name,
                subcategories: category.subcategories,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Delete a category
app.delete("/api/trackers/:trackerId/categories/:categoryId", authenticateToken, async (req, res) => {
    try {
        const { trackerId, categoryId } = req.params;
        // Verify tracker belongs to user
        const tracker = await Tracker_1.default.findOne({ _id: trackerId, userId: req.user.userId });
        if (!tracker) {
            return res.status(404).json({ error: "Tracker not found" });
        }
        const category = await Category_1.default.findOneAndDelete({ _id: categoryId, trackerId });
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json({
            message: "Category deleted successfully",
            id: categoryId,
        });
    }
    catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.use('/v1/api', imagekit_routes_1.default);
app.use('/v1/api', auth_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    // Handle JSON parse errors
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err.message);
        return res.status(400).json({ error: 'Invalid JSON payload provided' });
    }
    console.error('Global error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
