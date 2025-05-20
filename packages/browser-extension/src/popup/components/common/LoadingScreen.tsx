/**
 * 로딩 화면 컴포넌트
 * 데이터 로딩 중이거나 처리 중일 때 표시되는 로딩 화면
 */

import React from 'react';

// 로딩 화면 Props 타입
export interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  transparent?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 로딩 화면 컴포넌트
 * @param message 로딩 메시지 (기본값: '로딩 중...')
 * @param fullScreen 전체 화면 모드 (기본값: false)
 * @param transparent 배경 투명 여부 (기본값: false)
 * @param size 로딩 인디케이터 크기 (기본값: 'md')
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = '로딩 중...',
  fullScreen = false,
  transparent = false,
  size = 'md'
}) => {
  // 크기별 스타일
  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  // 컨테이너 스타일
  const containerStyles = `
    flex flex-col items-center justify-center
    ${fullScreen ? 'fixed inset-0 z-50' : 'w-full h-full min-h-[200px]'}
    ${transparent ? 'bg-transparent' : 'bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90'}
  `;

  return (
    <div className={containerStyles}>
      {/* 로딩 스피너 */}
      <div className={`relative ${sizeStyles[size]}`}>
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700 opacity-20"></div>
      </div>

      {/* 로딩 메시지 */}
      {message && (
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingScreen;