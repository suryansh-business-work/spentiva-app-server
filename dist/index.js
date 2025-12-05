"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const db_1 = __importDefault(require("./config/db"));
const env_1 = __importDefault(require("./config/env"));
const config_1 = __importDefault(require("./swagger/config"));
const logger_1 = require("./utils/logger");
const request_logger_1 = require("./middleware/request-logger");
const rate_limit_1 = require("./middleware/rate-limit");
// Modular API Routes
const auth_routes_1 = __importDefault(require("./apis/auth/auth.routes"));
const tracker_routes_1 = __importDefault(require("./apis/tracker/tracker.routes"));
const category_routes_1 = __importDefault(require("./apis/category/category.routes"));
const expense_routes_1 = __importDefault(require("./apis/expense/expense.routes"));
const usage_routes_1 = __importDefault(require("./apis/usage/usage.routes"));
const usage_log_routes_1 = __importDefault(require("./apis/usage-log/usage-log.routes"));
const imagekit_routes_1 = __importDefault(require("./apis/file-upload/imagekit-file-upload/imagekit.routes"));
const upload_routes_1 = __importDefault(require("./apis/file-upload/local-upload/upload.routes"));
const support_routes_1 = __importDefault(require("./apis/support/support.routes"));
const analytics_routes_1 = __importDefault(require("./apis/analytics/analytics.routes"));
const admin_routes_1 = __importDefault(require("./apis/admin/admin.routes"));
const health_routes_1 = __importDefault(require("./apis/health/health.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = env_1.default.PORT;
// Initialize database connection
(0, db_1.default)(env_1.default.DBURL);
// === Security Middleware ===
// Helmet - Security headers
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable for Swagger UI
    crossOriginEmbedderPolicy: false,
}));
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
            logger_1.logger.warn('CORS blocked origin', { origin });
            callback(null, false);
        }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
}));
// Enable gzip compression for all responses
app.use((0, compression_1.default)());
// Request logging middleware
app.use(request_logger_1.requestLogger);
app.use(express_1.default.json());
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static('uploads'));
// === Swagger API Documentation ===
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(config_1.default, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Spentiva API Docs',
    customfavIcon: '/favicon.ico',
}));
// === Modular API Routes ===
// Health & Monitoring (no rate limiting)
app.use('/v1/api', health_routes_1.default);
// Root endpoint
app.get('/', (req, res) => {
    const { successResponse } = require('./utils/response-object');
    return successResponse(res, { server: 'Spentiva', version: '1.0.0' }, 'Spentiva Server is running');
});
// Authentication (with strict rate limiting)
app.use('/v1/api/auth/send-otp', rate_limit_1.otpLimiter);
app.use('/v1/api/auth/send-email-otp', rate_limit_1.otpLimiter);
app.use('/v1/api/auth/verify-otp', rate_limit_1.authLimiter);
app.use('/v1/api/auth/verify-email-otp', rate_limit_1.authLimiter);
app.use('/v1/api/auth', auth_routes_1.default);
// AI Endpoints (with moderate rate limiting)
app.use('/v1/api/expense/parse', rate_limit_1.aiLimiter);
// General API rate limiting for all other routes
app.use('/v1/api', rate_limit_1.apiLimiter);
// Resource Routes
app.use('/v1/api/category', category_routes_1.default);
app.use('/v1/api/expense', expense_routes_1.default);
app.use('/v1/api/trackers', tracker_routes_1.default);
app.use('/v1/api/usage', usage_routes_1.default);
app.use('/v1/api/usage-logs', usage_log_routes_1.default);
// File uploads
app.use('/v1/api', imagekit_routes_1.default);
app.use('/v1/api', upload_routes_1.default);
// Analytics
app.use('/v1/api/analytics', analytics_routes_1.default);
// Admin Panel
app.use('/v1/api/admin', admin_routes_1.default);
// Support Tickets
app.use('/v1/api/support', support_routes_1.default);
// Global Error Handler (must be after all routes)
app.use((err, _req, res, _next) => {
    // Handle JSON parse errors
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        logger_1.logger.error('Bad JSON payload', { error: err.message });
        const { badRequestResponse } = require('./utils/response-object');
        return badRequestResponse(res, null, 'Invalid JSON payload provided');
    }
    logger_1.logger.error('Global error handler', { error: err.message, stack: err.stack });
    const { errorResponse } = require('./utils/response-object');
    return errorResponse(res, err, 'Internal server error');
});
app.listen(PORT, () => {
    logger_1.logger.info('🚀 Spentiva Server Started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
    });
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`💚 Health Check: http://localhost:${PORT}/v1/api/health\n`);
});
