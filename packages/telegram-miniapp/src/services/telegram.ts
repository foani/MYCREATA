/**
 * Telegram WebApp 통합 서비스
 * 
 * Telegram WebApp SDK와 통신하기 위한 서비스를 제공합니다.
 * Telegram 메신저 내에서 앱을 실행할 때만 사용됩니다.
 */

// WebApp 객체에 대한 타입 정의
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

// Telegram User 타입 정의
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

// Telegram WebApp 타입 정의
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id: string;
    user: TelegramUser;
    auth_date: number;
    hash: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive: boolean): void;
    hideProgress(): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
  sendData(data: string): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (isConfirmed: boolean) => void): void;
  ready(): void;
  expand(): void;
  close(): void;
}

// 서비스 클래스 정의
class TelegramService {
  private webApp: TelegramWebApp | null = null;

  constructor() {
    // 브라우저 환경에서만 WebApp을 초기화
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.initWebApp();
    }
  }

  /**
   * WebApp 초기화
   */
  private initWebApp(): void {
    if (!this.webApp) return;

    // 앱이 준비되었음을 Telegram에 알림
    this.webApp.ready();

    // 뒤로가기 버튼 비활성화 (일반적으로 SPA 라우팅에서 처리함)
    this.webApp.BackButton.hide();

    // 메인 버튼 숨기기 (필요할 때만 활성화)
    this.webApp.MainButton.hide();
  }

  /**
   * WebApp 객체 반환
   */
  getWebApp(): TelegramWebApp | null {
    return this.webApp;
  }

  /**
   * 사용자 정보 반환
   */
  getUser(): TelegramUser | null {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  /**
   * 앱 내에서 Telegram 환경인지 확인
   */
  isTelegramWebApp(): boolean {
    return !!this.webApp;
  }

  /**
   * 현재 테마 색상 반환
   */
  getColorScheme(): 'light' | 'dark' {
    return this.webApp?.colorScheme || 'light';
  }

  /**
   * 테마 파라미터 반환
   */
  getThemeParams() {
    return this.webApp?.themeParams;
  }

  /**
   * 메인 버튼 설정
   */
  setupMainButton(
    text: string,
    onClick: () => void,
    options?: {
      color?: string;
      textColor?: string;
      isActive?: boolean;
      isVisible?: boolean;
    }
  ): void {
    if (!this.webApp) return;

    const button = this.webApp.MainButton;
    button.setText(text);

    if (options?.color) {
      button.color = options.color;
    }

    if (options?.textColor) {
      button.textColor = options.textColor;
    }

    if (options?.isActive === false) {
      button.disable();
    } else {
      button.enable();
    }

    // 기존 이벤트 핸들러 제거 후 새로운 핸들러 등록
    button.offClick(onClick);
    button.onClick(onClick);

    if (options?.isVisible === false) {
      button.hide();
    } else {
      button.show();
    }
  }

  /**
   * 햅틱 피드백 트리거
   */
  hapticFeedback(type: 'success' | 'error' | 'warning' | 'selection' | 'impact', style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void {
    if (!this.webApp) return;

    const haptic = this.webApp.HapticFeedback;

    if (type === 'success' || type === 'error' || type === 'warning') {
      haptic.notificationOccurred(type);
    } else if (type === 'selection') {
      haptic.selectionChanged();
    } else if (type === 'impact' && style) {
      haptic.impactOccurred(style);
    }
  }

  /**
   * 경고창 표시
   */
  showAlert(message: string, callback?: () => void): void {
    if (!this.webApp) {
      alert(message);
      if (callback) callback();
      return;
    }

    this.webApp.showAlert(message, callback);
  }

  /**
   * 확인 대화상자 표시
   */
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void {
    if (!this.webApp) {
      const confirmed = window.confirm(message);
      if (callback) callback(confirmed);
      return;
    }

    this.webApp.showConfirm(message, callback);
  }

  /**
   * 팝업 대화상자 표시
   */
  showPopup(
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
  ): void {
    if (!this.webApp) {
      alert(params.message);
      if (callback) callback('ok');
      return;
    }

    this.webApp.showPopup(params, callback);
  }

  /**
   * 링크 열기
   */
  openLink(url: string): void {
    if (!this.webApp) {
      window.open(url, '_blank');
      return;
    }

    if (url.startsWith('https://t.me/')) {
      this.webApp.openTelegramLink(url.replace('https://t.me/', ''));
    } else {
      this.webApp.openLink(url);
    }
  }

  /**
   * Telegram 서버로 데이터 전송
   */
  sendData(data: string): void {
    if (!this.webApp) return;
    this.webApp.sendData(data);
  }

  /**
   * WebApp 닫기
   */
  close(): void {
    if (!this.webApp) {
      window.close();
      return;
    }

    this.webApp.close();
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const telegramService = new TelegramService();
export default telegramService;
