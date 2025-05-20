/**
 * biometrics.ts
 * 
 * 생체 인증(지문, 얼굴 인식 등) 관련 기능을 구현합니다.
 * 플랫폼별 생체 인증 API를 추상화하여 일관된 인터페이스를 제공합니다.
 */

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  IRIS = 'iris',
  NONE = 'none'
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  biometricType?: BiometricType;
}

export interface BiometricOptions {
  title?: string;
  subtitle?: string;
  description?: string;
  cancelButtonText?: string;
  fallbackToPasscode?: boolean;
}

/**
 * 생체 인증 관리자 인터페이스
 */
export interface BiometricAuthInterface {
  /**
   * 현재 기기에서 사용 가능한 생체 인식 유형 확인
   */
  getAvailableBiometricTypes(): Promise<BiometricType[]>;
  
  /**
   * 생체 인증 활성화 여부 확인
   */
  isBiometricAuthEnabled(): Promise<boolean>;
  
  /**
   * 생체 인증으로 사용자 인증 요청
   * @param options 생체 인증 옵션
   */
  authenticate(options?: BiometricOptions): Promise<BiometricAuthResult>;
  
  /**
   * 생체 인증 활성화/비활성화
   * @param enabled 활성화 여부
   */
  setBiometricAuthEnabled(enabled: boolean): Promise<boolean>;
}

/**
 * 기본 구현 클래스 - 웹 환경
 * (실제 생체 인식은 브라우저/모바일에서 플랫폼별 구현 필요)
 */
export class WebBiometricAuth implements BiometricAuthInterface {
  /**
   * 사용 가능한 생체 인식 유형 확인 (웹에서는 제한적)
   * @returns 사용 가능한 생체 인식 유형 목록
   */
  public async getAvailableBiometricTypes(): Promise<BiometricType[]> {
    // 웹 환경에서 WebAuthn API 지원 여부 확인
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      return [BiometricType.FINGERPRINT]; // 단순화를 위해 지문만 반환
    }
    return [BiometricType.NONE];
  }
  
  /**
   * 생체 인증 활성화 여부 확인
   * @returns 활성화 여부
   */
  public async isBiometricAuthEnabled(): Promise<boolean> {
    // 로컬 스토리지에서 설정 확인 (실제 구현에서는 보안 스토리지 사용)
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('biometric_auth_enabled') === 'true';
    }
    return false;
  }
  
  /**
   * 생체 인증 요청 (웹에서는 WebAuthn API 사용)
   * @param options 생체 인증 옵션
   * @returns 인증 결과
   */
  public async authenticate(options?: BiometricOptions): Promise<BiometricAuthResult> {
    // 웹 환경에서는 WebAuthn API 구현 필요
    // 현재는 샘플 구현으로 항상 실패 반환
    return {
      success: false,
      error: '웹 환경에서는 생체 인증이 완전히 지원되지 않습니다.',
      biometricType: BiometricType.NONE
    };
  }
  
  /**
   * 생체 인증 활성화/비활성화
   * @param enabled 활성화 여부
   * @returns 설정 성공 여부
   */
  public async setBiometricAuthEnabled(enabled: boolean): Promise<boolean> {
    // 로컬 스토리지에 설정 저장 (실제 구현에서는 보안 스토리지 사용)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('biometric_auth_enabled', enabled.toString());
      return true;
    }
    return false;
  }
}

/**
 * 모바일 앱용 생체 인증 인터페이스 (실제 구현은 플랫폼별 네이티브 모듈에서)
 */
export class MobileBiometricAuth implements BiometricAuthInterface {
  private nativeModule: any;
  
  constructor(nativeModule: any) {
    this.nativeModule = nativeModule;
  }
  
  /**
   * 사용 가능한 생체 인식 유형 확인
   * @returns 사용 가능한 생체 인식 유형 목록
   */
  public async getAvailableBiometricTypes(): Promise<BiometricType[]> {
    if (!this.nativeModule) {
      return [BiometricType.NONE];
    }
    
    try {
      // 네이티브 모듈 호출
      const types = await this.nativeModule.getAvailableBiometricTypes();
      return types.map((type: string) => {
        switch (type) {
          case 'fingerprint': return BiometricType.FINGERPRINT;
          case 'face': return BiometricType.FACE;
          case 'iris': return BiometricType.IRIS;
          default: return BiometricType.NONE;
        }
      });
    } catch (error) {
      console.error('생체 인식 유형 확인 오류:', error);
      return [BiometricType.NONE];
    }
  }
  
  /**
   * 생체 인증 활성화 여부 확인
   * @returns 활성화 여부
   */
  public async isBiometricAuthEnabled(): Promise<boolean> {
    if (!this.nativeModule) {
      return false;
    }
    
    try {
      return await this.nativeModule.isBiometricAuthEnabled();
    } catch (error) {
      console.error('생체 인증 상태 확인 오류:', error);
      return false;
    }
  }
  
  /**
   * 생체 인증 요청
   * @param options 생체 인증 옵션
   * @returns 인증 결과
   */
  public async authenticate(options?: BiometricOptions): Promise<BiometricAuthResult> {
    if (!this.nativeModule) {
      return {
        success: false,
        error: '네이티브 모듈을 찾을 수 없습니다.',
        biometricType: BiometricType.NONE
      };
    }
    
    try {
      // 네이티브 생체 인증 모듈 호출
      const result = await this.nativeModule.authenticate(options || {});
      return {
        success: result.success,
        error: result.error,
        errorCode: result.errorCode,
        biometricType: result.biometricType as BiometricType
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '생체 인증 오류',
        biometricType: BiometricType.NONE
      };
    }
  }
  
  /**
   * 생체 인증 활성화/비활성화
   * @param enabled 활성화 여부
   * @returns 설정 성공 여부
   */
  public async setBiometricAuthEnabled(enabled: boolean): Promise<boolean> {
    if (!this.nativeModule) {
      return false;
    }
    
    try {
      return await this.nativeModule.setBiometricAuthEnabled(enabled);
    } catch (error) {
      console.error('생체 인증 설정 오류:', error);
      return false;
    }
  }
}

/**
 * 플랫폼에 적합한 생체 인증 구현체 팩토리
 */
export class BiometricAuthFactory {
  /**
   * 현재 환경에 맞는 생체 인증 인스턴스 생성
   * @param nativeModule 네이티브 모듈 (모바일 환경에서 필요)
   * @returns 생체 인증 인터페이스 구현체
   */
  public static create(nativeModule?: any): BiometricAuthInterface {
    // 환경에 따라 적절한 구현체 반환
    if (nativeModule) {
      return new MobileBiometricAuth(nativeModule);
    }
    
    // 기본적으로 웹 구현체 반환
    return new WebBiometricAuth();
  }
}
