/**
 * @file switchEngine.ts
 * @description 자동 체인 전환 엔진 구현
 */

import { Transaction } from '../types/transactions.types';
import { ChainSwitchResult } from '../types/chain.types';
import { getNetworkInfo, isSupportedChain } from './chains';
import { createLogger } from '../utils/logging';
import { IProvider } from './providers/provider.interface';

// 로거 생성
const logger = createLogger('SwitchEngine');

/**
 * 체인 전환 엔진 옵션
 */
export interface SwitchEngineOptions {
  forceConfirmation?: boolean; // 전환 전 항상 확인 요청
  allowAutomaticSwitching?: boolean; // 자동 전환 허용
  saveHistory?: boolean; // 전환 이력 저장
  historySize?: number; // 이력 저장 크기
  detectChainFromContract?: boolean; // 계약 주소에서 체인 감지
  detectFromPrevPatterns?: boolean; // 이전 패턴에서 체인 감지
}

/**
 * 계약 주소와 체인 ID 맵핑
 */
export interface ContractChainMapping {
  [contractAddress: string]: number;
}

/**
 * DApp과 체인 ID 맵핑
 */
export interface DAppChainMapping {
  [origin: string]: number;
}

/**
 * 체인 전환 컨텍스트
 */
export interface ChainSwitchContext {
  currentChainId: number; // 현재 체인 ID
  targetChainId?: number; // 대상 체인 ID
  origin?: string; // 요청 출처
  requestedByDApp?: boolean; // DApp에서 요청됨
  contractAddress?: string; // 관련 계약 주소
  timestamp: number; // 타임스탬프
}

/**
 * 체인 전환 엔진 클래스
 */
export class ChainSwitchEngine {
  private options: SwitchEngineOptions;
  private contractMapping: ContractChainMapping = {};
  private dappMapping: DAppChainMapping = {};
  private switchHistory: ChainSwitchResult[] = [];
  private currentChainId: number;
  
  /**
   * 체인 전환 엔진 생성자
   * 
   * @param defaultChainId 기본 체인 ID
   * @param options 옵션
   */
  constructor(defaultChainId: number, options: SwitchEngineOptions = {}) {
    this.currentChainId = defaultChainId;
    this.options = {
      forceConfirmation: false,
      allowAutomaticSwitching: true,
      saveHistory: true,
      historySize: 50,
      detectChainFromContract: true,
      detectFromPrevPatterns: true,
      ...options
    };
    
    // 기본 계약 맵핑 초기화
    this.initDefaultContractMapping();
  }
  
  /**
   * 기본 계약 맵핑 초기화
   */
  private initDefaultContractMapping(): void {
    // 여기에 잘 알려진 계약과 체인 ID 맵핑 추가
    // 예: 유니스왑, AAVE, 컴파운드 등의 메인 계약
    
    // 이더리움 메인넷
    this.contractMapping['0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'] = 1; // UNI 토큰
    this.contractMapping['0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'] = 1; // 유니스왑 라우터
    
    // Polygon
    this.contractMapping['0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'] = 137; // WMATIC
    this.contractMapping['0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6'] = 137; // WBTC
    
    // Arbitrum
    this.contractMapping['0x912CE59144191C1204E64559FE8253a0e49E6548'] = 42161; // ARB 토큰
    
    // Catena 메인넷 (예시, 실제 계약 주소로 업데이트 필요)
    this.contractMapping['0x0000000000000000000000000000000000000001'] = 1000;
  }
  
