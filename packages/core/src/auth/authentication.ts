/**
 * authentication.ts
 * 
 * CreLink 지갑의 인증 시스템을 관리하는 모듈입니다.
 * 지갑 접근 보안, 사용자 인증, 세션 관리를 담당합니다.
 */

import { SecureStorageInterface } from '../storage/secureStorage';
import { AuthenticationError } from '../utils/errors';
import { KeyStoreData } from '../crypto/keystore';

export interface AuthCredentials {
  pin?: string;
  password?: string;
  biometricId?: string;
  zkdid?: string;
}

export enum AuthMethod {
  PIN = 'pin',
  PASSWORD = 'password',
  BIOMETRIC = 'biometric',
  ZKDID = 'zkdid'
}

export interface AuthConfig {
  methods: AuthMethod[];
  requiredMethods: AuthMethod[];
  lockTimeout: number; // 밀리초 단위, 자동 잠금 시간
  failedAttemptLimit: number; // 연속 실패 제한 횟수
  cooldownPeriod: number; // 밀리초 단위, 시도 제한 초과 시 대기 시간
}

export interface AuthState {
  isAuthenticated: boolean;
  lastAuthenticated: number | null; // 마지막 인증 시간 타임스탬프
  failedAttempts: number;
  lockedUntil: number | null; // 잠금 해제 시간 타임스탬프
}

/**
 * 지갑 인증 시스템을 관리하는 클래스
 */
export class AuthenticationManager {
  private config: AuthConfig;
  private state: AuthState;
  private secureStorage: SecureStorageInterface;
  private keystoreData: KeyStoreData | null = null;

  /**
   * AuthenticationManager 생성자
   * @param secureStorage 보안 스토리지 인터페이스
   * @param config 인증 설정
   */
  constructor(secureStorage: SecureStorageInterface, config?: Partial<AuthConfig>) {
    this.secureStorage = secureStorage;
    
    // 기본 설정값과 사용자 설정을 병합
    this.config = {
      methods: [AuthMethod.PIN, AuthMethod.PASSWORD],
      requiredMethods: [AuthMethod.PIN],
      lockTimeout: 5 * 60 * 1000, // 기본 5분
      failedAttemptLimit: 5,
      cooldownPeriod: 5 * 60 * 1000, // 기본 5분
      ...config
    };

    // 초기 상태 설정
    this.state = {
      isAuthenticated: false,
      lastAuthenticated: null,
      failedAttempts: 0,
      lockedUntil: null
    };
  }

  /**
   * 현재 인증 상태가 유효한지 확인
   * @returns 인증 상태 유효 여부
   */
  public isSessionValid(): boolean {
    if (!this.state.isAuthenticated) {
      return false;
    }

    // 잠금 설정이 있고 마지막 인증 시간이 있는 경우 시간 확인
    if (this.config.lockTimeout > 0 && this.state.lastAuthenticated) {
      const now = Date.now();
      const elapsed = now - this.state.lastAuthenticated;
      if (elapsed > this.config.lockTimeout) {
        this.lockSession();
        return false;
      }
    }

    return true;
  }

  /**
   * 세션을 잠금 상태로 변경
   */
  public lockSession(): void {
    this.state.isAuthenticated = false;
  }

  /**
   * 사용자 인증 시도
   * @param credentials 인증 자격 증명
   * @returns 인증 성공 여부
   */
  public async authenticate(credentials: AuthCredentials): Promise<boolean> {
    // 잠금 상태 확인
    if (this.isLocked()) {
      throw new AuthenticationError('계정이 잠겨 있습니다. 나중에 다시 시도하세요.');
    }

    try {
      // PIN 인증
      if (this.config.methods.includes(AuthMethod.PIN) && credentials.pin) {
        const isValid = await this.verifyPin(credentials.pin);
        if (!isValid) {
          this.handleFailedAttempt();
          throw new AuthenticationError('잘못된 PIN입니다.');
        }
      } 
      // 패스워드 인증
      else if (this.config.methods.includes(AuthMethod.PASSWORD) && credentials.password) {
        const isValid = await this.verifyPassword(credentials.password);
        if (!isValid) {
          this.handleFailedAttempt();
          throw new AuthenticationError('잘못된 비밀번호입니다.');
        }
      } 
      // zkDID 인증
      else if (this.config.methods.includes(AuthMethod.ZKDID) && credentials.zkdid) {
        const isValid = await this.verifyZkDID(credentials.zkdid);
        if (!isValid) {
          this.handleFailedAttempt();
          throw new AuthenticationError('zkDID 인증에 실패했습니다.');
        }
      }
      // 유효한 인증 방식 없음
      else {
        throw new AuthenticationError('지원되는 인증 방식이 제공되지 않았습니다.');
      }

      // 인증 성공 처리
      this.state.isAuthenticated = true;
      this.state.lastAuthenticated = Date.now();
      this.state.failedAttempts = 0;
      this.state.lockedUntil = null;
      
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('인증 중 오류가 발생했습니다.');
    }
  }

