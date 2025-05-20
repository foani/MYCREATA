/**
 * UIContext
 * UI 상태 및 기능을 관리하는 컨텍스트
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ThemeMode, 
  getPreferredTheme, 
  applyTheme, 
  saveUserTheme
} from '../../utils/theme';

// 알림 타입 정의
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// UI 컨텍스트 타입 정의
interface UIContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  modalContent: ReactNode | null;
  showModal: (content: ReactNode) => void;
  hideModal: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

// 기본 컨텍스트 값
const defaultContextValue: UIContextType = {
  notifications: [],
  showNotification: () => {},
  dismissNotification: () => {},
  dismissAllNotifications: () => {},
  isLoading: false,
  setIsLoading: () => {},
  modalContent: null,
  showModal: () => {},
  hideModal: () => {},
  themeMode: 'light',
  setThemeMode: () => {},
  toggleThemeMode: () => {},
};

// 컨텍스트 생성
const UIContext = createContext<UIContextType>(defaultContextValue);

// Props 타입 정의
interface UIProviderProps {
  children: ReactNode;
}

/**
 * UI 프로바이더 컴포넌트
 * @param children 자식 컴포넌트
 */
export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  // 상태 정의
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  
  // 초기 테마 설정
  useEffect(() => {
    const preferredTheme = getPreferredTheme();
    setThemeModeState(preferredTheme);
    applyTheme(preferredTheme);
    
    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const userTheme = localStorage.getItem('themeMode');
      if (!userTheme) {
        const newMode: ThemeMode = e.matches ? 'dark' : 'light';
        setThemeModeState(newMode);
        applyTheme(newMode);
      }
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // 이전 버전 브라우저 지원
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);
  
  /**
   * 테마 모드 설정
   * @param mode 테마 모드
   */
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveUserTheme(mode);
    applyTheme(mode);
  };
  
  /**
   * 테마 모드 토글
   */
  const toggleThemeMode = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };
  
  /**
   * 알림 표시
   * @param notification 알림 정보
   */
  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    // 일정 시간 후 자동 제거
    if (notification.duration !== 0) {
      const duration = notification.duration || 3000; // 기본값 3초
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }
  };
  
  /**
   * 알림 제거
   * @param id 알림 ID
   */
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };
  
  /**
   * 모든 알림 제거
   */
  const dismissAllNotifications = () => {
    setNotifications([]);
  };
  
  /**
   * 모달 표시
   * @param content 모달 내용
   */
  const showModal = (content: ReactNode) => {
    setModalContent(content);
  };
  
  /**
   * 모달 숨김
   */
  const hideModal = () => {
    setModalContent(null);
  };
  
  // 컨텍스트 값
  const contextValue: UIContextType = {
    notifications,
    showNotification,
    dismissNotification,
    dismissAllNotifications,
    isLoading,
    setIsLoading,
    modalContent,
    showModal,
    hideModal,
    themeMode,
    setThemeMode,
    toggleThemeMode,
  };
  
  return (
    <UIContext.Provider value={contextValue}>
      {children}
      
      {/* Notifications 렌더링 */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-md p-4 shadow-md ${
                notification.type === 'success'
                  ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : notification.type === 'error'
                  ? 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                  : 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{notification.message}</p>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <span className="sr-only">닫기</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal 렌더링 */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-4">{modalContent}</div>
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-right">
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                onClick={hideModal}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
};

/**
 * UI 컨텍스트 훅
 * @returns UI 컨텍스트 값
 */
export const useUI = () => {
  return useContext(UIContext);
};