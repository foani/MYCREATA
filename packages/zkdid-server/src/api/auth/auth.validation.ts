import { Schema } from 'express-validator';

/**
 * Telegram 인증 요청 검증 스키마
 */
export const telegramSchema: Schema = {
  initData: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Telegram initData is required',
    },
    isString: {
      errorMessage: 'Telegram initData must be a string',
    },
  },
};

/**
 * Google 인증 요청 검증 스키마
 */
export const googleSchema: Schema = {
  idToken: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Google ID token is required',
    },
    isString: {
      errorMessage: 'Google ID token must be a string',
    },
  },
};
