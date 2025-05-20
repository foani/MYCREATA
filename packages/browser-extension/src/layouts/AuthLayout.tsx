/**
 * 인증 레이아웃 컴포넌트
 * 인증되지 않은 사용자를 위한 레이아웃을 제공합니다.
 */

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="app-container">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 py-4 px-4 flex items-center">
        <button
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
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
        <div className="flex-1 flex justify-center">
          <img
            src="../../common/assets/images/logo.png"
            alt="CreLink Logo"
            className="h-8"
          />
        </div>
        <div className="w-5"></div> {/* 균형을 위한 빈 공간 */}
      </header>
      
      {/* 메인 컨텐츠 영역 */}
      <div className="content-container">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;