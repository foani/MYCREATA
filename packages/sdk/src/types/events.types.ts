/**
 * CreLink 이벤트 타입
 */
export enum EventType {
  /**
   * 계정 변경 이벤트
   */
  ACCOUNTS_CHANGED = 'accountsChanged',
  
  /**
   * 체인 변경 이벤트
   */
  CHAIN_CHANGED = 'chainChanged',
  
  /**
   * 연결 해제 이벤트
   */
  DISCONNECT = 'disconnect',
  
  /**
   * 연결 이벤트
   */
  CONNECT = 'connect',
  
  /**
   * 메시지 이벤트
   */
  MESSAGE = 'message',
}

/**
 * 연결 정보
 */
export interface ConnectInfo {
  /**
   * 체인 ID
   */
  chainId: string;
}

/**
 * 연결 해제 오류
 */
export interface ProviderRpcError extends Error {
  /**
   * 오류 코드
   */
  code: number;
  
  /**
   * 오류 데이터
   */
  data?: unknown;
}

/**
 * 메시지 이벤트 데이터
 */
export interface ProviderMessage {
  /**
   * 메시지 유형
   */
  type: string;
  
  /**
   * 메시지 데이터
   */
  data: unknown;
}

/**
 * 이벤트 데이터 타입 맵핑
 */
export interface EventData {
  [EventType.ACCOUNTS_CHANGED]: string[];
  [EventType.CHAIN_CHANGED]: string;
  [EventType.CONNECT]: ConnectInfo;
  [EventType.DISCONNECT]: ProviderRpcError;
  [EventType.MESSAGE]: ProviderMessage;
}
