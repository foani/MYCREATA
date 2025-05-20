import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { MMKV } from 'react-native-mmkv';
import { colors } from '../constants/theme';

// 스토리지 인스턴스 생성
const storage = new MMKV();

// 테마 타입
type ThemeMode = 'light' | 'dark' | 'system';

// 테마 컨텍스트 타입
interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  colors: typeof colors.light | typeof colors.dark;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

// 기본값으로 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  isDarkMode: false,
  colors: colors.light,
  setThemeMode: () => {},
  toggleThemeMode: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
  systemTheme?: 'light' | 'dark' | null;
}

/**
 * 테마 프로바이더 컴포넌트
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  systemTheme = 'light',
}) => {
  // 로컬 스토리지에서 테마 모드 불러오기
  const savedThemeMode = storage.getString('themeMode') as ThemeMode | undefined;
  const [themeMode, setThemeMode] = useState<ThemeMode>(savedThemeMode || 'system');
  
  // 현재 다크 모드 사용 여부 계산
  const isDarkMode = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemTheme === 'dark');

  // 현재 테마 색상 계산
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // 테마 모드 변경 시 스토리지에 저장
  useEffect(() => {
    storage.set('themeMode', themeMode);
  }, [themeMode]);

  // 테마 모드 토글 함수
  const toggleThemeMode = () => {
    if (themeMode === 'system') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  // 컨텍스트 값
  const contextValue: ThemeContextType = {
    themeMode,
    isDarkMode,
    colors: currentColors,
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
 * 테마 컨텍스트 사용 훅
 */
export const useTheme = () => useContext(ThemeContext);
