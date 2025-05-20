/**
 * TransactionService
 * 트랜잭션 처리 서비스
 * 트랜잭션 생성, 서명, 전송, 추적 기능을 제공합니다.
 */

import { KeyringService } from './keyring.service';
import { NetworkService } from './network.service';

// 트랜잭션 상태 열거형
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

// 트랜잭션 정보 인터페이스
export interface TransactionInfo {
  hash: string;
  from: string;
  to: string;
  value: string;
  data?: string;
  nonce: number;
  gasLimit: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  status: TransactionStatus;
  chainId: number;
  blockNumber?: number;
  blockHash?: string;
  timestamp: number;
}

export class TransactionService {
  // 현재 진행 중인 트랜잭션 목록
  private pendingTransactions: Map<string, TransactionInfo> = new Map();
  
  constructor(
    private keyringService: KeyringService,
    private networkService: NetworkService
  ) {}
  
  /**
   * 트랜잭션 서명 및 전송
   * @param txParams 트랜잭션 파라미터
   * @returns 트랜잭션 해시
   */
  public async signAndSendTransaction(txParams: any): Promise<string> {
    try {
      // 선택된 계정 및 네트워크 정보 가져오기
      const selectedAccount = await this.keyringService.getSelectedAccount();
      const selectedNetwork = await this.networkService.getSelectedNetwork();
      
      if (!selectedAccount) {
        throw new Error('선택된 계정이 없습니다.');
      }
      
      // 트랜잭션 파라미터 검증 및 보완
      const processedTxParams = await this.processTransactionParams(txParams, selectedAccount, selectedNetwork.chainId);
      
      // 트랜잭션 서명
      const signedTx = await this.keyringService.signTransaction(processedTxParams);
      
      // 트랜잭션 전송
      // 실제 구현에서는 ethers.js 또는 web3.js와 같은 라이브러리 사용
      // 임시 구현:
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // 트랜잭션 정보 저장
      const txInfo: TransactionInfo = {
        hash: txHash,
        from: selectedAccount,
        to: processedTxParams.to,
        value: processedTxParams.value || '0x0',
        data: processedTxParams.data,
        nonce: processedTxParams.nonce || 0,
        gasLimit: processedTxParams.gasLimit || '0x0',
        gasPrice: processedTxParams.gasPrice,
        maxFeePerGas: processedTxParams.maxFeePerGas,
        maxPriorityFeePerGas: processedTxParams.maxPriorityFeePerGas,
        status: TransactionStatus.PENDING,
        chainId: selectedNetwork.chainId,
        timestamp: Date.now()
      };
      
      this.pendingTransactions.set(txHash, txInfo);
      
      // 트랜잭션 상태 추적 시작
      this.trackTransaction(txHash);
      
      console.log(`트랜잭션이 전송되었습니다: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('트랜잭션 서명 및 전송 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 개인 메시지 서명
   * @param message 서명할 메시지
   * @returns 서명 결과
   */
  public async signPersonalMessage(message: string): Promise<string> {
    try {
      // 메시지 서명
      const signature = await this.keyringService.signMessage(message);
      return signature;
    } catch (error) {
      console.error('메시지 서명 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 타입화된 데이터 서명
   * @param typedData 타입화된 데이터
   * @returns 서명 결과
   */
  public async signTypedData(typedData: any): Promise<string> {
    try {
      // 타입화된 데이터 서명
      const signature = await this.keyringService.signTypedData(typedData);
      return signature;
    } catch (error) {
      console.error('타입화된 데이터 서명 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 트랜잭션 파라미터 처리
   * 누락된 파라미터 추가 및 값 검증
   * @param txParams 원본 트랜잭션 파라미터
   * @param from 발신 주소
   * @param chainId 체인 ID
   * @returns 처리된 트랜잭션 파라미터
   */
  private async processTransactionParams(txParams: any, from: string, chainId: number): Promise<any> {
    // from 필드가 없거나 선택된 계정과 다른 경우 설정
    const processedParams = {
      ...txParams,
      from
    };
    
    // chainId 필드가 없는 경우 설정
    if (!processedParams.chainId) {
      processedParams.chainId = chainId;
    }
    
    // 가스 추정 및 최적화 (실제 구현에서는 네트워크 요청 필요)
    if (!processedParams.gasLimit) {
      processedParams.gasLimit = await this.estimateGas(processedParams);
    }
    
    // EIP-1559 트랜잭션 지원
    const supportsEIP1559 = true; // 실제 구현에서는 네트워크 기능 확인 필요
    
    if (supportsEIP1559) {
      if (!processedParams.maxFeePerGas && !processedParams.gasPrice) {
        const gasFees = await this.getFeeData();
        processedParams.maxFeePerGas = gasFees.maxFeePerGas;
        processedParams.maxPriorityFeePerGas = gasFees.maxPriorityFeePerGas;
      }
    } else if (!processedParams.gasPrice) {
      processedParams.gasPrice = await this.getGasPrice();
    }
    
    // nonce 설정 (실제 구현에서는 네트워크 요청 필요)
    if (!processedParams.nonce) {
      processedParams.nonce = await this.getNonce(from);
    }
    
    return processedParams;
  }
  
  /**
   * 가스 추정
   * @param txParams 트랜잭션 파라미터
   * @returns 추정된 가스 제한
   */
  private async estimateGas(txParams: any): Promise<string> {
    // 실제 구현에서는 네트워크 요청으로 가스 추정
    // 임시 구현:
    return '0x5208'; // 21000 (기본 전송 가스)
  }
  
  /**
   * 가스 가격 조회
   * @returns 현재 가스 가격
   */
  private async getGasPrice(): Promise<string> {
    // 실제 구현에서는 네트워크 요청으로 가스 가격 조회
    // 임시 구현:
    return '0x3b9aca00'; // 1 Gwei
  }
  
  /**
   * EIP-1559 가스 데이터 조회
   * @returns 최대 기본 수수료 및 우선 순위 수수료
   */
  private async getFeeData(): Promise<{ maxFeePerGas: string; maxPriorityFeePerGas: string }> {
    // 실제 구현에서는 네트워크 요청으로 가스 데이터 조회
    // 임시 구현:
    return {
      maxFeePerGas: '0x3b9aca00', // 1 Gwei
      maxPriorityFeePerGas: '0x3b9aca00' // 1 Gwei
    };
  }
  
  /**
   * 논스 조회
   * @param address 계정 주소
   * @returns 다음 논스 값
   */
  private async getNonce(address: string): Promise<number> {
    // 실제 구현에서는 네트워크 요청으로 논스 조회
    // 임시 구현:
    return 0;
  }
  
  /**
   * 트랜잭션 상태 추적
   * @param txHash 트랜잭션 해시
   */
  private async trackTransaction(txHash: string): Promise<void> {
    // 실제 구현에서는 주기적으로 트랜잭션 상태 확인
    // 임시 구현: 5초 후 트랜잭션 확인된 것으로 처리
    
    setTimeout(() => {
      if (this.pendingTransactions.has(txHash)) {
        const txInfo = this.pendingTransactions.get(txHash)!;
        txInfo.status = TransactionStatus.CONFIRMED;
        txInfo.blockNumber = 1000000; // 임의의 블록 번호
        txInfo.blockHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        
        this.pendingTransactions.set(txHash, txInfo);
        console.log(`트랜잭션이 확인되었습니다: ${txHash}`);
        
        // 트랜잭션 확인 이벤트 발생 (실제 구현에서는 이벤트 시스템 필요)
      }
    }, 5000);
  }
  
  /**
   * 진행 중인 트랜잭션 조회
   * @returns 진행 중인 트랜잭션 목록
   */
  public getPendingTransactions(): TransactionInfo[] {
    return Array.from(this.pendingTransactions.values())
      .filter(tx => tx.status === TransactionStatus.PENDING);
  }
  
  /**
   * 특정 트랜잭션 조회
   * @param txHash 트랜잭션 해시
   * @returns 트랜잭션 정보 또는 undefined
   */
  public getTransaction(txHash: string): TransactionInfo | undefined {
    return this.pendingTransactions.get(txHash);
  }
  
  /**
   * 트랜잭션 취소
   * @param txHash 취소할 트랜잭션 해시
   * @returns 새 트랜잭션 해시
   */
  public async cancelTransaction(txHash: string): Promise<string | null> {
    const txInfo = this.pendingTransactions.get(txHash);
    if (!txInfo || txInfo.status !== TransactionStatus.PENDING) {
      throw new Error('취소할 수 없는 트랜잭션입니다.');
    }
    
    try {
      // 원 트랜잭션과 동일한 논스로 0 값 트랜잭션 생성
      // 단, 가스 가격은 더 높게 설정해야 함
      const cancelTxParams = {
        from: txInfo.from,
        to: txInfo.from, // 자기 자신에게 보내기
        value: '0x0',
        nonce: txInfo.nonce,
        chainId: txInfo.chainId,
        gasLimit: txInfo.gasLimit,
      };
      
      // EIP-1559 트랜잭션인 경우
      if (txInfo.maxFeePerGas) {
        cancelTxParams.maxFeePerGas = this.increaseHexValue(txInfo.maxFeePerGas, 1.1);
        cancelTxParams.maxPriorityFeePerGas = this.increaseHexValue(txInfo.maxPriorityFeePerGas || '0x0', 1.1);
      } else if (txInfo.gasPrice) {
        // 레거시 트랜잭션인 경우
        cancelTxParams.gasPrice = this.increaseHexValue(txInfo.gasPrice, 1.1);
      }
      
      // 취소 트랜잭션 전송
      const cancelTxHash = await this.signAndSendTransaction(cancelTxParams);
      
      // 원 트랜잭션 상태 업데이트
      txInfo.status = TransactionStatus.FAILED;
      this.pendingTransactions.set(txHash, txInfo);
      
      return cancelTxHash;
    } catch (error) {
      console.error('트랜잭션 취소 중 오류:', error);
      throw error;
    }
  }
  
  /**
   * 16진수 값 증가
   * @param hexValue 16진수 값
   * @param factor 증가 비율
   * @returns 증가된 16진수 값
   */
  private increaseHexValue(hexValue: string, factor: number): string {
    const value = parseInt(hexValue, 16);
    const increased = Math.floor(value * factor);
    return `0x${increased.toString(16)}`;
  }
}