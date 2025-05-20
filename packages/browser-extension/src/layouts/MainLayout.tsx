/**
 * 메인 레이아웃 컴포넌트
 * 인증된 사용자를 위한 기본 레이아웃을 제공합니다.
 */

import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../popup/hooks/useWallet';
import Header from '../popup/components/Header';

interface MainLayoutProps {
  isLocked: boolean;
}

/**
 * 메인 레이아웃 컴포넌트
 * @param isLocked 지갑 잠금 상태
 */
const MainLayout: React.FC<MainLayoutProps> = ({ isLocked }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wallet, isInitialized } = useWallet();
  const { t } = useTranslation();
  
  // 인증 상태 확인
  useEffect(() => {
    if (isLocked && isInitialized) {
      // 잠금 상태인 경우 로그인 페이지로 리디렉션
      navigate('/login', { state: { from: location.pathname } });
    } else if (!wallet && isInitialized) {
      // 지갑이 없는 경우 온보딩 페이지로 리디렉션
      navigate('/onboarding');
    }
  }, [isLocked, wallet, isInitialized, navigate, location]);
  
  // 인증 상태 확인 중이거나 인증되지 않은 경우 null 반환
  if (isLocked || !wallet) {
    return null;
  }
  
  // 현재 페이지에 따른 타이틀 설정
  const getTitle = () => {
    if (location.pathname === '/wallet') return t('navigation.wallet');
    if (location.pathname === '/assets') return t('navigation.assets');
    if (location.pathname === '/nft') return t('navigation.nft');
    if (location.pathname === '/activity') return t('navigation.activity');
    if (location.pathname === '/settings') return t('navigation.settings');
    return '';
  };
  
  // 헤더 표시 여부 설정
  const showNetworkSelector = location.pathname === '/wallet' || location.pathname === '/assets';
  
  return (
    <div className="app-container theme-transition">
      {/* 헤더 영역 */}
      <Header
        title={getTitle()}
        showNetwork={showNetworkSelector}
        showSettings={false}
      />
      
      {/* 메인 컨텐츠 영역 */}
      <div className="content-container theme-transition bg-background-color dark:bg-background-color">
        <Outlet />
      </div>
      
      {/* 푸터 내비게이션 영역 */}
      <Footer />
    </div>
  );
};

/**
 * 푸터 내비게이션 컴포넌트
 */
const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // 현재 경로에 따라 활성화된 탭 결정
  const isActive = (path: string) => {
    if (path === '/wallet') {
      return location.pathname === '/wallet' || location.pathname === '/assets';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="footer theme-transition">
      <div className="flex justify-around items-center w-full">
        {/* 지갑 탭 */}
        <div
          className={`flex flex-col items-center cursor-pointer ${
            isActive('/wallet') ? 'text-primary dark:text-primary' : 'text-text-secondary dark:text-text-secondary'
          }`}
          onClick={() => navigate('/wallet')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <span className="text-xs mt-1">{t('navigation.wallet')}</span>
        </div>
        
        {/* NFT 탭 */}
        <div
          className={`flex flex-col items-center cursor-pointer ${
            isActive('/nft') ? 'text-primary dark:text-primary' : 'text-text-secondary dark:text-text-secondary'
          }`}
          onClick={() => navigate('/nft')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs mt-1">{t('navigation.nft')}</span>
        </div>
        
        {/* 활동 탭 */}
        <div
          className={`flex flex-col items-center cursor-pointer ${
            isActive('/activity') ? 'text-primary dark:text-primary' : 'text-text-secondary dark:text-text-secondary'
          }`}
          onClick={() => navigate('/activity')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span className="text-xs mt-1">{t('navigation.activity')}</span>
        </div>
        
        {/* 설정 탭 */}
        <div
          className={`flex flex-col items-center cursor-pointer ${
            isActive('/settings') ? 'text-primary dark:text-primary' : 'text-text-secondary dark:text-text-secondary'
          }`}
          onClick={() => navigate('/settings')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
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
          <span className="text-xs mt-1">{t('navigation.settings')}</span>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;