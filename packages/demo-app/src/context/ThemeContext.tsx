import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 테마 모드 타입
export type ThemeMode = 'light' | 'dark';

// ThemeContext 인터페이스
interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

// 기본 컨텍스트 값
const defaultContextValue: ThemeContextType = {
  themeMode: 'light',
  setThemeMode: () => {},
  toggleThemeMode: () => {},
};

// ThemeContext 생성
const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

// Props 타입 정의
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * 테마 프로바이더 컴포넌트
 * @param children 자식 컴포넌트
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 테마 상태
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  
  // 초기 테마 설정
  useEffect(() => {
    // 저장된 테마 또는 시스템 설정에 따른 초기 테마
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode | null;
    const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemDarkMode ? 'dark' : 'light');
    
    setThemeModeState(initialTheme);
    applyTheme(initialTheme);
    
    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const userTheme = localStorage.getItem('themeMode');
      if (!userTheme) {
        const newMode: ThemeMode = e.matches ? 'dark' : 'light';
        setThemeModeState(newMode);
        applyTheme(newMode);
      }
    };
    
    // 이벤트 리스너 추가
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 이전 버전 브라우저 지원
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  /**
   * 테마 모드 설정
   * @param mode 테마 모드
   */
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('themeMode', mode);
    applyTheme(mode);
  };
  
  /**
   * 테마 모드 토글
   */
  const toggleThemeMode = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };
  
  /**
   * 테마 적용
   * @param mode 테마 모드
   */
  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };
  
  // 컨텍스트 값
  const contextValue: ThemeContextType = {
    themeMode,
    setThemeMode,
    toggleThemeMode,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 테마 컨텍스트 훅
 * @returns 테마 컨텍스트 값
 */
export const useTheme = () => {
  return useContext(ThemeContext);
};