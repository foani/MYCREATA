/**
 * @file bridge.service.ts
 * @description 크로스체인 브릿지 서비스 구현
 */

import { EventEmitter } from 'events';
import { createLogger } from '../../utils/logging';
import { 
  BridgeProvider, 
  BridgeProviderFactory, 
  BridgeProviderState,
  BridgeQuoteRequest, 
  BridgeQuoteResponse,
  BridgeTransactionRequest,
  BridgeTransactionResponse,
  BridgeTransactionInfo,
  BridgeBalanceInfo,
  BridgeToken,
  BridgeEventType,
  BridgeError,
  BridgeErrorCode
} from './bridge.interface';
import { Transaction } from '../../types/transactions.types';
import { SupportedChainId } from '../../types/chain.types';

// 로거 생성
const logger = createLogger('BridgeService');

/**
 * 기본 브릿지 서비스 구현
 */
export class BridgeService {
  private static instance: BridgeService;
  private eventEmitter: EventEmitter;
  private providerFactory: BridgeProviderFactory;
  private activeProviders: Map<string, BridgeProvider> = new Map();
  private recentTransactions: Map<string, BridgeTransactionInfo> = new Map();
  
  /**
   * 싱글톤 인스턴스 가져오기
   */
  public static getInstance(providerFactory: BridgeProviderFactory): BridgeService {
    if (!BridgeService.instance) {
      BridgeService.instance = new BridgeService(providerFactory);
    }
    
    return BridgeService.instance;
  }
  
  /**
   * 생성자 (private)
   * 
   * @param providerFactory 브릿지 제공자 팩토리
   */
  private constructor(providerFactory: BridgeProviderFactory) {
    this.eventEmitter = new EventEmitter();
    this.providerFactory = providerFactory;
    
    logger.info('Bridge service initialized');
  }
  
  /**
   * 특정 체인 쌍에 대한 브릿지 제공자 가져오기
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 브릿지 제공자
   */
  private getProvider(sourceChainId: number, destinationChainId: number): BridgeProvider {
    const key = `${sourceChainId}-${destinationChainId}`;
    
    // 기존 제공자 확인
    if (this.activeProviders.has(key)) {
      return this.activeProviders.get(key)!;
    }
    
    // 새 제공자 생성
    try {
      const provider = this.providerFactory.createBridgeProvider(sourceChainId, destinationChainId);
      
      // 이벤트 전달
      provider.on(BridgeEventType.TRANSACTION_CREATED, (tx: BridgeTransactionInfo) => {
        this.recentTransactions.set(tx.id, tx);
        this.eventEmitter.emit(BridgeEventType.TRANSACTION_CREATED, tx);
      });
      
      provider.on(BridgeEventType.TRANSACTION_UPDATED, (tx: BridgeTransactionInfo) => {
        this.recentTransactions.set(tx.id, tx);
        this.eventEmitter.emit(BridgeEventType.TRANSACTION_UPDATED, tx);
      });
      
      provider.on(BridgeEventType.TRANSACTION_COMPLETED, (tx: BridgeTransactionInfo) => {
        this.recentTransactions.set(tx.id, tx);
        this.eventEmitter.emit(BridgeEventType.TRANSACTION_COMPLETED, tx);
      });
      
      provider.on(BridgeEventType.TRANSACTION_FAILED, (tx: BridgeTransactionInfo) => {
        this.recentTransactions.set(tx.id, tx);
        this.eventEmitter.emit(BridgeEventType.TRANSACTION_FAILED, tx);
      });
      
      provider.on(BridgeEventType.ERROR, (error: Error) => {
        this.eventEmitter.emit(BridgeEventType.ERROR, error);
      });
      
      this.activeProviders.set(key, provider);
      
      return provider;
    } catch (error) {
      logger.error(`Failed to create bridge provider for chains ${sourceChainId}-${destinationChainId}: ${error.message}`);
      throw new BridgeError(
        BridgeErrorCode.UNSUPPORTED_CHAIN,
        `No bridge provider available for chains ${sourceChainId}-${destinationChainId}`,
        { sourceChainId, destinationChainId }
      );
    }
  }
  
