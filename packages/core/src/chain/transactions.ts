/**
 * @file transactions.ts
 * @description 트랜잭션 생성, 서명 및 전송 유틸리티
 */

import { Transaction, TransactionType, GasEstimate, SpeedUpOptions, CancelOptions } from '../types/transactions.types';
import { IProvider } from './providers/provider.interface';
import { createLogger } from '../utils/logging';
import { Wallet, TransactionRequest, parseEther, TransactionResponse, TransactionReceipt } from 'ethers';
import { normalizeAddress } from '../utils/address';

// 로거 생성
const logger = createLogger('Transactions');

/**
 * 가스 추정 옵션
 */
export interface EstimateGasOptions {
  padGasLimit?: number; // 가스 한도 패딩 (퍼센트)
  fallbackGasLimit?: string; // 추정 실패 시 대체 가스 한도
  maxGasPrice?: string; // 최대 가스 가격
  maxPriorityFee?: string; // 최대 우선순위 수수료
}

/**
 * 트랜잭션 빌더
 */
export class TransactionBuilder {
  private transaction: Partial<Transaction>;
  
  /**
   * 트랜잭션 빌더 생성자
   * 
   * @param from 발신자 주소
   * @param chainId 체인 ID
   */
  constructor(from: string, chainId: number) {
    this.transaction = {
      from: normalizeAddress(from),
      chainId,
      value: '0',
      data: '0x'
    };
  }
  
  /**
   * 수신자 주소 설정
   * 
   * @param to 수신자 주소
   * @returns 빌더 인스턴스
   */
  public setTo(to: string): TransactionBuilder {
    this.transaction.to = normalizeAddress(to);
    return this;
  }
  
  /**
   * 값 설정
   * 
   * @param value 값 (wei 단위 문자열)
   * @returns 빌더 인스턴스
   */
  public setValue(value: string): TransactionBuilder {
    this.transaction.value = value;
    return this;
  }
  
  /**
   * 값 설정 (이더 단위)
   * 
   * @param ether 값 (이더 단위)
   * @returns 빌더 인스턴스
   */
  public setValueInEther(ether: string): TransactionBuilder {
    this.transaction.value = parseEther(ether).toString();
    return this;
  }
  
  /**
   * 데이터 설정
   * 
   * @param data 데이터 (16진수 문자열)
   * @returns 빌더 인스턴스
   */
  public setData(data: string): TransactionBuilder {
    this.transaction.data = data;
    return this;
  }
  
  /**
   * 가스 한도 설정
   * 
   * @param gasLimit 가스 한도
   * @returns 빌더 인스턴스
   */
  public setGasLimit(gasLimit: string): TransactionBuilder {
    this.transaction.gasLimit = gasLimit;
    return this;
  }
  
  /**
   * 가스 가격 설정 (레거시)
   * 
   * @param gasPrice 가스 가격 (wei 단위)
   * @returns 빌더 인스턴스
   */
  public setGasPrice(gasPrice: string): TransactionBuilder {
    this.transaction.gasPrice = gasPrice;
    this.transaction.type = TransactionType.LEGACY;
    
    // EIP-1559 필드 제거
    delete this.transaction.maxFeePerGas;
    delete this.transaction.maxPriorityFeePerGas;
    
    return this;
  }
  
  /**
   * EIP-1559 가스 설정
   * 
   * @param maxFeePerGas 최대 가스 수수료
   * @param maxPriorityFeePerGas 최대 우선순위 수수료
   * @returns 빌더 인스턴스
   */
  public setEIP1559Gas(maxFeePerGas: string, maxPriorityFeePerGas: string): TransactionBuilder {
    this.transaction.maxFeePerGas = maxFeePerGas;
    this.transaction.maxPriorityFeePerGas = maxPriorityFeePerGas;
    this.transaction.type = TransactionType.EIP1559;
    
    // 레거시 필드 제거
    delete this.transaction.gasPrice;
    
    return this;
  }
  
  /**
   * 논스 설정
   * 
   * @param nonce 논스
   * @returns 빌더 인스턴스
   */
  public setNonce(nonce: number): TransactionBuilder {
    this.transaction.nonce = nonce;
    return this;
  }
  
  /**
   * 트랜잭션 타입 설정
   * 
   * @param type 트랜잭션 타입
   * @returns 빌더 인스턴스
   */
  public setType(type: TransactionType): TransactionBuilder {
    this.transaction.type = type;
    return this;
  }
  
  /**
   * 액세스 목록 설정 (EIP-2930)
   * 
   * @param accessList 액세스 목록
   * @returns 빌더 인스턴스
   */
  public setAccessList(accessList: Array<{ address: string; storageKeys: string[] }>): TransactionBuilder {
    this.transaction.accessList = accessList;
    
    if (this.transaction.type !== TransactionType.EIP1559) {
      this.transaction.type = TransactionType.EIP2930;
    }
    
    return this;
  }
  
