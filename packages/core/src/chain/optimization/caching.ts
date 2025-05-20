/**
 * @file caching.ts
 * @description Catena 네트워크 성능 향상을 위한 캐싱 메커니즘
 */

import { createLogger } from '../../utils/logging';

// 로거 생성
const logger = createLogger('CatenaCaching');

/**
 * 캐시 항목 인터페이스
 */
interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiry: number;
}

/**
 * 캐시 옵션 인터페이스
 */
export interface CacheOptions {
  ttl: number; // Time to live (밀리초)
  maxSize?: number; // 최대 캐시 크기
  storageKey?: string; // 로컬 스토리지 키
  persistent?: boolean; // 영구 저장 여부
}

/**
 * 캐시 통계 인터페이스
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  createdAt: number;
  lastCleanup: number;
  avgAccessTime: number;
  lastAccess: number;
  oldestItem: number;
}

/**
 * 기본 캐시 옵션
 */
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 30000, // 30초
  maxSize: 100,
  persistent: false
};

/**
 * 제너릭 캐시 클래스
 */
export class Cache<T> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private options: CacheOptions;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  /**
   * Cache 생성자
   * 
   * @param options 캐시 옵션
   */
  constructor(options: Partial<CacheOptions> = {}) {
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      createdAt: Date.now(),
      lastCleanup: Date.now(),
      avgAccessTime: 0,
      lastAccess: Date.now(),
      oldestItem: Date.now()
    };
    
    // 영구 저장소에서 복원 (옵션이 활성화된 경우)
    if (this.options.persistent && this.options.storageKey) {
      this.restoreFromStorage();
    }
    
    // 자동 정리 설정
    this.setupAutoCleanup();
  }
  
  /**
   * 캐시에 항목 설정
   * 
   * @param key 키
   * @param value 값
   * @param ttl 개별 TTL (옵션)
   */
  set(key: string, value: T, ttl?: number): void {
    const timestamp = Date.now();
    const expiry = timestamp + (ttl || this.options.ttl);
    
    this.cache.set(key, { value, timestamp, expiry });
    this.stats.size = this.cache.size;
    
    // 최대 크기를 초과하면 가장 오래된 항목 제거
    if (this.options.maxSize && this.cache.size > this.options.maxSize) {
      this.removeOldest();
    }
    
    // 영구 저장소에 저장 (옵션이 활성화된 경우)
    if (this.options.persistent && this.options.storageKey) {
      this.saveToStorage();
    }
    
    logger.debug(`Cache set: ${key}`);
  }
  
  /**
   * 캐시에서 항목 가져오기
   * 
   * @param key 키
   * @returns 값 또는 undefined (만료된 경우)
   */
  get(key: string): T | undefined {
    const startTime = Date.now();
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      logger.debug(`Cache miss: ${key}`);
      return undefined;
    }
    
    // 항목이 만료되었는지 확인
    if (item.expiry < startTime) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      logger.debug(`Cache expired: ${key}`);
      return undefined;
    }
    
    // 통계 업데이트
    this.stats.hits++;
    this.stats.lastAccess = startTime;
    const accessTime = Date.now() - startTime;
    this.stats.avgAccessTime = ((this.stats.avgAccessTime * (this.stats.hits - 1)) + accessTime) / this.stats.hits;
    
    logger.debug(`Cache hit: ${key}`);
    return item.value;
  }
  
  /**
   * 캐시에서 항목 확인 (가져오지 않고 존재 여부만 확인)
   * 
   * @param key 키
   * @returns 존재 여부 (만료되지 않은 경우에만 true)
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // 항목이 만료되었는지 확인
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }
    
    return true;
  }
  
  /**
   * 캐시에서 항목 삭제
   * 
   * @param key 키
   * @returns 삭제 성공 여부
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    
    if (result) {
      this.stats.size = this.cache.size;
      
      // 영구 저장소에서도 삭제 (옵션이 활성화된 경우)
      if (this.options.persistent && this.options.storageKey) {
        this.saveToStorage();
      }
      
      logger.debug(`Cache delete: ${key}`);
    }
    
    return result;
  }
  
  /**
   * 캐시 통계 가져오기
   * 
   * @returns 캐시 통계
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  /**
   * 캐시 모든 항목 지우기
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    
    // 영구 저장소에서도 삭제 (옵션이 활성화된 경우)
    if (this.options.persistent && this.options.storageKey) {
      this.clearStorage();
    }
    
    logger.debug('Cache cleared');
  }
  
  /**
   * 모든 만료된 항목 제거
   * 
   * @returns 제거된 항목 수
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      this.stats.size = this.cache.size;
      this.stats.lastCleanup = now;
      
      // 영구 저장소 업데이트 (옵션이 활성화된 경우)
      if (this.options.persistent && this.options.storageKey) {
        this.saveToStorage();
      }
      
      logger.debug(`Cache cleanup: removed ${removedCount} items`);
    }
    
    return removedCount;
  }
  
  /**
   * 캐시 크기 가져오기
   * 
   * @returns 캐시 크기
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * 가장 오래된 항목 제거
   * 
   * @returns 제거된 항목의 키 또는 undefined
   */
  private removeOldest(): string | undefined {
    let oldest: [string, CacheItem<T>] | null = null;
    
    for (const entry of this.cache.entries()) {
      if (!oldest || entry[1].timestamp < oldest[1].timestamp) {
        oldest = entry;
      }
    }
    
    if (oldest) {
      const [key] = oldest;
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      
      // 영구 저장소 업데이트 (옵션이 활성화된 경우)
      if (this.options.persistent && this.options.storageKey) {
        this.saveToStorage();
      }
      
      logger.debug(`Cache removed oldest item: ${key}`);
      return key;
    }
    
    return undefined;
  }
  
  /**
   * 모든 항목의 키 목록 가져오기
   * 
   * @returns 키 배열
   */
  keys(): string[] {
    // 만료된 항목 제거
    this.cleanup();
    
    return Array.from(this.cache.keys());
  }
  
  /**
   * 모든 항목의 값 목록 가져오기
   * 
   * @returns 값 배열
   */
  values(): T[] {
    // 만료된 항목 제거
    this.cleanup();
    
    return Array.from(this.cache.values()).map(item => item.value);
  }
  
  /**
   * 모든 항목의 키-값 쌍 가져오기
   * 
   * @returns 키-값 쌍 배열
   */
  entries(): [string, T][] {
    // 만료된 항목 제거
    this.cleanup();
    
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value]);
  }
  
  /**
   * 모든 항목에 대해 함수 실행
   * 
   * @param callback 실행할 함수
   */
  forEach(callback: (value: T, key: string) => void): void {
    // 만료된 항목 제거
    this.cleanup();
    
    for (const [key, item] of this.cache.entries()) {
      callback(item.value, key);
    }
  }
  
  /**
   * 특정 키 패턴과 일치하는 항목 삭제
   * 
   * @param pattern 정규식 패턴
   * @returns 삭제된 항목 수
   */
  deletePattern(pattern: RegExp): number {
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.stats.size = this.cache.size;
      
      // 영구 저장소 업데이트 (옵션이 활성화된 경우)
      if (this.options.persistent && this.options.storageKey) {
        this.saveToStorage();
      }
      
      logger.debug(`Cache pattern delete: removed ${count} items`);
    }
    
    return count;
  }
  
  /**
   * 캐시 옵션 업데이트
   * 
   * @param options 새로운 옵션
   */
  updateOptions(options: Partial<CacheOptions>): void {
    this.options = { ...this.options, ...options };
    
    // 자동 정리 재설정
    this.setupAutoCleanup();
    
    logger.debug('Cache options updated');
  }
  
  /**
   * 자동 정리 설정
   */
  private setupAutoCleanup(): void {
    // 이전 정리 인터벌 제거
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // TTL의 절반마다 정리 실행
    const cleanupFrequency = Math.max(this.options.ttl / 2, 1000); // 최소 1초
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupFrequency);
  }
  
  /**
   * 캐시를 영구 저장소에 저장
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      logger.warn('localStorage is not available');
      return;
    }
    
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        stats: this.stats
      };
      
      localStorage.setItem(this.options.storageKey!, JSON.stringify(data));
      logger.debug(`Cache saved to localStorage: ${this.options.storageKey}`);
    } catch (error) {
      logger.error(`Failed to save cache to localStorage: ${error.message}`);
    }
  }
  
  /**
   * 영구 저장소에서 캐시 복원
   */
  private restoreFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      logger.warn('localStorage is not available');
      return;
    }
    
    try {
      const json = localStorage.getItem(this.options.storageKey!);
      
      if (!json) {
        return;
      }
      
      const data = JSON.parse(json);
      
      if (data.cache) {
        this.cache = new Map(data.cache);
        
        // 만료된 항목 제거
        this.cleanup();
      }
      
      if (data.stats) {
        this.stats = { ...data.stats };
      }
      
      logger.debug(`Cache restored from localStorage: ${this.options.storageKey}`);
    } catch (error) {
      logger.error(`Failed to restore cache from localStorage: ${error.message}`);
    }
  }
  
  /**
   * 영구 저장소에서 캐시 삭제
   */
  private clearStorage(): void {
    if (typeof localStorage === 'undefined') {
      logger.warn('localStorage is not available');
      return;
    }
    
    try {
      localStorage.removeItem(this.options.storageKey!);
      logger.debug(`Cache removed from localStorage: ${this.options.storageKey}`);
    } catch (error) {
      logger.error(`Failed to remove cache from localStorage: ${error.message}`);
    }
  }
  
  /**
   * 클래스 소멸 시 정리
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    logger.debug('Cache disposed');
  }
}

/**
 * 특정 함수 결과를 캐싱하는 함수
 * 
 * @param fn 캐싱할 함수
 * @param keyFn 캐시 키 생성 함수
 * @param options 캐시 옵션
 * @returns 캐싱된 함수
 */
