/**
 * 승인 레이아웃 컴포넌트
 * 승인 요청 화면을 위한 레이아웃을 제공합니다.
 */

import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '../popup/hooks/useWallet';

interface ApprovalLayoutProps {
  isLocked: boolean;
}

/**
 * 승인 레이아웃 컴포넌트
 * @param isLocked 지갑 잠금 상태
 */
const ApprovalLayout: React.FC<ApprovalLayoutProps> = ({ isLocked }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { wallet, isInitialized } = useWallet();
  
  // 인증 상태 확인
  useEffect(() => {
    if (isLocked && isInitialized) {
      // 잠금 상태인 경우 로그인 페이지로 리디렉션
      // 현재 URL을 state로 저장하여 로그인 후 돌아올 수 있도록 함
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
  
  return (
    <div className="app-container">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 flex items-center">
        <div className="flex-1 flex justify-center">
          <div className="text-center">
            <h1 className="text-lg font-bold">요청 승인</h1>
            <p className="text-xs text-gray-500">
              다음 요청을 검토하고 승인하세요.
            </p>
          </div>
        </div>
      </header>
      
      {/* 메인 컨텐츠 영역 */}
      <div className="content-container">
        <Outlet />
      </div>
    </div>
  );
};

export default ApprovalLayout;