  /**
   * 트랜잭션 빌드
   * 
   * @returns 트랜잭션 객체
   */
  public build(): Transaction {
    if (!this.transaction.from) {
      throw new Error('Transaction must have a from address');
    }
    
    if (!this.transaction.chainId) {
      throw new Error('Transaction must have a chainId');
    }
    
    if (!this.transaction.to && !this.transaction.data) {
      throw new Error('Transaction must have a to address or data for contract deployment');
    }
    
    return this.transaction as Transaction;
  }
}

/**
 * 가스 추정
 * 
 * @param provider 프로바이더
 * @param transaction 트랜잭션
 * @param options 옵션
 * @returns 가스 추정 결과
 */
export async function estimateGas(
  provider: IProvider,
  transaction: Transaction,
  options: EstimateGasOptions = {}
): Promise<GasEstimate> {
  try {
    // EIP-1559 지원 여부 확인
    const supportsEIP1559 = await provider.supportsEIP1559().catch(() => false);
    
    // 가스 한도 추정
    let gasLimit = await provider.estimateGas(transaction);
    
    // 패딩 추가 (기본값: 10%)
    const padGasLimitPercent = options.padGasLimit ?? 10;
    const paddingFactor = 1 + padGasLimitPercent / 100;
    
    gasLimit = Math.ceil(Number(gasLimit) * paddingFactor).toString();
    
    // 가스 가격 정보 조회
    let gasEstimate: GasEstimate;
    
    if (supportsEIP1559) {
      // EIP-1559 가스 정보
      const feeData = await provider.send('eth_feeHistory', [1, 'latest', [10, 90]]);
      const baseFee = feeData.baseFeePerGas[0];
      
      // 우선순위 수수료 (기본값: 1.5 gwei)
      const priorityFee = options.maxPriorityFee || '0x38D7EA4C68000'; // 1.5 gwei
      
      // 최대 수수료 = 기본 수수료 * 2 + 우선순위 수수료
      const maxFeePerGas = options.maxGasPrice || 
        (BigInt(baseFee) * BigInt(2) + BigInt(priorityFee)).toString();
      
      gasEstimate = {
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas: priorityFee,
        estimatedBaseFee: baseFee,
        type: TransactionType.EIP1559
      };
    } else {
      // 레거시 가스 가격
      const gasPrice = await provider.getGasPrice();
      
      // 최대 가스 가격 적용
      const finalGasPrice = options.maxGasPrice && BigInt(gasPrice) > BigInt(options.maxGasPrice)
        ? options.maxGasPrice
        : gasPrice;
      
      gasEstimate = {
        gasLimit,
        gasPrice: finalGasPrice,
        type: TransactionType.LEGACY
      };
    }
    
    // 예상 가스 비용 계산
    if (gasEstimate.gasPrice) {
      gasEstimate.estimatedGasCost = (BigInt(gasEstimate.gasLimit) * BigInt(gasEstimate.gasPrice)).toString();
    } else if (gasEstimate.maxFeePerGas) {
      gasEstimate.estimatedGasCost = (BigInt(gasEstimate.gasLimit) * BigInt(gasEstimate.maxFeePerGas)).toString();
    }
    
    return gasEstimate;
  } catch (error) {
    logger.error(`Failed to estimate gas: ${error.message}`);
    
    // 대체 가스 한도 사용
    if (options.fallbackGasLimit) {
      logger.info(`Using fallback gas limit: ${options.fallbackGasLimit}`);
      
      return {
        gasLimit: options.fallbackGasLimit,
        gasPrice: transaction.gasPrice || (await provider.getGasPrice()),
        type: TransactionType.LEGACY
      };
    }
    
    throw error;
  }
}

/**
 * 트랜잭션에 가스 정보 적용
 * 
 * @param transaction 트랜잭션
 * @param gasEstimate 가스 추정 결과
 * @returns 가스 정보가 추가된 트랜잭션
 */
export function applyGasSettings(transaction: Transaction, gasEstimate: GasEstimate): Transaction {
  const updatedTx = { ...transaction };
  
  // 가스 한도 적용
  updatedTx.gasLimit = gasEstimate.gasLimit;
  
  // 가스 가격 또는 EIP-1559 수수료 적용
  if (gasEstimate.type === TransactionType.EIP1559) {
    updatedTx.maxFeePerGas = gasEstimate.maxFeePerGas;
    updatedTx.maxPriorityFeePerGas = gasEstimate.maxPriorityFeePerGas;
    updatedTx.type = TransactionType.EIP1559;
    delete updatedTx.gasPrice;
  } else {
    updatedTx.gasPrice = gasEstimate.gasPrice;
    updatedTx.type = TransactionType.LEGACY;
    delete updatedTx.maxFeePerGas;
    delete updatedTx.maxPriorityFeePerGas;
  }
  
  return updatedTx;
}

