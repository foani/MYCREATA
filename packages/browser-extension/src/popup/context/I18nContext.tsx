/**
 * I18nContext.tsx
 * 국제화(i18n) 상태 및 기능을 관리하는 컨텍스트
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, LANGUAGES } from '../../i18n';
import { useWallet } from '../hooks/useWallet';

// 컨텍스트 타입 정의
interface I18nContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  availableLanguages: { [key: string]: string };
}

// 기본 컨텍스트 값
const defaultContextValue: I18nContextType = {
  language: 'ko',
  changeLanguage: () => {},
  availableLanguages: LANGUAGES,
};

// 컨텍스트 생성
const I18nContext = createContext<I18nContextType>(defaultContextValue);

// Props 타입 정의
interface I18nProviderProps {
  children: ReactNode;
}

/**
 * I18n 프로바이더 컴포넌트
 * @param children 자식 컴포넌트
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const { settings, updateSettings } = useWallet();
  const [language, setLanguage] = useState(getCurrentLanguage());
  
  // 초기 언어 설정
  useEffect(() => {
    // 지갑 설정에서 언어 설정 가져오기
    const settingsLanguage = settings?.language;
    if (settingsLanguage && settingsLanguage !== language) {
      handleChangeLanguage(settingsLanguage);
    }
  }, [settings]);
  
  /**
   * 언어 변경 핸들러
   * @param lang 변경할 언어 코드
   */
  const handleChangeLanguage = (lang: string) => {
    changeLanguage(lang);
    setLanguage(lang);
    
    // 지갑 설정 업데이트
    updateSettings({ language: lang });
  };
  
  // 컨텍스트 값
  const contextValue: I18nContextType = {
    language,
    changeLanguage: handleChangeLanguage,
    availableLanguages: LANGUAGES,
  };
  
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

/**
 * I18n 컨텍스트 훅
 * @returns I18n 컨텍스트 값
 */
export const useI18n = () => {
  return useContext(I18nContext);
};