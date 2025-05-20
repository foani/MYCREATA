/**
 * i18n/index.ts
 * 국제화(i18n) 설정 및 초기화
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 파일 가져오기
import koCommon from '../../../common/i18n/ko/common.json';
import enCommon from '../../../common/i18n/en/common.json';
import jaCommon from '../../../common/i18n/ja/common.json';
import viCommon from '../../../common/i18n/vi/common.json';

/**
 * 지원하는 언어 코드
 */
export const LANGUAGES = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  vi: 'Tiếng Việt',
};

/**
 * 네임스페이스 정의
 */
export const namespaces = {
  common: 'common',
};

/**
 * i18n 초기화
 */
i18n
  // 브라우저 언어 자동 감지
  .use(LanguageDetector)
  // React와 통합
  .use(initReactI18next)
  // 초기화
  .init({
    // 리소스 정의
    resources: {
      ko: {
        [namespaces.common]: koCommon,
      },
      en: {
        [namespaces.common]: enCommon,
      },
      ja: {
        [namespaces.common]: jaCommon,
      },
      vi: {
        [namespaces.common]: viCommon,
      },
    },
    // 기본 언어
    fallbackLng: 'ko',
    // 디버그 모드 (개발 환경에서만 true)
    debug: process.env.NODE_ENV === 'development',
    // 기본 네임스페이스
    defaultNS: namespaces.common,
    // 키 구분자 (중첩된 키 구분)
    keySeparator: '.',
    // 인터폴레이션 설정
    interpolation: {
      escapeValue: false, // React에서는 이스케이핑하지 않음
    },
    // 감지 옵션
    detection: {
      // 저장 옵션
      caches: ['localStorage'],
      // 언어 변경 시 localStorage에 저장
      lookupLocalStorage: 'i18nextLng',
    },
  });

/**
 * 언어 변경 함수
 * @param lng 변경할 언어 코드
 */
export const changeLanguage = (lng: string): void => {
  i18n.changeLanguage(lng);
  localStorage.setItem('i18nextLng', lng);
};

/**
 * 현재 언어 코드 반환
 * @returns 현재 언어 코드
 */
export const getCurrentLanguage = (): string => {
  return i18n.language.substring(0, 2);
};

export default i18n;