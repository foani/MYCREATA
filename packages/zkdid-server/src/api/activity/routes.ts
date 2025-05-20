import { Router } from 'express';
import { logActivity, getActivities } from './activity.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { logActivitySchema } from './activity.validation';

const router = Router();

/**
 * @route   POST /api/v1/activity/log
 * @desc    사용자 활동 로그 저장
 * @access  Private (인증 필요)
 */
router.post('/log', authMiddleware, validate(logActivitySchema), logActivity);

/**
 * @route   GET /api/v1/activity
 * @desc    사용자 활동 기록 조회
 * @access  Private (인증 필요)
 */
router.get('/', authMiddleware, getActivities);

export default router;
