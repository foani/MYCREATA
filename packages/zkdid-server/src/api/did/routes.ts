import { Router } from 'express';
import { resolve, associate, verify } from './did.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { associateSchema, verifySchema } from './did.validation';

const router = Router();

/**
 * @route   GET /api/v1/did/resolve/:id
 * @desc    DID 식별자로 DID 문서 조회
 * @access  Public
 */
router.get('/resolve/:id', resolve);

/**
 * @route   POST /api/v1/did/associate
 * @desc    DID와 지갑 주소 연결
 * @access  Private (인증 필요)
 */
router.post('/associate', authMiddleware, validate(associateSchema), associate);

/**
 * @route   POST /api/v1/did/verify
 * @desc    DID 기반 서명 검증
 * @access  Public
 */
router.post('/verify', validate(verifySchema), verify);

export default router;
