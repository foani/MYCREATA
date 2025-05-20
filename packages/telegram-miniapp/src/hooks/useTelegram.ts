import { useEffect, useState, useCallback } from 'react';
import telegramService, { TelegramUser } from '../services/telegram';

/**
 * Telegram WebApp 기능을 쉽게 사용하기 위한 커스텀 훅
 * 
 * Telegram WebApp SDK의 기능을 React 컴포넌트에서 사용할 수 있도록 제공합니다.
 */
export const useTelegram = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [queryId, setQueryId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // 초기화
  useEffect(() => {
    const webApp = telegramService.getWebApp();
    if (!webApp) return;

    // 사용자 정보 설정
    const telegramUser = telegramService.getUser();
    if (telegramUser) {
      setUser(telegramUser);
    }

    // 색상 스키마 설정
    setColorScheme(telegramService.getColorScheme());

    // 쿼리 ID 설정
    setQueryId(webApp.initDataUnsafe.query_id || null);

    // 확장 여부 설정
    setIsExpanded(webApp.isExpanded);

    // 이벤트 핸들러
    const handleThemeChange = () => {
      setColorScheme(telegramService.getColorScheme());
    };

    const handleViewportChange = () => {
      setIsExpanded(webApp?.isExpanded || false);
    };

    // 이벤트 리스너 등록
    webApp.onEvent('themeChanged', handleThemeChange);
    webApp.onEvent('viewportChanged', handleViewportChange);

    // Ready 상태 설정
    setIsReady(true);

    // 클린업 함수
    return () => {
      webApp.offEvent('themeChanged', handleThemeChange);
      webApp.offEvent('viewportChanged', handleViewportChange);
    };
  }, []);

  /**
   * 메인 버튼 설정
   */
  const setupMainButton = useCallback(
    (
      text: string,
      onClick: () => void,
      options?: {
        color?: string;
        textColor?: string;
        isActive?: boolean;
        isVisible?: boolean;
      }
    ) => {
      telegramService.setupMainButton(text, onClick, options);
    },
    []
  );

  /**
   * 뒤로가기 버튼 표시/숨김 설정
   */
  const setupBackButton = useCallback(
    (isVisible: boolean, onClick?: () => void) => {
      const webApp = telegramService.getWebApp();
      if (!webApp) return;

      if (isVisible) {
        webApp.BackButton.show();
        if (onClick) {
          webApp.BackButton.onClick(onClick);
        }
      } else {
        webApp.BackButton.hide();
        if (onClick) {
          webApp.BackButton.offClick(onClick);
        }
      }
    },
    []
  );

  /**
   * 햅틱 피드백 트리거
   */
  const hapticFeedback = useCallback(
    (type: 'success' | 'error' | 'warning' | 'selection' | 'impact', style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      telegramService.hapticFeedback(type, style);
    },
    []
  );

  /**
   * 경고창 표시
   */
  const showAlert = useCallback(
    (message: string, callback?: () => void) => {
      telegramService.showAlert(message, callback);
    },
    []
  );

  /**
   * 확인 대화상자 표시
   */
  const showConfirm = useCallback(
    (message: string, callback?: (confirmed: boolean) => void) => {
      telegramService.showConfirm(message, callback);
    },
    []
  );

  /**
   * 팝업 대화상자 표시
   */
  const showPopup = useCallback(
    (
      params: {
        title?: string;
        message: string;
        buttons?: Array<{
          id?: string;
          type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
          text: string;
        }>;
      },
      callback?: (buttonId: string) => void
    ) => {
      telegramService.showPopup(params, callback);
    },
    []
  );

  /**
   * 링크 열기
   */
  const openLink = useCallback(
    (url: string) => {
      telegramService.openLink(url);
    },
    []
  );

  /**
   * 클라이언트에서 테마 관련 스타일 가져오기
   */
  const getThemeStyles = useCallback(() => {
    const webApp = telegramService.getWebApp();
    if (!webApp) {
      return {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        buttonColor: '#3E96FF',
        buttonTextColor: '#ffffff',
        linkColor: '#3E96FF',
        hintColor: '#999999',
        secondaryBgColor: '#f5f5f5',
      };
    }

    const { 
      bg_color,
      text_color,
      button_color, 
      button_text_color,
      link_color,
      hint_color,
      secondary_bg_color
    } = webApp.themeParams;

    return {
      backgroundColor: bg_color,
      textColor: text_color,
      buttonColor: button_color,
      buttonTextColor: button_text_color,
      linkColor: link_color,
      hintColor: hint_color,
      secondaryBgColor: secondary_bg_color,
    };
  }, []);

  /**
   * 웹 앱 확장 (전체 화면)
   */
  const expandApp = useCallback(() => {
    const webApp = telegramService.getWebApp();
    if (!webApp) return;

    webApp.expand();
  }, []);

  /**
   * 웹앱 닫기
   */
  const closeApp = useCallback(() => {
    telegramService.close();
  }, []);

  /**
   * 데이터 전송
   */
  const sendData = useCallback((data: string) => {
    telegramService.sendData(data);
  }, []);

  /**
   * Telegram 환경인지 확인
   */
  const isTelegramWebApp = telegramService.isTelegramWebApp();

  return {
    user,
    colorScheme,
    queryId,
    isExpanded,
    isReady,
    isTelegramWebApp,
    setupMainButton,
    setupBackButton,
    hapticFeedback,
    showAlert,
    showConfirm,
    showPopup,
    openLink,
    getThemeStyles,
    expandApp,
    closeApp,
    sendData,
  };
};
