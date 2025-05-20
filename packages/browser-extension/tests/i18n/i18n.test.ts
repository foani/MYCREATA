/**
 * i18n 설정 테스트
 */

import i18n, { changeLanguage, getCurrentLanguage, LANGUAGES } from '../../src/i18n';

// i18next 모듈 모킹
jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn(),
  t: jest.fn((key) => key),
  changeLanguage: jest.fn(),
  language: 'ko',
}));

describe('i18n 설정', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('LANGUAGES에는 지원하는 모든 언어가 포함되어 있어야 함', () => {
    expect(LANGUAGES).toHaveProperty('ko');
    expect(LANGUAGES).toHaveProperty('en');
    expect(LANGUAGES).toHaveProperty('ja');
    expect(LANGUAGES).toHaveProperty('vi');
  });
  
  test('changeLanguage 함수가 i18n.changeLanguage를 호출하고 localStorage에 저장해야 함', () => {
    // localStorage.setItem 모킹
    const localStorageSetItemSpy = jest.spyOn(localStorage, 'setItem');
    
    changeLanguage('en');
    
    // i18n.changeLanguage가 호출되었는지 확인
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
    
    // localStorage에 저장되었는지 확인
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('i18nextLng', 'en');
  });
  
  test('getCurrentLanguage 함수가 현재 언어 코드를 반환해야 함', () => {
    // i18n.language를 모킹
    Object.defineProperty(i18n, 'language', {
      get: jest.fn(() => 'ko-KR'),
    });
    
    const language = getCurrentLanguage();
    
    // 언어 코드의 처음 2글자만 반환해야 함
    expect(language).toBe('ko');
  });
});