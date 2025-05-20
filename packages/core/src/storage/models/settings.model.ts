/**
 * settings.model.ts
 * 
 * 지갑 설정 관련 데이터 모델 정의.
 */

/**
 * 테마 설정
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

/**
 * 언어 설정
 */
export type Language = 'ko' | 'en' | 'ja' | 'vi' | 'ru' | 'es' | 'de' | 'fr';

/**
 * 화폐 단위
 */
export type Currency = 'USD' | 'KRW' | 'JPY' | 'EUR' | 'GBP' | 'CNY';

/**
 * 가스 설정
 */
export enum GasPriceType {
  LOW = 'low',
  AVERAGE = 'average',
  HIGH = 'high',
  CUSTOM = 'custom'
}

/**
 * 네트워크 설정
 */
export interface NetworkSettings {
  enableTestnets: boolean;
  autoSwitchNetwork: boolean;
  customRpcEndpoints: Record<string, string[]>;
  preferredNetwork: string; // 체인 ID
}

/**
 * 보안 설정
 */
export interface SecuritySettings {
  autoLockTimeout: number; // 분 단위, 0은 비활성화
  requireAuthForSending: boolean;
  enableBiometrics: boolean;
  hideBalanceOnLock: boolean;
  enableAdvancedSigning: boolean; // 고급 서명 정보 표시
}

/**
 * 개인정보 설정
 */
export interface PrivacySettings {
  shareAnalytics: boolean;
  enableCrashReports: boolean;
  blockExplorerAPI: boolean; // API 사용 허용
  useCustomNode: boolean;
  blockList: string[]; // 차단된 주소 목록
}

/**
 * 알림 설정
 */
export interface NotificationSettings {
  enableNotifications: boolean;
  transactionNotifications: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
  marketingNotifications: boolean;
}

/**
 * 고급 설정
 */
export interface AdvancedSettings {
  showHexData: boolean;
  showTestNetworks: boolean;
  showInternalTransactions: boolean;
  developerMode: boolean;
  customGasLimit: number | null;
  ipfsGateway: string;
}

/**
 * 지갑 기본 설정
 */
export interface WalletSettings {
  theme: Theme;
  language: Language;
  currency: Currency;
  gasPriceType: GasPriceType;
  customGasPrice?: number;
  network: NetworkSettings;
  security: SecuritySettings;
  privacy: PrivacySettings;
  notification: NotificationSettings;
  advanced: AdvancedSettings;
  lastUpdated: number;
}

/**
 * 지갑 기본 설정 기본값
 */
export const DEFAULT_SETTINGS: WalletSettings = {
  theme: Theme.SYSTEM,
  language: 'en',
  currency: 'USD',
  gasPriceType: GasPriceType.AVERAGE,
  network: {
    enableTestnets: false,
    autoSwitchNetwork: true,
    customRpcEndpoints: {},
    preferredNetwork: '1000' // Catena 메인넷
  },
  security: {
    autoLockTimeout: 5, // 5분
    requireAuthForSending: true,
    enableBiometrics: false,
    hideBalanceOnLock: true,
    enableAdvancedSigning: false
  },
  privacy: {
    shareAnalytics: true,
    enableCrashReports: true,
    blockExplorerAPI: true,
    useCustomNode: false,
    blockList: []
  },
  notification: {
    enableNotifications: true,
    transactionNotifications: true,
    priceAlerts: false,
    securityAlerts: true,
    marketingNotifications: false
  },
  advanced: {
    showHexData: false,
    showTestNetworks: false,
    showInternalTransactions: false,
    developerMode: false,
    customGasLimit: null,
    ipfsGateway: 'https://ipfs.io/ipfs/'
  },
  lastUpdated: Date.now()
};

/**
 * 설정 관리 클래스
 */
export class SettingsModel {
  private settings: WalletSettings;
  