  /**
   * 체인 전환
   * 
   * @param targetChainId 대상 체인 ID
   * @param context 전환 컨텍스트
   * @returns 전환 결과
   */
  public async switchChain(
    targetChainId: number,
    context: Partial<ChainSwitchContext> = {}
  ): Promise<ChainSwitchResult> {
    const previousChainId = this.currentChainId;
    
    // 컨텍스트 완성
    const fullContext: ChainSwitchContext = {
      currentChainId: previousChainId,
      targetChainId,
      timestamp: Date.now(),
      ...context
    };
    
    logger.info(`Chain switch requested from ${previousChainId} to ${targetChainId}`);
    
    // 같은 체인인지 확인
    if (previousChainId === targetChainId) {
      const result: ChainSwitchResult = {
        success: true,
        chainId: targetChainId,
        previousChainId,
        timestamp: Date.now()
      };
      
      this.addToHistory(result);
      return result;
    }
    
    // 지원되는 체인인지 확인
    if (!isSupportedChain(targetChainId)) {
      const result: ChainSwitchResult = {
        success: false,
        chainId: previousChainId,
        previousChainId,
        error: `Chain ID ${targetChainId} is not supported`,
        timestamp: Date.now()
      };
      
      this.addToHistory(result);
      return result;
    }
    
    try {
      // 확인이 필요한 경우
      if (this.options.forceConfirmation && !context.requestedByDApp) {
        // NOTE: 실제로는 UI 확인 로직이 필요합니다.
        // 여기서는 항상 성공으로 가정합니다.
      }
      
      // 체인 전환 성공
      this.currentChainId = targetChainId;
      
      // DApp 맵핑 업데이트
      if (context.origin) {
        this.dappMapping[context.origin] = targetChainId;
      }
      
      // 계약 맵핑 업데이트
      if (context.contractAddress) {
        this.contractMapping[context.contractAddress] = targetChainId;
      }
      
      const result: ChainSwitchResult = {
        success: true,
        chainId: targetChainId,
        previousChainId,
        timestamp: Date.now()
      };
      
      this.addToHistory(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`Chain switch failed: ${errorMessage}`);
      
      const result: ChainSwitchResult = {
        success: false,
        chainId: previousChainId,
        previousChainId,
        error: errorMessage,
        timestamp: Date.now()
      };
      
      this.addToHistory(result);
      return result;
    }
  }
  
  /**
   * 트랜잭션에서 체인 감지
   * 
   * @param transaction 트랜잭션
   * @param origin 요청 출처
   * @returns 감지된 체인 ID 또는 undefined
   */
  public detectChainFromTransaction(
    transaction: Transaction,
    origin?: string
  ): number | undefined {
    // 1. 트랜잭션에 체인 ID가 있는 경우
    if (transaction.chainId) {
      return transaction.chainId;
    }
    
    // 2. 계약 주소에서 체인 감지
    if (this.options.detectChainFromContract && transaction.to) {
      const chainId = this.contractMapping[transaction.to];
      
      if (chainId) {
        return chainId;
      }
    }
    
    // 3. DApp 패턴에서 체인 감지
    if (this.options.detectFromPrevPatterns && origin) {
      const chainId = this.dappMapping[origin];
      
      if (chainId) {
        return chainId;
      }
    }
    
    // 감지 실패
    return undefined;
  }
  
  /**
   * 체인 자동 전환
   * 
   * @param transaction 트랜잭션
   * @param origin 요청 출처
   * @returns 전환 결과 또는 undefined (전환 불필요)
   */
  public async autoSwitchChain(
    transaction: Transaction,
    origin?: string
  ): Promise<ChainSwitchResult | undefined> {
    // 자동 전환이 비활성화된 경우
    if (!this.options.allowAutomaticSwitching) {
      return undefined;
    }
    
    // 트랜잭션에서 체인 감지
    const detectedChainId = this.detectChainFromTransaction(transaction, origin);
    
    // 체인을 감지하지 못한 경우
    if (!detectedChainId) {
      return undefined;
    }
    
    // 현재 체인과 다른 경우 전환
    if (detectedChainId !== this.currentChainId) {
      return this.switchChain(detectedChainId, {
        requestedByDApp: false,
        origin,
        contractAddress: transaction.to
      });
    }
    
    // 전환이 필요 없는 경우
    return undefined;
  }
  
  /**
   * DApp에서 체인 전환 요청 처리
   * 
   * @param targetChainId 대상 체인 ID
   * @param origin 요청 출처
   * @returns 전환 결과
   */
  public async handleDAppSwitchRequest(
    targetChainId: number,
    origin: string
  ): Promise<ChainSwitchResult> {
    return this.switchChain(targetChainId, {
      requestedByDApp: true,
      origin
    });
  }
  
  /**
   * 현재 체인 ID 가져오기
   * 
   * @returns 현재 체인 ID
   */
  public getCurrentChainId(): number {
    return this.currentChainId;
  }
  
  /**
   * 체인 전환 이력 가져오기
   * 
   * @returns 전환 이력
   */
  public getSwitchHistory(): ChainSwitchResult[] {
    return [...this.switchHistory];
  }
  
  /**
   * 이력에 결과 추가
   * 
   * @param result 전환 결과
   */
  private addToHistory(result: ChainSwitchResult): void {
    if (!this.options.saveHistory) {
      return;
    }
    
    this.switchHistory.unshift(result);
    
    // 이력 크기 제한
    if (this.switchHistory.length > (this.options.historySize || 50)) {
      this.switchHistory.pop();
    }
  }
  
  /**
   * 계약 맵핑 추가
   * 
   * @param contractAddress 계약 주소
   * @param chainId 체인 ID
   */
  public addContractMapping(contractAddress: string, chainId: number): void {
    this.contractMapping[contractAddress] = chainId;
  }
  
