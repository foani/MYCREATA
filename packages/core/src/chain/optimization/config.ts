/**
 * @file config.ts
 * @description Catena 네트워크 성능 최적화를 위한 설정
 */

import { createLogger } from '../../utils/logging';
import { SupportedChainId } from '../../types/chain.types';

// 로거 생성
const logger = createLogger('OptimizationConfig');

/**
 * 네트워크 체인별 성능 최적화 설정
 */
export interface ChainOptimizationConfig {
  chainId: number;
  
  // 요청 관련 설정
  requestTimeout: number; // 요청 타임아웃 (밀리초)
  maxRetries: number; // 최대 재시도 횟수
  retryDelay: number; // 재시도 지연 시간 (밀리초)
  batchSize: number; // 배치 요청 크기
  
  // 폴링 관련 설정
  pollingInterval: number; // 기본 폴링 간격 (밀리초)
  blockPollingInterval: number; // 블록 폴링 간격 (밀리초)
  transactionPollingInterval: number; // 트랜잭션 폴링 간격 (밀리초)
  
  // 캐싱 관련 설정
  cacheEnabled: boolean; // 캐시 활성화 여부
  cacheTTL: number; // 캐시 TTL (밀리초)
  maxCacheSize: number; // 최대 캐시 크기
  
  // 가스 관련 설정
  gasPriceIncreasePercentage: number; // 가스 가격 증가 비율 (%)
  minGasPrice: string; // 최소 가스 가격 (wei)
  maxGasPrice: string; // 최대 가스 가격 (wei)
  gasLimitBuffer: number; // 가스 한도 버퍼 (%)
  
  // 연결 관련 설정
  connectionTimeout: number; // 연결 타임아웃 (밀리초)
  maxSocketsPerHost: number; // 호스트별 최대 소켓 수
  keepAliveTimeout: number; // Keep-Alive 타임아웃 (밀리초)
  
  // 로깅 관련 설정
  verboseLogging: boolean; // 자세한 로깅 활성화 여부
  logRpcCalls: boolean; // RPC 호출 로깅 여부
  logRpcResponses: boolean; // RPC 응답 로깅 여부
  
  // 기타 설정
  useWebsocket: boolean; // WebSocket 사용 여부
  excludedMethodsFromCache: string[]; // 캐시에서 제외할 메서드
  autoDisconnect: boolean; // 자동 연결 해제 여부
  autoDisconnectTimeout: number; // 자동 연결 해제 타임아웃 (밀리초)
}

/**
 * 기본 성능 최적화 설정
 */
const DEFAULT_OPTIMIZATION_CONFIG: Omit<ChainOptimizationConfig, 'chainId'> = {
  // 요청 관련 설정
  requestTimeout: 30000, // 30초
  maxRetries: 3,
  retryDelay: 1000, // 1초
  batchSize: 10,
  
  // 폴링 관련 설정
  pollingInterval: 12000, // 12초
  blockPollingInterval: 12000, // 12초
  transactionPollingInterval: 5000, // 5초
  
  // 캐싱 관련 설정
  cacheEnabled: true,
  cacheTTL: 30000, // 30초
  maxCacheSize: 100,
  
  // 가스 관련 설정
  gasPriceIncreasePercentage: 10, // 10%
  minGasPrice: '1000000000', // 1 Gwei
  maxGasPrice: '500000000000', // 500 Gwei
  gasLimitBuffer: 20, // 20%
  
  // 연결 관련 설정
  connectionTimeout: 20000, // 20초
  maxSocketsPerHost: 5,
  keepAliveTimeout: 60000, // 1분
  
  // 로깅 관련 설정
  verboseLogging: false,
  logRpcCalls: false,
  logRpcResponses: false,
  
  // 기타 설정
  useWebsocket: false,
  excludedMethodsFromCache: ['eth_sendRawTransaction', 'eth_sendTransaction'],
  autoDisconnect: true,
  autoDisconnectTimeout: 300000 // 5분
};

/**
 * 체인별 최적화 설정
 */
