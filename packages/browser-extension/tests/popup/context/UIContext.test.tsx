/**
 * UI 컨텍스트 테스트
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { UIProvider, useUI } from '../../../src/popup/context/UIContext';

// 테스트용 컴포넌트
const TestComponent = () => {
  const {
    showNotification,
    dismissNotification,
    dismissAllNotifications,
    notifications,
    isLoading,
    setIsLoading,
    showModal,
    hideModal,
    modalContent,
    themeMode,
    setThemeMode,
    toggleThemeMode,
  } = useUI();

  return (
    <div>
      <div data-testid="theme-mode">{themeMode}</div>
      <button
        data-testid="toggle-theme"
        onClick={toggleThemeMode}
      >
        Toggle Theme
      </button>
      <button
        data-testid="set-theme-light"
        onClick={() => setThemeMode('light')}
      >
        Set Light
      </button>
      <button
        data-testid="set-theme-dark"
        onClick={() => setThemeMode('dark')}
      >
        Set Dark
      </button>
      <button
        data-testid="show-notification"
        onClick={() => showNotification({ type: 'info', message: 'Test notification' })}
      >
        Show Notification
      </button>
      <button
        data-testid="dismiss-all-notifications"
        onClick={dismissAllNotifications}
      >
        Dismiss All
      </button>
      <div data-testid="notification-count">{notifications.length}</div>
      <button
        data-testid="toggle-loading"
        onClick={() => setIsLoading(!isLoading)}
      >
        Toggle Loading
      </button>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <button
        data-testid="show-modal"
        onClick={() => showModal(<div>Modal Content</div>)}
      >
        Show Modal
      </button>
      <button
        data-testid="hide-modal"
        onClick={hideModal}
      >
        Hide Modal
      </button>
      <div data-testid="modal-state">{modalContent ? 'Modal Open' : 'Modal Closed'}</div>
    </div>
  );
};

// 전역 모킹 설정
jest.useFakeTimers();

describe('UIContext', () => {
  beforeEach(() => {
    // localStorage 초기화
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('초기 themeMode 값이 올바르게 설정되어야 함', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // 기본값은 'light'이어야 함
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  test('toggleThemeMode로 테마를 전환할 수 있어야 함', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // 초기값은 'light'
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

    // 토글 후 'dark'로 변경
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

    // 한 번 더 토글하면 'light'로 돌아감
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  test('setThemeMode로 특정 테마를 설정할 수 있어야 함', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // 'dark'로 설정
    fireEvent.click(screen.getByTestId('set-theme-dark'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

    // 'light'로 설정
    fireEvent.click(screen.getByTestId('set-theme-light'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  test('showNotification으로 알림을 표시할 수 있어야 함', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // 초기에는 알림이 없어야 함
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');

    // 알림 표시
    fireEvent.click(screen.getByTestId('show-notification'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
  });

  test('알림이 자동으로 사라져야 함', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // 알림 표시
    fireEvent.click(screen.getByTestId('show-notification'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');

    // 3초 후 알림이 사라져야 함
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
  });

  test('dismissAllNotifications로 모든 알림을 제거할 수 있어야 함', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // 여러 알림 표시
    fireEvent.click(screen.getByTestId('show-notification'));
    fireEvent.click(screen.getByTestId('show-notification'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('2');

    // 모든 알림 제거
    fireEvent.click(screen.getByTestId('dismiss-all-notifications'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
  });

  test('setIsLoading으로 로딩 상태를 변경할 수 있어야 함', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // 초기 상태는 'Not Loading'
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');

    // 로딩 상태로 변경
    fireEvent.click(screen.getByTestId('toggle-loading'));
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');

    // 로딩 상태 해제
    fireEvent.click(screen.getByTestId('toggle-loading'));
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
  });

  test('showModal과 hideModal로 모달을 표시하고 숨길 수 있어야 함', () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // 초기 상태는 'Modal Closed'
    expect(screen.getByTestId('modal-state')).toHaveTextContent('Modal Closed');

    // 모달 표시
    fireEvent.click(screen.getByTestId('show-modal'));
    expect(screen.getByTestId('modal-state')).toHaveTextContent('Modal Open');

    // 모달 숨김
    fireEvent.click(screen.getByTestId('hide-modal'));
    expect(screen.getByTestId('modal-state')).toHaveTextContent('Modal Closed');
  });
});