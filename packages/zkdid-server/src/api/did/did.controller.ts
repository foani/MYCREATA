import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logging';
import { zkdidService } from '../../services/zkdid';
import { cryptoService } from '../../services/crypto';
import DID from '../../models/did.model';
import Activity from '../../models/activity.model';
import { AppError } from '../../middleware/error.middleware';

/**
 * DID 식별자로 DID 문서 조회 컨트롤러
 */
export const resolve = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // DID 식별자 검증
    if (!id || !id.startsWith('did:')) {
      return next(new AppError('Invalid DID format', 400));
    }

    // DID 문서 조회
    const did = await DID.findOne({ did: id });
    
    if (!did) {
      return next(new AppError('DID not found', 404));
    }

    // DID 문서 포맷팅
    const didDocument = zkdidService.formatDIDDocument(did);

    // 응답 반환
    res.status(200).json({
      status: 'success',
      data: {
        didDocument,
      },
    });
  } catch (error) {
    logger.error('Error in DID resolve:', error);
    next(new AppError('Failed to resolve DID', 500));
  }
};

/**
 * DID와 지갑 주소 연결 컨트롤러
 */
export const associate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, signature, message } = req.body;
    const userId = req.user._id;

    // DID 조회
    const did = await DID.findOne({ userId });
    
    if (!did) {
      return next(new AppError('DID not found for this user', 404));
    }

    // 서명 검증
    const isValid = await cryptoService.verifyWalletSignature(walletAddress, message, signature);
    
    if (!isValid) {
      logger.warn(`Invalid signature for wallet association: ${walletAddress}`);
      return next(new AppError('Invalid signature', 400));
    }

    // 이미 연결된 지갑인지 확인
    if (did.walletAddresses.includes(walletAddress)) {
      return res.status(200).json({
        status: 'success',
        message: 'Wallet address already associated with this DID',
        data: {
          did: did.did,
          walletAddresses: did.walletAddresses,
        },
      });
    }

    // 지갑 주소 추가
    did.walletAddresses.push(walletAddress);
    await did.save();

    // 활동 기록
    await Activity.create({
      userId,
      didId: did._id,
      did: did.did,
      activityType: 'wallet',
      action: 'associate',
      walletAddress,
      status: 'success',
      metadata: {
        message,
      },
    });

    // 응답 반환
    res.status(200).json({
      status: 'success',
      message: 'Wallet address successfully associated with DID',
      data: {
        did: did.did,
        walletAddresses: did.walletAddresses,
      },
    });
  } catch (error) {
    logger.error('Error in DID associate:', error);
    next(new AppError('Failed to associate wallet with DID', 500));
  }
};

/**
 * DID 기반 서명 검증 컨트롤러
 */
export const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { did: didId, signature, message } = req.body;

    // DID 조회
    const did = await DID.findOne({ did: didId });
    
    if (!did) {
      return next(new AppError('DID not found', 404));
    }

    // DID 기반 서명 검증
    const verificationResult = await zkdidService.verifySignature(did, message, signature);
    
    // 활동 기록
    await Activity.create({
      userId: did.userId,
      didId: did._id,
      did: did.did,
      activityType: 'auth',
      action: 'verify',
      status: verificationResult.isValid ? 'success' : 'failed',
      metadata: {
        message,
        verification: verificationResult,
      },
    });

    // 응답 반환
    if (verificationResult.isValid) {
      res.status(200).json({
        status: 'success',
        message: 'Signature successfully verified',
        data: {
          did: did.did,
          isValid: true,
          verificationMethod: verificationResult.method,
        },
      });
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid signature',
        data: {
          did: did.did,
          isValid: false,
          error: verificationResult.error,
        },
      });
    }
  } catch (error) {
    logger.error('Error in DID verify:', error);
    next(new AppError('Failed to verify signature', 500));
  }
};
