/**
 * 팝업 애플리케이션 메인 컴포넌트
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routes';
import { WalletProvider } from './context/WalletContext';
import { NetworkProvider } from './context/NetworkContext';
import { UIProvider } from './context/UIContext';
import { I18nProvider } from './context/I18nContext';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ApprovalLayout from '../layouts/ApprovalLayout';
import { applyTheme, getPreferredTheme } from '../utils/theme';

// 초기 로딩 컴포넌트
const Loading = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-pulse flex flex-col items-center">
      <img src="../../common/assets/images/logo.png" alt="CreLink Logo" className="w-16 h-16 mb-4" />
      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">로딩 중...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  
  // 테마 적용
  useEffect(() => {
    const theme = getPreferredTheme();
    applyTheme(theme);
  }, []);
  
  // 초기 상태 확인
  useEffect(() => {
    const checkInitialState = async () => {
      try {
        // 확장 프로그램 상태 확인
        const isInitializedResult = await chrome.runtime.sendMessage({
          type: 'internal',
          method: 'isInitialized'
        });
        
        setIsInitialized(isInitializedResult.result);
        
        // 지갑 존재 여부 확인
        const hasWalletResult = await chrome.runtime.sendMessage({
          type: 'internal',
          method: 'hasWallet'
        });
        
        setHasWallet(hasWalletResult.result);
        
        // 지갑 잠금 상태 확인
        const isLockedResult = await chrome.runtime.sendMessage({
          type: 'internal',
          method: 'isLocked'
        });
        
        setIsLocked(isLockedResult.result);
      } catch (error) {
        console.error('초기 상태 확인 중 오류:', error);
        // 오류 발생 시 기본값 설정
        setIsInitialized(true);
        setHasWallet(false);
        setIsLocked(true);
      }
    };
    
    checkInitialState();
  }, []);
  
  // 초기화되지 않은 경우 로딩 표시
  if (isInitialized === null || hasWallet === null || isLocked === null) {
    return <Loading />;
  }
  
  // 지갑이 없는 경우 온보딩으로 리디렉션
  const initialRoute = !hasWallet
    ? '/onboarding'
    : isLocked
      ? '/login'
      : '/wallet';
  
  return (
    <Router>
      <UIProvider>
        <I18nProvider>
          <NetworkProvider>
            <WalletProvider>
              <div className="theme-transition">
                <Routes>
                  {/* 기본 리디렉션 */}
                  <Route path="/" element={<Navigate to={initialRoute} replace />} />
                  
                  {/* 인증 관련 라우트 */}
                  <Route element={<AuthLayout />}>
                    {routes.auth.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                  </Route>
                  
                  {/* 메인 라우트 (인증 필요) */}
                  <Route element={<MainLayout isLocked={isLocked} />}>
                    {routes.main.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={isLocked ? <Navigate to="/login" replace /> : route.element}
                      />
                    ))}
                  </Route>
                  
                  {/* 승인 요청 라우트 */}
                  <Route element={<ApprovalLayout isLocked={isLocked} />}>
                    {routes.approval.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={isLocked ? <Navigate to="/login" replace /> : route.element}
                      />
                    ))}
                  </Route>
                  
                  {/* 404 페이지 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </WalletProvider>
          </NetworkProvider>
        </I18nProvider>
      </UIProvider>
    </Router>
  );
};

export default App;