  /**
   * 지원하는 토큰 목록 가져오기
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 지원하는 토큰 목록
   */
  public async getSupportedTokens(
    sourceChainId: number, 
    destinationChainId: number
  ): Promise<BridgeToken[]> {
    try {
      const provider = this.getProvider(sourceChainId, destinationChainId);
      return await provider.getSupportedTokens(sourceChainId, destinationChainId);
    } catch (error) {
      logger.error(`Failed to get supported tokens: ${error.message}`);
      
      if (error instanceof BridgeError) {
        throw error;
      }
      
      throw new BridgeError(
        BridgeErrorCode.PROVIDER_ERROR,
        `Failed to get supported tokens: ${error.message}`,
        { sourceChainId, destinationChainId }
      );
    }
  }
  
  /**
   * 브릿지 전송 견적 가져오기
   * 
   * @param request 견적 요청
   * @returns 견적 응답
   */
  public async getQuote(request: BridgeQuoteRequest): Promise<BridgeQuoteResponse> {
    try {
      const provider = this.getProvider(request.sourceChainId, request.destinationChainId);
      return await provider.getQuote(request);
    } catch (error) {
      logger.error(`Failed to get bridge quote: ${error.message}`);
      
      if (error instanceof BridgeError) {
        throw error;
      }
      
      throw new BridgeError(
        BridgeErrorCode.PROVIDER_ERROR,
        `Failed to get bridge quote: ${error.message}`,
        { request }
      );
    }
  }
  
  /**
   * 브릿지 트랜잭션 생성
   * 
   * @param request 트랜잭션 요청
   * @returns 트랜잭션 응답
   */
  public async createTransaction(request: BridgeTransactionRequest): Promise<BridgeTransactionResponse> {
    try {
      const provider = this.getProvider(request.sourceChainId, request.destinationChainId);
      
      // 토큰 허용량 확인 (네이티브 토큰이 아닌 경우)
      if (request.tokenAddress !== '0x0000000000000000000000000000000000000000') {
        const supportedTokens = await provider.getSupportedTokens(
          request.sourceChainId,
          request.destinationChainId
        );
        
        const token = supportedTokens.find(t => t.sourceAddress.toLowerCase() === request.tokenAddress.toLowerCase());
        
        if (!token) {
          throw new BridgeError(
            BridgeErrorCode.UNSUPPORTED_TOKEN,
            `Token ${request.tokenAddress} is not supported for this bridge`,
            { request }
          );
        }
        
        if (!token.isNative) {
          // 브릿지 컨트랙트 주소 가져오기 (제공자에 따라 다름)
          const spender = await this.getBridgeContractAddress(provider, request.sourceChainId);
          
          // 허용량 확인
          const allowance = await provider.checkAllowance(
            request.tokenAddress,
            request.sender,
            spender,
            request.sourceChainId
          );
          
          // 허용량이 부족한 경우
          if (BigInt(allowance) < BigInt(request.amount)) {
            // 허용량 필요 이벤트 발생
            this.eventEmitter.emit(BridgeEventType.ALLOWANCE_NEEDED, {
              tokenAddress: request.tokenAddress,
              owner: request.sender,
              spender,
              required: request.amount,
              current: allowance,
              chainId: request.sourceChainId
            });
            
            throw new BridgeError(
              BridgeErrorCode.INSUFFICIENT_ALLOWANCE,
              `Insufficient allowance for token ${request.tokenAddress}`,
              { 
                tokenAddress: request.tokenAddress, 
                required: request.amount,
                current: allowance,
                chainId: request.sourceChainId
              }
            );
          }
        }
      }
      
      // 트랜잭션 생성
      return await provider.createTransaction(request);
    } catch (error) {
      logger.error(`Failed to create bridge transaction: ${error.message}`);
      
      if (error instanceof BridgeError) {
        throw error;
      }
      
      throw new BridgeError(
        BridgeErrorCode.PROVIDER_ERROR,
        `Failed to create bridge transaction: ${error.message}`,
        { request }
      );
    }
  }
  
