import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/app';
import { AppError } from './error.middleware';
import { logger } from '../utils/logging';
import User from '../models/user.model';

// JWT 토큰에서 추출된 페이로드 타입 정의
interface JwtPayload {
  id: string;
  did?: string;
  iat: number;
  exp: number;
}

// Request 객체에 user 필드 추가
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * 인증 미들웨어
 * JWT 토큰을 검증하고 요청 객체에 사용자 정보를 추가합니다.
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Authorization 헤더 확인
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      // 쿠키에서 토큰 확인
      token = req.cookies.jwt;
    }

    // 토큰이 없는 경우
    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 토큰 검증
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // 사용자 조회
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 비밀번호 변경 여부 확인 (선택 사항)
    if (currentUser.passwordChangedAt && decoded.iat) {
      const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
      if (changedTimestamp > decoded.iat) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
      }
    }

    // 요청 객체에 사용자 정보 추가
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(new AppError('Authentication failed', 401));
  }
};

/**
 * 권한 제한 미들웨어
 * 특정 역할을 가진 사용자만 접근할 수 있도록 제한합니다.
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
