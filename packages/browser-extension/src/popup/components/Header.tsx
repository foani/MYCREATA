/**
 * Header.tsx
 * 앱 상단 헤더 컴포넌트
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NetworkSelector from './NetworkSelector';
import ThemeToggle from './common/ThemeToggle';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  showNetwork?: boolean;
  onSettingsClick?: () => void;
}

/**
 * 헤더 컴포넌트
 * @param title 제목
 * @param showBack 뒤로가기 버튼 표시 여부
 * @param showSettings 설정 버튼 표시 여부
 * @param showNetwork 네트워크 선택기 표시 여부
 * @param onSettingsClick 설정 버튼 클릭 핸들러
 */
const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showSettings = false,
  showNetwork = false,
  onSettingsClick
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleSettings = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      navigate('/settings');
    }
  };
  
  return (
    <header className="theme-transition p-4 border-b border-border-color flex items-center justify-between bg-surface-color dark:bg-surface-color">
      <div className="flex items-center">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            aria-label={t('actions.back')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-text-primary dark:text-text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        {title && (
          <h1 className="text-lg font-bold text-text-primary dark:text-text-primary">
            {title}
          </h1>
        )}
      </div>
      
      <div className="flex items-center">
        {showNetwork && <NetworkSelector className="mr-2" />}
        
        <ThemeToggle className="mr-2" />
        
        {showSettings && (
          <button
            onClick={handleSettings}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            aria-label={t('settings.general')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-text-primary dark:text-text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;