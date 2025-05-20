/**
 * @file index.ts
 * @description Catena 네트워크 최적화 모듈의 메인 진입점
 */

import { createLogger } from '../../utils/logging';
import { SupportedChainId } from '../../types/chain.types';
import config, { 
  ChainOptimizationConfig, 
  getChainOptimizationConfig,
  updateChainOptimizationConfig
} from './config';
import caching, { Cache, RpcCache } from './caching';
import performance, { 
  PerformanceTestResult, 
  ConnectionTestResult, 
  runAllPerformanceTests,
  compareCatenaNetworks
} from './performance';

// 로거 생성
const logger = createLogger('CatenaOptimization');

/**
 * 최적화 관리자 클래스
 */
export class OptimizationManager {
  private static instance: OptimizationManager;
  
  // 캐시 인스턴스
  private rpcCaches: Map<number, RpcCache> = new Map();
  
  // 성능 테스트 결과
  private performanceResults: Map<number, PerformanceTestResult[]> = new Map();
  
  /**
   * 싱글톤 인스턴스 가져오기
   */
  public static getInstance(): OptimizationManager {
    if (!OptimizationManager.instance) {
      OptimizationManager.instance = new OptimizationManager();
    }
    
    return OptimizationManager.instance;
  }
  
  /**
   * 생성자 (private)
   */
  private constructor() {
    logger.info('Optimization manager initialized');
    this.initializeCaches();
  }
  
  /**
   * 캐시 초기화
   */
  private initializeCaches(): void {
    // 각 체인별 RPC 캐시 생성
    for (const chainId of [
      SupportedChainId.CATENA_MAINNET,
      SupportedChainId.CATENA_TESTNET
    ]) {
      const config = getChainOptimizationConfig(chainId);
      
      if (config.cacheEnabled) {
        this.rpcCaches.set(
          chainId,
          new RpcCache({
            ttl: config.cacheTTL,
            maxSize: config.maxCacheSize,
            storageKey: `crelink_rpc_cache_${chainId}`,
            persistent: true
          })
        );
        
        logger.info(`RPC cache initialized for chain ID ${chainId}`);
      }
    }
  }
  
  /**
   * 특정 체인에 대한 RPC 캐시 가져오기
   * 
   * @param chainId 체인 ID
   * @returns RPC 캐시 또는 undefined (비활성화된 경우)
   */
  public getRpcCache(chainId: number): RpcCache | undefined {
    return this.rpcCaches.get(chainId);
  }
  
  /**
   * 특정 체인에 대한 RPC 캐시 설정/업데이트
   * 
   * @param chainId 체인 ID
   * @param options 캐시 옵션
   */
  public setRpcCache(chainId: number, options: { 
    enabled: boolean,
    ttl?: number,
    maxSize?: number
  }): void {
    const config = getChainOptimizationConfig(chainId);
    
    // 캐시 비활성화
    if (!options.enabled) {
      this.rpcCaches.delete(chainId);
      
      // 설정 업데이트
      updateChainOptimizationConfig(chainId, { 
        cacheEnabled: false
      });
      
      logger.info(`RPC cache disabled for chain ID ${chainId}`);
      return;
    }
    
    // 캐시 활성화 또는 업데이트
    const ttl = options.ttl || config.cacheTTL;
    const maxSize = options.maxSize || config.maxCacheSize;
    
    // 설정 업데이트
    updateChainOptimizationConfig(chainId, { 
      cacheEnabled: true,
      cacheTTL: ttl,
      maxCacheSize: maxSize
    });
    
    // 기존 캐시가 있으면 옵션 업데이트
    if (this.rpcCaches.has(chainId)) {
      const cache = this.rpcCaches.get(chainId)!;
      cache.updateOptions({ 
        ttl,
        maxSize
      });
      
      logger.info(`RPC cache updated for chain ID ${chainId}`);
      return;
    }
    
    // 새 캐시 생성
    this.rpcCaches.set(
      chainId,
      new RpcCache({
        ttl,
        maxSize,
        storageKey: `crelink_rpc_cache_${chainId}`,
        persistent: true
      })
    );
    
    logger.info(`RPC cache initialized for chain ID ${chainId}`);
  }
  
  /**
   * 모든 캐시 지우기
   */
  public clearAllCaches(): void {
    for (const [chainId, cache] of this.rpcCaches.entries()) {
      cache.clear();
      logger.info(`Cleared cache for chain ID ${chainId}`);
    }
  }
  
  /**
   * 특정 체인에 대한 캐시 지우기
   * 
   * @param chainId 체인 ID
   */
  public clearCache(chainId: number): void {
    const cache = this.rpcCaches.get(chainId);
    
    if (cache) {
      cache.clear();
      logger.info(`Cleared cache for chain ID ${chainId}`);
    }
  }
  
  /**
   * RPC 메서드 결과 캐싱
   * 
   * @param chainId 체인 ID
   * @param method RPC 메서드
   * @param params 파라미터
   * @param result 결과
   * @param ttl TTL (밀리초, 옵션)
   */
  public cacheRpcResult(
    chainId: number,
    method: string,
    params: any[],
    result: any,
    ttl?: number
  ): void {
    const cache = this.rpcCaches.get(chainId);
    
    if (!cache) {
      return;
    }
    
    // 캐시 가능한 메서드인지 확인
    if (!RpcCache.isCacheableMethod(method)) {
      return;
    }
    
    // 캐시 키 생성
    const key = RpcCache.createCacheKey(method, params, chainId);
    
    // 결과 캐싱
    if (ttl) {
      cache.set(key, result, ttl);
    } else {
      // 메서드별 적절한 TTL 사용
      cache.set(key, result, RpcCache.getTtlForMethod(method));
    }
  }
  
