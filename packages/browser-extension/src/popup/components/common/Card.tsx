/**
 * 카드 컴포넌트
 * 콘텐츠를 담는 기본 컨테이너로 사용되는 카드 컴포넌트
 */

import React, { ReactNode } from 'react';

// 카드 Props 타입
export interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  border?: boolean;
}

/**
 * 카드 컴포넌트
 * @param title 카드 제목
 * @param subtitle 카드 부제목
 * @param children 카드 내용
 * @param className 추가 CSS 클래스
 * @param footer 카드 푸터
 * @param headerAction 헤더 우측 영역에 표시할 액션 요소
 * @param onClick 클릭 핸들러
 * @param hoverable 호버 효과 활성화 여부
 * @param border 테두리 표시 여부
 */
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  footer,
  headerAction,
  onClick,
  hoverable = false,
  border = true,
}) => {
  // 기본 카드 스타일
  const cardClasses = `
    bg-white dark:bg-gray-800 
    rounded-lg 
    ${border ? 'border border-gray-200 dark:border-gray-700' : ''} 
    shadow-sm 
    overflow-hidden
    ${hoverable ? 'hover:shadow-md transition-shadow duration-200' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  // 헤더 표시 여부
  const hasHeader = title || subtitle || headerAction;

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 카드 헤더 */}
      {hasHeader && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            {title && (
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}

      {/* 카드 본문 */}
      <div className="px-4 py-4">{children}</div>

      {/* 카드 푸터 */}
      {footer && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;