/**
 * @file index.ts
 * @description CreLink 지갑 핵심 라이브러리의 메인 진입점
 */

/**
 * 인증 모듈 내보내기
 */
export * from './auth';

/**
 * 체인 관련 모듈 내보내기
 */
// export * from './chain';

/**
 * 암호화 및 키 관리 모듈 내보내기
 */
// export * from './crypto';

/**
 * 스토리지 모듈 내보내기
 */
export * from './storage';

/**
 * 유틸리티 모듈 내보내기
 */
export * from './utils';

/**
 * 라이브러리 버전
 */
export const VERSION = '0.1.0';