  /**
   * 계정이 잠겨있는지 확인
   * @returns 잠금 상태 여부
   */
  private isLocked(): boolean {
    if (!this.state.lockedUntil) {
      return false;
    }
    
    const now = Date.now();
    if (now > this.state.lockedUntil) {
      // 잠금 시간이 지났으면 잠금 해제
      this.state.lockedUntil = null;
      return false;
    }
    
    return true;
  }

  /**
   * 인증 실패 처리
   */
  private handleFailedAttempt(): void {
    this.state.failedAttempts += 1;
    
    // 실패 시도 제한 초과 시 계정 잠금
    if (this.state.failedAttempts >= this.config.failedAttemptLimit) {
      this.state.lockedUntil = Date.now() + this.config.cooldownPeriod;
      this.state.failedAttempts = 0;
    }
  }

  /**
   * PIN 검증
   * @param pin 입력된 PIN
   * @returns 검증 결과
   */
  private async verifyPin(pin: string): Promise<boolean> {
    try {
      const storedPin = await this.secureStorage.getItem('auth.pin');
      return storedPin === pin;
    } catch (error) {
      console.error('PIN 검증 오류:', error);
      return false;
    }
  }

  /**
   * 비밀번호 검증
   * @param password 입력된 비밀번호
   * @returns 검증 결과
   */
  private async verifyPassword(password: string): Promise<boolean> {
    try {
      // 키스토어 데이터가 없으면 불러오기 시도
      if (!this.keystoreData) {
        const keystoreJson = await this.secureStorage.getItem('auth.keystore');
        if (!keystoreJson) {
          throw new Error('키스토어 데이터를 찾을 수 없습니다.');
        }
        this.keystoreData = JSON.parse(keystoreJson);
      }
      
      // 실제 검증 로직은 키스토어 모듈에서 처리
      // 여기서는 성공했다고 가정하고 나중에 실제 키스토어 검증 로직과 연결
      return true;
    } catch (error) {
      console.error('비밀번호 검증 오류:', error);
      return false;
    }
  }

  /**
   * zkDID 검증
   * @param zkdid 입력된 zkDID
   * @returns 검증 결과
   */
  private async verifyZkDID(zkdid: string): Promise<boolean> {
    try {
      // zkDID 검증 로직은 별도 모듈에서 처리될 예정
      // 추후 zkdid.ts 모듈과 연결
      return true;
    } catch (error) {
      console.error('zkDID 검증 오류:', error);
      return false;
    }
  }

  /**
   * 인증 설정 업데이트
   * @param newConfig 새 인증 설정
   */
  public updateConfig(newConfig: Partial<AuthConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * PIN 설정 또는 변경
   * @param newPin 새 PIN
   * @param currentCredentials 현재 인증 자격 증명 (기존 PIN이 있을 경우 필요)
   */
  public async setPin(newPin: string, currentCredentials?: AuthCredentials): Promise<void> {
    // PIN 형식 검증 (4-8자리 숫자)
    if (!/^\d{4,8}$/.test(newPin)) {
      throw new AuthenticationError('PIN은 4-8자리 숫자여야 합니다.');
    }

    // 기존 PIN이 있으면 인증 확인
    const hasExistingPin = await this.secureStorage.hasItem('auth.pin');
    if (hasExistingPin) {
      if (!currentCredentials) {
        throw new AuthenticationError('기존 PIN을 변경하려면 현재 인증 정보가 필요합니다.');
      }

      const isAuthenticated = await this.authenticate(currentCredentials);
      if (!isAuthenticated) {
        throw new AuthenticationError('인증에 실패했습니다. PIN을 변경할 수 없습니다.');
      }
    }

    // 새 PIN 저장
    await this.secureStorage.setItem('auth.pin', newPin);

    // 필요한 경우 인증 방식 추가
    if (!this.config.methods.includes(AuthMethod.PIN)) {
      this.config.methods.push(AuthMethod.PIN);
    }
  }
}
