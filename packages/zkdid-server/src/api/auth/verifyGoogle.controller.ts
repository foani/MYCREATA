import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logging';
import { googleService } from '../../services/google';
import { zkdidService } from '../../services/zkdid';
import User from '../../models/user.model';
import DID from '../../models/did.model';
import Activity from '../../models/activity.model';
import { AppError } from '../../middleware/error.middleware';
import { generateToken } from '../../utils/token';

/**
 * Google OAuth 토큰 검증 및 사용자 인증 컨트롤러
 */
export const verifyGoogle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;

    // Google ID 토큰 검증
    logger.debug('Verifying Google ID token');
    const payload = await googleService.verifyIdToken(idToken);
    
    if (!payload) {
      logger.warn('Invalid Google ID token received');
      return next(new AppError('Invalid Google ID token', 400));
    }

    const { sub: googleId, email, given_name, family_name } = payload;
    logger.info(`Google user verified: ${googleId}, email: ${email}`);

    // 사용자 찾기 또는 생성
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email: email && email.toLowerCase() }
      ]
    });
    
    if (!user) {
      logger.info(`Creating new user for Google ID: ${googleId}`);
      user = await User.create({
        googleId,
        email: email && email.toLowerCase(),
        firstName: given_name || 'Google',
        lastName: family_name || 'User',
        username: email ? email.split('@')[0] : `gg_${googleId.substring(0, 8)}`,
      });
    } else {
      // 기존 사용자 정보 업데이트
      logger.debug(`Updating existing user for Google ID: ${googleId}`);
      
      // 기존 구글 계정이 없는 경우 연결
      if (!user.googleId) {
        user.googleId = googleId;
      }
      
      user.email = email || user.email;
      user.firstName = given_name || user.firstName;
      user.lastName = family_name || user.lastName;
      user.lastLoginAt = new Date();
      await user.save();
    }

    // 사용자의 DID 찾기 또는 생성
    let did = await DID.findOne({ userId: user._id, method: 'zkgg' });
    
    if (!did) {
      logger.info(`Creating new zkDID for user: ${user._id}`);
      
      // zkDID 생성
      const didInfo = await zkdidService.generateDID({
        method: 'zkgg',
        googleId,
        userId: user._id,
      });
      
      did = await DID.create({
        did: didInfo.did,
        userId: user._id,
        method: 'zkgg',
        googleId,
        publicKey: didInfo.publicKey,
        proofValue: didInfo.proofValue,
      });
    }

    // 로그인 활동 기록
    await Activity.create({
      userId: user._id,
      didId: did._id,
      did: did.did,
      activityType: 'auth',
      action: 'login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
      metadata: {
        provider: 'google',
        googleId,
        email,
      },
    });

    // JWT 토큰 생성
    const token = generateToken(user._id, did.did);

    // 응답 반환
    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          did: did.did,
          walletAddresses: did.walletAddresses,
        },
      },
    });
  } catch (error) {
    logger.error('Error in verifyGoogle:', error);
    next(new AppError('Authentication failed', 500));
  }
};
