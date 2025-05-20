import { Router } from 'express';
import authRoutes from './auth/routes';
import didRoutes from './did/routes';
import activityRoutes from './activity/routes';

const router = Router();

// API 버전 접두사
const API_VERSION = 'v1';

// 헬스 체크 엔드포인트
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy and running',
  });
});

// 인증 관련 라우트
router.use(`/${API_VERSION}/auth`, authRoutes);

// DID 관련 라우트
router.use(`/${API_VERSION}/did`, didRoutes);

// 활동 관련 라우트
router.use(`/${API_VERSION}/activity`, activityRoutes);

export default router;
