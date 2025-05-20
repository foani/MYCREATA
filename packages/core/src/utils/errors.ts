/**
 * errors.ts
 * 
 * CreLink 지갑에서 사용되는 모든 커스텀 오류 클래스를 정의합니다.
 */

/**
 * 모든 CreLink 오류의 기본 클래스
 */
export class CreLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreLinkError';
    
    // ES6 클래스를 확장한 오류에서 prototype 체인 유지
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 암호화 관련 오류
 */
export class CryptoError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'CryptoError';
  }
}

/**
 * 키 관리 관련 오류
 */
export class KeyManagementError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'KeyManagementError';
  }
}

/**
 * 키스토어 관련 오류
 */
export class KeystoreError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'KeystoreError';
  }
}

/**
 * 니모닉 관련 오류
 */
export class MnemonicError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'MnemonicError';
  }
}

/**
 * 인증 관련 오류
 */
export class AuthenticationError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * 스토리지 관련 오류
 */
export class StorageError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * 네트워크 관련 오류
 */
export class NetworkError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * 체인 관련 오류
 */
export class ChainError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'ChainError';
  }
}

/**
 * 트랜잭션 관련 오류
 */
export class TransactionError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionError';
  }
}

/**
 * 가스 관련 오류
 */
export class GasError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'GasError';
  }
}

/**
 * RPC 요청 관련 오류
 */
export class RpcError extends CreLinkError {
  public code?: number;
  public data?: any;
  
  constructor(message: string, code?: number, data?: any) {
    super(message);
    this.name = 'RpcError';
    this.code = code;
    this.data = data;
  }
}

/**
 * 서명 관련 오류
 */
export class SignatureError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'SignatureError';
  }
}

/**
 * DApp 연결 관련 오류
 */
export class DAppConnectionError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'DAppConnectionError';
  }
}

/**
 * 입력 검증 관련 오류
 */
export class ValidationError extends CreLinkError {
  public field?: string;
  
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * 잘못된 파라미터 오류
 */
export class InvalidParameterError extends CreLinkError {
  public parameter?: string;
  
  constructor(message: string, parameter?: string) {
    super(message);
    this.name = 'InvalidParameterError';
    this.parameter = parameter;
  }
}

/**
 * 지원되지 않는 기능 오류
 */
export class UnsupportedFeatureError extends CreLinkError {
  public feature?: string;
  
  constructor(message: string, feature?: string) {
    super(message);
    this.name = 'UnsupportedFeatureError';
    this.feature = feature;
  }
}

/**
 * 리소스를 찾을 수 없음 오류
 */
export class NotFoundError extends CreLinkError {
  public resource?: string;
  
  constructor(message: string, resource?: string) {
    super(message);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

/**
 * 중복 리소스 오류
 */
export class DuplicateResourceError extends CreLinkError {
  public resource?: string;
  
  constructor(message: string, resource?: string) {
    super(message);
    this.name = 'DuplicateResourceError';
    this.resource = resource;
  }
}

/**
 * 타임아웃 오류
 */
export class TimeoutError extends CreLinkError {
  public operation?: string;
  
  constructor(message: string, operation?: string) {
    super(message);
    this.name = 'TimeoutError';
    this.operation = operation;
  }
}

/**
 * 디바이스 관련 오류
 */
export class DeviceError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'DeviceError';
  }
}

/**
 * 복구 관련 오류
 */
export class RecoveryError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'RecoveryError';
  }
}

/**
 * 동기화 관련 오류
 */
export class SyncError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'SyncError';
  }
}

/**
 * 권한 관련 오류
 */
export class PermissionError extends CreLinkError {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * 에러 유틸리티 함수들
 */
export class ErrorUtils {
  /**
   * RPC 에러 코드를 기반으로 사용자 친화적인 메시지 생성
   * @param code RPC 에러 코드
   * @param message 원본 에러 메시지
   * @returns 사용자 친화적인 메시지
   */
  public static getReadableErrorMessage(code: number, message: string): string {
    switch (code) {
      case -32700:
        return '잘못된 JSON 형식입니다.';
      case -32600:
        return '잘못된 요청입니다.';
      case -32601:
        return '지원되지 않는 메서드입니다.';
      case -32602:
        return '잘못된 파라미터입니다.';
      case -32603:
        return '내부 오류가 발생했습니다.';
      case 4001:
        return '사용자가 요청을 거부했습니다.';
      case 4100:
        return '인증되지 않은 계정입니다.';
      case 4200:
        return '지원되지 않는 메서드입니다.';
      case 4900:
        return '연결이 끊겼습니다.';
      case 4901:
        return '체인 연결이 끊겼습니다.';
      default:
        // 가스 관련 오류 메시지
        if (message.includes('gas') && message.includes('allowance')) {
          return '가스 한도가 부족합니다. 가스 한도를 높여보세요.';
        }
        // 논스 관련 오류 메시지
        if (message.includes('nonce')) {
          return '트랜잭션 논스 오류입니다. 이미 처리된 트랜잭션일 수 있습니다.';
        }
        // 잔액 부족 오류 메시지
        if (message.includes('insufficient funds')) {
          return '잔액이 부족합니다. 가스비를 포함한 충분한 잔액이 필요합니다.';
        }
        // 서명 오류 메시지
        if (message.includes('signature')) {
          return '서명 오류가 발생했습니다. 다시 시도해주세요.';
        }
        // 기본 메시지
        return message;
    }
  }
  
  /**
   * JS/TS 에러 객체를 CreLink 에러로 변환
   * @param error 원본 에러
   * @returns CreLink 에러
   */
  public static fromError(error: any): CreLinkError {
    if (error instanceof CreLinkError) {
      return error;
    }
    
    // 에러 메시지 추출
    const message = error.message || error.toString();
    
    // 에러 타입에 따라 적절한 CreLink 에러 생성
    if (message.includes('crypto') || message.includes('cipher')) {
      return new CryptoError(message);
    }
    
    if (message.includes('key') || message.includes('mnemonic')) {
      return new KeyManagementError(message);
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return new NetworkError(message);
    }
    
    if (message.includes('transaction')) {
      return new TransactionError(message);
    }
    
    if (message.includes('gas')) {
      return new GasError(message);
    }
    
    if (message.includes('signature')) {
      return new SignatureError(message);
    }
    
    if (message.includes('RPC')) {
      return new RpcError(message);
    }
    
    if (message.includes('timeout')) {
      return new TimeoutError(message);
    }
    
    // 기본적으로 일반 CreLink 에러 반환
    return new CreLinkError(message);
  }
}
