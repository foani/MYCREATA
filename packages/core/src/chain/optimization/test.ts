/**
 * @file test.ts
 * @description Catena 네트워크 최적화 테스트 스크립트
 */

import { SupportedChainId } from '../../types/chain.types';
import { CatenaProvider, CATENA_MAINNET_RPC_URL, CATENA_TESTNET_RPC_URL } from '../providers/catena.provider';
import { EnhancedCatenaProvider } from '../providers/enhanced-catena.provider';
import { createLogger } from '../../utils/logging';
import { getChainOptimizationConfig, updateChainOptimizationConfig } from './config';
import { benchmarkGasEstimation, benchmarkTransactionRetrieval, benchmarkBlockRetrieval, testChainConnectivity } from './performance';
import defaultOptimizationManager from './index';

// 로거 생성
const logger = createLogger('CatenaOptimizationTest');

/**
 * 테스트 결과 인터페이스
 */
interface TestResult {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * 기본 Catena 프로바이더와 향상된 프로바이더 성능 비교
 * 
 * @param chainId 체인 ID
 * @param iterations 테스트 반복 횟수
 * @returns 테스트 결과
 */
export async function compareProviders(
  chainId: number = SupportedChainId.CATENA_MAINNET, 
  iterations: number = 10
): Promise<{ standard: TestResult, enhanced: TestResult }> {
  logger.info(`Comparing providers for chain ID ${chainId} with ${iterations} iterations`);
  
  // RPC URL 결정
  const rpcUrl = chainId === SupportedChainId.CATENA_MAINNET
    ? CATENA_MAINNET_RPC_URL
    : CATENA_TESTNET_RPC_URL;
  
  // 설정 로드
  const config = getChainOptimizationConfig(chainId);
  
  // 표준 프로바이더 테스트
  const standardResult: TestResult = {
    name: 'Standard Provider',
    startTime: Date.now(),
    endTime: 0,
    duration: 0,
    success: false
  };
  
  // 향상된 프로바이더 테스트
  const enhancedResult: TestResult = {
    name: 'Enhanced Provider',
    startTime: 0,
    endTime: 0,
    duration: 0,
    success: false
  };
  
  try {
    // 표준 프로바이더 초기화
    const standardProvider = new CatenaProvider(rpcUrl);
    await standardProvider.initialize();
    
    // 테스트 트랜잭션 (ETH 전송)
    const testTransaction = {
      to: '0x0000000000000000000000000000000000000000',
      from: '0x0000000000000000000000000000000000000001',
      value: '0x16345785d8a0000', // 0.1 ETH
      data: '0x'
    };
    
    // 표준 프로바이더 가스 견적 테스트
    const standardGasTests: { time: number, estimate: string }[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const estimate = await standardProvider.estimateGas(testTransaction);
      const end = Date.now();
      
      standardGasTests.push({
        time: end - start,
        estimate
      });
    }
    
    // 표준 프로바이더 블록 조회 테스트
    const standardBlockTests: { time: number, blockNumber: number }[] = [];
    const latestBlock = await standardProvider.getBlockNumber();
    
    for (let i = 0; i < iterations; i++) {
      const blockToFetch = Math.max(1, latestBlock - i);
      const start = Date.now();
      const block = await standardProvider.getBlock(blockToFetch);
      const end = Date.now();
      
      standardBlockTests.push({
        time: end - start,
        blockNumber: blockToFetch
      });
    }
    
    // 표준 프로바이더 연결 종료
    await standardProvider.disconnect();
    
    // 표준 프로바이더 테스트 완료
    standardResult.endTime = Date.now();
    standardResult.duration = standardResult.endTime - standardResult.startTime;
    standardResult.success = true;
    standardResult.data = {
      gasTests: standardGasTests,
      blockTests: standardBlockTests,
      avgGasTime: standardGasTests.reduce((sum, test) => sum + test.time, 0) / standardGasTests.length,
      avgBlockTime: standardBlockTests.reduce((sum, test) => sum + test.time, 0) / standardBlockTests.length
    };
    
    // 잠시 대기 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 향상된 프로바이더 초기화
    enhancedResult.startTime = Date.now();
    const enhancedProvider = new EnhancedCatenaProvider(rpcUrl);
    await enhancedProvider.initialize();
    
    // 향상된 프로바이더 가스 견적 테스트
    const enhancedGasTests: { time: number, estimate: string }[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const estimate = await enhancedProvider.estimateGas(testTransaction);
      const end = Date.now();
      
      enhancedGasTests.push({
        time: end - start,
        estimate
      });
    }
    
    // 향상된 프로바이더 블록 조회 테스트
    const enhancedBlockTests: { time: number, blockNumber: number }[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const blockToFetch = Math.max(1, latestBlock - i);
      const start = Date.now();
      const block = await enhancedProvider.getBlock(blockToFetch);
      const end = Date.now();
      
      enhancedBlockTests.push({
        time: end - start,
        blockNumber: blockToFetch
      });
    }
    
    // 향상된 프로바이더 연결 종료
    await enhancedProvider.disconnect();
    
    // 향상된 프로바이더 테스트 완료
    enhancedResult.endTime = Date.now();
    enhancedResult.duration = enhancedResult.endTime - enhancedResult.startTime;
    enhancedResult.success = true;
    enhancedResult.data = {
      gasTests: enhancedGasTests,
      blockTests: enhancedBlockTests,
      avgGasTime: enhancedGasTests.reduce((sum, test) => sum + test.time, 0) / enhancedGasTests.length,
      avgBlockTime: enhancedBlockTests.reduce((sum, test) => sum + test.time, 0) / enhancedBlockTests.length,
      providerStats: enhancedProvider.getStats()
    };
    
    // 결과 출력
    logger.info(`Standard Provider - Avg Gas Time: ${standardResult.data.avgGasTime.toFixed(2)}ms, Avg Block Time: ${standardResult.data.avgBlockTime.toFixed(2)}ms`);
    logger.info(`Enhanced Provider - Avg Gas Time: ${enhancedResult.data.avgGasTime.toFixed(2)}ms, Avg Block Time: ${enhancedResult.data.avgBlockTime.toFixed(2)}ms`);
    
    const gasImprovement = (1 - enhancedResult.data.avgGasTime / standardResult.data.avgGasTime) * 100;
    const blockImprovement = (1 - enhancedResult.data.avgBlockTime / standardResult.data.avgBlockTime) * 100;
    
    logger.info(`Performance improvement - Gas: ${gasImprovement.toFixed(2)}%, Block: ${blockImprovement.toFixed(2)}%`);
    
    return { standard: standardResult, enhanced: enhancedResult };
  } catch (error) {
    logger.error(`Error comparing providers: ${error.message}`);
    
    if (!standardResult.endTime) {
      standardResult.endTime = Date.now();
      standardResult.duration = standardResult.endTime - standardResult.startTime;
      standardResult.error = error.message;
    }
    
    if (!enhancedResult.endTime && enhancedResult.startTime > 0) {
      enhancedResult.endTime = Date.now();
      enhancedResult.duration = enhancedResult.endTime - enhancedResult.startTime;
      enhancedResult.error = error.message;
    }
    
    return { standard: standardResult, enhanced: enhancedResult };
  }
}

/**
 * 다양한 설정으로 성능 테스트 실행
 * 
 * @param chainId 체인 ID
 * @returns 테스트 결과
 */
export async function testDifferentConfigurations(
  chainId: number = SupportedChainId.CATENA_TESTNET
): Promise<TestResult[]> {
  logger.info(`Testing different configurations for chain ID ${chainId}`);
  
  const results: TestResult[] = [];
  
  // 원래 설정 저장
  const originalConfig = getChainOptimizationConfig(chainId);
  
  try {
    // 설정 1: 캐싱 비활성화
    const noCacheConfig = {
      ...originalConfig,
      cacheEnabled: false
    };
    
    // 설정 2: 짧은 요청 타임아웃
    const shortTimeoutConfig = {
      ...originalConfig,
      requestTimeout: 5000 // 5초
    };
    
    // 설정 3: 많은 재시도
    const manyRetriesConfig = {
      ...originalConfig,
      maxRetries: 5,
      retryDelay: 500
    };
    
    // 설정 4: 짧은 폴링 간격
    const shortPollingConfig = {
      ...originalConfig,
      pollingInterval: 5000, // 5초
      blockPollingInterval: 5000 // 5초
    };
    
    // 설정 5: 최적화된 설정
    const optimizedConfig = {
      ...originalConfig,
      cacheEnabled: true,
      cacheTTL: 10000, // 10초
      maxCacheSize: 200,
      requestTimeout: 20000, // 20초
      maxRetries: 3,
      retryDelay: 1000, // 1초
      pollingInterval: 12000, // 12초 (Catena 블록 시간)
      blockPollingInterval: 12000, // 12초
      batchSize: 15
    };
    
    // 설정 목록
    const configs = [
      { name: 'No Cache', config: noCacheConfig },
      { name: 'Short Timeout', config: shortTimeoutConfig },
      { name: 'Many Retries', config: manyRetriesConfig },
      { name: 'Short Polling', config: shortPollingConfig },
      { name: 'Optimized', config: optimizedConfig }
    ];
    
    // 각 설정으로 테스트
    for (const { name, config } of configs) {
      const result: TestResult = {
        name: `Config: ${name}`,
        startTime: Date.now(),
        endTime: 0,
        duration: 0,
        success: false
      };
      
      try {
        // 설정 업데이트
        updateChainOptimizationConfig(chainId, config);
        
        // RPC URL 결정
        const rpcUrl = chainId === SupportedChainId.CATENA_MAINNET
          ? CATENA_MAINNET_RPC_URL
          : CATENA_TESTNET_RPC_URL;
        
        // 프로바이더 초기화
        const provider = new EnhancedCatenaProvider(rpcUrl);
        await provider.initialize();
        
        // 가스 견적 테스트
        const gasResult = await benchmarkGasEstimation(chainId, 5);
        
        // 블록 조회 테스트
        const blockResult = await benchmarkBlockRetrieval(chainId, 0, 5);
        
        // 프로바이더 연결 종료
        await provider.disconnect();
        
        // 결과 저장
        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;
        result.success = true;
        result.data = {
          gasResult,
          blockResult,
          config
        };
        
        // 캐시 정리 (다음 테스트를 위해)
        defaultOptimizationManager.clearCache(chainId);
        
        logger.info(`Test completed for config: ${name}`);
      } catch (error) {
        result.endTime = Date.now();
        result.duration = result.endTime - result.startTime;
        result.error = error.message;
        logger.error(`Error testing config ${name}: ${error.message}`);
      }
      
      results.push(result);
      
      // 서버 부하 방지를 위한 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 원래 설정 복원
    updateChainOptimizationConfig(chainId, originalConfig);
    
    // 결과 분석 및 출력
    const successfulResults = results.filter(r => r.success);
    
    if (successfulResults.length > 0) {
      // 각 설정의 가스 견적 평균 시간 비교
      const gasComparison = successfulResults.map(r => ({
        name: r.name,
        avgTime: r.data.gasResult.data.avgTime || 0
      }));
      
      // 각 설정의 블록 조회 평균 시간 비교
      const blockComparison = successfulResults.map(r => ({
        name: r.name,
        avgTime: r.data.blockResult.data.avgTime || 0
      }));
      
      // 정렬하여 최고의 설정 찾기
      gasComparison.sort((a, b) => a.avgTime - b.avgTime);
      blockComparison.sort((a, b) => a.avgTime - b.avgTime);
      
      logger.info('Gas Estimation Comparison:');
      gasComparison.forEach(c => logger.info(`${c.name}: ${c.avgTime.toFixed(2)}ms`));
      
      logger.info('Block Retrieval Comparison:');
      blockComparison.forEach(c => logger.info(`${c.name}: ${c.avgTime.toFixed(2)}ms`));
      
      logger.info(`Best config for gas estimation: ${gasComparison[0].name}`);
      logger.info(`Best config for block retrieval: ${blockComparison[0].name}`);
    }
    
    return results;
  } catch (error) {
    logger.error(`Error testing different configurations: ${error.message}`);
    
    // 원래 설정 복원
    updateChainOptimizationConfig(chainId, originalConfig);
    
    return results;
  }
}

/**
 * 연결 안정성 테스트
 * 
 * @param chainId 체인 ID
 * @param duration 테스트 기간 (밀리초)
 * @param interval 간격 (밀리초)
 * @returns 테스트 결과
 */
export async function testStability(
  chainId: number = SupportedChainId.CATENA_TESTNET,
  duration: number = 60000, // 1분
  interval: number = 2000 // 2초
): Promise<TestResult> {
  logger.info(`Testing stability for chain ID ${chainId} for ${duration}ms with ${interval}ms interval`);
  
  const result: TestResult = {
    name: 'Stability Test',
    startTime: Date.now(),
    endTime: 0,
    duration: 0,
    success: false
  };
  
  try {
    // 연결 테스트 실행
    const connectivityResults = await testChainConnectivity(chainId, duration, interval);
    
    // 결과 분석
    const successCount = connectivityResults.filter(r => r.success).length;
    const failureCount = connectivityResults.length - successCount;
    const successRate = (successCount / connectivityResults.length) * 100;
    const avgLatency = connectivityResults.reduce((sum, r) => sum + r.latency, 0) / connectivityResults.length;
    
    // 결과 저장
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.success = true;
    result.data = {
      connectivityResults,
      successCount,
      failureCount,
      successRate,
      avgLatency,
      totalTests: connectivityResults.length
    };
    
    logger.info(`Stability test completed with ${successRate.toFixed(2)}% success rate (${successCount}/${connectivityResults.length} tests successful)`);
    logger.info(`Average latency: ${avgLatency.toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.error = error.message;
    
    logger.error(`Error testing stability: ${error.message}`);
    return result;
  }
}

/**
 * 모든 최적화 테스트 실행 후 권장 구성 생성
 * 
 * @param chainId 체인 ID
 * @returns 권장 구성 결과
 */
export async function generateRecommendedConfiguration(
  chainId: number = SupportedChainId.CATENA_TESTNET
): Promise<{ recommended: any, testResults: TestResult[] }> {
  logger.info(`Generating recommended configuration for chain ID ${chainId}`);
  
  const testResults: TestResult[] = [];
  
  try {
    // 1. 기본 테스트
    const stabilityResult = await testStability(chainId, 30000, 3000);
    testResults.push(stabilityResult);
    
    // 2. 다양한 설정 테스트
    const configResults = await testDifferentConfigurations(chainId);
    testResults.push(...configResults);
    
    // 3. 성공한 결과 중 가장 좋은 설정 찾기
    const successfulConfigTests = configResults.filter(r => r.success);
    
    if (successfulConfigTests.length === 0) {
      throw new Error('No successful configuration tests');
    }
    
    // 가스 견적 시간 기준으로 설정 선택
    const sortedByGas = [...successfulConfigTests].sort((a, b) => 
      (a.data.gasResult.data.avgTime || Infinity) - (b.data.gasResult.data.avgTime || Infinity)
    );
    
    // 블록 조회 시간 기준으로 설정 선택
    const sortedByBlock = [...successfulConfigTests].sort((a, b) => 
      (a.data.blockResult.data.avgTime || Infinity) - (b.data.blockResult.data.avgTime || Infinity)
    );
    
    // 안정성 점수 계산
    const stabilityFactor = stabilityResult.success 
      ? (stabilityResult.data.successRate / 100) // 0-1 범위
      : 0.5; // 안정성 테스트 실패 시 기본값
    
    // 가스 및 블록 조회 성능이 좋은 상위 2개 설정 추출
    const topGasConfigs = sortedByGas.slice(0, 2);
    const topBlockConfigs = sortedByBlock.slice(0, 2);
    
    // 두 목록에 모두 있는 설정 찾기 (교집합)
    const bestConfigs = topGasConfigs.filter(gas => 
      topBlockConfigs.some(block => block.name === gas.name)
    );
    
    // 최적의 설정 선택 또는 생성
    let recommendedConfigData;
    
    if (bestConfigs.length > 0) {
      // 두 목록에 모두 있는 설정이 있으면 첫 번째 선택
      recommendedConfigData = bestConfigs[0].data.config;
      logger.info(`Selected existing configuration: ${bestConfigs[0].name}`);
    } else {
      // 아니면 상위 설정들의 값을 조합하여 새 설정 생성
      logger.info('Creating hybrid configuration from top performers');
      
      // 가스 성능이 좋은 설정
      const bestGasConfig = topGasConfigs[0].data.config;
      
      // 블록 조회 성능이 좋은 설정
      const bestBlockConfig = topBlockConfigs[0].data.config;
      
      // 혼합 설정 생성
      recommendedConfigData = {
        chainId,
        // 가스 관련 설정은 가스 성능이 좋은 설정에서 가져옴
        gasPriceIncreasePercentage: bestGasConfig.gasPriceIncreasePercentage,
        minGasPrice: bestGasConfig.minGasPrice,
        maxGasPrice: bestGasConfig.maxGasPrice,
        gasLimitBuffer: bestGasConfig.gasLimitBuffer,
        
        // 블록 관련 설정은 블록 성능이 좋은 설정에서 가져옴
        pollingInterval: bestBlockConfig.pollingInterval,
        blockPollingInterval: bestBlockConfig.blockPollingInterval,
        
        // 캐싱 설정은 안정성에 따라 조정
        cacheEnabled: true,
        cacheTTL: Math.round(10000 * stabilityFactor + 5000), // 5-15초 (안정성에 따라)
        maxCacheSize: Math.round(100 * (stabilityFactor + 0.5)), // 50-150 항목 (안정성에 따라)
        
        // 요청 관련 설정은 안정성에 따라 조정
        requestTimeout: Math.round(20000 * (1 + (1 - stabilityFactor) * 0.5)), // 20-30초 (안정성이 낮을수록 더 긴 타임아웃)
        maxRetries: Math.max(2, Math.round(3 * (1 + (1 - stabilityFactor)))), // 3-6회 재시도 (안정성이 낮을수록 더 많은 재시도)
        retryDelay: Math.round(1000 * (1 + (1 - stabilityFactor) * 0.5)), // 1-1.5초 (안정성이 낮을수록 더 긴 지연)
        
        // 기타 설정
        verboseLogging: false,
        logRpcCalls: false,
        logRpcResponses: false,
        useWebsocket: false,
        batchSize: 10
      };
    }
    
    // 테스트 데이터 기반 권장 구성 적용
    // updateChainOptimizationConfig(chainId, recommendedConfigData);
    
    logger.info('Generated recommended configuration');
    logger.info(`Cache TTL: ${recommendedConfigData.cacheTTL}ms, Max Retries: ${recommendedConfigData.maxRetries}`);
    logger.info(`Polling Interval: ${recommendedConfigData.pollingInterval}ms`);
    
    return {
      recommended: recommendedConfigData,
      testResults
    };
  } catch (error) {
    logger.error(`Error generating recommended configuration: ${error.message}`);
    
    // 기본 권장 구성 반환
    return {
      recommended: getChainOptimizationConfig(chainId),
      testResults
    };
  }
}

/**
 * 모든 테스트 결과를 JSON 파일로 저장 (Node.js 환경에서만 사용 가능)
 * 
 * @param results 테스트 결과
 * @param filePath 파일 경로
 */
export function saveTestResultsToJson(results: any, filePath: string): void {
  try {
    // Node.js 환경에서의 파일 저장을 위한 임시 로직
    const fs = require('fs');
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    logger.info(`Test results saved to ${filePath}`);
  } catch (error) {
    logger.error(`Failed to save test results: ${error.message}`);
  }
}

// 기본 내보내기
export default {
  compareProviders,
  testDifferentConfigurations,
  testStability,
  generateRecommendedConfiguration,
  saveTestResultsToJson
};
