/**
 * @file enhanced-catena.provider.ts
 * @description 성능 최적화가 적용된 Catena 체인 프로바이더
 */

import { JsonRpcProvider, Interface } from 'ethers';
import { Transaction, TransactionReceipt } from '../../types/transactions.types';
import { RpcProviderOptions } from '../../types/chain.types';
import { BaseProvider, ProviderEventType, ProviderState, defaultProviderFactory } from './provider.interface';
import { CatenaProvider, CATENA_MAINNET_CHAIN_ID, CATENA_TESTNET_CHAIN_ID } from './catena.provider';
import { createLogger } from '../../utils/logging';
import { getChainOptimizationConfig } from '../optimization/config';
import { defaultOptimizationManager } from '../optimization';

// 로거 생성
const logger = createLogger('EnhancedCatenaProvider');

/**
 * 향상된 Catena 프로바이더 클래스
 */
export class EnhancedCatenaProvider extends CatenaProvider {
  private requestCache: Map<string, { promise: Promise<any>, timestamp: number }> = new Map();
  private pendingRequests: Set<string> = new Set();
  private requestTimeout: number;
  private maxRetries: number;
  private retryDelay: number;
  private pendingTransactions: Map<string, { timestamp: number, retryCount: number }> = new Map();
  private failedRequests: Map<string, { error: Error, timestamp: number, method: string }> = new Map();
  
  /**
   * 향상된 Catena 프로바이더 생성자
   * 
   * @param url RPC URL
   * @param options 옵션
   */
  constructor(url: string, options: RpcProviderOptions = { url }) {
    super(url, options);
    
    // 최적화 설정 로드
    const chainId = url.includes('testnet') ? CATENA_TESTNET_CHAIN_ID : CATENA_MAINNET_CHAIN_ID;
    const optimizationConfig = getChainOptimizationConfig(chainId);
    
    // 최적화 설정 적용
    this.requestTimeout = options.timeout || optimizationConfig.requestTimeout;
    this.maxRetries = optimizationConfig.maxRetries;
    this.retryDelay = optimizationConfig.retryDelay;
    this.blockPollingInterval = optimizationConfig.blockPollingInterval;
    this.pendingTransactionsPollingInterval = optimizationConfig.transactionPollingInterval;
    
    logger.info(`Enhanced Catena provider initialized for chainId ${chainId}`);
  }
  
  /**
   * RPC 메서드 호출 (캐싱 및 재시도 지원)
   * 
   * @param method 메서드 이름
   * @param params 파라미터
   * @returns 결과
   */
  public async send(method: string, params: any[]): Promise<any> {
    const chainId = this.chainId;
    const cacheKey = JSON.stringify({ method, params });
    
    // 캐시 확인
    const cachedResult = defaultOptimizationManager.getCachedRpcResult(chainId, method, params);
    if (cachedResult !== undefined) {
      logger.debug(`Using cached result for ${method}`);
      return cachedResult;
    }
    
    // 중복 요청 처리
    if (this.pendingRequests.has(cacheKey)) {
      logger.debug(`Reusing pending request for ${method}`);
      return this.getPendingRequest(cacheKey);
    }
    
    // 새 요청 생성
    try {
      // 요청 등록
      const promise = this.executeWithRetry(method, params);
      this.pendingRequests.add(cacheKey);
      this.requestCache.set(cacheKey, { promise, timestamp: Date.now() });
      
      // 요청 실행 및 결과 캐싱
      const result = await promise;
      defaultOptimizationManager.cacheRpcResult(chainId, method, params, result);
      
      // 요청 완료
      this.pendingRequests.delete(cacheKey);
      return result;
    } catch (error) {
      // 요청 실패
      this.pendingRequests.delete(cacheKey);
      this.failedRequests.set(cacheKey, { 
        error, 
        timestamp: Date.now(),
        method
      });
      throw error;
    }
  }
  
  /**
   * 재시도 로직이 포함된 RPC 요청 실행
   * 
   * @param method 메서드 이름
   * @param params 파라미터
   * @returns 결과
   */
  private async executeWithRetry(method: string, params: any[]): Promise<any> {
    let lastError: Error | null = null;
    
    // 최대 재시도 횟수만큼 시도
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // 타임아웃 적용된 요청
        const result = await this.executeWithTimeout(method, params);
        
        // 첫 시도가 아닌 경우 성공 로그
        if (attempt > 0) {
          logger.info(`Request ${method} succeeded after ${attempt} retries`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // 마지막 시도인 경우 실패
        if (attempt === this.maxRetries) {
          logger.error(`Request ${method} failed after ${attempt} retries: ${error.message}`);
          throw error;
        }
        
        // 재시도 대기
        const delay = this.retryDelay * Math.pow(1.5, attempt);
        logger.warn(`Request ${method} failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // 이 코드는 실행되지 않아야 함 (위에서 예외 발생)
    throw lastError || new Error(`Request ${method} failed for unknown reason`);
  }
  
  /**
   * 타임아웃 적용된 RPC 요청 실행
   * 
   * @param method 메서드 이름
   * @param params 파라미터
   * @returns 결과
   */
  private async executeWithTimeout(method: string, params: any[]): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      // 타임아웃 설정
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request ${method} timed out after ${this.requestTimeout}ms`));
      }, this.requestTimeout);
      
      try {
        // 요청 실행
        const result = await super.send(method, params);
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }
  
