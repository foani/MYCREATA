import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logging';
import { telegramService } from '../../services/telegram';
import { zkdidService } from '../../services/zkdid';
import User from '../../models/user.model';
import DID from '../../models/did.model';
import Activity from '../../models/activity.model';
import { AppError } from '../../middleware/error.middleware';
import { generateToken } from '../../utils/token';

/**
 * Telegram 인증 데이터 검증 및 사용자 인증 컨트롤러
 */
export const verifyTelegram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { initData } = req.body;

    // Telegram initData 검증
    logger.debug('Verifying Telegram initData');
    const telegramData = await telegramService.verifyInitData(initData);
    
    if (!telegramData || !telegramData.user) {
      logger.warn('Invalid Telegram initData received');
      return next(new AppError('Invalid Telegram initData', 400));
    }

    const { user: telegramUser } = telegramData;
    logger.info(`Telegram user verified: ${telegramUser.id}`);

    // 사용자 찾기 또는 생성
    let user = await User.findOne({ telegramId: telegramUser.id.toString() });
    
    if (!user) {
      logger.info(`Creating new user for Telegram ID: ${telegramUser.id}`);
      user = await User.create({
        telegramId: telegramUser.id.toString(),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || '',
        username: telegramUser.username || `tg_${telegramUser.id}`,
      });
    } else {
      // 기존 사용자 정보 업데이트
      logger.debug(`Updating existing user for Telegram ID: ${telegramUser.id}`);
      user.firstName = telegramUser.first_name;
      user.lastName = telegramUser.last_name || user.lastName;
      user.username = telegramUser.username || user.username;
      user.lastLoginAt = new Date();
      await user.save();
    }

    // 사용자의 DID 찾기 또는 생성
    let did = await DID.findOne({ userId: user._id, method: 'zktg' });
    
    if (!did) {
      logger.info(`Creating new zkDID for user: ${user._id}`);
      
      // zkDID 생성
      const didInfo = await zkdidService.generateDID({
        method: 'zktg',
        telegramId: telegramUser.id.toString(),
        userId: user._id,
      });
      
      did = await DID.create({
        did: didInfo.did,
        userId: user._id,
        method: 'zktg',
        telegramId: telegramUser.id.toString(),
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
        provider: 'telegram',
        telegramId: telegramUser.id.toString(),
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
          username: user.username,
          did: did.did,
          walletAddresses: did.walletAddresses,
        },
      },
    });
  } catch (error) {
    logger.error('Error in verifyTelegram:', error);
    next(new AppError('Authentication failed', 500));
  }
};
