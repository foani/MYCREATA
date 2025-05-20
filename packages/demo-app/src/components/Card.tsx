import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

/**
 * 카드 컴포넌트
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  // 카드 기본 스타일
  const baseStyle = 'bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden';
  
  // 호버 효과
  const hoverStyle = hoverable ? 'hover:shadow-lg transition-shadow duration-300' : '';
  
  // 클릭 가능 여부
  const clickableStyle = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      className={`${baseStyle} ${hoverStyle} ${clickableStyle} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
