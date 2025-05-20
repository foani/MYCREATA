/**
 * @file performance.ts
 * @description Catena 체인 성능 최적화 및 테스트를 위한 유틸리티
 */

import { JsonRpcProvider, ethers } from 'ethers';
import { CatenaProvider, CATENA_MAINNET_RPC_URL, CATENA_TESTNET_RPC_URL } from '../providers/catena.provider';
import { createLogger } from '../../utils/logging';
import { SupportedChainId } from '../../types/chain.types';
import { getNetworkInfo } from '../chains';

// 로거 생성
const logger = createLogger('CatenaPerformance');

/**
 * 성능 테스트 결과 인터페이스
 */
export interface PerformanceTestResult {
  provider: string;
  testName: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * 연결 테스트 결과 인터페이스
 */
export interface ConnectionTestResult {
  rpcUrl: string;
  latency: number;
  success: boolean;
  error?: string;
  chainId?: number;
  blockNumber?: number;
  timestamp: number;
}

/**
 * RPC 응답 시간 기록
 * @param url RPC URL
 * @returns 응답 시간 및 성공 여부
 */
export async function measureRpcResponseTime(url: string): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  const result: ConnectionTestResult = {
    rpcUrl: url,
    latency: 0,
    success: false,
    timestamp: startTime
  };

  try {
    const provider = new JsonRpcProvider(url);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    const endTime = Date.now();
    result.latency = endTime - startTime;
    result.success = true;
    result.chainId = Number(network.chainId);
    result.blockNumber = blockNumber;
    
    return result;
  } catch (error) {
    const endTime = Date.now();
    result.latency = endTime - startTime;
    result.error = error.message;
    logger.error(`RPC response time measurement failed for ${url}: ${error.message}`);
    return result;
  }
}

/**
 * Catena 메인넷/테스트넷 응답 시간 비교
 * @returns 메인넷과 테스트넷의 응답 시간 결과
 */
export async function compareCatenaNetworks(): Promise<ConnectionTestResult[]> {
  const mainnetResult = await measureRpcResponseTime(CATENA_MAINNET_RPC_URL);
  const testnetResult = await measureRpcResponseTime(CATENA_TESTNET_RPC_URL);
  
  logger.info(`Catena Mainnet latency: ${mainnetResult.latency}ms, success: ${mainnetResult.success}`);
  logger.info(`Catena Testnet latency: ${testnetResult.latency}ms, success: ${testnetResult.success}`);
  
  return [mainnetResult, testnetResult];
}

/**
 * 체인 연결 안정성 테스트
 * @param chainId 체인 ID
 * @param duration 테스트 기간 (밀리초)
 * @param interval 간격 (밀리초)
 * @returns 테스트 결과 목록
 */
export async function testChainConnectivity(
  chainId: number,
  duration: number = 60000,
  interval: number = 2000
): Promise<ConnectionTestResult[]> {
  const networkInfo = getNetworkInfo(chainId);
  if (!networkInfo) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }
  
  const rpcUrl = networkInfo.rpcUrl;
  const results: ConnectionTestResult[] = [];
  const startTime = Date.now();
  const endTime = startTime + duration;
  
  logger.info(`Starting chain connectivity test for ${networkInfo.name} (${rpcUrl}) for ${duration}ms`);
  
  while (Date.now() < endTime) {
    const result = await measureRpcResponseTime(rpcUrl);
    results.push(result);
    
    if (!result.success) {
      logger.warn(`Connection test failed at ${new Date().toISOString()}`);
    }
    
    // 마지막 간격에서는 대기하지 않음
    if (Date.now() + interval < endTime) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  // 결과 분석
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;
  
  logger.info(`Chain connectivity test completed for ${networkInfo.name}`);
  logger.info(`Success rate: ${(successCount / results.length * 100).toFixed(2)}% (${successCount}/${results.length})`);
  logger.info(`Average latency: ${avgLatency.toFixed(2)}ms`);
  
  return results;
}

/**
 * 가스 예상 성능 테스트
 * @param chainId 체인 ID
 * @param iterations 반복 횟수
 * @returns 테스트 결과
 */
