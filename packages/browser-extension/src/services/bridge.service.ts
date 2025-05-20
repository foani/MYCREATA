/**
 * 브릿지 서비스
 * 
 * 다양한 체인 간 브릿지 기능을 중개하는 서비스 클래스입니다.
 * 코어 라이브러리의 브릿지 제공자를 사용하여 상위 레벨의 인터페이스를 제공합니다.
 * 
 * @author CreLink Team
 */

import { ethers } from 'ethers';
import { 
  BridgeProvider, 
  BridgeTransaction, 
  BridgeTransactionStatus, 
  BridgeAsset 
} from '../../../core/src/chain/bridge/bridge.interface';
import { BridgeFactory } from '../../../core/src/chain/bridge/bridge.factory';
import { ChainType } from '../../../core/src/chain/chains';
import { WalletController } from '../background/walletController';

export class BridgeService {
  private bridgeFactory: BridgeFactory;
  private bridgeProviders: Map<string, BridgeProvider> = new Map();
  
  constructor() {
    this.bridgeFactory = new BridgeFactory();
    this.initBridgeProviders();
  }
  
  /**
   * 브릿지 제공자 초기화
   * 각 지원 체인 쌍에 대한 브릿지 제공자를 생성
   */
  private async initBridgeProviders(): Promise<void> {
    try {
      // Catena <-> Ethereum
      const catenaEthereumKey = `${ChainType.CATENA}-${ChainType.ETHEREUM}`;
      const catenaEthereumProvider = await this.bridgeFactory.createBridgeProvider(
        ChainType.CATENA,
        ChainType.ETHEREUM
      );
      this.bridgeProviders.set(catenaEthereumKey, catenaEthereumProvider);
      
      // Catena <-> Polygon
      const catenaPolygonKey = `${ChainType.CATENA}-${ChainType.POLYGON}`;
      const catenaPolygonProvider = await this.bridgeFactory.createBridgeProvider(
        ChainType.CATENA,
        ChainType.POLYGON
      );
      this.bridgeProviders.set(catenaPolygonKey, catenaPolygonProvider);
      
      // Catena <-> Arbitrum
      const catenaArbitrumKey = `${ChainType.CATENA}-${ChainType.ARBITRUM}`;
      const catenaArbitrumProvider = await this.bridgeFactory.createBridgeProvider(
        ChainType.CATENA,
        ChainType.ARBITRUM
      );
      this.bridgeProviders.set(catenaArbitrumKey, catenaArbitrumProvider);
    } catch (error) {
      console.error('Failed to initialize bridge providers:', error);
      throw new Error('Bridge initialization failed');
    }
  }
  
  /**
   * 체인 쌍에 대한 브릿지 제공자 가져오기
   * 
   * @param sourceChain - 소스 체인
   * @param targetChain - 대상 체인
   * @returns 해당 체인 쌍에 대한 브릿지 제공자
   */
  private getBridgeProvider(sourceChain: ChainType, targetChain: ChainType): BridgeProvider {
    const key = `${sourceChain}-${targetChain}`;
    const provider = this.bridgeProviders.get(key);
    
    if (!provider) {
      throw new Error(`Bridge provider not found for ${sourceChain} to ${targetChain}`);
    }
    
    return provider;
  }
  
  /**
   * 지원되는 자산 목록 가져오기
   * 
   * @param sourceChain - 소스 체인
   * @param targetChain - 대상 체인 (옵션)
   * @returns 지원되는 자산 목록
   */
  async getSupportedAssets(sourceChain: ChainType, targetChain?: ChainType): Promise<BridgeAsset[]> {
    try {
      // 대상 체인이 지정되지 않은 경우 기본 대상 체인 결정
      if (!targetChain) {
        targetChain = sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      }
      
      const provider = this.getBridgeProvider(sourceChain, targetChain);
      return await provider.getSupportedAssets(sourceChain);
    } catch (error) {
      console.error('Failed to get supported assets:', error);
      throw new Error('Failed to fetch supported assets');
    }
  }
  
  /**
   * 토큰의 상대 체인에서의 매핑 토큰 가져오기
   * 
   * @param tokenAddress - 토큰 주소
   * @param sourceChain - 소스 체인
   * @param targetChain - 대상 체인 (옵션)
   * @returns 매핑된 토큰 주소
   */
  async getMappedToken(
    tokenAddress: string,
    sourceChain: ChainType,
    targetChain?: ChainType
  ): Promise<string> {
    try {
      // 대상 체인이 지정되지 않은 경우 기본 대상 체인 결정
      if (!targetChain) {
        targetChain = sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      }
      
      const provider = this.getBridgeProvider(sourceChain, targetChain);
      return await provider.getMappedToken(tokenAddress, sourceChain);
    } catch (error) {
      console.error('Failed to get mapped token:', error);
      throw new Error('Failed to fetch mapped token');
    }
  }
  
