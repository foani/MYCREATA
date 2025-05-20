import { Schema } from 'express-validator';

/**
 * 활동 로그 저장 요청 검증 스키마
 */
export const logActivitySchema: Schema = {
  activityType: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Activity type is required',
    },
    isString: {
      errorMessage: 'Activity type must be a string',
    },
    isIn: {
      options: [['auth', 'wallet', 'dapp', 'mission', 'referral', 'admin', 'other']],
      errorMessage: 'Invalid activity type',
    },
  },
  action: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Action is required',
    },
    isString: {
      errorMessage: 'Action must be a string',
    },
  },
  walletAddress: {
    in: ['body'],
    optional: true,
    isString: {
      errorMessage: 'Wallet address must be a string',
    },
    matches: {
      options: /^0x[a-fA-F0-9]{40}$/,
      errorMessage: 'Invalid Ethereum wallet address format',
    },
  },
  status: {
    in: ['body'],
    optional: true,
    isString: {
      errorMessage: 'Status must be a string',
    },
    isIn: {
      options: [['success', 'failed']],
      errorMessage: 'Status must be either "success" or "failed"',
    },
  },
  metadata: {
    in: ['body'],
    optional: true,
    isObject: {
      errorMessage: 'Metadata must be an object',
    },
  },
};
