/**
 * @file provider.interface.ts
 * @description 네트워크 프로바이더 인터페이스 정의
 */

import { RpcProvider, RpcProviderOptions } from '../../types/chain.types';
import { Transaction, TransactionReceipt } from '../../types/transactions.types';

/**
 * 이벤트 타입
 */
export enum ProviderEventType {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  NETWORK_CHANGED = 'networkChanged',
  BLOCK = 'block',
  TRANSACTION = 'transaction',
  PENDING = 'pending'
}

/**
 * 프로바이더 상태
 */
export enum ProviderState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

/**
 * 프로바이더 인터페이스
 */
export interface IProvider extends RpcProvider {
  /**
   * 프로바이더 상태
   */
  readonly state: ProviderState;
  
  /**
   * 연결 상태
   */
  readonly isConnected: boolean;
  
  /**
   * 프로바이더 초기화
   */
  initialize(): Promise<void>;
  
  /**
   * 연결 시작
   */
  connect(): Promise<void>;
  
  /**
   * 연결 종료
   */
  disconnect(): Promise<void>;
  
  /**
   * 재연결
   */
  reconnect(): Promise<void>;
  
  /**
   * 토큰 잔액 조회
   * 
   * @param address 계정 주소
   * @param tokenAddress 토큰 계약 주소
   * @returns 잔액 (문자열)
   */
  getTokenBalance(address: string, tokenAddress: string): Promise<string>;
  
  /**
   * 코드 조회
   * 
   * @param address 계약 주소
   * @returns 계약 코드 (16진수 문자열)
   */
  getCode(address: string): Promise<string>;
  
  /**
   * 논스 조회
   * 
   * @param address 계정 주소
   * @returns 논스 (숫자)
   */
  getNonce(address: string): Promise<number>;
  
  /**
   * 가스 가격 조회
   * 
   * @returns 가스 가격 (wei 단위 문자열)
   */
  getGasPrice(): Promise<string>;
  
  /**
   * 가스 견적
   * 
   * @param transaction 트랜잭션
   * @returns 견적 가스 (wei 단위 문자열)
   */
  estimateGas(transaction: Transaction): Promise<string>;
  
  /**
   * 현재 블록 번호 조회
   * 
   * @returns 블록 번호
   */
  getBlockNumber(): Promise<number>;
  
  /**
   * 트랜잭션 영수증 조회
   * 
   * @param hash 트랜잭션 해시
   * @returns 트랜잭션 영수증
   */
  getTransactionReceipt(hash: string): Promise<TransactionReceipt | null>;
  
  /**
   * EIP-1559 지원 여부 확인
   * 
   * @returns 지원 여부 (true/false)
   */
  supportsEIP1559(): Promise<boolean>;
  
  /**
   * ABI 호출
   * 
   * @param abi ABI
   * @param address 계약 주소
   * @param method 메서드 이름
   * @param params 파라미터
   * @returns 결과 (any)
   */
  callContract(abi: any[], address: string, method: string, params: any[]): Promise<any>;
  
  /**
   * 이벤트 리스너 추가
   * 
   * @param event 이벤트 타입
   * @param listener 리스너 함수
   */
  on(event: ProviderEventType, listener: (...args: any[]) => void): void;
  
  /**
   * 이벤트 리스너 한 번만 추가
   * 
   * @param event 이벤트 타입
   * @param listener 리스너 함수
   */
  once(event: ProviderEventType, listener: (...args: any[]) => void): void;
  
  /**
   * 이벤트 리스너 제거
   * 
   * @param event 이벤트 타입
   * @param listener 리스너 함수
   */
  off(event: ProviderEventType, listener: (...args: any[]) => void): void;
  
  /**
   * 모든 이벤트 리스너 제거
   * 
   * @param event 이벤트 타입 (선택 사항)
   */
  removeAllListeners(event?: ProviderEventType): void;
}

/**
 * 기본 프로바이더 추상 클래스
 */
export abstract class BaseProvider implements IProvider {
  public readonly chainId: number;
  public readonly url: string;
  public state: ProviderState = ProviderState.DISCONNECTED;
  
  protected options: RpcProviderOptions;
  protected eventHandlers: Record<string, Array<(...args: any[]) => void>> = {};
  