  /**
   * 브릿지 트랜잭션 상태 조회
   * 
   * @param transactionId 트랜잭션 ID
   * @returns 트랜잭션 정보
   */
  public async getTransactionStatus(transactionId: string): Promise<BridgeTransactionInfo> {
    // 최근 트랜잭션 캐시에서 확인
    if (this.recentTransactions.has(transactionId)) {
      const cachedTx = this.recentTransactions.get(transactionId)!;
      
      // 완료된 트랜잭션이 아니면 최신 상태 조회
      if (
        cachedTx.status !== 'completed' && 
        cachedTx.status !== 'failed' && 
        cachedTx.status !== 'refunded'
      ) {
        try {
          const provider = this.getProvider(cachedTx.sourceChainId, cachedTx.destinationChainId);
          const updatedTx = await provider.getTransactionStatus(transactionId);
          
          // 캐시 업데이트
          this.recentTransactions.set(transactionId, updatedTx);
          
          return updatedTx;
        } catch (error) {
          logger.warn(`Failed to get latest transaction status, using cached status: ${error.message}`);
          return cachedTx;
        }
      }
      
      return cachedTx;
    }
    
    // 캐시에 없으면 각 제공자에게 요청
    for (const provider of this.activeProviders.values()) {
      try {
        const tx = await provider.getTransactionStatus(transactionId);
        
        // 캐시에 저장
        this.recentTransactions.set(transactionId, tx);
        
        return tx;
      } catch (error) {
        // 이 제공자에 트랜잭션이 없음, 다음 제공자 시도
        continue;
      }
    }
    
    // 트랜잭션을 찾을 수 없음
    throw new BridgeError(
      BridgeErrorCode.UNKNOWN_ERROR,
      `Transaction with ID ${transactionId} not found`,
      { transactionId }
    );
  }
  
  /**
   * 지갑 주소의 클레임 가능한 잔액 조회
   * 
   * @param address 지갑 주소
   * @param chainId 체인 ID
   * @returns 잔액 정보 목록
   */
  public async getClaimableBalances(address: string, chainId: number): Promise<BridgeBalanceInfo[]> {
    const results: BridgeBalanceInfo[] = [];
    
    // 각 제공자별로 클레임 가능 잔액 조회
    for (const provider of this.activeProviders.values()) {
      // 이 체인을 지원하는 제공자인지 확인
      if (provider.supportedChains.includes(chainId)) {
        try {
          const balances = await provider.getClaimableBalances(address, chainId);
          results.push(...balances);
        } catch (error) {
          logger.warn(`Provider ${provider.name} failed to get claimable balances: ${error.message}`);
        }
      }
    }
    
    return results;
  }
  
  /**
   * 토큰 허용량 확인
   * 
   * @param tokenAddress 토큰 주소
   * @param owner 소유자 주소
   * @param spender 스펜더 주소
   * @param chainId 체인 ID
   * @returns 허용량 (wei 단위 문자열)
   */
  public async checkAllowance(
    tokenAddress: string, 
    owner: string, 
    spender: string, 
    chainId: number
  ): Promise<string> {
    // 이 체인을 지원하는 제공자 찾기
    for (const provider of this.activeProviders.values()) {
      if (provider.supportedChains.includes(chainId)) {
        try {
          return await provider.checkAllowance(tokenAddress, owner, spender, chainId);
        } catch (error) {
          logger.warn(`Provider ${provider.name} failed to check allowance: ${error.message}`);
        }
      }
    }
    
    throw new BridgeError(
      BridgeErrorCode.UNSUPPORTED_CHAIN,
      `No provider found for chain ${chainId}`,
      { chainId }
    );
  }
  
