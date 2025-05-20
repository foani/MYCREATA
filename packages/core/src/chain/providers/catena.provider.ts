/**
 * @file catena.provider.ts
 * @description Catena 체인 프로바이더 구현
 */

import { JsonRpcProvider, Contract, Interface } from 'ethers';
import { Transaction, TransactionReceipt } from '../../types/transactions.types';
import { RpcProviderOptions } from '../../types/chain.types';
import { BaseProvider, ProviderEventType, ProviderState, defaultProviderFactory } from './provider.interface';
import { ERC20_ABI } from '../contracts';
import { createLogger } from '../../utils/logging';

// Catena 체인 ID
export const CATENA_MAINNET_CHAIN_ID = 1000;
export const CATENA_TESTNET_CHAIN_ID = 9000;

// Catena RPC URL
export const CATENA_MAINNET_RPC_URL = 'https://cvm.node.creatachain.com';
export const CATENA_TESTNET_RPC_URL = 'https://consensus.testnet.cvm.creatachain.com';

// 로거 생성
const logger = createLogger('CatenaProvider');

/**
 * Catena 프로바이더 클래스
 */
export class CatenaProvider extends BaseProvider {
  private provider: JsonRpcProvider | null = null;
  private blockPollingInterval: number;
  private pendingTransactionsPollingInterval: number;
  private blockPollingCleanup: (() => void) | null = null;
  private pendingTransactionsPollingCleanup: (() => void) | null = null;
  private lastBlockNumber: number = 0;
  
  /**
   * Catena 프로바이더 생성자
   * 
   * @param url RPC URL
   * @param options 옵션
   */
  constructor(url: string, options: RpcProviderOptions = { url }) {
    const chainId = url.includes('testnet') ? CATENA_TESTNET_CHAIN_ID : CATENA_MAINNET_CHAIN_ID;
    super(chainId, url, options);
    
    this.blockPollingInterval = options.pollingInterval || 12000; // 12초 (Catena 블록 생성 시간 기반)
    this.pendingTransactionsPollingInterval = options.pollingInterval || 5000; // 5초
  }
  
  /**
   * 프로바이더 초기화
   */
  public async initialize(): Promise<void> {
    if (this.provider) {
      return;
    }
    
    try {
      this.setState(ProviderState.CONNECTING);
      
      // JsonRpcProvider 생성
      this.provider = new JsonRpcProvider(this.url, this.chainId);
      
      // 초기 연결 확인
      await this.provider.getNetwork();
      
      // 초기 블록 번호 조회
      this.lastBlockNumber = await this.getBlockNumber();
      
      // 폴링 설정
      this.setupPollingServices();
      
      this.setState(ProviderState.CONNECTED);
      logger.info(`Initialized Catena provider for chainId ${this.chainId}`);
    } catch (error) {
      this.handleError(error);
      logger.error(`Failed to initialize Catena provider: ${error.message}`);
      this.setState(ProviderState.ERROR);
      throw error;
    }
  }
  
  /**
   * 연결 시작
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }
    
    await this.initialize();
  }
  
  /**
   * 연결 종료
   */
  public async disconnect(): Promise<void> {
    this.stopPollingServices();
    
    if (this.provider) {
      this.provider.removeAllListeners();
      this.provider = null;
    }
    
    this.setState(ProviderState.DISCONNECTED);
    logger.info(`Disconnected Catena provider for chainId ${this.chainId}`);
  }
  
  /**
   * 재연결
   */
  public async reconnect(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }
  