  /**
   * 기본 프로바이더 생성자
   * 
   * @param chainId 체인 ID
   * @param url RPC URL
   * @param options 옵션
   */
  constructor(chainId: number, url: string, options: RpcProviderOptions = { url }) {
    this.chainId = chainId;
    this.url = url;
    this.options = { ...options, url };
  }
  
  /**
   * 연결 상태 확인
   */
  public get isConnected(): boolean {
    return this.state === ProviderState.CONNECTED;
  }
  
  // 추상 메서드 정의 (각 프로바이더 구현에서 오버라이드)
  abstract initialize(): Promise<void>;
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract reconnect(): Promise<void>;
  abstract send(method: string, params: any[]): Promise<any>;
  abstract getBalance(address: string): Promise<string>;
  abstract getTokenBalance(address: string, tokenAddress: string): Promise<string>;
  abstract getCode(address: string): Promise<string>;
  abstract getNonce(address: string): Promise<number>;
  abstract getGasPrice(): Promise<string>;
  abstract estimateGas(transaction: Transaction): Promise<string>;
  abstract getBlockNumber(): Promise<number>;
  abstract getBlock(blockHashOrNumber: string | number): Promise<any>;
  abstract getTransaction(transactionHash: string): Promise<any>;
  abstract getTransactionReceipt(hash: string): Promise<TransactionReceipt | null>;
  abstract call(transaction: any): Promise<string>;
  abstract sendTransaction(signedTransaction: string): Promise<string>;
  abstract supportsEIP1559(): Promise<boolean>;
  abstract callContract(abi: any[], address: string, method: string, params: any[]): Promise<any>;
  abstract getTransactionCount(address: string): Promise<number>;
  
  /**
   * 이벤트 리스너 추가
   * 
   * @param event 이벤트 타입
   * @param listener 리스너 함수
   */
  public on(event: string, listener: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(listener);
  }
  
  /**
   * 이벤트 리스너 한 번만 추가
   * 
   * @param event 이벤트 타입
   * @param listener 리스너 함수
   */
  public once(event: string, listener: (...args: any[]) => void): void {
    const onceListener = (...args: any[]) => {
      this.off(event, onceListener);
      listener(...args);
    };
    this.on(event, onceListener);
  }
  