  /**
   * 토큰 허용량 승인 트랜잭션 생성
   * 
   * @param tokenAddress 토큰 주소
   * @param spender 스펜더 주소
   * @param amount 금액 (wei 단위 문자열)
   * @param chainId 체인 ID
   * @returns 트랜잭션 객체
   */
  public async createApprovalTransaction(
    tokenAddress: string, 
    spender: string, 
    amount: string, 
    chainId: number
  ): Promise<Transaction> {
    // 이 체인을 지원하는 제공자 찾기
    for (const provider of this.activeProviders.values()) {
      if (provider.supportedChains.includes(chainId)) {
        try {
          return await provider.createApprovalTransaction(tokenAddress, spender, amount, chainId);
        } catch (error) {
          logger.warn(`Provider ${provider.name} failed to create approval transaction: ${error.message}`);
        }
      }
    }
    
    throw new BridgeError(
      BridgeErrorCode.UNSUPPORTED_CHAIN,
      `No provider found for chain ${chainId}`,
      { chainId }
    );
  }
  
  /**
   * 모든 트랜잭션 가져오기
   * 
   * @returns 트랜잭션 정보 목록 (최신순)
   */
  public getAllTransactions(): BridgeTransactionInfo[] {
    return Array.from(this.recentTransactions.values())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  /**
   * 주소의 모든 트랜잭션 가져오기
   * 
   * @param address 주소
   * @returns 트랜잭션 정보 목록 (최신순)
   */
  public getTransactionsByAddress(address: string): BridgeTransactionInfo[] {
    return Array.from(this.recentTransactions.values())
      .filter(tx => tx.sender.toLowerCase() === address.toLowerCase() || 
                    tx.recipient.toLowerCase() === address.toLowerCase())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  /**
   * 특정 체인 간의 모든 트랜잭션 가져오기
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 트랜잭션 정보 목록 (최신순)
   */
  public getTransactionsByChains(sourceChainId: number, destinationChainId: number): BridgeTransactionInfo[] {
    return Array.from(this.recentTransactions.values())
      .filter(tx => tx.sourceChainId === sourceChainId && tx.destinationChainId === destinationChainId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  /**
   * 특정 상태의 모든 트랜잭션 가져오기
   * 
   * @param status 트랜잭션 상태
   * @returns 트랜잭션 정보 목록 (최신순)
   */
  public getTransactionsByStatus(status: string): BridgeTransactionInfo[] {
    return Array.from(this.recentTransactions.values())
      .filter(tx => tx.status === status)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  /**
   * 클레임 트랜잭션 생성
   * 
   * @param address 주소
   * @param balanceInfo 잔액 정보
   * @returns 트랜잭션 응답
   */
  public async createClaimTransaction(
    address: string, 
    balanceInfo: BridgeBalanceInfo
  ): Promise<BridgeTransactionResponse> {
    // 이 체인을 지원하는 제공자 찾기
    for (const provider of this.activeProviders.values()) {
      if (provider.supportedChains.includes(balanceInfo.destinationChainId)) {
        try {
          return await provider.createClaimTransaction(address, balanceInfo);
        } catch (error) {
          logger.warn(`Provider ${provider.name} failed to create claim transaction: ${error.message}`);
        }
      }
    }
    
    throw new BridgeError(
      BridgeErrorCode.UNSUPPORTED_CHAIN,
      `No provider found for chain ${balanceInfo.destinationChainId}`,
      { chainId: balanceInfo.destinationChainId }
    );
  }
  
  /**
   * 지원하는 체인 목록 가져오기
   * 
   * @returns 체인 ID 목록
   */
  public getSupportedChains(): number[] {
    const chains: Set<number> = new Set();
    
    for (const provider of this.activeProviders.values()) {
      for (const chainId of provider.supportedChains) {
        chains.add(chainId);
      }
    }
    
    return Array.from(chains);
  }
  
  /**
   * 지원하는 제공자 목록 가져오기
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 제공자 이름 목록
   */
  public getSupportedProviders(sourceChainId: number, destinationChainId: number): string[] {
    return this.providerFactory.getSupportedProviders(sourceChainId, destinationChainId);
  }
  
  /**
   * 체인 간 지원 여부 확인
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @returns 지원 여부
   */
  public isBridgeSupported(sourceChainId: number, destinationChainId: number): boolean {
    return this.getSupportedProviders(sourceChainId, destinationChainId).length > 0;
  }
  
  /**
   * 브릿지 컨트랙트 주소 가져오기
   * 
   * @param provider 브릿지 제공자
   * @param chainId 체인 ID
   * @returns 컨트랙트 주소
   */
  private async getBridgeContractAddress(provider: BridgeProvider, chainId: number): Promise<string> {
    // 제공자 구현에 따라 다름
    // 예시로 하드코딩된 주소 사용
    switch (provider.name) {
      case 'catena-bridge':
        if (chainId === SupportedChainId.CATENA_MAINNET) {
          return '0x5555555555555555555555555555555555555555';
        } else if (chainId === SupportedChainId.ETHEREUM) {
          return '0x6666666666666666666666666666666666666666';
        } else if (chainId === SupportedChainId.POLYGON) {
          return '0x7777777777777777777777777777777777777777';
        } else if (chainId === SupportedChainId.ARBITRUM) {
          return '0x8888888888888888888888888888888888888888';
        }
        break;
      
      case 'wormhole':
        if (chainId === SupportedChainId.CATENA_MAINNET) {
          return '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        } else if (chainId === SupportedChainId.ETHEREUM) {
          return '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
        } else if (chainId === SupportedChainId.POLYGON) {
          return '0xcccccccccccccccccccccccccccccccccccccccc';
        } else if (chainId === SupportedChainId.ARBITRUM) {
          return '0xdddddddddddddddddddddddddddddddddddddddd';
        }
        break;
    }
    
    throw new BridgeError(
      BridgeErrorCode.UNSUPPORTED_CHAIN,
      `No bridge contract address found for chain ${chainId} with provider ${provider.name}`,
      { chainId, provider: provider.name }
    );
  }
  
  /**
   * 리스너 등록
   * 
   * @param event 이벤트 이름
   * @param listener 리스너 함수
   */
  public on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }
  
  /**
   * 리스너 제거
   * 
   * @param event 이벤트 이름
   * @param listener 리스너 함수
   */
  public off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
  
  /**
   * 일회성 리스너 등록
   * 
   * @param event 이벤트 이름
   * @param listener 리스너 함수
   */
  public once(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.once(event, listener);
  }
  
  /**
   * 모든 리스너 제거
   * 
   * @param event 이벤트 이름 (옵션)
   */
  public removeAllListeners(event?: string): void {
    this.eventEmitter.removeAllListeners(event);
  }
  
  /**
   * 전송 가능한 최소/최대 금액 가져오기
   * 
   * @param sourceChainId 소스 체인 ID
   * @param destinationChainId 대상 체인 ID
   * @param tokenAddress 토큰 주소
   * @returns { min: string, max: string } 최소/최대 금액 (wei 단위 문자열)
   */
  public async getTransferLimits(
    sourceChainId: number,
    destinationChainId: number,
    tokenAddress: string
  ): Promise<{ min: string, max: string }> {
    try {
      const tokens = await this.getSupportedTokens(sourceChainId, destinationChainId);
      const token = tokens.find(t => t.sourceAddress.toLowerCase() === tokenAddress.toLowerCase());
      
      if (!token) {
        throw new BridgeError(
          BridgeErrorCode.UNSUPPORTED_TOKEN,
          `Token ${tokenAddress} is not supported for this bridge`,
          { sourceChainId, destinationChainId, tokenAddress }
        );
      }
      
      return {
        min: token.minAmount,
        max: token.maxAmount
      };
    } catch (error) {
      logger.error(`Failed to get transfer limits: ${error.message}`);
      
      if (error instanceof BridgeError) {
        throw error;
      }
      
      throw new BridgeError(
        BridgeErrorCode.PROVIDER_ERROR,
        `Failed to get transfer limits: ${error.message}`,
        { sourceChainId, destinationChainId, tokenAddress }
      );
    }
  }
  
  /**
   * 여러 브릿지 제공자로부터 견적 가져와서 비교
   * 
   * @param request 견적 요청
   * @returns 견적 응답 목록 (수수료 기준 오름차순)
   */
  public async compareQuotes(request: BridgeQuoteRequest): Promise<BridgeQuoteResponse[]> {
    const providers = this.getSupportedProviders(request.sourceChainId, request.destinationChainId);
    const quotes: BridgeQuoteResponse[] = [];
    
    for (const providerName of providers) {
      try {
        // 각 제공자에 대해 견적 요청
        const provider = this.getProvider(request.sourceChainId, request.destinationChainId);
        const quote = await provider.getQuote(request);
        quotes.push(quote);
      } catch (error) {
        logger.warn(`Provider ${providerName} failed to get quote: ${error.message}`);
      }
    }
    
    // 수수료 기준으로 정렬 (오름차순)
    return quotes.sort((a, b) => {
      const aFee = BigInt(a.bridgeFee.fixedFee);
      const bFee = BigInt(b.bridgeFee.fixedFee);
      
      if (aFee < bFee) return -1;
      if (aFee > bFee) return 1;
      return 0;
    });
  }
  
  /**
   * 주기적으로 트랜잭션 상태 업데이트
   * 
   * @param intervalMs 간격 (밀리초)
   * @returns 업데이트 작업 중지 함수
   */
  public startTransactionStatusPolling(intervalMs: number = 30000): () => void {
    // 진행 중인 트랜잭션만 업데이트
    const updatePendingTransactions = async () => {
      const pendingTxIds = Array.from(this.recentTransactions.entries())
        .filter(([_, tx]) => 
          tx.status !== 'completed' && 
          tx.status !== 'failed' && 
          tx.status !== 'refunded'
        )
        .map(([id]) => id);
      
      for (const txId of pendingTxIds) {
        try {
          await this.getTransactionStatus(txId);
        } catch (error) {
          logger.warn(`Failed to update transaction ${txId}: ${error.message}`);
        }
      }
    };
    
    // 주기적 업데이트 시작
    const intervalId = setInterval(updatePendingTransactions, intervalMs);
    
    // 처음 한 번 즉시 실행
    updatePendingTransactions();
    
    // 중지 함수 반환
    return () => clearInterval(intervalId);
  }
  
  /**
   * 트랜잭션 내역 저장
   * 
   * @param storage 스토리지
   */
  public saveTransactionHistory(storage: Storage): void {
    try {
      const transactions = Array.from(this.recentTransactions.values());
      storage.setItem('crelink_bridge_transactions', JSON.stringify(transactions));
      logger.info(`Saved ${transactions.length} bridge transactions to storage`);
    } catch (error) {
      logger.error(`Failed to save transaction history: ${error.message}`);
    }
  }
  
  /**
   * 트랜잭션 내역 로드
   * 
   * @param storage 스토리지
   */
  public loadTransactionHistory(storage: Storage): void {
    try {
      const json = storage.getItem('crelink_bridge_transactions');
      
      if (!json) {
        return;
      }
      
      const transactions = JSON.parse(json) as BridgeTransactionInfo[];
      
      for (const tx of transactions) {
        this.recentTransactions.set(tx.id, tx);
      }
      
      logger.info(`Loaded ${transactions.length} bridge transactions from storage`);
    } catch (error) {
      logger.error(`Failed to load transaction history: ${error.message}`);
    }
  }
  
  /**
   * 모든 리소스 해제
   */
  public dispose(): void {
    // 모든 제공자 해제
    for (const provider of this.activeProviders.values()) {
      provider.removeAllListeners();
    }
    
    this.activeProviders.clear();
    this.eventEmitter.removeAllListeners();
    logger.info('Bridge service disposed');
  }
}

export default BridgeService;
