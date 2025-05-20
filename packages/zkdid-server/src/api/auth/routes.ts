import { Router } from 'express';
import { verifyTelegram } from './verifyTelegram.controller';
import { verifyGoogle } from './verifyGoogle.controller';
import { validate } from '../../middleware/validation.middleware';
import { telegramSchema, googleSchema } from './auth.validation';

const router = Router();

/**
 * @route   POST /api/v1/auth/telegram
 * @desc    Telegram 인증 데이터 검증 및 사용자 인증
 * @access  Public
 */
router.post('/telegram', validate(telegramSchema), verifyTelegram);

/**
 * @route   POST /api/v1/auth/google
 * @desc    Google OAuth 토큰 검증 및 사용자 인증
 * @access  Public
 */
router.post('/google', validate(googleSchema), verifyGoogle);

export default router;
