import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import db from './config/db';
import config from './config/env';

// Modular API Routes
import authRoutes from './apis/auth/auth.routes';
import trackerRoutes from './apis/tracker/tracker.routes';

import categoryRoutes from './apis/category/category.routes';
import expenseRoutes from './apis/expense/expense.routes';
import messageRoutes from './apis/message/message.routes';
import usageRoutes from './apis/usage/usage.routes';
import usageLogRoutes from './apis/usage-log/usage-log.routes';
import imagekitUploadRoutes from './apis/file-upload/imagekit-file-upload/imagekit.routes';
import analyticsRoutes from './apis/analytics/analytics.routes';

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

// === Modular API Routes ===
// Authentication
app.use('/api/auth', authRoutes);

// Resource Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/usage-logs', usageLogRoutes);

// Reports (module not yet implemented)
// app.use('/api/reports', reportRoutes);

// File uploads
app.use('/v1/api', imagekitUploadRoutes);
app.use('/v1/api', authRoutes);
app.use('/v1/api', trackerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Analytics
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  // Handle JSON parse errors
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    return res.status(400).json({ error: 'Invalid JSON payload provided' });
  }

  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
