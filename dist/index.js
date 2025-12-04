"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const db_1 = __importDefault(require("./config/db"));
const env_1 = __importDefault(require("./config/env"));
const config_1 = __importDefault(require("./swagger/config"));
// Modular API Routes
const auth_routes_1 = __importDefault(require("./apis/auth/auth.routes"));
const tracker_routes_1 = __importDefault(require("./apis/tracker/tracker.routes"));
const category_routes_1 = __importDefault(require("./apis/category/category.routes"));
const expense_routes_1 = __importDefault(require("./apis/expense/expense.routes"));
const usage_routes_1 = __importDefault(require("./apis/usage/usage.routes"));
const usage_log_routes_1 = __importDefault(require("./apis/usage-log/usage-log.routes"));
const imagekit_routes_1 = __importDefault(require("./apis/file-upload/imagekit-file-upload/imagekit.routes"));
const analytics_routes_1 = __importDefault(require("./apis/analytics/analytics.routes"));
const admin_routes_1 = __importDefault(require("./apis/admin/admin.routes"));
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
// === Swagger API Documentation ===
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(config_1.default, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Spentiva API Docs',
    customfavIcon: '/favicon.ico',
}));
// === Modular API Routes ===
// Authentication
app.use('/v1/api/auth', auth_routes_1.default);
// Resource Routes
app.use('/v1/api/category', category_routes_1.default);
app.use('/v1/api/expense', expense_routes_1.default);
app.use('/v1/api/trackers', tracker_routes_1.default);
app.use('/v1/api/usage', usage_routes_1.default);
app.use('/v1/api/usage-logs', usage_log_routes_1.default);
// Reports (module not yet implemented)
// app.use('/api/reports', reportRoutes);
// File uploads
app.use('/v1/api', imagekit_routes_1.default);
app.use('/v1/api', auth_routes_1.default);
app.use('/v1/api', tracker_routes_1.default);
// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Spentiva Server is running' });
});
// Analytics
app.use('/v1/api/analytics', analytics_routes_1.default);
// Admin Panel
app.use('/v1/api/admin', admin_routes_1.default);
app.listen(PORT, () => {
    console.log(`Spentiva Server is running on http://localhost:${PORT}`);
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    // Handle JSON parse errors
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err.message);
        const { badRequestResponse } = require('./utils/response-object');
        return badRequestResponse(res, null, 'Invalid JSON payload provided');
    }
    console.error('Global error:', err);
    const { errorResponse } = require('./utils/response-object');
    return errorResponse(res, err, 'Internal server error');
});
