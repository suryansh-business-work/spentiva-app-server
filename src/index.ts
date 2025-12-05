import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import db from './config/db';
import config from './config/env';
import swaggerSpec from './swagger/config';

// Modular API Routes
import authRoutes from './apis/auth/auth.routes';
import trackerRoutes from './apis/tracker/tracker.routes';

import categoryRoutes from './apis/category/category.routes';
import expenseRoutes from './apis/expense/expense.routes';
import usageRoutes from './apis/usage/usage.routes';
import usageLogRoutes from './apis/usage-log/usage-log.routes';
import imagekitUploadRoutes from './apis/file-upload/imagekit-file-upload/imagekit.routes';
import uploadRoutes from './apis/file-upload/local-upload/upload.routes';
import supportRoutes from './apis/support/support.routes';
import analyticsRoutes from './apis/analytics/analytics.routes';
import adminRoutes from './apis/admin/admin.routes';

dotenv.config();
const app = express();
const PORT = config.PORT;

// Initialize database connection
db(config.DBURL);

// CORS Configuration
const allowedOrigins = ['https://app.spentiva.com', 'http://localhost:8001'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true, // Allow cookies and authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  })
);

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// === Swagger API Documentation ===
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Spentiva API Docs',
    customfavIcon: '/favicon.ico',
  })
);

// === Modular API Routes ===
// Authentication
app.use('/v1/api/auth', authRoutes);

// Resource Routes
app.use('/v1/api/category', categoryRoutes);
app.use('/v1/api/expense', expenseRoutes);
app.use('/v1/api/trackers', trackerRoutes);
app.use('/v1/api/usage', usageRoutes);
app.use('/v1/api/usage-logs', usageLogRoutes);

// Reports (module not yet implemented)
// app.use('/api/reports', reportRoutes);

// File uploads
app.use('/v1/api', imagekitUploadRoutes);
app.use('/v1/api', uploadRoutes);
app.use('/v1/api', trackerRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Spentiva Server is running' });
});

// Analytics
app.use('/v1/api/analytics', analyticsRoutes);

// Admin Panel
app.use('/v1/api/admin', adminRoutes);

// Support Tickets
app.use('/v1/api/support', supportRoutes);

app.listen(PORT, () => {
  console.log(`Spentiva Server is running on http://localhost:${PORT}`);
});

// Global Error Handler
app.use((err: any, _req: any, res: any, _next: any) => {
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
