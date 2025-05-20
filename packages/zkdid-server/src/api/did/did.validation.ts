import { Schema } from 'express-validator';

/**
 * DID와 지갑 주소 연결 요청 검증 스키마
 */
export const associateSchema: Schema = {
  walletAddress: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Wallet address is required',
    },
    isString: {
      errorMessage: 'Wallet address must be a string',
    },
    matches: {
      options: /^0x[a-fA-F0-9]{40}$/,
      errorMessage: 'Invalid Ethereum wallet address format',
    },
  },
  signature: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Signature is required',
    },
    isString: {
      errorMessage: 'Signature must be a string',
    },
  },
  message: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Message is required',
    },
    isString: {
      errorMessage: 'Message must be a string',
    },
  },
};

/**
 * DID 서명 검증 요청 스키마
 */
export const verifySchema: Schema = {
  did: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'DID is required',
    },
    isString: {
      errorMessage: 'DID must be a string',
    },
  },
  signature: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Signature is required',
    },
    isString: {
      errorMessage: 'Signature must be a string',
    },
  },
  message: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Message is required',
    },
    isString: {
      errorMessage: 'Message must be a string',
    },
  },
};
