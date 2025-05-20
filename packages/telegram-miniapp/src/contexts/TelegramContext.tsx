import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TelegramUser } from '../services/telegram';
import { useTelegram } from '../hooks/useTelegram';

interface TelegramContextProps {
  user: TelegramUser | null;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  isReady: boolean;
  isTelegramWebApp: boolean;
  themeStyles: {
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    linkColor: string;
    hintColor: string;
    secondaryBgColor: string;
  };
}

interface TelegramProviderProps {
  children: ReactNode;
}

const defaultThemeStyles = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  buttonColor: '#3E96FF',
  buttonTextColor: '#ffffff',
  linkColor: '#3E96FF',
  hintColor: '#999999',
  secondaryBgColor: '#f5f5f5',
};

const TelegramContext = createContext<TelegramContextProps>({
  user: null,
  colorScheme: 'light',
  isExpanded: false,
  isReady: false,
  isTelegramWebApp: false,
  themeStyles: defaultThemeStyles,
});

/**
 * Telegram 관련 컨텍스트 제공자
 * 
 * 앱 전체에서 Telegram 사용자 정보, 테마, 상태 등을 공유합니다.
 */
export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const {
    user,
    colorScheme,
    isExpanded,
    isReady,
    isTelegramWebApp,
    getThemeStyles,
  } = useTelegram();

  const [themeStyles, setThemeStyles] = useState(defaultThemeStyles);

  // 초기화 및 테마 변경 시 스타일 업데이트
  useEffect(() => {
    if (isTelegramWebApp) {
      setThemeStyles(getThemeStyles());
    }
  }, [isTelegramWebApp, colorScheme, getThemeStyles]);

  const contextValue: TelegramContextProps = {
    user,
    colorScheme,
    isExpanded,
    isReady,
    isTelegramWebApp,
    themeStyles,
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

/**
 * Telegram 컨텍스트 사용 훅
 */
export const useTelegramContext = () => useContext(TelegramContext);