  /**
   * 이벤트 리스너 제거
   * 
   * @param event 이벤트 타입
   * @param listener 리스너 함수
   */
  public off(event: string, listener: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) {
      return;
    }
    this.eventHandlers[event] = this.eventHandlers[event].filter(l => l !== listener);
  }
  
  /**
   * 모든 이벤트 리스너 제거
   * 
   * @param event 이벤트 타입 (선택 사항)
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.eventHandlers[event] = [];
    } else {
      this.eventHandlers = {};
    }
  }
  
  /**
   * 이벤트 발생
   * 
   * @param event 이벤트 타입
   * @param args 인자
   */
  protected emit(event: string, ...args: any[]): void {
    if (!this.eventHandlers[event]) {
      return;
    }
    
    for (const listener of this.eventHandlers[event]) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
  }
  
  /**
   * 프로바이더 상태 변경
   * 
   * @param newState 새 상태
   */
  protected setState(newState: ProviderState): void {
    const oldState = this.state;
    this.state = newState;
    
    if (oldState !== newState) {
      if (newState === ProviderState.CONNECTED) {
        this.emit(ProviderEventType.CONNECT, { chainId: this.chainId });
      } else if (newState === ProviderState.DISCONNECTED) {
        this.emit(ProviderEventType.DISCONNECT, { chainId: this.chainId });
      } else if (newState === ProviderState.ERROR) {
        this.emit(ProviderEventType.ERROR, { chainId: this.chainId });
      }
    }
  }
  
  /**
   * 에러 처리
   * 
   * @param error 에러 객체
   */
  protected handleError(error: any): void {
    console.error(`Provider error (chainId: ${this.chainId}):`, error);
    this.setState(ProviderState.ERROR);
    this.emit(ProviderEventType.ERROR, { chainId: this.chainId, error });
  }
  
  /**
   * 요청 타임아웃 생성
   * 
   * @param ms 타임아웃 (밀리초)
   * @returns Promise
   */
  protected createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${ms}ms`));
      }, ms);
    });
  }
  
  /**
   * 폴링 설정
   * 
   * @param method 호출할 메서드
   * @param interval 주기 (밀리초)
   * @returns 정리 함수
   */
  protected setupPolling(method: () => Promise<any>, interval: number): () => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let active = true;
    
    const poll = async () => {
      if (!active) return;
      
      try {
        await method();
      } catch (error) {
        console.error('Polling error:', error);
      }
      
      if (active) {
        timeoutId = setTimeout(poll, interval);
      }
    };
    
    poll();
    
    return () => {
      active = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }
}

/**
 * 프로바이더 팩토리 인터페이스
 */
export interface IProviderFactory {
  /**
   * 프로바이더 생성
   * 
   * @param chainId 체인 ID
   * @param options 옵션
   * @returns 프로바이더 인스턴스
   */
  createProvider(chainId: number, options?: RpcProviderOptions): IProvider;
  
  /**
   * 프로바이더 존재 여부 확인
   * 
   * @param chainId 체인 ID
   * @returns 존재 여부
   */
  hasProvider(chainId: number): boolean;
  
  /**
   * 프로바이더 가져오기
   * 
   * @param chainId 체인 ID
   * @returns 프로바이더 인스턴스 또는 null
   */
  getProvider(chainId: number): IProvider | null;
  
  /**
   * 모든 프로바이더 가져오기
   * 
   * @returns 프로바이더 맵
   */
  getAllProviders(): Map<number, IProvider>;
  
  /**
   * 프로바이더 제거
   * 
   * @param chainId 체인 ID
   * @returns 제거 성공 여부
   */
  removeProvider(chainId: number): boolean;
}

/**
 * 기본 프로바이더 팩토리
 */
export class ProviderFactory implements IProviderFactory {
  protected providers: Map<number, IProvider> = new Map();
  protected providerConstructors: Map<number, new (url: string, options?: RpcProviderOptions) => IProvider> = new Map();
  protected defaultUrls: Map<number, string> = new Map();
  
  /**
   * 프로바이더 등록
   * 
   * @param chainId 체인 ID
   * @param providerConstructor 프로바이더 생성자
   * @param defaultUrl 기본 URL
   */
  public registerProvider(
    chainId: number,
    providerConstructor: new (url: string, options?: RpcProviderOptions) => IProvider,
    defaultUrl: string
  ): void {
    this.providerConstructors.set(chainId, providerConstructor);
    this.defaultUrls.set(chainId, defaultUrl);
  }
  
  /**
   * 프로바이더 생성
   * 
   * @param chainId 체인 ID
   * @param options 옵션
   * @returns 프로바이더 인스턴스
   */
  public createProvider(chainId: number, options?: RpcProviderOptions): IProvider {
    const existingProvider = this.providers.get(chainId);
    if (existingProvider) {
      return existingProvider;
    }
    
    const Constructor = this.providerConstructors.get(chainId);
    if (!Constructor) {
      throw new Error(`No provider constructor registered for chainId ${chainId}`);
    }
    
    const url = (options && options.url) || this.defaultUrls.get(chainId);
    if (!url) {
      throw new Error(`No URL provided or default URL registered for chainId ${chainId}`);
    }
    
    const provider = new Constructor(url, options);
    this.providers.set(chainId, provider);
    
    return provider;
  }
  
  /**
   * 프로바이더 존재 여부 확인
   * 
   * @param chainId 체인 ID
   * @returns 존재 여부
   */
  public hasProvider(chainId: number): boolean {
    return this.providers.has(chainId);
  }
  
  /**
   * 프로바이더 가져오기
   * 
   * @param chainId 체인 ID
   * @returns 프로바이더 인스턴스 또는 null
   */
  public getProvider(chainId: number): IProvider | null {
    return this.providers.get(chainId) || null;
  }
  
  /**
   * 모든 프로바이더 가져오기
   * 
   * @returns 프로바이더 맵
   */
  public getAllProviders(): Map<number, IProvider> {
    return new Map(this.providers);
  }
  
  /**
   * 프로바이더 제거
   * 
   * @param chainId 체인 ID
   * @returns 제거 성공 여부
   */
  public removeProvider(chainId: number): boolean {
    const provider = this.providers.get(chainId);
    if (provider) {
      provider.disconnect().catch(console.error);
      this.providers.delete(chainId);
      return true;
    }
    return false;
  }
}

/**
 * 기본 프로바이더 팩토리 인스턴스
 */
export const defaultProviderFactory = new ProviderFactory();
