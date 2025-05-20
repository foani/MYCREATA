/**
 * 빈 상태 컴포넌트
 * 데이터가 없거나 결과가 없을 때 표시되는 빈 상태 UI
 */

import React, { ReactNode } from 'react';
import Button from './Button';

// 빈 상태 Props 타입
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

/**
 * 빈 상태 컴포넌트
 * @param icon 아이콘 요소
 * @param title 제목
 * @param description 설명
 * @param actionLabel 주요 액션 버튼 라벨
 * @param onAction 주요 액션 핸들러
 * @param secondaryActionLabel 보조 액션 버튼 라벨
 * @param onSecondaryAction 보조 액션 핸들러
 * @param className 추가 CSS 클래스
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  // 기본 아이콘 (제공되지 않은 경우)
  const defaultIcon = (
    <svg
      className="h-12 w-12 text-gray-400 dark:text-gray-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 12V8a2 2 0 00-2-2h-2.5M5 12V8c0-1.1.9-2 2-2h2.5M12 4v16M5 16v4h14v-4"
      />
    </svg>
  );

  return (
    <div className={`py-8 px-4 text-center ${className}`}>
      {/* 아이콘 */}
      <div className="flex justify-center mb-4">
        {icon || defaultIcon}
      </div>

      {/* 제목 */}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {/* 설명 */}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;