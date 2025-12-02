"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const env_1 = __importDefault(require("./config/env"));
// Modular API Routes
const auth_routes_1 = __importDefault(require("./apis/auth/auth.routes"));
const tracker_routes_1 = __importDefault(require("./apis/tracker/tracker.routes"));
const category_routes_1 = __importDefault(require("./apis/category/category.routes"));
const expense_routes_1 = __importDefault(require("./apis/expense/expense.routes"));
const message_routes_1 = __importDefault(require("./apis/message/message.routes"));
const usage_routes_1 = __importDefault(require("./apis/usage/usage.routes"));
const usage_log_routes_1 = __importDefault(require("./apis/usage-log/usage-log.routes"));
const imagekit_routes_1 = __importDefault(require("./apis/file-upload/imagekit-file-upload/imagekit.routes"));
const analytics_routes_1 = __importDefault(require("./apis/analytics/analytics.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = env_1.default.PORT;
// Initialize database connection
(0, db_1.default)(env_1.default.DBURL);
// CORS Configuration
const allowedOrigins = ['https://app.spentiva.com', 'http://localhost:8001'];
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
// === Modular API Routes ===
// Authentication
app.use('/api/auth', auth_routes_1.default);
// Resource Routes
app.use('/api/categories', category_routes_1.default);
app.use('/api/expenses', expense_routes_1.default);
app.use('/api/messages', message_routes_1.default);
app.use('/api/trackers', tracker_routes_1.default);
app.use('/api/usage', usage_routes_1.default);
app.use('/api/usage-logs', usage_log_routes_1.default);
// Reports (module not yet implemented)
// app.use('/api/reports', reportRoutes);
// File uploads
app.use('/v1/api', imagekit_routes_1.default);
app.use('/v1/api', auth_routes_1.default);
app.use('/v1/api', tracker_routes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});
// Analytics
app.use('/api/analytics', analytics_routes_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Global Error Handler
app.use((err, req, res, _next) => {
    // Handle JSON parse errors
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err.message);
        return res.status(400).json({ error: 'Invalid JSON payload provided' });
    }
    console.error('Global error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
