import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Spentiva API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for Spentiva Expense Tracker',
      contact: {
        name: 'Spentiva Support',
        email: 'suryansh@exyconn.com',
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
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from login/signup',
        },
      },
      schemas: {},
    },
    security: [],
  },
  apis: [
    './src/swagger/paths/*.ts',
    './src/swagger/schemas/*.ts',
  ],
};

export default swaggerJsdoc(options);
