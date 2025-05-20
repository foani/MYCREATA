/**
 * theme.ts
 * 테마 관련 유틸리티 및 타입 정의
 */

// 테마 타입 정의
export type ThemeMode = 'light' | 'dark';

// 테마 인터페이스
export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    background: string;
    surface: string;
    surfaceLight: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    border: string;
  };
}

// 라이트 테마 정의
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#0066FF',
    primaryLight: '#338AFF',
    primaryDark: '#0052CC',
    secondary: '#4D32C0',
    secondaryLight: '#6A50D0',
    secondaryDark: '#3A249D',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceLight: '#F8F9FA',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#0066FF',
    textPrimary: '#1C1C1E',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
    textInverse: '#FFFFFF',
    border: '#E5E5EA',
  },
};

// 다크 테마 정의
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#0066FF',
    primaryLight: '#338AFF',
    primaryDark: '#0052CC',
    secondary: '#4D32C0',
    secondaryLight: '#6A50D0',
    secondaryDark: '#3A249D',
    background: '#000000',
    surface: '#1C1C1E',
    surfaceLight: '#2C2C2E',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
    info: '#0A84FF',
    textPrimary: '#FFFFFF',
    textSecondary: '#AEAEB2',
    textTertiary: '#636366',
    textInverse: '#1C1C1E',
    border: '#38383A',
  },
};

/**
 * 테마 색상을 CSS 변수로 변환
 * @param theme 테마 객체
 * @returns 변환된 CSS 스타일 객체
 */
export const themeToCssVars = (theme: Theme): Record<string, string> => {
  return {
    '--primary-color': theme.colors.primary,
    '--primary-color-light': theme.colors.primaryLight,
    '--primary-color-dark': theme.colors.primaryDark,
    '--secondary-color': theme.colors.secondary,
    '--secondary-color-light': theme.colors.secondaryLight,
    '--secondary-color-dark': theme.colors.secondaryDark,
    '--background-color': theme.colors.background,
    '--surface-color': theme.colors.surface,
    '--surface-color-light': theme.colors.surfaceLight,
    '--error-color': theme.colors.error,
    '--success-color': theme.colors.success,
    '--warning-color': theme.colors.warning,
    '--info-color': theme.colors.info,
    '--text-primary': theme.colors.textPrimary,
    '--text-secondary': theme.colors.textSecondary,
    '--text-tertiary': theme.colors.textTertiary,
    '--text-inverse': theme.colors.textInverse,
    '--border-color': theme.colors.border,
  };
};

/**
 * 현재 시스템 테마 모드 감지
 * @returns 시스템 테마 모드
 */
export const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

/**
 * 사용자가 선택한 테마 모드 불러오기
 * @returns 저장된 테마 모드 또는 null
 */
export const getUserTheme = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null;
  
  const savedTheme = localStorage.getItem('themeMode');
  return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : null;
};

/**
 * 사용자 테마 모드 저장
 * @param mode 테마 모드
 */
export const saveUserTheme = (mode: ThemeMode): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('themeMode', mode);
};

/**
 * 테마 모드 적용
 * @param mode 테마 모드
 */
export const applyTheme = (mode: ThemeMode): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  const cssVars = themeToCssVars(theme);
  
  const root = document.documentElement;
  
  // CSS 변수 설정
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // 다크 모드 클래스 설정
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

/**
 * 최적의 테마 모드 계산
 * - 사용자 설정 → 시스템 설정 순으로 확인
 * @returns 테마 모드
 */
export const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  
  const userTheme = getUserTheme();
  if (userTheme) return userTheme;
  
  return getSystemTheme();
};