export function memoize<T, A extends any[]>(
  fn: (...args: A) => Promise<T>,
  keyFn: (...args: A) => string = (...args) => JSON.stringify(args),
  options?: Partial<CacheOptions>
): (...args: A) => Promise<T> {
  const cache = new Cache<T>(options);
  
  return async (...args: A): Promise<T> => {
    const key = keyFn(...args);
    
    // 캐시에서 값 확인
    const cachedValue = cache.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    // 함수 실행 및 결과 캐싱
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * RPC 요청 캐싱을 위한 특수 캐시
 */
export class RpcCache extends Cache<any> {
  constructor(options?: Partial<CacheOptions>) {
    // RPC 캐시는 기본적으로 짧은 TTL을 가짐
    super({
      ttl: 5000, // 5초
      maxSize: 200,
      ...options
    });
  }
  
  /**
   * 특정 메서드에 대한 TTL 생성
   * 
   * @param method RPC 메서드
   * @returns TTL (밀리초)
   */
  static getTtlForMethod(method: string): number {
    switch (method) {
      case 'eth_blockNumber':
        return 3000; // 3초
      case 'eth_getBalance':
        return 10000; // 10초
      case 'eth_getTransactionCount':
        return 5000; // 5초
      case 'eth_gasPrice':
        return 10000; // 10초
      case 'eth_call':
        return 5000; // 5초
      case 'eth_getCode':
        return 60000; // 1분 (잘 변경되지 않음)
      case 'eth_getBlockByNumber':
        return 20000; // 20초
      case 'eth_getBlockByHash':
        return 60000; // 1분 (해시로 조회하면 절대 변경되지 않음)
      case 'eth_getTransactionByHash':
        return 60000; // 1분 (해시로 조회하면 절대 변경되지 않음)
      case 'eth_getTransactionReceipt':
        return 60000; // 1분 (해시로 조회하면 절대 변경되지 않음)
      case 'eth_getLogs':
        return 30000; // 30초
      case 'net_version':
        return 300000; // 5분 (거의 변경되지 않음)
      case 'web3_clientVersion':
        return 300000; // 5분 (거의 변경되지 않음)
      default:
        return 5000; // 기본 5초
    }
  }
  
  /**
   * 캐시 가능한 메서드 확인
   * 
   * @param method RPC 메서드
   * @returns 캐시 가능 여부
   */
  static isCacheableMethod(method: string): boolean {
    // 읽기 전용 메서드만 캐싱
    const cacheableMethods = [
      'eth_blockNumber',
      'eth_getBalance',
      'eth_getTransactionCount',
      'eth_gasPrice',
      'eth_call',
      'eth_getCode',
      'eth_getBlockByNumber',
      'eth_getBlockByHash',
      'eth_getTransactionByHash',
      'eth_getTransactionReceipt',
      'eth_getLogs',
      'eth_estimateGas',
      'net_version',
      'web3_clientVersion',
      'eth_chainId'
    ];
    
    return cacheableMethods.includes(method);
  }
  
  /**
   * RPC 요청 캐싱을 위한 키 생성
   * 
   * @param method RPC 메서드
   * @param params RPC 파라미터
   * @param chainId 체인 ID
   * @returns 캐시 키
   */
  static createCacheKey(method: string, params: any[], chainId: number): string {
    return `${chainId}:${method}:${JSON.stringify(params)}`;
  }
}

export default {
  Cache,
  RpcCache,
  memoize
};