  /**
   * 대기 중인 요청 가져오기 (이미 진행 중인 동일 요청 재사용)
   * 
   * @param cacheKey 캐시 키
   * @returns 요청 결과
   */
  private async getPendingRequest(cacheKey: string): Promise<any> {
    const cached = this.requestCache.get(cacheKey);
    
    if (!cached) {
      throw new Error(`No pending request found for key ${cacheKey}`);
    }
    
    try {
      return await cached.promise;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * 트랜잭션 전송 (강화된 모니터링 포함)
   * 
   * @param signedTransaction 서명된 트랜잭션
   * @returns 트랜잭션 해시
   */
  public async sendTransaction(signedTransaction: string): Promise<string> {
    try {
      // 기본 전송 메서드 호출
      const txHash = await super.sendTransaction(signedTransaction);
      
      // 트랜잭션 모니터링 시작
      this.monitorTransaction(txHash);
      
      return txHash;
    } catch (error) {
      logger.error(`Error sending transaction: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 트랜잭션 모니터링
   * 
   * @param txHash 트랜잭션 해시
   */
  private monitorTransaction(txHash: string): void {
    // 모니터링 상태 저장
    this.pendingTransactions.set(txHash, { 
      timestamp: Date.now(),
      retryCount: 0
    });
    
    // 모니터링 시작
    this.pollTransaction(txHash);
  }
  
  /**
   * 트랜잭션 폴링
   * 
   * @param txHash 트랜잭션 해시
   */
  private async pollTransaction(txHash: string): Promise<void> {
    if (!this.pendingTransactions.has(txHash)) {
      return;
    }
    
    try {
      const receipt = await this.getTransactionReceipt(txHash);
      
      if (receipt) {
        // 트랜잭션 확인됨
        this.pendingTransactions.delete(txHash);
        
        // 이벤트 발생
        this.emit(ProviderEventType.TRANSACTION_CONFIRMED, {
          hash: txHash,
          receipt
        });
        
        logger.info(`Transaction ${txHash} confirmed`);
        return;
      }
      
      // 아직 확인되지 않음, 재시도
      const pendingTx = this.pendingTransactions.get(txHash)!;
      pendingTx.retryCount++;
      
      // 타임아웃 체크 (10분)
      if (Date.now() - pendingTx.timestamp > 600000) {
        this.pendingTransactions.delete(txHash);
        
        // 이벤트 발생
        this.emit(ProviderEventType.TRANSACTION_TIMEOUT, {
          hash: txHash
        });
        
        logger.warn(`Transaction ${txHash} timed out after 10 minutes`);
        return;
      }
      
      // 다음 폴링 예약
      setTimeout(() => {
        this.pollTransaction(txHash);
      }, this.pendingTransactionsPollingInterval);
    } catch (error) {
      logger.error(`Error polling transaction ${txHash}: ${error.message}`);
      
      // 에러에도 불구하고 계속 폴링
      const pendingTx = this.pendingTransactions.get(txHash);
      if (pendingTx) {
        pendingTx.retryCount++;
        
        // 다음 폴링 예약 (에러 시 간격 증가)
        setTimeout(() => {
          this.pollTransaction(txHash);
        }, this.pendingTransactionsPollingInterval * 1.5);
      }
    }
  }
  
  /**
   * 잔액 조회 (캐싱 적용)
   * 
   * @param address 주소
   * @returns 잔액 (wei 단위 문자열)
   */
  public async getBalance(address: string): Promise<string> {
    return this.send('eth_getBalance', [address, 'latest']);
  }
  
  /**
   * 프로바이더 상태 통계 가져오기
   * 
   * @returns 상태 통계
   */
  public getStats(): any {
    return {
      pendingRequests: this.pendingRequests.size,
      pendingTransactions: this.pendingTransactions.size,
      failedRequests: this.failedRequests.size,
      isConnected: this.isConnected,
      lastBlockNumber: this.lastBlockNumber,
      cacheInfo: defaultOptimizationManager.getRpcCache(this.chainId)?.getStats()
    };
  }
  
  /**
   * 오래된 캐시 및 요청 정리
   */
  private cleanupOldCaches(): void {
    const now = Date.now();
    
    // 오래된 실패한 요청 제거 (1시간 이상)
    for (const [key, { timestamp }] of this.failedRequests.entries()) {
      if (now - timestamp > 3600000) {
        this.failedRequests.delete(key);
      }
    }
    
    // 오래된 요청 캐시 제거 (10분 이상)
    for (const [key, { timestamp }] of this.requestCache.entries()) {
      if (now - timestamp > 600000) {
        this.requestCache.delete(key);
      }
    }
  }
  
  /**
   * 연결 종료 시 정리
   */
  public async disconnect(): Promise<void> {
    // 기본 연결 종료
    await super.disconnect();
    
    // 리소스 정리
    this.pendingRequests.clear();
    this.pendingTransactions.clear();
    this.requestCache.clear();
    this.failedRequests.clear();
    
    logger.info(`Disconnected enhanced Catena provider for chainId ${this.chainId}`);
  }
}

// 향상된 Catena 프로바이더 등록
defaultProviderFactory.registerProvider(
  CATENA_MAINNET_CHAIN_ID,
  EnhancedCatenaProvider as any,
  'enhanced'
);

defaultProviderFactory.registerProvider(
  CATENA_TESTNET_CHAIN_ID,
  EnhancedCatenaProvider as any,
  'enhanced'
);

export default EnhancedCatenaProvider;
