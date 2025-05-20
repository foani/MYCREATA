import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(401, message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`[${err.statusCode}] ${err.message}`);
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // MongoDB duplicate key error
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    logger.error(`[409] Duplicate key error: ${err.message}`);
    return res.status(409).json({
      status: 'error',
      message: 'Duplicate entry'
    });
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    logger.error(`[400] Validation error: ${err.message}`);
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    logger.error(`[401] JWT error: ${err.message}`);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    logger.error(`[401] Token expired: ${err.message}`);
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // Default error
  logger.error(`[500] Internal server error: ${err.message}`);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}; 