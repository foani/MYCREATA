import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

export interface BiometricsResult {
  success: boolean;
  error?: string;
  biometryType?: BiometryTypes;
}

class BiometricsService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
  }

  /**
   * 기기의 생체 인증 지원 여부 확인
   * @returns 생체 인증 지원 정보
   */
  async isSensorAvailable(): Promise<BiometricsResult> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      
      return {
        success: available,
        biometryType
      };
    } catch (error) {
      console.error('Error checking biometrics availability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 생체 인증 키 쌍 생성
   * @param publicKeyIdentifier 공개키 식별자
   * @returns 키 생성 결과
   */
  async createKeys(publicKeyIdentifier: string): Promise<BiometricsResult> {
    try {
      const { publicKey, keysExist } = await this.rnBiometrics.createKeys(publicKeyIdentifier);
      
      return {
        success: true,
        publicKey,
        keysExist
      } as unknown as BiometricsResult;
    } catch (error) {
      console.error('Error creating biometric keys:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 생체 인증 프롬프트 표시 및 서명
   * @param promptMessage 사용자에게 표시할 메시지
   * @param payload 서명할 데이터
   * @param publicKeyIdentifier 공개키 식별자
   * @returns 서명 결과
   */
  async promptAndSign(
    promptMessage: string,
    payload: string,
    publicKeyIdentifier: string
  ): Promise<BiometricsResult> {
    try {
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage,
        payload,
        cancelButtonText: 'Cancel',
        authenticationMode: 'BiometricAndDeviceCredential',
        allowDeviceCredentials: true,
        publicKeyIdentifier
      });
      
      return {
        success,
        signature
      } as unknown as BiometricsResult;
    } catch (error) {
      console.error('Error during biometric signature:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 생체 인증 프롬프트 표시 (서명 없음)
   * @param promptMessage 사용자에게 표시할 메시지
   * @returns 인증 결과
   */
  async simplePrompt(promptMessage: string): Promise<BiometricsResult> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
        authenticationMode: 'BiometricAndDeviceCredential',
        allowDeviceCredentials: true,
      });
      
      return {
        success
      };
    } catch (error) {
      console.error('Error during biometric prompt:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 생체 인증으로 저장된 키 쌍 삭제
   * @param publicKeyIdentifier 공개키 식별자
   * @returns 삭제 결과
   */
  async deleteKeys(publicKeyIdentifier: string): Promise<BiometricsResult> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys(publicKeyIdentifier);
      
      return {
        success: keysDeleted
      };
    } catch (error) {
      console.error('Error deleting biometric keys:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 생체 인증 키 존재 여부 확인
   * @param publicKeyIdentifier 공개키 식별자
   * @returns 키 존재 여부
   */
  async checkKeys(publicKeyIdentifier: string): Promise<BiometricsResult> {
    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist(publicKeyIdentifier);
      
      return {
        success: keysExist
      };
    } catch (error) {
      console.error('Error checking biometric keys:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 생체 인증 센서 타입 반환
   * @returns 생체 인증 센서 타입
   */
  async getBiometricType(): Promise<BiometryTypes | undefined> {
    try {
      const { biometryType } = await this.rnBiometrics.isSensorAvailable();
      return biometryType;
    } catch (error) {
      console.error('Error getting biometric type:', error);
      return undefined;
    }
  }
}

export default new BiometricsService();