  /**
   * 캐시된 RPC 메서드 결과 가져오기
   * 
   * @param chainId 체인 ID
   * @param method RPC 메서드
   * @param params 파라미터
   * @returns 캐시된 결과 또는 undefined
   */
  public getCachedRpcResult(
    chainId: number,
    method: string,
    params: any[]
  ): any | undefined {
    const cache = this.rpcCaches.get(chainId);
    
    if (!cache) {
      return undefined;
    }
    
    // 캐시 키 생성
    const key = RpcCache.createCacheKey(method, params, chainId);
    
    // 캐시된 결과 가져오기
    return cache.get(key);
  }
  
  /**
   * 특정 체인에 대한 성능 테스트 실행
   * 
   * @param chainId 체인 ID
   * @param iterations 반복 횟수
   * @returns 성능 테스트 결과
   */
  public async runPerformanceTests(
    chainId: number,
    iterations: number = 5
  ): Promise<PerformanceTestResult[]> {
    logger.info(`Running performance tests for chain ID ${chainId} with ${iterations} iterations`);
    
    try {
      const results = await runAllPerformanceTests(chainId, iterations);
      
      // 결과 저장
      this.performanceResults.set(chainId, results);
      
      return results;
    } catch (error) {
      logger.error(`Error running performance tests: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Catena 메인넷과 테스트넷 네트워크 비교
   * 
   * @returns 연결 테스트 결과 또는 undefined (오류 발생 시)
   */
  public async compareCatenaNetworks(): Promise<ConnectionTestResult[] | undefined> {
    logger.info('Comparing Catena Mainnet and Testnet networks');
    
    try {
      return await compareCatenaNetworks();
    } catch (error) {
      logger.error(`Error comparing networks: ${error.message}`);
      return undefined;
    }
  }
  
  /**
   * 최적화 설정 자동 생성
   * 
   * @param chainId 체인 ID
   * @param environment 환경 ('production' | 'development' | 'test')
   * @returns 성공 여부
   */
  public autoOptimize(
    chainId: number,
    environment: 'production' | 'development' | 'test' = 'production'
  ): boolean {
    logger.info(`Auto-optimizing chain ID ${chainId} for ${environment} environment`);
    
    try {
      // 최적 설정 생성
      const optimalConfig = config.generateOptimalConfig(chainId, environment);
      
      // 설정 업데이트
      updateChainOptimizationConfig(chainId, optimalConfig);
      
      // 캐시 업데이트
      this.setRpcCache(chainId, { 
        enabled: optimalConfig.cacheEnabled,
        ttl: optimalConfig.cacheTTL,
        maxSize: optimalConfig.maxCacheSize
      });
      
      logger.info(`Auto-optimization complete for chain ID ${chainId}`);
      return true;
    } catch (error) {
      logger.error(`Error auto-optimizing chain ID ${chainId}: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 모든 지원되는 체인에 대한 최적화 실행
   * 
   * @param environment 환경 ('production' | 'development' | 'test')
   * @returns 성공한 체인 ID 목록
   */
  public autoOptimizeAll(
    environment: 'production' | 'development' | 'test' = 'production'
  ): number[] {
    logger.info(`Auto-optimizing all chains for ${environment} environment`);
    
    const chains = [
      SupportedChainId.CATENA_MAINNET,
      SupportedChainId.CATENA_TESTNET,
    ];
    
    const successfulChains: number[] = [];
    
    for (const chainId of chains) {
      if (this.autoOptimize(chainId, environment)) {
        successfulChains.push(chainId);
      }
    }
    
    logger.info(`Auto-optimization complete for ${successfulChains.length}/${chains.length} chains`);
    return successfulChains;
  }
  
  /**
   * 성능 테스트 결과 가져오기
   * 
   * @param chainId 체인 ID (옵션, 제공되지 않으면 모든 결과 반환)
   * @returns 성능 테스트 결과
   */
  public getPerformanceResults(chainId?: number): PerformanceTestResult[] {
    if (chainId !== undefined) {
      return this.performanceResults.get(chainId) || [];
    }
    
    // 모든 결과 병합
    return Array.from(this.performanceResults.values()).flat();
  }
  
  /**
   * 성능 테스트 결과 지우기
   * 
   * @param chainId 체인 ID (옵션, 제공되지 않으면 모든 결과 지움)
   */
  public clearPerformanceResults(chainId?: number): void {
    if (chainId !== undefined) {
      this.performanceResults.delete(chainId);
      logger.info(`Cleared performance results for chain ID ${chainId}`);
      return;
    }
    
    this.performanceResults.clear();
    logger.info('Cleared all performance results');
  }
  
  /**
   * 최적화 관리자 해제
   */
  public dispose(): void {
    // 모든 캐시 해제
    for (const cache of this.rpcCaches.values()) {
      cache.dispose();
    }
    
    this.rpcCaches.clear();
    this.performanceResults.clear();
    
    logger.info('Optimization manager disposed');
  }
}

// 기본 최적화 관리자 인스턴스
const defaultOptimizationManager = OptimizationManager.getInstance();

export {
  ChainOptimizationConfig,
  PerformanceTestResult,
  ConnectionTestResult,
  Cache,
  RpcCache,
  OptimizationManager,
  getChainOptimizationConfig,
  updateChainOptimizationConfig,
  defaultOptimizationManager
};

export default defaultOptimizationManager;