export async function benchmarkGasEstimation(
  chainId: number,
  iterations: number = 10
): Promise<PerformanceTestResult> {
  const networkInfo = getNetworkInfo(chainId);
  if (!networkInfo) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }
  
  const result: PerformanceTestResult = {
    provider: networkInfo.name,
    testName: 'gasEstimation',
    startTime: Date.now(),
    endTime: 0,
    duration: 0,
    success: false,
    data: {
      iterations,
      estimates: [] as { time: number, gasEstimate: string }[]
    }
  };
  
  try {
    let provider: CatenaProvider;
    
    if (chainId === SupportedChainId.CATENA_MAINNET) {
      provider = new CatenaProvider(CATENA_MAINNET_RPC_URL);
    } else if (chainId === SupportedChainId.CATENA_TESTNET) {
      provider = new CatenaProvider(CATENA_TESTNET_RPC_URL);
    } else {
      throw new Error(`Chain ID ${chainId} is not a Catena network`);
    }
    
    await provider.initialize();
    
    // 테스트 트랜잭션 (ETH 전송)
    const testTransaction = {
      to: '0x0000000000000000000000000000000000000000',
      from: '0x0000000000000000000000000000000000000001',
      value: ethers.parseEther('0.1'),
      data: '0x'
    };
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      const gasEstimate = await provider.estimateGas(testTransaction);
      const endTime = Date.now();
      
      (result.data!.estimates as any).push({
        time: endTime - startTime,
        gasEstimate
      });
    }
    
    // 결과 계산
    const times = (result.data!.estimates as any).map((e: any) => e.time);
    const avgTime = times.reduce((a: number, b: number) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    result.data!.avgTime = avgTime;
    result.data!.minTime = minTime;
    result.data!.maxTime = maxTime;
    
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.success = true;
    
    logger.info(`Gas estimation benchmark for ${networkInfo.name} completed`);
    logger.info(`Average time: ${avgTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`);
    
    // 연결 종료
    await provider.disconnect();
    
    return result;
  } catch (error) {
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.error = error.message;
    
    logger.error(`Gas estimation benchmark for ${networkInfo.name} failed: ${error.message}`);
    return result;
  }
}

/**
 * 트랜잭션 조회 성능 테스트
 * @param chainId 체인 ID
 * @param txHashes 조회할 트랜잭션 해시 목록
 * @returns 테스트 결과
 */
export async function benchmarkTransactionRetrieval(
  chainId: number,
  txHashes: string[]
): Promise<PerformanceTestResult> {
  const networkInfo = getNetworkInfo(chainId);
  if (!networkInfo) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }
  
  const result: PerformanceTestResult = {
    provider: networkInfo.name,
    testName: 'transactionRetrieval',
    startTime: Date.now(),
    endTime: 0,
    duration: 0,
    success: false,
    data: {
      transactions: txHashes.length,
      retrievals: [] as { hash: string, time: number, success: boolean, error?: string }[]
    }
  };
  
  try {
    let provider: CatenaProvider;
    
    if (chainId === SupportedChainId.CATENA_MAINNET) {
      provider = new CatenaProvider(CATENA_MAINNET_RPC_URL);
    } else if (chainId === SupportedChainId.CATENA_TESTNET) {
      provider = new CatenaProvider(CATENA_TESTNET_RPC_URL);
    } else {
      throw new Error(`Chain ID ${chainId} is not a Catena network`);
    }
    
    await provider.initialize();
    
    for (const txHash of txHashes) {
      const txResult = {
        hash: txHash,
        time: 0,
        success: false
      };
      
      try {
        const startTime = Date.now();
        await provider.getTransaction(txHash);
        const endTime = Date.now();
        
        txResult.time = endTime - startTime;
        txResult.success = true;
      } catch (error) {
        txResult.time = Date.now() - result.startTime;
        txResult.success = false;
        txResult.error = error.message;
      }
      
      (result.data!.retrievals as any).push(txResult);
    }
    
    // 결과 계산
    const successfulRetrievals = (result.data!.retrievals as any).filter((r: any) => r.success);
    const times = successfulRetrievals.map((r: any) => r.time);
    
    if (times.length > 0) {
      const avgTime = times.reduce((a: number, b: number) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      result.data!.avgTime = avgTime;
      result.data!.minTime = minTime;
      result.data!.maxTime = maxTime;
      result.data!.successRate = successfulRetrievals.length / txHashes.length;
    }
    
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.success = true;
    
    logger.info(`Transaction retrieval benchmark for ${networkInfo.name} completed`);
    logger.info(`Success rate: ${((successfulRetrievals.length / txHashes.length) * 100).toFixed(2)}% (${successfulRetrievals.length}/${txHashes.length})`);
    
    if (times.length > 0) {
      logger.info(`Average time: ${result.data!.avgTime.toFixed(2)}ms, Min: ${result.data!.minTime}ms, Max: ${result.data!.maxTime}ms`);
    }
    
    // 연결 종료
    await provider.disconnect();
    
    return result;
  } catch (error) {
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.error = error.message;
    
    logger.error(`Transaction retrieval benchmark for ${networkInfo.name} failed: ${error.message}`);
    return result;
  }
}

