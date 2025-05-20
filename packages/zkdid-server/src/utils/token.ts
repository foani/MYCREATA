import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { config } from '../config/app';
import { logger } from './logging';

/**
 * JWT 토큰 생성 함수
 * 
 * @param userId 사용자 ID
 * @param did DID 식별자
 * @returns JWT 토큰
 */
export const generateToken = (userId: Types.ObjectId | string, did?: string): string => {
  try {
    const payload = {
      id: userId,
      did,
    };

    const options = {
      expiresIn: config.jwt.expiresIn,
    };

    return jwt.sign(payload, config.jwt.secret, options);
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Failed to generate token');
  }
};

/**
 * JWT 토큰 검증 함수
 * 
 * @param token JWT 토큰
 * @returns 검증 결과 및 페이로드
 */
export const verifyToken = (token: string): { valid: boolean; payload?: any; error?: string } => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return { valid: true, payload: decoded };
  } catch (error) {
    logger.error('Error verifying JWT token:', error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Invalid token' 
    };
  }
};
