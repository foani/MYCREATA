/**
 * 기본 RPC 응답 인터페이스
 */
export interface RPCResponse<T> {
  /**
   * JSON-RPC 버전
   */
  jsonrpc: string;
  
  /**
   * 요청 ID
   */
  id: number | string;
  
  /**
   * 응답 결과
   */
  result?: T;
  
  /**
   * 오류 정보
   */
  error?: RPCError;
}

/**
 * RPC 오류 인터페이스
 */
export interface RPCError {
  /**
   * 오류 코드
   */
  code: number;
  
  /**
   * 오류 메시지
   */
  message: string;
  
  /**
   * 추가 오류 데이터
   */
  data?: any;
}

/**
 * 계정 응답
 */
export type AccountsResponse = string[];

/**
 * 체인 ID 응답
 */
export type ChainIdResponse = string;

/**
 * 트랜잭션 해시 응답
 */
export type TransactionHashResponse = string;

/**
 * 서명 응답
 */
export type SignatureResponse = string;

/**
 * 가스 추정 응답
 */
export type EstimateGasResponse = string;

/**
 * 가스 가격 응답
 */
export type GasPriceResponse = string;

/**
 * 트랜잭션 카운트 응답
 */
export type TransactionCountResponse = string;

/**
 * 잔액 응답
 */
export type BalanceResponse = string;

/**
 * 호출 응답
 */
export type CallResponse = string;

/**
 * 클라이언트 버전 응답
 */
export type ClientVersionResponse = string;

/**
 * 네트워크 버전 응답
 */
export type NetworkVersionResponse = string;

/**
 * 권한 응답
 */
export interface PermissionResponse {
  /**
   * 권한 주체
   */
  parentCapability: string;
  
  /**
   * 메서드 이름
   */
  method: string;
  
  /**
   * 권한에 대한 추가 데이터
   */
  caveats?: any[];
}

/**
 * CreLink 지갑 오류 코드
 */
export enum ErrorCode {
  // 표준 JSON-RPC 오류
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  
  // CreLink 지갑 오류
  USER_REJECTED = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
  CHAIN_DISCONNECTED = 4901,
  CHAIN_NOT_ADDED = 4902,
  
  // 기타 오류
  RESOURCE_UNAVAILABLE = 4000,
  RESOURCE_NOT_FOUND = 4004,
  TIMEOUT = 4008,
  
  // 서버 오류
  SERVER_ERROR = -32000,
  
  // 미정의 오류
  UNKNOWN_ERROR = -1
}
