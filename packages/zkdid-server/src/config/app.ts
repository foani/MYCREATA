import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * 애플리케이션 설정
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/zkdid',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    passwordMinLength: 8,
    passwordMaxLength: 100
  },
  swagger: {
    title: process.env.SWAGGER_TITLE || 'CreLink zkDID API',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    description: process.env.SWAGGER_DESCRIPTION || 'CreLink zkDID API Documentation',
    host: process.env.SWAGGER_HOST || 'localhost:3000',
    basePath: process.env.SWAGGER_BASE_PATH || '/api',
    schemes: (process.env.SWAGGER_SCHEMES || 'http,https').split(','),
    consumes: (process.env.SWAGGER_CONSUMES || 'application/json').split(','),
    produces: (process.env.SWAGGER_PRODUCES || 'application/json').split(',')
  }
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default config;
