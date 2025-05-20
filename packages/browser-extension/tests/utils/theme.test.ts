/**
 * 테마 유틸리티 테스트
 */

import {
  lightTheme,
  darkTheme,
  themeToCssVars,
  getSystemTheme,
  getUserTheme,
  saveUserTheme,
  applyTheme,
  getPreferredTheme,
  ThemeMode,
} from '../../src/utils/theme';

describe('테마 유틸리티', () => {
  // 테스트 전 localStorage 초기화
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    
    // document.documentElement의 스타일 속성 모킹
    Object.defineProperty(document.documentElement, 'style', {
      value: {
        setProperty: jest.fn(),
      },
      writable: true,
    });
    
    // classList 모킹
    Object.defineProperty(document.documentElement, 'classList', {
      value: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      writable: true,
    });
  });
  
  describe('테마 객체', () => {
    test('라이트 테마 객체가 올바른 속성을 가지고 있어야 함', () => {
      expect(lightTheme).toHaveProperty('mode', 'light');
      expect(lightTheme).toHaveProperty('colors');
      expect(lightTheme.colors).toHaveProperty('primary');
      expect(lightTheme.colors).toHaveProperty('background');
      expect(lightTheme.colors).toHaveProperty('surface');
      expect(lightTheme.colors).toHaveProperty('textPrimary');
    });
    
    test('다크 테마 객체가 올바른 속성을 가지고 있어야 함', () => {
      expect(darkTheme).toHaveProperty('mode', 'dark');
      expect(darkTheme).toHaveProperty('colors');
      expect(darkTheme.colors).toHaveProperty('primary');
      expect(darkTheme.colors).toHaveProperty('background');
      expect(darkTheme.colors).toHaveProperty('surface');
      expect(darkTheme.colors).toHaveProperty('textPrimary');
    });
  });
  
  describe('themeToCssVars', () => {
    test('테마를 CSS 변수로 변환해야 함', () => {
      const cssVars = themeToCssVars(lightTheme);
      expect(cssVars).toHaveProperty('--primary-color', lightTheme.colors.primary);
      expect(cssVars).toHaveProperty('--background-color', lightTheme.colors.background);
      expect(cssVars).toHaveProperty('--text-primary', lightTheme.colors.textPrimary);
    });
  });
  
  describe('getUserTheme', () => {
    test('저장된 테마가 없으면 null을 반환해야 함', () => {
      const theme = getUserTheme();
      expect(theme).toBeNull();
    });
    
    test('저장된 테마가 있으면 해당 테마를 반환해야 함', () => {
      localStorage.setItem('themeMode', 'dark');
      const theme = getUserTheme();
      expect(theme).toBe('dark');
    });
    
    test('유효하지 않은 테마가 저장되어 있으면 null을 반환해야 함', () => {
      localStorage.setItem('themeMode', 'invalidTheme');
      const theme = getUserTheme();
      expect(theme).toBeNull();
    });
  });
  
  describe('saveUserTheme', () => {
    test('테마를 localStorage에 저장해야 함', () => {
      saveUserTheme('dark');
      expect(localStorage.getItem('themeMode')).toBe('dark');
      
      saveUserTheme('light');
      expect(localStorage.getItem('themeMode')).toBe('light');
    });
  });
  
  describe('applyTheme', () => {
    test('라이트 테마 적용 시 다크 모드 클래스를 제거해야 함', () => {
      applyTheme('light');
      
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
      expect(document.documentElement.classList.add).not.toHaveBeenCalled();
    });
    
    test('다크 테마 적용 시 다크 모드 클래스를 추가해야 함', () => {
      applyTheme('dark');
      
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
      expect(document.documentElement.classList.remove).not.toHaveBeenCalled();
    });
    
    test('테마에 맞는 CSS 변수를 적용해야 함', () => {
      applyTheme('light');
      
      const cssVars = themeToCssVars(lightTheme);
      const setPropertyMock = document.documentElement.style.setProperty as jest.Mock;
      
      // 각 CSS 변수가 setProperty로 설정되었는지 확인
      Object.entries(cssVars).forEach(([key, value]) => {
        expect(setPropertyMock).toHaveBeenCalledWith(key, value);
      });
    });
  });
  
  describe('getPreferredTheme', () => {
    test('localStorage에 테마가 저장되어 있으면 해당 테마를 반환해야 함', () => {
      localStorage.setItem('themeMode', 'dark');
      
      const theme = getPreferredTheme();
      expect(theme).toBe('dark');
    });
    
    test('localStorage에 테마가 없으면 시스템 테마를 반환해야 함', () => {
      // 시스템 테마 함수 모킹
      jest.spyOn(window, 'matchMedia').mockImplementation((query) => {
        return {
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        } as MediaQueryList;
      });
      
      // 다크 모드 시스템 테마 테스트
      window.matchMedia = jest.fn().mockImplementation((query) => {
        return {
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      });
      
      const darkTheme = getPreferredTheme();
      expect(darkTheme).toBe('dark');
      
      // 라이트 모드 시스템 테마 테스트
      window.matchMedia = jest.fn().mockImplementation((query) => {
        return {
          matches: query !== '(prefers-color-scheme: dark)',
          media: query,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      });
      
      const lightTheme = getPreferredTheme();
      expect(lightTheme).toBe('light');
    });
  });
});