  /**
   * 토큰 잔액 조회
   * 
   * @param tokenAddress - 토큰 주소
   * @param walletAddress - 지갑 주소
   * @param chainType - 체인 유형
   * @returns 토큰 잔액
   */
  async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    chainType: ChainType
  ): Promise<string> {
    try {
      // 대상 체인은 소스 체인과 반대 체인으로 설정
      const targetChain = chainType === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      const provider = this.getBridgeProvider(chainType, targetChain);
      
      return await provider.getTokenBalance(tokenAddress, walletAddress, chainType);
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw new Error('Failed to fetch token balance');
    }
  }
  
  /**
   * 토큰 허용량 조회
   * 
   * @param tokenAddress - 토큰 주소
   * @param walletAddress - 지갑 주소
   * @param chainType - 체인 유형
   * @returns 토큰 허용량 정보
   */
  async getTokenAllowance(
    tokenAddress: string,
    walletAddress: string,
    chainType: ChainType
  ): Promise<{ allowance: string; isApproved: boolean }> {
    try {
      // 대상 체인은 소스 체인과 반대 체인으로 설정
      const targetChain = chainType === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      const provider = this.getBridgeProvider(chainType, targetChain);
      
      return await provider.getTokenAllowance(tokenAddress, walletAddress, chainType);
    } catch (error) {
      console.error('Failed to get token allowance:', error);
      throw new Error('Failed to fetch token allowance');
    }
  }
  
  /**
   * 토큰 승인
   * 
   * @param tokenAddress - 토큰 주소
   * @param amount - 승인 금액
   * @param chainType - 체인 유형
   * @param signer - 서명자
   * @returns 트랜잭션 해시
   */
  async approveToken(
    tokenAddress: string,
    amount: string,
    chainType: ChainType,
    signer: any
  ): Promise<string> {
    try {
      // 대상 체인은 소스 체인과 반대 체인으로 설정
      const targetChain = chainType === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      const provider = this.getBridgeProvider(chainType, targetChain);
      
      return await provider.approveToken(tokenAddress, amount, chainType, signer);
    } catch (error) {
      console.error('Failed to approve token:', error);
      throw new Error('Failed to approve token');
    }
  }
  
  /**
   * 브릿지 수수료 추정
   * 
   * @param sourceTokenAddress - 소스 토큰 주소
   * @param amount - 금액
   * @param sourceChain - 소스 체인
   * @param targetChain - 대상 체인 (옵션)
   * @returns 수수료 정보
   */
  async estimateBridgeFee(
    sourceTokenAddress: string,
    amount: string,
    sourceChain: ChainType,
    targetChain?: ChainType
  ): Promise<{
    bridgeFee: string;
    relayerFee: string;
    gasEstimate: string;
    totalFee: string;
  }> {
    try {
      // 대상 체인이 지정되지 않은 경우 기본 대상 체인 결정
      if (!targetChain) {
        targetChain = sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      }
      
      const provider = this.getBridgeProvider(sourceChain, targetChain);
      return await provider.estimateBridgeFee(sourceTokenAddress, amount, sourceChain);
    } catch (error) {
      console.error('Failed to estimate bridge fee:', error);
      throw new Error('Failed to estimate bridge fee');
    }
  }
  
  /**
   * 브릿지 트랜잭션 실행
   * 
   * @param sourceTokenAddress - 소스 토큰 주소
   * @param amount - 금액
   * @param recipientAddress - 수신자 주소
   * @param sourceChain - 소스 체인
   * @param signTransaction - 트랜잭션 서명 함수
   * @param targetChain - 대상 체인 (옵션)
   * @returns 브릿지 트랜잭션 정보
   */
  async bridgeAsset(
    sourceTokenAddress: string,
    amount: string,
    recipientAddress: string,
    sourceChain: ChainType,
    signTransaction: any,
    targetChain?: ChainType
  ): Promise<BridgeTransaction> {
    try {
      // 대상 체인이 지정되지 않은 경우 기본 대상 체인 결정
      if (!targetChain) {
        targetChain = sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      }
      
      const provider = this.getBridgeProvider(sourceChain, targetChain);
      
      // 지갑 컨트롤러에서 서명자 가져오기 (실제로는 서명자를 직접 전달받아야 함)
      const signer = signTransaction;
      
      return await provider.bridgeAsset(
        sourceTokenAddress,
        amount,
        recipientAddress,
        sourceChain,
        signer
      );
    } catch (error) {
      console.error('Failed to bridge asset:', error);
      throw new Error('Failed to bridge asset');
    }
  }
  
  /**
   * 트랜잭션 상태 조회
   * 
   * @param transactionId - 트랜잭션 ID
   * @param sourceChain - 소스 체인
   * @param targetChain - 대상 체인 (옵션)
   * @returns 브릿지 트랜잭션 상태 정보
   */
  async getTransactionStatus(
    transactionId: string,
    sourceChain: ChainType,
    targetChain?: ChainType
  ): Promise<BridgeTransaction> {
    try {
      // 대상 체인이 지정되지 않은 경우 기본 대상 체인 결정
      if (!targetChain) {
        targetChain = sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      }
      
      const provider = this.getBridgeProvider(sourceChain, targetChain);
      return await provider.getTransactionStatus(transactionId, sourceChain);
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw new Error('Failed to fetch transaction status');
    }
  }
  
  /**
   * 트랜잭션 이력 조회
   * 
   * @param walletAddress - 지갑 주소
   * @param sourceChain - 소스 체인 (옵션)
   * @param targetChain - 대상 체인 (옵션)
   * @returns 브릿지 트랜잭션 목록
   */
  async getTransactionHistory(
    walletAddress: string,
    sourceChain?: ChainType,
    targetChain?: ChainType
  ): Promise<BridgeTransaction[]> {
    try {
      // 소스 체인과 대상 체인이 모두 지정되지 않은 경우 기본값 설정
      if (!sourceChain) {
        sourceChain = ChainType.CATENA;
      }
      
      if (!targetChain) {
        targetChain = sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      }
      
      const provider = this.getBridgeProvider(sourceChain, targetChain);
      return await provider.getTransactionHistory(walletAddress);
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }
  
  /**
   * 브릿지 상태 확인
   * 
   * @param sourceChain - 소스 체인
   * @param targetChain - 대상 체인 (옵션)
   * @returns 브릿지 상태 정보
   */
  async checkBridgeStatus(
    sourceChain: ChainType,
    targetChain?: ChainType
  ): Promise<any> {
    try {
      // 대상 체인이 지정되지 않은 경우 기본 대상 체인 결정
      if (!targetChain) {
        targetChain = sourceChain === ChainType.CATENA ? ChainType.ETHEREUM : ChainType.CATENA;
      }
      
      const provider = this.getBridgeProvider(sourceChain, targetChain);
      return await provider.checkBridgeStatus();
    } catch (error) {
      console.error('Failed to check bridge status:', error);
      throw new Error('Failed to check bridge status');
    }
  }
  
  /**
   * Arbitrum 출금 완료 실행 (Arbitrum 특화 기능)
   * 
   * @param withdrawalId - 출금 ID
   * @param signer - 서명자
   * @returns 트랜잭션 해시
   */
  async executeArbitrumWithdrawal(withdrawalId: string, signer: any): Promise<string> {
    try {
      const provider = this.getBridgeProvider(ChainType.CATENA, ChainType.ARBITRUM);
      
      // 타입 단언을 통해 Arbitrum 특화 메서드 호출
      const arbitrumProvider = provider as any;
      if (typeof arbitrumProvider.executeWithdrawal !== 'function') {
        throw new Error('This bridge provider does not support Arbitrum withdrawals');
      }
      
      return await arbitrumProvider.executeWithdrawal(withdrawalId, signer);
    } catch (error) {
      console.error('Failed to execute Arbitrum withdrawal:', error);
      throw new Error('Failed to execute Arbitrum withdrawal');
    }
  }
  
  /**
   * Polygon 출금 완료 (Polygon 특화 기능)
   * 
   * @param transactionId - 트랜잭션 ID
   * @param recipient - 수신자 주소
   * @param signer - 서명자
   * @returns 트랜잭션 해시
   */
  async executePolygonExit(
    transactionId: string,
    recipient: string,
    signer: any
  ): Promise<string> {
    try {
      const provider = this.getBridgeProvider(ChainType.CATENA, ChainType.POLYGON);
      
      // 타입 단언을 통해 Polygon 특화 메서드 호출
      const polygonProvider = provider as any;
      if (typeof polygonProvider.exitTransaction !== 'function') {
        throw new Error('This bridge provider does not support Polygon exits');
      }
      
      return await polygonProvider.exitTransaction(transactionId, recipient, signer);
    } catch (error) {
      console.error('Failed to execute Polygon exit:', error);
      throw new Error('Failed to execute Polygon exit');
    }
  }
  
  /**
   * 청구 가능한 출금 트랜잭션 조회 (특화 기능)
   * 
   * @param walletAddress - 지갑 주소
   * @param chainType - 체인 유형
   * @returns 청구 가능한 트랜잭션 목록
   */
  async getClaimableTransactions(
    walletAddress: string,
    chainType: ChainType
  ): Promise<BridgeTransaction[]> {
    try {
      let provider;
      
      switch (chainType) {
        case ChainType.ARBITRUM:
          provider = this.getBridgeProvider(ChainType.CATENA, ChainType.ARBITRUM);
          
          // Arbitrum 특화 메서드 호출
          const arbitrumProvider = provider as any;
          if (typeof arbitrumProvider.getClaimableWithdrawals !== 'function') {
            throw new Error('This bridge provider does not support claimable withdrawals');
          }
          
          return await arbitrumProvider.getClaimableWithdrawals(walletAddress);
          
        case ChainType.POLYGON:
          provider = this.getBridgeProvider(ChainType.CATENA, ChainType.POLYGON);
          
          // Polygon 특화 메서드 호출
          const polygonProvider = provider as any;
          if (typeof polygonProvider.getExitableTransactions !== 'function') {
            throw new Error('This bridge provider does not support exitable transactions');
          }
          
          return await polygonProvider.getExitableTransactions(walletAddress);
          
        default:
          throw new Error(`Claimable transactions not supported for ${chainType}`);
      }
    } catch (error) {
      console.error('Failed to get claimable transactions:', error);
      throw new Error('Failed to fetch claimable transactions');
    }
  }
}
