import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logging';
import DID from '../../models/did.model';
import Activity from '../../models/activity.model';
import { AppError } from '../../middleware/error.middleware';

/**
 * 사용자 활동 로그 저장 컨트롤러
 */
export const logActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activityType, action, walletAddress, status, metadata } = req.body;
    const userId = req.user._id;

    // 사용자의 DID 조회
    const did = await DID.findOne({ userId });
    
    if (!did) {
      return next(new AppError('DID not found for this user', 404));
    }

    // 활동 로그 생성
    const activity = await Activity.create({
      userId,
      didId: did._id,
      did: did.did,
      activityType,
      action,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      walletAddress,
      status: status || 'success',
      metadata,
    });

    // 응답 반환
    res.status(201).json({
      status: 'success',
      message: 'Activity logged successfully',
      data: {
        activityId: activity._id,
      },
    });
  } catch (error) {
    logger.error('Error in logActivity:', error);
    next(new AppError('Failed to log activity', 500));
  }
};

/**
 * 사용자 활동 기록 조회 컨트롤러
 */
export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    
    // 페이지네이션 파라미터
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // 필터링 파라미터
    const activityType = req.query.type as string;
    const walletAddress = req.query.wallet as string;
    
    // 기본 쿼리 객체
    const queryObj: any = { userId };
    
    // 필터 적용
    if (activityType) {
      queryObj.activityType = activityType;
    }
    
    if (walletAddress) {
      queryObj.walletAddress = walletAddress;
    }
    
    // 활동 기록 조회
    const activities = await Activity.find(queryObj)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // 총 기록 수 조회
    const total = await Activity.countDocuments(queryObj);
    
    // 응답 반환
    res.status(200).json({
      status: 'success',
      results: activities.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: {
        activities,
      },
    });
  } catch (error) {
    logger.error('Error in getActivities:', error);
    next(new AppError('Failed to retrieve activities', 500));
  }
};