const CHAIN_OPTIMIZATION_CONFIGS: Map<number, ChainOptimizationConfig> = new Map([
  // Catena 메인넷
  [
    SupportedChainId.CATENA_MAINNET,
    {
      chainId: SupportedChainId.CATENA_MAINNET,
      ...DEFAULT_OPTIMIZATION_CONFIG,
      
      // Catena 메인넷 특화 설정
      pollingInterval: 12000, // Catena 블록 시간 기반 (12초)
      blockPollingInterval: 12000, // Catena 블록 시간 기반 (12초)
      minGasPrice: '2000000000', // 2 Gwei (메인넷은 조금 더 높게 설정)
      cacheTTL: 12000, // 12초 (Catena 블록 시간)
      gasPriceIncreasePercentage: 15 // 15% (메인넷은 조금 더 높게 설정)
    }
  ],
  
  // Catena 테스트넷
  [
    SupportedChainId.CATENA_TESTNET,
    {
      chainId: SupportedChainId.CATENA_TESTNET,
      ...DEFAULT_OPTIMIZATION_CONFIG,
      
      // Catena 테스트넷 특화 설정
      pollingInterval: 12000, // Catena 테스트넷 블록 시간 기반 (12초)
      blockPollingInterval: 12000, // Catena 테스트넷 블록 시간 기반 (12초)
      minGasPrice: '1000000000', // 1 Gwei (테스트넷은 낮게 설정)
      maxRetries: 5, // 테스트넷은 재시도 횟수 증가
      verboseLogging: true, // 테스트넷은 자세한 로깅 활성화
      logRpcCalls: true // 테스트넷은 RPC 호출 로깅 활성화
    }
  ]
]);

/**
 * 체인 ID에 대한 최적화 설정 가져오기
 * 
 * @param chainId 체인 ID
 * @returns 최적화 설정
 */
export function getChainOptimizationConfig(chainId: number): ChainOptimizationConfig {
  const config = CHAIN_OPTIMIZATION_CONFIGS.get(chainId);
  
  if (config) {
    return { ...config };
  }
  
  // 기본 설정 적용
  logger.warn(`No optimization config found for chain ID ${chainId}, using default config`);
  return { chainId, ...DEFAULT_OPTIMIZATION_CONFIG };
}

/**
 * 체인 ID에 대한 최적화 설정 업데이트
 * 
 * @param chainId 체인 ID
 * @param config 업데이트할 설정
 */
export function updateChainOptimizationConfig(
  chainId: number,
  config: Partial<ChainOptimizationConfig>
): void {
  const existingConfig = CHAIN_OPTIMIZATION_CONFIGS.get(chainId);
  
  if (existingConfig) {
    CHAIN_OPTIMIZATION_CONFIGS.set(chainId, { ...existingConfig, ...config });
  } else {
    CHAIN_OPTIMIZATION_CONFIGS.set(chainId, { 
      chainId,
      ...DEFAULT_OPTIMIZATION_CONFIG,
      ...config
    });
  }
  
  logger.info(`Updated optimization config for chain ID ${chainId}`);
}

/**
 * 최적화 설정 초기화
 */
export function resetChainOptimizationConfig(chainId: number): void {
  if (chainId === SupportedChainId.CATENA_MAINNET) {
    CHAIN_OPTIMIZATION_CONFIGS.set(chainId, {
      chainId,
      ...DEFAULT_OPTIMIZATION_CONFIG,
      pollingInterval: 12000,
      blockPollingInterval: 12000,
      minGasPrice: '2000000000',
      cacheTTL: 12000,
      gasPriceIncreasePercentage: 15
    });
  } else if (chainId === SupportedChainId.CATENA_TESTNET) {
    CHAIN_OPTIMIZATION_CONFIGS.set(chainId, {
      chainId,
      ...DEFAULT_OPTIMIZATION_CONFIG,
      pollingInterval: 12000,
      blockPollingInterval: 12000,
      minGasPrice: '1000000000',
      maxRetries: 5,
      verboseLogging: true,
      logRpcCalls: true
    });
  } else {
    CHAIN_OPTIMIZATION_CONFIGS.delete(chainId);
  }
  
  logger.info(`Reset optimization config for chain ID ${chainId}`);
}

/**
 * 모든 체인에 대한 최적화 설정 가져오기
 * 
 * @returns 모든 체인 최적화 설정
 */
export function getAllChainOptimizationConfigs(): ChainOptimizationConfig[] {
  return Array.from(CHAIN_OPTIMIZATION_CONFIGS.values()).map(config => ({ ...config }));
}

/**
 * 모든 체인에 대한 최적화 설정 저장하기
 * 
 * @param localStorage 로컬 스토리지 (옵션)
 */
