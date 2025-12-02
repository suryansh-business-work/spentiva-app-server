# Spentiva API Documentation

## Swagger Documentation

API documentation is available at `/api/docs` when the server is running.

### Accessing the Documentation

- **Local Development**: `http://localhost:8002/api/docs`
- **Production**: `https://api.spentiva.com/api/docs`

### Authentication

Most endpoints require Bearer token authentication:

1. Login or Signup to get your JWT token
2. Click the "Authorize" button in Swagger UI
3. Enter: `Bearer YOUR_TOKEN_HERE`
4. All authenticated requests will now include your token

### API Structure

The API documentation is organized into the following modules:

- **Authentication**: User login, signup, password reset
- **Expenses**: Create, read, update, delete expenses
- **Trackers**: Manage expense trackers
- **Categories**: Manage expense categories
- **Analytics**: View expense analytics and reports
- **Usage**: Track API usage and logs

### Modular Swagger Files

Swagger documentation is split across multiple files for better organization:

```
src/swagger/
├── config.ts              # Main Swagger configuration
├── schemas/
│   ├── common.ts         # Common schemas (User, Error, etc.)
│   └── models.ts         # Model schemas (Expense, Tracker, etc.)
└── paths/
    ├── auth.ts           # Authentication endpoints
    ├── expenses.ts       # Expense endpoints
    ├── trackers.ts       # Tracker endpoints
    ├── categories.ts     # Category endpoints
    └── analytics.ts      #Analytics endpoints
```

### Quick Start

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:8002/api/docs`
3. Use `/api/auth/login` or `/api/auth/signup` to get a token
4. Click "Authorize" and enter your token
5. Try out the API endpoints!