/**
 * 블록 조회 성능 테스트
 * @param chainId 체인 ID
 * @param startBlock 시작 블록
 * @param blockCount 조회할 블록 수
 * @returns 테스트 결과
 */
export async function benchmarkBlockRetrieval(
  chainId: number,
  startBlock: number,
  blockCount: number = 10
): Promise<PerformanceTestResult> {
  const networkInfo = getNetworkInfo(chainId);
  if (!networkInfo) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }
  
  const result: PerformanceTestResult = {
    provider: networkInfo.name,
    testName: 'blockRetrieval',
    startTime: Date.now(),
    endTime: 0,
    duration: 0,
    success: false,
    data: {
      startBlock,
      blockCount,
      retrievals: [] as { blockNumber: number, time: number, success: boolean, error?: string }[]
    }
  };
  
  try {
    let provider: CatenaProvider;
    
    if (chainId === SupportedChainId.CATENA_MAINNET) {
      provider = new CatenaProvider(CATENA_MAINNET_RPC_URL);
    } else if (chainId === SupportedChainId.CATENA_TESTNET) {
      provider = new CatenaProvider(CATENA_TESTNET_RPC_URL);
    } else {
      throw new Error(`Chain ID ${chainId} is not a Catena network`);
    }
    
    await provider.initialize();
    
    // 시작 블록이 0이면 최신 블록에서 시작
    if (startBlock === 0) {
      startBlock = await provider.getBlockNumber();
      startBlock = Math.max(1, startBlock - blockCount + 1); // blockCount개의 블록을 조회하기 위한 시작 블록
    }
    
    for (let i = 0; i < blockCount; i++) {
      const blockNumber = startBlock + i;
      const blockResult = {
        blockNumber,
        time: 0,
        success: false
      };
      
      try {
        const startTime = Date.now();
        await provider.getBlock(blockNumber);
        const endTime = Date.now();
        
        blockResult.time = endTime - startTime;
        blockResult.success = true;
      } catch (error) {
        blockResult.time = Date.now() - result.startTime;
        blockResult.success = false;
        blockResult.error = error.message;
      }
      
      (result.data!.retrievals as any).push(blockResult);
    }
    
    // 결과 계산
    const successfulRetrievals = (result.data!.retrievals as any).filter((r: any) => r.success);
    const times = successfulRetrievals.map((r: any) => r.time);
    
    if (times.length > 0) {
      const avgTime = times.reduce((a: number, b: number) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      result.data!.avgTime = avgTime;
      result.data!.minTime = minTime;
      result.data!.maxTime = maxTime;
      result.data!.successRate = successfulRetrievals.length / blockCount;
    }
    
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.success = true;
    
    logger.info(`Block retrieval benchmark for ${networkInfo.name} completed`);
    logger.info(`Success rate: ${((successfulRetrievals.length / blockCount) * 100).toFixed(2)}% (${successfulRetrievals.length}/${blockCount})`);
    
    if (times.length > 0) {
      logger.info(`Average time: ${result.data!.avgTime.toFixed(2)}ms, Min: ${result.data!.minTime}ms, Max: ${result.data!.maxTime}ms`);
    }
    
    // 연결 종료
    await provider.disconnect();
    
    return result;
  } catch (error) {
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.error = error.message;
    
    logger.error(`Block retrieval benchmark for ${networkInfo.name} failed: ${error.message}`);
    return result;
  }
}

/**
 * 체인 ID 전환 성능 테스트
 * @param iterations 반복 횟수
 * @returns 테스트 결과
 */