export function saveOptimizationConfigs(localStorage?: Storage): void {
  if (!localStorage) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage = window.localStorage;
    } else {
      logger.warn('localStorage is not available');
      return;
    }
  }
  
  try {
    const configs = getAllChainOptimizationConfigs();
    localStorage.setItem('crelink_optimization_configs', JSON.stringify(configs));
    logger.info('Saved optimization configs to localStorage');
  } catch (error) {
    logger.error(`Failed to save optimization configs: ${error.message}`);
  }
}

/**
 * 로컬 스토리지에서 모든 체인에 대한 최적화 설정 불러오기
 * 
 * @param localStorage 로컬 스토리지 (옵션)
 */
export function loadOptimizationConfigs(localStorage?: Storage): void {
  if (!localStorage) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage = window.localStorage;
    } else {
      logger.warn('localStorage is not available');
      return;
    }
  }
  
  try {
    const configsJson = localStorage.getItem('crelink_optimization_configs');
    
    if (!configsJson) {
      logger.info('No saved optimization configs found');
      return;
    }
    
    const configs = JSON.parse(configsJson) as ChainOptimizationConfig[];
    
    for (const config of configs) {
      CHAIN_OPTIMIZATION_CONFIGS.set(config.chainId, config);
    }
    
    logger.info(`Loaded optimization configs for ${configs.length} chains`);
  } catch (error) {
    logger.error(`Failed to load optimization configs: ${error.message}`);
  }
}

/**
 * 체인 ID에 대한 적절한 폴링 간격 계산
 * 
 * @param chainId 체인 ID
 * @returns 폴링 간격 (밀리초)
 */
export function calculateOptimalPollingInterval(chainId: number): number {
  const config = getChainOptimizationConfig(chainId);
  
  // 각 체인의 평균 블록 시간에 따라 최적의 폴링 간격 계산
  switch (chainId) {
    case SupportedChainId.CATENA_MAINNET:
    case SupportedChainId.CATENA_TESTNET:
      return 12000; // Catena의 평균 블록 시간은 12초
    case SupportedChainId.ETHEREUM:
      return 15000; // 이더리움의 평균 블록 시간은 15초
    case SupportedChainId.POLYGON:
      return 3000; // 폴리곤의 평균 블록 시간은 2-3초
    case SupportedChainId.ARBITRUM:
      return 1000; // Arbitrum의 평균 블록 시간은 매우 짧음
    default:
      return config.pollingInterval; // 기본 폴링 간격 사용
  }
}

/**
 * 체인 ID에 대한 적절한 가스 가격 범위 계산
 * 
 * @param chainId 체인 ID
 * @returns 가스 가격 범위 { min: string, max: string } (wei 단위)
 */
export function calculateOptimalGasPriceRange(chainId: number): { min: string, max: string } {
  const config = getChainOptimizationConfig(chainId);
  
  // 각 체인의 일반적인 가스 가격 범위 반환
  switch (chainId) {
    case SupportedChainId.CATENA_MAINNET:
      return { min: '2000000000', max: '100000000000' }; // 2-100 Gwei
    case SupportedChainId.CATENA_TESTNET:
      return { min: '1000000000', max: '50000000000' }; // 1-50 Gwei
    case SupportedChainId.ETHEREUM:
      return { min: '10000000000', max: '500000000000' }; // 10-500 Gwei
    case SupportedChainId.POLYGON:
      return { min: '30000000000', max: '300000000000' }; // 30-300 Gwei
    case SupportedChainId.ARBITRUM:
      return { min: '100000000', max: '2000000000' }; // 0.1-2 Gwei
    default:
      return { min: config.minGasPrice, max: config.maxGasPrice };
  }
}

/**
 * 체인 ID와 환경에 따른 네트워크 연결 재시도 전략 계산
 * 
 * @param chainId 체인 ID
 * @param environment 환경 ('production' | 'development' | 'test')
 * @returns 재시도 설정 { maxRetries: number, retryDelay: number, exponentialBackoff: boolean }
 */