  /**
   * RPC 메서드 호출
   * 
   * @param method 메서드 이름
   * @param params 파라미터
   * @returns 결과
   */
  public async send(method: string, params: any[]): Promise<any> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const result = await this.provider!.send(method, params);
      return result;
    } catch (error) {
      logger.error(`Error calling ${method}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 잔액 조회
   * 
   * @param address 주소
   * @returns 잔액 (wei 단위 문자열)
   */
  public async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const balance = await this.provider!.getBalance(address);
      return balance.toString();
    } catch (error) {
      logger.error(`Error getting balance for ${address}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 토큰 잔액 조회
   * 
   * @param address 주소
   * @param tokenAddress 토큰 계약 주소
   * @returns 잔액 (wei 단위 문자열)
   */
  public async getTokenBalance(address: string, tokenAddress: string): Promise<string> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, this.provider!);
      const balance = await tokenContract.balanceOf(address);
      return balance.toString();
    } catch (error) {
      logger.error(`Error getting token balance for ${address} (token: ${tokenAddress}): ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 코드 조회
   * 
   * @param address 계약 주소
   * @returns 코드 (16진수 문자열)
   */
  public async getCode(address: string): Promise<string> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      return await this.provider!.getCode(address);
    } catch (error) {
      logger.error(`Error getting code for ${address}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 논스 조회
   * 
   * @param address 주소
   * @returns 논스
   */
  public async getNonce(address: string): Promise<number> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const nonce = await this.provider!.getTransactionCount(address);
      return nonce;
    } catch (error) {
      logger.error(`Error getting nonce for ${address}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 가스 가격 조회
   * 
   * @returns 가스 가격 (wei 단위 문자열)
   */
  public async getGasPrice(): Promise<string> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const gasPrice = await this.provider!.getFeeData();
      
      // EIP-1559를 지원하는 경우 maxFeePerGas 반환, 아니면 gasPrice 반환
      if (gasPrice.maxFeePerGas) {
        return gasPrice.maxFeePerGas.toString();
      }
      
      return gasPrice.gasPrice?.toString() || '0';
    } catch (error) {
      logger.error(`Error getting gas price: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 가스 견적
   * 
   * @param transaction 트랜잭션
   * @returns 가스 견적 (wei 단위 문자열)
   */
  public async estimateGas(transaction: Transaction): Promise<string> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const gasEstimate = await this.provider!.estimateGas({
        to: transaction.to,
        from: transaction.from,
        data: transaction.data,
        value: transaction.value
      });
      
      return gasEstimate.toString();
    } catch (error) {
      logger.error(`Error estimating gas for transaction: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 현재 블록 번호 조회
   * 
   * @returns 블록 번호
   */
  public async getBlockNumber(): Promise<number> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const blockNumber = await this.provider!.getBlockNumber();
      this.lastBlockNumber = blockNumber;
      return blockNumber;
    } catch (error) {
      logger.error(`Error getting block number: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 블록 조회
   * 
   * @param blockHashOrNumber 블록 해시 또는 번호
   * @returns 블록 정보
   */
  public async getBlock(blockHashOrNumber: string | number): Promise<any> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const block = await this.provider!.getBlock(blockHashOrNumber);
      return block;
    } catch (error) {
      logger.error(`Error getting block ${blockHashOrNumber}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 트랜잭션 조회
   * 
   * @param transactionHash 트랜잭션 해시
   * @returns 트랜잭션 정보
   */
  public async getTransaction(transactionHash: string): Promise<any> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const transaction = await this.provider!.getTransaction(transactionHash);
      return transaction;
    } catch (error) {
      logger.error(`Error getting transaction ${transactionHash}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 트랜잭션 영수증 조회
   * 
   * @param hash 트랜잭션 해시
   * @returns 트랜잭션 영수증
   */
  public async getTransactionReceipt(hash: string): Promise<TransactionReceipt | null> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const receipt = await this.provider!.getTransactionReceipt(hash);
      
      if (!receipt) {
        return null;
      }
      
      // 타입 변환
      return {
        to: receipt.to || '',
        from: receipt.from,
        contractAddress: receipt.contractAddress,
        transactionIndex: receipt.index,
        root: receipt.root || undefined,
        gasUsed: receipt.gasUsed.toString(),
        logsBloom: receipt.logsBloom,
        blockHash: receipt.blockHash,
        transactionHash: receipt.hash,
        logs: receipt.logs.map(log => ({
          transactionIndex: log.transactionIndex,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          address: log.address,
          topics: log.topics,
          data: log.data,
          logIndex: log.index,
          blockHash: log.blockHash
        })),
        blockNumber: receipt.blockNumber,
        confirmations: receipt.confirmations,
        cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice.toString(),
        status: receipt.status,
        type: receipt.type
      };
    } catch (error) {
      logger.error(`Error getting transaction receipt ${hash}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 계약 호출
   * 
   * @param transaction 트랜잭션
   * @returns 호출 결과 (16진수 문자열)
   */
  public async call(transaction: any): Promise<string> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const result = await this.provider!.call(transaction);
      return result;
    } catch (error) {
      logger.error(`Error calling contract: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 트랜잭션 전송
   * 
   * @param signedTransaction 서명된 트랜잭션
   * @returns 트랜잭션 해시
   */
  public async sendTransaction(signedTransaction: string): Promise<string> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const tx = await this.provider!.broadcastTransaction(signedTransaction);
      return tx.hash;
    } catch (error) {
      logger.error(`Error sending transaction: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * EIP-1559 지원 여부 확인
   * 
   * @returns 지원 여부
   */
  public async supportsEIP1559(): Promise<boolean> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const block = await this.provider!.getBlock('latest');
      return block && typeof block.baseFeePerGas !== 'undefined';
    } catch (error) {
      logger.error(`Error checking EIP-1559 support: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 계약 호출
   * 
   * @param abi ABI
   * @param address 계약 주소
   * @param method 메서드 이름
   * @param params 파라미터
   * @returns 결과
   */
  public async callContract(abi: any[], address: string, method: string, params: any[]): Promise<any> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      const contract = new Contract(address, abi, this.provider!);
      const result = await contract[method](...params);
      return result;
    } catch (error) {
      logger.error(`Error calling contract ${address}.${method}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 트랜잭션 수 조회
   * 
   * @param address 주소
   * @returns 트랜잭션 수
   */
  public async getTransactionCount(address: string): Promise<number> {
    if (!this.provider) {
      await this.connect();
    }
    
    try {
      return await this.provider!.getTransactionCount(address);
    } catch (error) {
      logger.error(`Error getting transaction count for ${address}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 폴링 서비스 설정
   */
  private setupPollingServices(): void {
    // 이미 설정된 경우 중지
    this.stopPollingServices();
    
    // 블록 폴링
    this.blockPollingCleanup = this.setupPolling(async () => {
      try {
        const blockNumber = await this.getBlockNumber();
        
        if (blockNumber > this.lastBlockNumber) {
          // 새 블록 이벤트 발생
          for (let i = this.lastBlockNumber + 1; i <= blockNumber; i++) {
            const block = await this.getBlock(i);
            this.emit(ProviderEventType.BLOCK, block);
          }
          
          this.lastBlockNumber = blockNumber;
        }
      } catch (error) {
        logger.error(`Block polling error: ${error.message}`);
      }
    }, this.blockPollingInterval);
    
    // 대기 중인 트랜잭션 폴링 (미구현)
    // this.pendingTransactionsPollingCleanup = ...
  }
  
  /**
   * 폴링 서비스 중지
   */
  private stopPollingServices(): void {
    if (this.blockPollingCleanup) {
      this.blockPollingCleanup();
      this.blockPollingCleanup = null;
    }
    
    if (this.pendingTransactionsPollingCleanup) {
      this.pendingTransactionsPollingCleanup();
      this.pendingTransactionsPollingCleanup = null;
    }
  }
}

// Catena 프로바이더 등록
defaultProviderFactory.registerProvider(
  CATENA_MAINNET_CHAIN_ID,
  CatenaProvider as any,
  CATENA_MAINNET_RPC_URL
);

defaultProviderFactory.registerProvider(
  CATENA_TESTNET_CHAIN_ID,
  CatenaProvider as any,
  CATENA_TESTNET_RPC_URL
);