export async function benchmarkChainSwitching(iterations: number = 10): Promise<PerformanceTestResult> {
  const result: PerformanceTestResult = {
    provider: 'CatenaProvider',
    testName: 'chainSwitching',
    startTime: Date.now(),
    endTime: 0,
    duration: 0,
    success: false,
    data: {
      iterations,
      switches: [] as { from: number, to: number, time: number, success: boolean, error?: string }[]
    }
  };
  
  try {
    // 메인넷과 테스트넷 프로바이더 생성
    const mainnetProvider = new CatenaProvider(CATENA_MAINNET_RPC_URL);
    const testnetProvider = new CatenaProvider(CATENA_TESTNET_RPC_URL);
    
    // 초기화
    await mainnetProvider.initialize();
    await testnetProvider.initialize();
    
    for (let i = 0; i < iterations; i++) {
      // 메인넷 -> 테스트넷
      const mainToTestResult = {
        from: SupportedChainId.CATENA_MAINNET,
        to: SupportedChainId.CATENA_TESTNET,
        time: 0,
        success: false
      };
      
      try {
        const startTime = Date.now();
        await mainnetProvider.disconnect();
        await testnetProvider.connect();
        const endTime = Date.now();
        
        mainToTestResult.time = endTime - startTime;
        mainToTestResult.success = true;
      } catch (error) {
        mainToTestResult.time = Date.now() - result.startTime;
        mainToTestResult.success = false;
        mainToTestResult.error = error.message;
      }
      
      (result.data!.switches as any).push(mainToTestResult);
      
      // 테스트넷 -> 메인넷
      const testToMainResult = {
        from: SupportedChainId.CATENA_TESTNET,
        to: SupportedChainId.CATENA_MAINNET,
        time: 0,
        success: false
      };
      
      try {
        const startTime = Date.now();
        await testnetProvider.disconnect();
        await mainnetProvider.connect();
        const endTime = Date.now();
        
        testToMainResult.time = endTime - startTime;
        testToMainResult.success = true;
      } catch (error) {
        testToMainResult.time = Date.now() - result.startTime;
        testToMainResult.success = false;
        testToMainResult.error = error.message;
      }
      
      (result.data!.switches as any).push(testToMainResult);
    }
    
    // 결과 계산
    const successfulSwitches = (result.data!.switches as any).filter((s: any) => s.success);
    const times = successfulSwitches.map((s: any) => s.time);
    
    if (times.length > 0) {
      const avgTime = times.reduce((a: number, b: number) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      result.data!.avgTime = avgTime;
      result.data!.minTime = minTime;
      result.data!.maxTime = maxTime;
      result.data!.successRate = successfulSwitches.length / (iterations * 2);
    }
    
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.success = true;
    
    logger.info('Chain switching benchmark completed');
    logger.info(`Success rate: ${((successfulSwitches.length / (iterations * 2)) * 100).toFixed(2)}% (${successfulSwitches.length}/${iterations * 2})`);
    
    if (times.length > 0) {
      logger.info(`Average time: ${result.data!.avgTime.toFixed(2)}ms, Min: ${result.data!.minTime}ms, Max: ${result.data!.maxTime}ms`);
    }
    
    // 연결 종료
    await mainnetProvider.disconnect();
    await testnetProvider.disconnect();
    
    return result;
  } catch (error) {
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.error = error.message;
    
    logger.error(`Chain switching benchmark failed: ${error.message}`);
    return result;
  }
}

/**
 * 대량 계정 조회 성능 테스트
 * @param chainId 체인 ID
 * @param addresses 조회할 주소 목록
 * @returns 테스트 결과
 */
export async function benchmarkBatchBalanceCheck(
  chainId: number,
  addresses: string[]
): Promise<PerformanceTestResult> {
  const networkInfo = getNetworkInfo(chainId);
  if (!networkInfo) {
    throw new Error(`Chain ID ${chainId} is not supported`);
  }
  
  const result: PerformanceTestResult = {
    provider: networkInfo.name,
    testName: 'batchBalanceCheck',
    startTime: Date.now(),
    endTime: 0,
    duration: 0,
    success: false,
    data: {
      addresses: addresses.length,
      checks: [] as { address: string, time: number, success: boolean, error?: string }[]
    }
  };
  
  try {
    let provider: CatenaProvider;
    
    if (chainId === SupportedChainId.CATENA_MAINNET) {
      provider = new CatenaProvider(CATENA_MAINNET_RPC_URL);
    } else if (chainId === SupportedChainId.CATENA_TESTNET) {
      provider = new CatenaProvider(CATENA_TESTNET_RPC_URL);
    } else {
      throw new Error(`Chain ID ${chainId} is not a Catena network`);
    }
    
    await provider.initialize();
    
    for (const address of addresses) {
      const balanceResult = {
        address,
        time: 0,
        success: false,
        balance: '0'
      };
      
      try {
        const startTime = Date.now();
        const balance = await provider.getBalance(address);
        const endTime = Date.now();
        
        balanceResult.time = endTime - startTime;
        balanceResult.success = true;
        balanceResult.balance = balance;
      } catch (error) {
        balanceResult.time = Date.now() - result.startTime;
        balanceResult.success = false;
        balanceResult.error = error.message;
      }
      
      (result.data!.checks as any).push(balanceResult);
    }
    
    // 결과 계산
    const successfulChecks = (result.data!.checks as any).filter((c: any) => c.success);
    const times = successfulChecks.map((c: any) => c.time);
    
    if (times.length > 0) {
      const avgTime = times.reduce((a: number, b: number) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      result.data!.avgTime = avgTime;
      result.data!.minTime = minTime;
      result.data!.maxTime = maxTime;
      result.data!.successRate = successfulChecks.length / addresses.length;
    }
    
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.success = true;
    
    logger.info(`Batch balance check benchmark for ${networkInfo.name} completed`);
    logger.info(`Success rate: ${((successfulChecks.length / addresses.length) * 100).toFixed(2)}% (${successfulChecks.length}/${addresses.length})`);
    
    if (times.length > 0) {
      logger.info(`Average time: ${result.data!.avgTime.toFixed(2)}ms, Min: ${result.data!.minTime}ms, Max: ${result.data!.maxTime}ms`);
    }
    
    // 연결 종료
    await provider.disconnect();
    
    return result;
  } catch (error) {
    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;
    result.error = error.message;
    
    logger.error(`Batch balance check benchmark for ${networkInfo.name} failed: ${error.message}`);
    return result;
  }
}

/**
 * 성능 테스트 결과를 파일에 저장하는 유틸리티 함수
 * @param result 성능 테스트 결과
 * @param filePath 파일 경로
 */
export function savePerformanceResultToJson(result: PerformanceTestResult, filePath: string): void {
  try {
    // Node.js 환경에서의 파일 저장을 위한 임시 로직
    // 실제 환경에서는 적절한 파일 시스템 API를 사용해야 함
    const fs = require('fs');
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    logger.info(`Performance test result saved to ${filePath}`);
  } catch (error) {
    logger.error(`Failed to save performance test result: ${error.message}`);
  }
}

/**
 * 연결 테스트 결과를 CVS 파일로 저장하는 유틸리티 함수
 * @param results 연결 테스트 결과 목록
 * @param filePath 파일 경로
 */
export function saveConnectionResultsToCsv(results: ConnectionTestResult[], filePath: string): void {
  try {
    // CSV 헤더 정의
    const headers = ['timestamp', 'rpcUrl', 'latency', 'success', 'chainId', 'blockNumber', 'error'];
    
    // 데이터 행 생성
    const rows = results.map(result => {
      return [
        result.timestamp,
        result.rpcUrl,
        result.latency,
        result.success,
        result.chainId || '',
        result.blockNumber || '',
        result.error || ''
      ].join(',');
    });
    
    // CSV 문자열 생성
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // 파일 저장 (Node.js 환경 가정)
    const fs = require('fs');
    fs.writeFileSync(filePath, csvContent);
    logger.info(`Connection test results saved to ${filePath}`);
  } catch (error) {
    logger.error(`Failed to save connection test results: ${error.message}`);
  }
}

/**
 * 모든 성능 테스트 실행
 * @param chainId 체인 ID
 * @param iterations 반복 횟수
 * @returns 테스트 결과 목록
 */
export async function runAllPerformanceTests(
  chainId: number,
  iterations: number = 5
): Promise<PerformanceTestResult[]> {
  const results: PerformanceTestResult[] = [];
  
  logger.info(`Starting all performance tests for chain ID ${chainId}`);
  
  try {
    // 가스 견적 테스트
    const gasResult = await benchmarkGasEstimation(chainId, iterations);
    results.push(gasResult);
    
    // 블록 조회 테스트
    const blockResult = await benchmarkBlockRetrieval(chainId, 0, iterations);
    results.push(blockResult);
    
    // 체인 전환 테스트 (체인 ID에 관계없이 실행)
    const switchResult = await benchmarkChainSwitching(iterations);
    results.push(switchResult);
    
    // 연결 안정성 테스트 (짧게 실행)
    await testChainConnectivity(chainId, 10000, 1000);
    
    logger.info('All performance tests completed');
    
    return results;
  } catch (error) {
    logger.error(`Error running performance tests: ${error.message}`);
    return results;
  }
}

export default {
  measureRpcResponseTime,
  compareCatenaNetworks,
  testChainConnectivity,
  benchmarkGasEstimation,
  benchmarkTransactionRetrieval,
  benchmarkBlockRetrieval,
  benchmarkChainSwitching,
  benchmarkBatchBalanceCheck,
  savePerformanceResultToJson,
  saveConnectionResultsToCsv,
  runAllPerformanceTests
};