/**
 * 트랜잭션 서명
 * 
 * @param privateKey 개인키
 * @param transaction 트랜잭션
 * @returns 서명된 트랜잭션 (16진수 문자열)
 */
export async function signTransaction(privateKey: string, transaction: Transaction): Promise<string> {
  try {
    const wallet = new Wallet(privateKey);
    
    // 트랜잭션 요청 객체 생성
    const txRequest: TransactionRequest = {
      to: transaction.to,
      from: transaction.from,
      data: transaction.data,
      value: transaction.value,
      chainId: transaction.chainId,
      nonce: transaction.nonce,
      gasLimit: transaction.gasLimit,
      type: transaction.type
    };
    
    // 트랜잭션 타입에 따라 가스 설정 추가
    if (transaction.type === TransactionType.EIP1559 && transaction.maxFeePerGas && transaction.maxPriorityFeePerGas) {
      txRequest.maxFeePerGas = transaction.maxFeePerGas;
      txRequest.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas;
    } else if (transaction.gasPrice) {
      txRequest.gasPrice = transaction.gasPrice;
    }
    
    // EIP-2930 액세스 리스트 추가
    if ((transaction.type === TransactionType.EIP2930 || transaction.type === TransactionType.EIP1559) && 
        transaction.accessList) {
      txRequest.accessList = transaction.accessList;
    }
    
    // 트랜잭션 서명
    const signedTx = await wallet.signTransaction(txRequest);
    return signedTx;
  } catch (error) {
    logger.error(`Failed to sign transaction: ${error.message}`);
    throw error;
  }
}

/**
 * 트랜잭션 전송
 * 
 * @param provider 프로바이더
 * @param signedTransaction 서명된 트랜잭션
 * @returns 트랜잭션 해시
 */
export async function sendTransaction(provider: IProvider, signedTransaction: string): Promise<string> {
  try {
    return await provider.sendTransaction(signedTransaction);
  } catch (error) {
    logger.error(`Failed to send transaction: ${error.message}`);
    throw error;
  }
}

/**
 * 트랜잭션 확인 대기
 * 
 * @param provider 프로바이더
 * @param txHash 트랜잭션 해시
 * @param confirmations 확인 수 (기본값: 1)
 * @param timeout 타임아웃 (밀리초, 기본값: 5분)
 * @returns 트랜잭션 영수증
 */
export async function waitForTransaction(
  provider: IProvider,
  txHash: string,
  confirmations: number = 1,
  timeout: number = 300000
): Promise<TransactionReceipt> {
  const startTime = Date.now();
  
  while (true) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt && receipt.confirmations >= confirmations) {
        return receipt;
      }
      
      // 타임아웃 확인
      if (Date.now() - startTime > timeout) {
        throw new Error(`Transaction confirmation timed out after ${timeout}ms`);
      }
      
      // 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      if (error.message.includes('timed out')) {
        throw error;
      }
      
      logger.warn(`Error while waiting for transaction: ${error.message}`);
      
      // 타임아웃 확인
      if (Date.now() - startTime > timeout) {
        throw new Error(`Transaction confirmation timed out after ${timeout}ms`);
      }
      
      // 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

/**
 * 트랜잭션 가속 (스피드업)
 * 
 * @param provider 프로바이더
 * @param transaction 원본 트랜잭션
 * @param options 가속 옵션
 * @returns 새 트랜잭션
 */
export async function speedUpTransaction(
  provider: IProvider,
  transaction: Transaction,
  options: SpeedUpOptions = {}
): Promise<Transaction> {
  try {
    // 논스 유지 (같은 트랜잭션을 대체하기 위함)
    const nonce = transaction.nonce ?? await provider.getNonce(transaction.from);
    
    // 새 트랜잭션 생성
    const newTx: Transaction = {
      ...transaction,
      nonce
    };
    
    // 가스 배수 계수 (기본값: 1.1 = 10% 상승)
    const multiplier = options.multiplier || 1.1;
    
    // EIP-1559 트랜잭션
    if (transaction.type === TransactionType.EIP1559 && transaction.maxFeePerGas && transaction.maxPriorityFeePerGas) {
      newTx.maxFeePerGas = options.maxFeePerGas || 
        (BigInt(Math.floor(Number(transaction.maxFeePerGas) * multiplier))).toString();
      
      newTx.maxPriorityFeePerGas = options.maxPriorityFeePerGas || 
        (BigInt(Math.floor(Number(transaction.maxPriorityFeePerGas) * multiplier))).toString();
    } 
    // 레거시 트랜잭션
    else if (transaction.gasPrice) {
      newTx.gasPrice = options.gasPrice || 
        (BigInt(Math.floor(Number(transaction.gasPrice) * multiplier))).toString();
    }
    
    // 트랜잭션 타입 설정
    if (options.type !== undefined) {
      newTx.type = options.type;
    }
    
    return newTx;
  } catch (error) {
    logger.error(`Failed to speed up transaction: ${error.message}`);
    throw error;
  }
}

