/**
 * @file bridge.interface.ts
 * @description 크로스체인 브릿지 기능을 위한 인터페이스 정의
 */

import { Transaction } from '../../types/transactions.types';

/**
 * 브릿지 제공자 상태
 */
export enum BridgeProviderState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

/**
 * 브릿지 전송 방향
 */
export enum BridgeDirection {
  CATENA_TO_ETHEREUM = 'catena-to-ethereum',
  ETHEREUM_TO_CATENA = 'ethereum-to-catena',
  CATENA_TO_POLYGON = 'catena-to-polygon',
  POLYGON_TO_CATENA = 'polygon-to-catena',
  CATENA_TO_ARBITRUM = 'catena-to-arbitrum',
  ARBITRUM_TO_CATENA = 'arbitrum-to-catena'
}

/**
 * 브릿지 트랜잭션 타입
 */
export enum BridgeTransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  APPROVAL = 'approval',
  CLAIM = 'claim'
}

/**
 * 브릿지 트랜잭션 상태
 */
export enum BridgeTransactionStatus {
  INITIATED = 'initiated',
  PENDING_SOURCE_CONFIRMATION = 'pending-source-confirmation',
  SOURCE_CONFIRMED = 'source-confirmed',
  WAITING_RELAY = 'waiting-relay',
  PENDING_DESTINATION_CONFIRMATION = 'pending-destination-confirmation',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

/**
 * 브릿지 토큰 정보
 */
export interface BridgeToken {
  symbol: string;
  name: string;
  decimals: number;
  sourceAddress: string;
  destinationAddress: string;
  sourceChainId: number;
  destinationChainId: number;
  minAmount: string;
  maxAmount: string;
  isNative: boolean;
  logoURI?: string;
}

/**
 * 브릿지 수수료 정보
 */
export interface BridgeFee {
  fixedFee: string;
  percentageFee: number;
  gasTokenSymbol: string;
  feeInUSD?: string;
  currency: string;
}

/**
 * 브릿지 견적 요청
 */
export interface BridgeQuoteRequest {
  sourceChainId: number;
  destinationChainId: number;
  tokenAddress: string;
  amount: string;
  sender: string;
  recipient?: string;
}

/**
 * 브릿지 견적 응답
 */
export interface BridgeQuoteResponse {
  sourceChainId: number;
  destinationChainId: number;
  tokenAddress: string;
  amount: string;
  amountReceived: string;
  bridgeFee: BridgeFee;
  estimatedGasCost: string;
  estimatedTime: number; // 초 단위
  validUntil: number; // 타임스탬프
  path?: string[]; // 브릿지 경로
  provider: string; // 브릿지 제공자
  requiredAllowance?: string; // 필요한 허용량
  quoteId?: string; // 고유 견적 ID
}

/**
 * 브릿지 트랜잭션 정보
 */
export interface BridgeTransactionInfo {
  id: string;
  sourceChainId: number;
  destinationChainId: number;
  sourceTokenAddress: string;
  destinationTokenAddress: string;
  sourceAmount: string;
  destinationAmount: string;
  sender: string;
  recipient: string;
  sourceTransactionHash?: string;
  destinationTransactionHash?: string;
  status: BridgeTransactionStatus;
  createdAt: number;
  updatedAt: number;
  estimatedCompletionTime?: number;
  fee: BridgeFee;
  type: BridgeTransactionType;
  provider: string;
  error?: string;
}

/**
 * 브릿지 잔액 정보
 */
export interface BridgeBalanceInfo {
  sourceChainId: number;
  destinationChainId: number;
  tokenAddress: string;
  symbol: string;
  balance: string;
  decimals: number;
  claimable: boolean;
  pendingAmount: string;
}

/**
 * 브릿지 트랜잭션 요청
 */
export interface BridgeTransactionRequest {
  quoteId?: string; // 견적 ID (옵션)
  sourceChainId: number;
  destinationChainId: number;
  tokenAddress: string;
  amount: string;
  sender: string;
  recipient: string;
  referrer?: string; // 추천인 (옵션)
}

/**
 * 브릿지 트랜잭션 응답
 */
export interface BridgeTransactionResponse {
  transactionId: string;
  sourceTransaction: Transaction;
  bridgeTransactionInfo: BridgeTransactionInfo;
}

/**
 * 브릿지 제공자 인터페이스
 */
export interface BridgeProvider {
  /**
   * 제공자 이름
   */
  readonly name: string;
  
  /**
   * 제공자 상태
   */
  readonly state: BridgeProviderState;
  
  /**
   * 지원하는 체인 ID 목록
   */
  readonly supportedChains: number[];
  
  /**
   * 지원하는 토큰 목록 가져오기
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 지원하는 토큰 목록
   */
  getSupportedTokens(sourceChainId: number, destinationChainId: number): Promise<BridgeToken[]>;
  
  /**
   * 브릿지 전송 견적 가져오기
   * 
   * @param request 견적 요청
   * @returns 견적 응답
   */
  getQuote(request: BridgeQuoteRequest): Promise<BridgeQuoteResponse>;
  
