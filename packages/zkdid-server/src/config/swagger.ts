import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './app';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'zkDID Authentication API',
      version: '1.0.0',
      description: 'API documentation for zkDID Authentication Server',
      contact: {
        name: 'API Support',
        email: 'support@crelink.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/api/**/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 