/**
 * 트랜잭션 취소
 * 
 * @param provider 프로바이더
 * @param transaction 원본 트랜잭션
 * @param options 취소 옵션
 * @returns 취소 트랜잭션
 */
export async function cancelTransaction(
  provider: IProvider,
  transaction: Transaction,
  options: CancelOptions = {}
): Promise<Transaction> {
  try {
    // 논스 유지 (같은 트랜잭션을 대체하기 위함)
    const nonce = transaction.nonce ?? await provider.getNonce(transaction.from);
    
    // 취소 트랜잭션 생성 (자신에게 0 값을 전송)
    const cancelTx: Transaction = {
      from: transaction.from,
      to: transaction.from,
      value: '0',
      data: '0x',
      chainId: transaction.chainId,
      nonce,
      gasLimit: transaction.gasLimit
    };
    
    // 가스 배수 계수 (기본값: 1.1 = 10% 상승)
    const multiplier = options.multiplier || 1.1;
    
    // EIP-1559 트랜잭션
    if (transaction.type === TransactionType.EIP1559 && transaction.maxFeePerGas && transaction.maxPriorityFeePerGas) {
      cancelTx.maxFeePerGas = options.maxFeePerGas || 
        (BigInt(Math.floor(Number(transaction.maxFeePerGas) * multiplier))).toString();
      
      cancelTx.maxPriorityFeePerGas = options.maxPriorityFeePerGas || 
        (BigInt(Math.floor(Number(transaction.maxPriorityFeePerGas) * multiplier))).toString();
      
      cancelTx.type = TransactionType.EIP1559;
    } 
    // 레거시 트랜잭션
    else if (transaction.gasPrice) {
      cancelTx.gasPrice = options.gasPrice || 
        (BigInt(Math.floor(Number(transaction.gasPrice) * multiplier))).toString();
      
      cancelTx.type = TransactionType.LEGACY;
    }
    
    // 트랜잭션 타입 설정
    if (options.type !== undefined) {
      cancelTx.type = options.type;
    }
    
    return cancelTx;
  } catch (error) {
    logger.error(`Failed to create cancel transaction: ${error.message}`);
    throw error;
  }
}

/**
 * 트랜잭션 논스 계산
 * 
 * @param provider 프로바이더
 * @param address 주소
 * @returns 다음 논스
 */
export async function getNextNonce(provider: IProvider, address: string): Promise<number> {
  try {
    return await provider.getNonce(address);
  } catch (error) {
    logger.error(`Failed to get nonce for ${address}: ${error.message}`);
    throw error;
  }
}

/**
 * 컨트랙트 메서드 호출 데이터 생성
 * 
 * @param contractInterface 컨트랙트 인터페이스
 * @param method 메서드 이름
 * @param params 파라미터
 * @returns 호출 데이터 (16진수 문자열)
 */
export function encodeContractCall(contractInterface: any, method: string, params: any[]): string {
  try {
    return contractInterface.encodeFunctionData(method, params);
  } catch (error) {
    logger.error(`Failed to encode contract call for ${method}: ${error.message}`);
    throw error;
  }
}

/**
 * ERC-20 토큰 전송 데이터 생성
 * 
 * @param to 수신자 주소
 * @param amount 금액 (토큰의 가장 작은 단위)
 * @returns 호출 데이터 (16진수 문자열)
 */
export function encodeERC20Transfer(to: string, amount: string): string {
  // ERC-20 transfer(address,uint256) 함수 시그니처
  const methodId = '0xa9059cbb';
  
  // 파라미터 인코딩
  const addressParam = normalizeAddress(to).substring(2).padStart(64, '0');
  const amountParam = BigInt(amount).toString(16).padStart(64, '0');
  
  return `${methodId}${addressParam}${amountParam}`;
}

/**
 * ERC-20 승인 데이터 생성
 * 
 * @param spender 권한을 받을 주소
 * @param amount 승인 금액 (토큰의 가장 작은 단위)
 * @returns 호출 데이터 (16진수 문자열)
 */
export function encodeERC20Approve(spender: string, amount: string): string {
  // ERC-20 approve(address,uint256) 함수 시그니처
  const methodId = '0x095ea7b3';
  
  // 파라미터 인코딩
  const addressParam = normalizeAddress(spender).substring(2).padStart(64, '0');
  const amountParam = BigInt(amount).toString(16).padStart(64, '0');
  
  return `${methodId}${addressParam}${amountParam}`;
}