  /**
   * 브릿지 트랜잭션 생성
   * 
   * @param request 트랜잭션 요청
   * @returns 트랜잭션 응답
   */
  createTransaction(request: BridgeTransactionRequest): Promise<BridgeTransactionResponse>;
  
  /**
   * 브릿지 트랜잭션 상태 조회
   * 
   * @param transactionId 트랜잭션 ID
   * @returns 트랜잭션 정보
   */
  getTransactionStatus(transactionId: string): Promise<BridgeTransactionInfo>;
  
  /**
   * 지갑 주소의 클레임 가능한 잔액 조회
   * 
   * @param address 지갑 주소
   * @param chainId 체인 ID
   * @returns 잔액 정보 목록
   */
  getClaimableBalances(address: string, chainId: number): Promise<BridgeBalanceInfo[]>;
  
  /**
   * 클레임 트랜잭션 생성
   * 
   * @param address 지갑 주소
   * @param balanceInfo 잔액 정보
   * @returns 트랜잭션 응답
   */
  createClaimTransaction(address: string, balanceInfo: BridgeBalanceInfo): Promise<BridgeTransactionResponse>;
  
  /**
   * 토큰 허용량 확인
   * 
   * @param tokenAddress 토큰 주소
   * @param owner 소유자 주소
   * @param spender 스펜더 주소
   * @param chainId 체인 ID
   * @returns 허용량 (wei 단위 문자열)
   */
  checkAllowance(tokenAddress: string, owner: string, spender: string, chainId: number): Promise<string>;
  
  /**
   * 토큰 허용량 승인 트랜잭션 생성
   * 
   * @param tokenAddress 토큰 주소
   * @param spender 스펜더 주소
   * @param amount 금액 (wei 단위 문자열)
   * @param chainId 체인 ID
   * @returns 트랜잭션 객체
   */
  createApprovalTransaction(tokenAddress: string, spender: string, amount: string, chainId: number): Promise<Transaction>;
  
  /**
   * 리스너 등록
   * 
   * @param event 이벤트 이름
   * @param listener 리스너 함수
   */
  on(event: string, listener: (...args: any[]) => void): void;
  
  /**
   * 리스너 제거
   * 
   * @param event 이벤트 이름
   * @param listener 리스너 함수
   */
  off(event: string, listener: (...args: any[]) => void): void;
  
  /**
   * 일회성 리스너 등록
   * 
   * @param event 이벤트 이름
   * @param listener 리스너 함수
   */
  once(event: string, listener: (...args: any[]) => void): void;
  
  /**
   * 모든 리스너 제거
   * 
   * @param event 이벤트 이름 (옵션)
   */
  removeAllListeners(event?: string): void;
}

/**
 * 기본 브릿지 제공자 인터페이스
 */
export interface BridgeProviderFactory {
  /**
   * 브릿지 제공자 생성
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 브릿지 제공자
   */
  createBridgeProvider(sourceChainId: number, destinationChainId: number): BridgeProvider;
  
  /**
   * 지원하는 제공자 목록 가져오기
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 제공자 이름 목록
   */
  getSupportedProviders(sourceChainId: number, destinationChainId: number): string[];
  
  /**
   * 제공자 등록
   * 
   * @param name 제공자 이름
   * @param provider 제공자 클래스
   * @param supportedChains 지원하는 체인 ID 목록
   */
  registerProvider(name: string, provider: any, supportedChains: number[]): void;
}

/**
 * 브릿지 이벤트 타입
 */
export enum BridgeEventType {
  TRANSACTION_CREATED = 'transaction-created',
  TRANSACTION_UPDATED = 'transaction-updated',
  TRANSACTION_COMPLETED = 'transaction-completed',
  TRANSACTION_FAILED = 'transaction-failed',
  PROVIDER_STATE_CHANGED = 'provider-state-changed',
  ERROR = 'error',
  ALLOWANCE_NEEDED = 'allowance-needed'
}

/**
 * 브릿지 오류 코드
 */
export enum BridgeErrorCode {
  INSUFFICIENT_FUNDS = 'insufficient-funds',
  INSUFFICIENT_ALLOWANCE = 'insufficient-allowance',
  INVALID_AMOUNT = 'invalid-amount',
  UNSUPPORTED_TOKEN = 'unsupported-token',
  UNSUPPORTED_CHAIN = 'unsupported-chain',
  PROVIDER_ERROR = 'provider-error',
  USER_REJECTED = 'user-rejected',
  TRANSACTION_FAILED = 'transaction-failed',
  TRANSACTION_TIMEOUT = 'transaction-timeout',
  QUOTE_EXPIRED = 'quote-expired',
  NETWORK_ERROR = 'network-error',
  UNKNOWN_ERROR = 'unknown-error'
}

/**
 * 브릿지 오류
 */
export class BridgeError extends Error {
  code: BridgeErrorCode;
  details?: any;
  
  constructor(code: BridgeErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'BridgeError';
    this.code = code;
    this.details = details;
  }
}
