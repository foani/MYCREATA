/**
 * ThemeToggle 컴포넌트 테스트
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../../../src/popup/components/common/ThemeToggle';
import { UIProvider } from '../../../src/popup/context/UIContext';

// 테마 토글 컴포넌트를 UIProvider로 감싸는 테스트 래퍼
const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <UIProvider>
      {component}
    </UIProvider>
  );
};

describe('ThemeToggle', () => {
  test('컴포넌트가 렌더링되어야 함', () => {
    renderWithProvider(<ThemeToggle data-testid="theme-toggle" />);
    
    // 버튼이 렌더링되었는지 확인
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });
  
  test('클래스 이름을 props로 받을 수 있어야 함', () => {
    renderWithProvider(<ThemeToggle className="custom-class" data-testid="theme-toggle" />);
    
    // 버튼에 custom-class가 적용되었는지 확인
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('custom-class');
  });
  
  test('클릭 시 테마가 전환되어야 함', () => {
    // 라이트 모드에서 시작
    const { rerender } = renderWithProvider(<ThemeToggle data-testid="theme-toggle" />);
    
    // 초기 상태에서는 라이트 모드 아이콘이 표시되어야 함 (달 아이콘)
    const toggleButton = screen.getByRole('button');
    expect(toggleButton.querySelector('svg')).toBeInTheDocument();
    
    // 버튼 클릭
    fireEvent.click(toggleButton);
    
    // 다크 모드로 전환되었으므로 다크 모드 아이콘이 표시되어야 함 (해 아이콘)
    rerender(
      <UIProvider>
        <ThemeToggle data-testid="theme-toggle" />
      </UIProvider>
    );
    
    // 토글 후 버튼의 accessible name(aria-label)이 바뀌었는지 확인
    // (구현 방식에 따라 달라질 수 있음)
    // 참고: ThemeToggle 컴포넌트는 themeMode 상태에 따라 aria-label을 변경함
    expect(toggleButton).toHaveAttribute('aria-label', '라이트 모드로 전환');
  });
});