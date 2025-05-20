/**
 * @file bridge.factory.ts
 * @description 크로스체인 브릿지 제공자 팩토리 구현
 */

import { createLogger } from '../../utils/logging';
import { BridgeProvider, BridgeProviderFactory } from './bridge.interface';
import { SupportedChainId } from '../../types/chain.types';

// 로거 생성
const logger = createLogger('BridgeFactory');

/**
 * 기본 브릿지 제공자 팩토리 구현
 */
export class DefaultBridgeProviderFactory implements BridgeProviderFactory {
  private static instance: DefaultBridgeProviderFactory;
  private providers: Map<string, { 
    constructor: new (...args: any[]) => BridgeProvider,
    supportedChains: number[]
  }> = new Map();
  
  /**
   * 싱글톤 인스턴스 가져오기
   */
  public static getInstance(): DefaultBridgeProviderFactory {
    if (!DefaultBridgeProviderFactory.instance) {
      DefaultBridgeProviderFactory.instance = new DefaultBridgeProviderFactory();
    }
    
    return DefaultBridgeProviderFactory.instance;
  }
  
  /**
   * 생성자 (private)
   */
  private constructor() {
    logger.info('Bridge provider factory initialized');
  }
  
  /**
   * 제공자 등록
   * 
   * @param name 제공자 이름
   * @param provider 제공자 클래스
   * @param supportedChains 지원하는 체인 ID 목록
   */
  public registerProvider(
    name: string,
    provider: new (...args: any[]) => BridgeProvider,
    supportedChains: number[]
  ): void {
    this.providers.set(name, { constructor: provider, supportedChains });
    logger.info(`Registered bridge provider: ${name} for chains: ${supportedChains.join(', ')}`);
  }
  
  /**
   * 지원하는 제공자 목록 가져오기
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 제공자 이름 목록
   */
  public getSupportedProviders(sourceChainId: number, destinationChainId: number): string[] {
    const supportedProviders: string[] = [];
    
    for (const [name, { supportedChains }] of this.providers.entries()) {
      if (
        supportedChains.includes(sourceChainId) && 
        supportedChains.includes(destinationChainId)
      ) {
        supportedProviders.push(name);
      }
    }
    
    return supportedProviders;
  }
  
  /**
   * 브릿지 제공자 생성
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 브릿지 제공자
   */
  public createBridgeProvider(sourceChainId: number, destinationChainId: number): BridgeProvider {
    const supportedProviders = this.getSupportedProviders(sourceChainId, destinationChainId);
    
    if (supportedProviders.length === 0) {
      throw new Error(`No bridge provider found for chains ${sourceChainId} → ${destinationChainId}`);
    }
    
    // 기본 제공자 선택 (첫 번째)
    const providerName = supportedProviders[0];
    const { constructor } = this.providers.get(providerName)!;
    
    // 제공자 인스턴스 생성
    try {
      const provider = new constructor();
      logger.info(`Created bridge provider: ${providerName} for chains ${sourceChainId} → ${destinationChainId}`);
      return provider;
    } catch (error) {
      logger.error(`Failed to create bridge provider ${providerName}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 특정 이름의 브릿지 제공자 생성
   * 
   * @param name 제공자 이름
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 브릿지 제공자
   */
  public createNamedBridgeProvider(
    name: string,
    sourceChainId: number,
    destinationChainId: number
  ): BridgeProvider {
    const provider = this.providers.get(name);
    
    if (!provider) {
      throw new Error(`Bridge provider ${name} not found`);
    }
    
    const { constructor, supportedChains } = provider;
    
    // 체인 지원 여부 확인
    if (
      !supportedChains.includes(sourceChainId) || 
      !supportedChains.includes(destinationChainId)
    ) {
      throw new Error(`Bridge provider ${name} doesn't support chains ${sourceChainId} → ${destinationChainId}`);
    }
    
    // 제공자 인스턴스 생성
    try {
      const providerInstance = new constructor();
      logger.info(`Created named bridge provider: ${name} for chains ${sourceChainId} → ${destinationChainId}`);
      return providerInstance;
    } catch (error) {
      logger.error(`Failed to create named bridge provider ${name}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 특정 체인에 대한 모든 제공자 가져오기
   * 
   * @param chainId 체인 ID
   * @returns 제공자 이름 목록
   */
  public getProvidersForChain(chainId: number): string[] {
    const supportedProviders: string[] = [];
    
    for (const [name, { supportedChains }] of this.providers.entries()) {
      if (supportedChains.includes(chainId)) {
        supportedProviders.push(name);
      }
    }
    
    return supportedProviders;
  }
  
  /**
   * 모든 제공자 이름 가져오기
   * 
   * @returns 제공자 이름 목록
   */
  public getAllProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }
  
  /**
   * 제공자 등록 여부 확인
   * 
   * @param name 제공자 이름
   * @returns 등록 여부
   */
  public hasProvider(name: string): boolean {
    return this.providers.has(name);
  }
  
  /**
   * 지원하는 체인 목록 가져오기
   * 
   * @returns 체인 ID 목록
   */
  public getSupportedChains(): number[] {
    const chains: Set<number> = new Set();
    
    for (const { supportedChains } of this.providers.values()) {
      for (const chainId of supportedChains) {
        chains.add(chainId);
      }
    }
    
    return Array.from(chains);
  }
  
  /**
   * 모든 제공자 삭제
   */
  public clearProviders(): void {
    this.providers.clear();
    logger.info('Cleared all bridge providers');
  }
}

// 기본 브릿지 제공자 팩토리 인스턴스
export const defaultBridgeProviderFactory = DefaultBridgeProviderFactory.getInstance();

export default defaultBridgeProviderFactory;
