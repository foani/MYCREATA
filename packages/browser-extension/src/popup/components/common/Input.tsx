/**
 * 입력 컴포넌트
 * 다양한 유형의 입력을 지원하는 재사용 가능한 입력 컴포넌트
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';

// 입력 Props 타입
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}

/**
 * 입력 컴포넌트
 * @param label 입력 라벨
 * @param error 오류 메시지
 * @param helperText 도움말 텍스트
 * @param leftIcon 왼쪽 아이콘
 * @param rightIcon 오른쪽 아이콘
 * @param fullWidth 전체 너비 사용 여부
 * @param containerClassName 컨테이너 CSS 클래스
 * @param className 입력 CSS 클래스
 * @param id 입력 ID
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  containerClassName = '',
  className = '',
  id,
  ...props
}, ref) => {
  // 고유 ID 생성
  const uniqueId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // 오류 상태 클래스
  const errorClass = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-500';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label
          htmlFor={uniqueId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={uniqueId}
          className={`
            block rounded-md shadow-sm
            ${errorClass}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${fullWidth ? 'w-full' : ''}
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors
            ${className}
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      
      {/* 오류 메시지 또는 도움말 */}
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

// 표시 이름 설정
Input.displayName = 'Input';

export default Input;