import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logging';

/**
 * 사용자 정의 에러 클래스
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 개발 환경에서의 에러 응답
 */
const sendDevError = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * 프로덕션 환경에서의 에러 응답
 */
const sendProdError = (err: AppError, res: Response) => {
  // 운영상 에러는 클라이언트에게 세부 정보 전달
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 프로그래밍 에러나 알 수 없는 에러는 세부 정보 숨김
    logger.error('ERROR 💥:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

/**
 * 몽고DB 에러 처리
 */
const handleMongoDBError = (err: any) => {
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(`Duplicate field value: ${field}. Please use another value!`, 400);
  }
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val: any) => val.message);
    return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
  }
  
  return new AppError('Database error', 500);
};

/**
 * JWT 에러 처리
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

/**
 * 글로벌 에러 핸들러 미들웨어
 */
export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError' || err.name === 'ValidationError' || err.code === 11000) {
      error = handleMongoDBError(err);
    }
    
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendProdError(error, res);
  }
};