  /**
   * DApp 맵핑 추가
   * 
   * @param origin DApp 출처
   * @param chainId 체인 ID
   */
  public addDAppMapping(origin: string, chainId: number): void {
    this.dappMapping[origin] = chainId;
  }
  
  /**
   * 계약 맵핑 가져오기
   * 
   * @returns 계약 맵핑
   */
  public getContractMapping(): ContractChainMapping {
    return { ...this.contractMapping };
  }
  
  /**
   * DApp 맵핑 가져오기
   * 
   * @returns DApp 맵핑
   */
  public getDAppMapping(): DAppChainMapping {
    return { ...this.dappMapping };
  }
  
  /**
   * 계약 맵핑 지우기
   * 
   * @param contractAddress 계약 주소
   */
  public removeContractMapping(contractAddress: string): void {
    delete this.contractMapping[contractAddress];
  }
  
  /**
   * DApp 맵핑 지우기
   * 
   * @param origin DApp 출처
   */
  public removeDAppMapping(origin: string): void {
    delete this.dappMapping[origin];
  }
  
  /**
   * 옵션 설정
   * 
   * @param options 옵션
   */
  public setOptions(options: Partial<SwitchEngineOptions>): void {
    this.options = {
      ...this.options,
      ...options
    };
  }
  
  /**
   * 옵션 가져오기
   * 
   * @returns 현재 옵션
   */
  public getOptions(): SwitchEngineOptions {
    return { ...this.options };
  }
}

/**
 * 전역 체인 전환 엔진 인스턴스
 */
export const globalSwitchEngine = new ChainSwitchEngine(1000); // Catena 메인넷을 기본값으로 사용

/**
 * 프로바이더 체인 전환
 * 
 * @param provider 현재 프로바이더
 * @param targetChainId 대상 체인 ID
 * @param providerFactory 프로바이더 팩토리
 * @returns 대상 체인 프로바이더 또는 undefined
 */
export async function switchProviderChain(
  provider: IProvider,
  targetChainId: number,
  providerFactory: any
): Promise<IProvider | undefined> {
  try {
    // 같은 체인이면 현재 프로바이더 반환
    if (provider.chainId === targetChainId) {
      return provider;
    }
    
    // 지원되는 체인인지 확인
    if (!isSupportedChain(targetChainId)) {
      logger.error(`Chain ID ${targetChainId} is not supported`);
      return undefined;
    }
    
    // 대상 체인 프로바이더 생성
    const newProvider = providerFactory.hasProvider(targetChainId)
      ? providerFactory.getProvider(targetChainId)
      : providerFactory.createProvider(targetChainId);
    
    // 프로바이더 연결
    await newProvider.connect();
    
    // 글로벌 엔진에 전환 기록
    await globalSwitchEngine.switchChain(targetChainId);
    
    return newProvider;
  } catch (error) {
    logger.error(`Failed to switch provider chain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return undefined;
  }
}

/**
 * 추천 체인 ID 가져오기
 * 
 * @param transaction 트랜잭션
 * @param origin 요청 출처
 * @returns 추천 체인 ID 또는 undefined
 */
export function getRecommendedChainId(
  transaction: Transaction,
  origin?: string
): number | undefined {
  return globalSwitchEngine.detectChainFromTransaction(transaction, origin);
}

/**
 * 계약 주소의 체인 ID 가져오기
 * 
 * @param contractAddress 계약 주소
 * @returns 체인 ID 또는 undefined
 */
export function getChainIdForContract(contractAddress: string): number | undefined {
  const contractMapping = globalSwitchEngine.getContractMapping();
  return contractMapping[contractAddress];
}

/**
 * 트랜잭션 체인 ID 검증
 * 
 * @param transaction 트랜잭션
 * @param currentChainId 현재 체인 ID
 * @returns 유효성 여부 (true/false)
 */
export function validateTransactionChainId(transaction: Transaction, currentChainId: number): boolean {
  // 트랜잭션에 체인 ID가 없는 경우
  if (!transaction.chainId) {
    return true;
  }
  
  return transaction.chainId === currentChainId;
}

/**
 * 주어진 체인 ID가 전환이 필요한지 확인
 * 
 * @param currentChainId 현재 체인 ID
 * @param targetChainId 대상 체인 ID
 * @returns 전환 필요 여부 (true/false)
 */
export function needsChainSwitch(currentChainId: number, targetChainId: number): boolean {
  return currentChainId !== targetChainId && isSupportedChain(targetChainId);
}