  /**
   * SettingsModel 생성자
   * @param initialSettings 초기 설정
   */
  constructor(initialSettings?: Partial<WalletSettings>) {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...initialSettings,
      lastUpdated: Date.now()
    };
  }
  
  /**
   * 전체 설정 가져오기
   * @returns 설정 객체
   */
  public getSettings(): WalletSettings {
    return { ...this.settings };
  }
  
  /**
   * 전체 설정 업데이트
   * @param newSettings 새 설정
   */
  public updateSettings(newSettings: Partial<WalletSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings,
      lastUpdated: Date.now()
    };
  }
  
  /**
   * 테마 설정 업데이트
   * @param theme 새 테마
   */
  public setTheme(theme: Theme): void {
    this.settings.theme = theme;
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 언어 설정 업데이트
   * @param language 새 언어
   */
  public setLanguage(language: Language): void {
    this.settings.language = language;
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 화폐 단위 업데이트
   * @param currency 새 화폐 단위
   */
  public setCurrency(currency: Currency): void {
    this.settings.currency = currency;
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 가스 가격 유형 업데이트
   * @param type 가스 가격 유형
   * @param customPrice 커스텀 가스 가격 (CUSTOM 유형일 때)
   */
  public setGasPriceType(type: GasPriceType, customPrice?: number): void {
    this.settings.gasPriceType = type;
    
    if (type === GasPriceType.CUSTOM && customPrice !== undefined) {
      this.settings.customGasPrice = customPrice;
    }
    
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 네트워크 설정 업데이트
   * @param networkSettings 새 네트워크 설정
   */
  public updateNetworkSettings(networkSettings: Partial<NetworkSettings>): void {
    this.settings.network = {
      ...this.settings.network,
      ...networkSettings
    };
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 선호 네트워크 설정
   * @param chainId 체인 ID
   */
  public setPreferredNetwork(chainId: string): void {
    this.settings.network.preferredNetwork = chainId;
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 커스텀 RPC 엔드포인트 추가
   * @param chainId 체인 ID
   * @param endpoint RPC 엔드포인트
   */
  public addCustomRpcEndpoint(chainId: string, endpoint: string): void {
    if (!this.settings.network.customRpcEndpoints[chainId]) {
      this.settings.network.customRpcEndpoints[chainId] = [];
    }
    
    if (!this.settings.network.customRpcEndpoints[chainId].includes(endpoint)) {
      this.settings.network.customRpcEndpoints[chainId].push(endpoint);
      this.settings.lastUpdated = Date.now();
    }
  }
  
  /**
   * 커스텀 RPC 엔드포인트 제거
   * @param chainId 체인 ID
   * @param endpoint RPC 엔드포인트
   */
  public removeCustomRpcEndpoint(chainId: string, endpoint: string): void {
    if (this.settings.network.customRpcEndpoints[chainId]) {
      const index = this.settings.network.customRpcEndpoints[chainId].indexOf(endpoint);
      
      if (index !== -1) {
        this.settings.network.customRpcEndpoints[chainId].splice(index, 1);
        this.settings.lastUpdated = Date.now();
      }
    }
  }
  
  /**
   * 보안 설정 업데이트
   * @param securitySettings 새 보안 설정
   */
  public updateSecuritySettings(securitySettings: Partial<SecuritySettings>): void {
    this.settings.security = {
      ...this.settings.security,
      ...securitySettings
    };
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 개인정보 설정 업데이트
   * @param privacySettings 새 개인정보 설정
   */
  public updatePrivacySettings(privacySettings: Partial<PrivacySettings>): void {
    this.settings.privacy = {
      ...this.settings.privacy,
      ...privacySettings
    };
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 차단 목록에 주소 추가
   * @param address 차단할 주소
   */
  public addToBlockList(address: string): void {
    if (!this.settings.privacy.blockList.includes(address)) {
      this.settings.privacy.blockList.push(address);
      this.settings.lastUpdated = Date.now();
    }
  }
  
  /**
   * 차단 목록에서 주소 제거
   * @param address 차단 해제할 주소
   */
  public removeFromBlockList(address: string): void {
    const index = this.settings.privacy.blockList.indexOf(address);
    
    if (index !== -1) {
      this.settings.privacy.blockList.splice(index, 1);
      this.settings.lastUpdated = Date.now();
    }
  }
  
  /**
   * 알림 설정 업데이트
   * @param notificationSettings 새 알림 설정
   */
  public updateNotificationSettings(notificationSettings: Partial<NotificationSettings>): void {
    this.settings.notification = {
      ...this.settings.notification,
      ...notificationSettings
    };
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 고급 설정 업데이트
   * @param advancedSettings 새 고급 설정
   */
  public updateAdvancedSettings(advancedSettings: Partial<AdvancedSettings>): void {
    this.settings.advanced = {
      ...this.settings.advanced,
      ...advancedSettings
    };
    this.settings.lastUpdated = Date.now();
  }
  
  /**
   * 기본 설정으로 초기화
   */
  public resetToDefaults(): void {
    this.settings = {
      ...DEFAULT_SETTINGS,
      lastUpdated: Date.now()
    };
  }
}
