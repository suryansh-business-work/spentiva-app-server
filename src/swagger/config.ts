import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Spentiva API Documentation',
      version: '1.0.0',
      description: `
# Spentiva Expense Tracker API

Complete RESTful API for the Spentiva expense tracking application.

## Features
- 🔐 JWT-based authentication with OTP verification
- 📊 Multi-tracker expense management (personal & business)
- 🤖 AI-powered expense parsing using OpenAI
- 📈 Comprehensive usage analytics and graphs
- 💬 Real-time support ticket system
- 📁 File upload with ImageKit integration
- 👥 Admin panel with user management
- 🎨 Customizable categories and subcategories

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting
- General API: 100 requests/15 minutes
- Auth endpoints: 5 requests/15 minutes  
- OTP endpoints: 3 requests/15 minutes
- AI endpoints: 20 requests/15 minutes
      `,
      contact: {
        name: 'Spentiva Support',
        email: 'suryansh@exyconn.com',
        url: 'https://spentiva.com/support',
      },
      license: {
        name: 'Proprietary',
        url: 'https://spentiva.com/license',
      },
    },
    servers: [
      {
        url: 'http://localhost:8002',
        description: 'Development server',
      },
      {
        url: 'https://api.spentiva.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication, registration, and OTP verification',
      },
      {
        name: 'Health & Monitoring',
        description: 'System health checks and server status',
      },
      {
        name: 'Trackers',
        description: 'Expense tracker management (personal & business)',
      },
      {
        name: 'Categories',
        description: 'Category and subcategory management for expense classification',
      },
      {
        name: 'Expenses',
        description: 'Expense logging, AI parsing, and conversational tracking',
      },
      {
        name: 'Usage & Analytics',
        description: 'Usage tracking, statistics, and analytics graphs',
      },
      {
        name: 'Support',
        description: 'Support ticket management and customer service',
      },
      {
        name: 'File Upload',
        description: 'File and media upload services (ImageKit & local storage)',
      },
      {
        name: 'Admin',
        description: 'Administrative operations (admin-only access)',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: `
**JWT Authentication**

Obtain your JWT token by:
1. Signing up: \`POST /v1/api/auth/signup\`
2. Verifying OTP: \`POST /v1/api/auth/verify-otp\`
3. Logging in: \`POST /v1/api/auth/login\`

Token expires in 7 days. Include in all authenticated requests:
\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`
          `,
        },
      },
      schemas: {},
    },
    security: [],
  },
  apis: ['./src/swagger/paths/*.ts', './src/swagger/schemas/*.ts'],
};

export default swaggerJsdoc(options);