export function calculateRetryStrategy(
  chainId: number,
  environment: 'production' | 'development' | 'test' = 'production'
): { maxRetries: number, retryDelay: number, exponentialBackoff: boolean } {
  const config = getChainOptimizationConfig(chainId);
  
  // 환경별 기본 설정
  const baseStrategy = {
    production: { maxRetries: 3, retryDelay: 1000, exponentialBackoff: true },
    development: { maxRetries: 5, retryDelay: 500, exponentialBackoff: true },
    test: { maxRetries: 2, retryDelay: 300, exponentialBackoff: false }
  }[environment];
  
  // 체인별 특별 처리
  switch (chainId) {
    case SupportedChainId.CATENA_TESTNET:
      // 테스트넷은 더 많은 재시도와 지수 백오프를 사용
      return {
        ...baseStrategy,
        maxRetries: baseStrategy.maxRetries + 2,
        exponentialBackoff: true
      };
    case SupportedChainId.CATENA_MAINNET:
      // 메인넷은 기본 설정보다 조금 긴 지연 시간 사용
      return {
        ...baseStrategy,
        retryDelay: baseStrategy.retryDelay * 1.5
      };
    default:
      return baseStrategy;
  }
}

/**
 * 특정 체인에 대한 자동화된 최적화 설정 생성
 * 
 * @param chainId 체인 ID
 * @param environment 환경 ('production' | 'development' | 'test')
 * @returns 최적화 설정
 */
export function generateOptimalConfig(
  chainId: number,
  environment: 'production' | 'development' | 'test' = 'production'
): ChainOptimizationConfig {
  // 환경별 기본 설정
  const envConfig = {
    production: {
      verboseLogging: false,
      logRpcCalls: false,
      logRpcResponses: false,
      cacheEnabled: true,
      cacheTTL: 30000
    },
    development: {
      verboseLogging: true,
      logRpcCalls: true,
      logRpcResponses: true,
      cacheEnabled: true,
      cacheTTL: 15000
    },
    test: {
      verboseLogging: true,
      logRpcCalls: true,
      logRpcResponses: true,
      cacheEnabled: false,
      cacheTTL: 5000
    }
  }[environment];
  
  // 체인별로 최적화된 설정 반환
  const pollingInterval = calculateOptimalPollingInterval(chainId);
  const gasPriceRange = calculateOptimalGasPriceRange(chainId);
  const retryStrategy = calculateRetryStrategy(chainId, environment);
  
  return {
    chainId,
    ...DEFAULT_OPTIMIZATION_CONFIG,
    ...envConfig,
    pollingInterval,
    blockPollingInterval: pollingInterval,
    transactionPollingInterval: Math.max(1000, pollingInterval / 3),
    minGasPrice: gasPriceRange.min,
    maxGasPrice: gasPriceRange.max,
    maxRetries: retryStrategy.maxRetries,
    retryDelay: retryStrategy.retryDelay,
    // WebSocket 사용 여부는 체인별로 다름
    useWebsocket: [
      SupportedChainId.ETHEREUM,
      SupportedChainId.ARBITRUM
    ].includes(chainId)
  };
}

/**
 * 현재 체인 설정을 기반으로 성능 점수 계산
 * 
 * @param chainId 체인 ID
 * @returns 성능 점수 (0-100)
 */
export function calculatePerformanceScore(chainId: number): number {
  const config = getChainOptimizationConfig(chainId);
  
  // 각 설정 항목에 대한 점수 계산
  const scores = {
    // 캐싱 (0-25점)
    caching: config.cacheEnabled ? (25 * Math.min(1, config.cacheTTL / 60000)) : 0,
    
    // 폴링 간격 최적화 (0-25점)
    polling: 25 * Math.min(1, calculateOptimalPollingInterval(chainId) / config.pollingInterval),
    
    // 재시도 전략 (0-15점)
    retry: Math.min(15, config.maxRetries * 3),
    
    // 배치 크기 (0-10점)
    batch: Math.min(10, config.batchSize),
    
    // 가스 가격 최적화 (0-15점)
    gas: config.gasPriceIncreasePercentage <= 20 ? 15 : (30 - config.gasPriceIncreasePercentage) / 2,
    
    // WebSocket 사용 (0-10점)
    websocket: config.useWebsocket ? 10 : 0
  };
  
  // 총점 계산
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  // 0-100 범위로 제한
  return Math.max(0, Math.min(100, totalScore));
}

export default {
  getChainOptimizationConfig,
  updateChainOptimizationConfig,
  resetChainOptimizationConfig,
  getAllChainOptimizationConfigs,
  saveOptimizationConfigs,
  loadOptimizationConfigs,
  calculateOptimalPollingInterval,
  calculateOptimalGasPriceRange,
  calculateRetryStrategy,
  generateOptimalConfig,
  calculatePerformanceScore
};
